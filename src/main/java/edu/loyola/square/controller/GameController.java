package edu.loyola.square.controller;

import edu.loyola.square.model.Player;
import edu.loyola.square.model.Game;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class GameController {
  private final Object lock = new Object();
  private int endGameLocation;

  @ModelAttribute("game")
  public Game newGame() {
    List<Player> players = new ArrayList<>();
    players.add(new Player("Player 1", 100));
    players.add(new Player("Player 2", 100));
    return new Game(players);
  }

  @GetMapping("/hello")
  public String hello() {
    return "Hello World";
  }

  @PostMapping("/gamestart")
  public ResponseEntity<Map<String, Object>> startGame(HttpSession session) {
    session.removeAttribute("game");
    List<Player> players = new ArrayList<>();
    players.add(new Player("Player 1", 100));
    players.add(new Player("Player 2", 100));
    Game newGame = new Game(players);

    if (newGame != null) {
      System.out.println("Game is found");
      newGame.initializeGame();
      session.setAttribute("game", newGame);
      Map<String, Object> gameState = getGameState(newGame);

      Player currentPlayer = newGame.getCurrentPlayer();
      if(currentPlayer.getPlayerHand().blackjack()) {
        endGameLocation = 1;
        Map<String, Object> status = newGame.endGameStatus(1);
        gameState.put("gameStatus", status);
        gameState.put("hasAce", false);
        return ResponseEntity.ok(gameState);
      } else if (currentPlayer.getPlayerHand().getAceCount() > 0) {
        gameState.put("hasAce", true);
        return ResponseEntity.ok(gameState);
      } else {
        gameState.put("hasAce", false);
      }

      System.out.println(gameState);
      return ResponseEntity.ok(gameState);
    }
    return ResponseEntity.badRequest().body(Map.of("Error:", "Game failed to start"));
  }

  @PostMapping("/stand")
  public ResponseEntity<Map<String, Object>> playerStand(HttpSession session) {
    synchronized (lock) {
      Game game = (Game) session.getAttribute("game");
      if (game != null) {
        game.takeDealerTurn();
        endGameLocation = 3;
        Map<String, Object> gameState = getGameState(game);
        Map<String, Object> status = game.endGameStatus(3);
        gameState.put("gameStatus", status);
        game.nextPlayer();
        session.setAttribute("game", game);
        System.out.println("Standing gameState is: " + gameState);
        return ResponseEntity.ok(gameState);
      }
      return ResponseEntity.badRequest().body(Map.of("Error:", "Game failed to start"));
    }
  }

  @PostMapping("/hit")
  public ResponseEntity<Map<String, Object>> playerHit(HttpSession session) {
    synchronized (lock) {
      Game game = (Game) session.getAttribute("game");
      boolean gameNull = game != null;
      System.out.println(gameNull);

      if (game != null) {
        System.out.println("game not null");
        Map<String, Object> gameState = getGameState(game);
        Player currentPlayer = game.getCurrentPlayer();
        game.hit(currentPlayer.getPlayerHand());
        gameState = getGameState(game);

        if (gameState.get("hasAce").equals(true)) {
          return ResponseEntity.ok(gameState);
        }

        if(currentPlayer.getPlayerHand().getValue() >= 21) {
          endGameLocation = 2;
          Map<String, Object> status = game.endGameStatus(2);
          gameState.put("gameStatus", status);
          game.nextPlayer();
        }

        session.setAttribute("game", game);
        System.out.println("Hit Gamestate" + gameState);
        return ResponseEntity.ok(gameState);
      }
      return ResponseEntity.badRequest().body(Map.of("Error:", "Game failed to start"));
    }
  }

  @PostMapping("/promptAce")
  public ResponseEntity<Map<String, Object>> promptAce(HttpSession session, @RequestBody Map<String, Object> requestAce) {
    synchronized (lock) {
      Game game = (Game) session.getAttribute("game");
      if(game != null) {
        Integer aceValue = (Integer) requestAce.get("aceValue");
        Player currentPlayer = game.getCurrentPlayer();

        if (aceValue != null && (aceValue == 1 || aceValue == 11)) {
          currentPlayer.getPlayerHand().setAceValue(aceValue);
        }

        Map<String, Object> gameState = getGameState(game);
        gameState.put("aceValue", aceValue);

        int handValue = currentPlayer.getPlayerHand().getValue();
        if (handValue > 21) {
          Map<String, Object> status = game.endGameStatus(2);
          gameState.put("gameStatus", status);
          game.nextPlayer();
        } else if (handValue == 21) {
          Map<String, Object> status = game.endGameStatus(1);
          gameState.put("gameStatus", status);
          game.nextPlayer();
        }

        session.setAttribute("game", game);
        return ResponseEntity.ok(gameState);
      }
      return ResponseEntity.badRequest().body(Map.of("Error:", "Failed to store ace"));
    }
  }

  public Map<String, Object> getGameState(Game game) {
    Map<String, Object> gameState = new HashMap<>();
    if (game != null) {
      List<Map<String, Object>> playerStates = new ArrayList<>();

      // Add state for each player
      for (Player player : game.getPlayers()) {
        Map<String, Object> playerState = new HashMap<>();
        playerState.put("name", player.getName());
        playerState.put("hand", player.getPlayerHand().getHand());
        playerState.put("value", player.getPlayerHand().getValue());
        playerState.put("hasAce", player.getHasAce());
        playerStates.add(playerState);
      }

      gameState.put("players", playerStates);
      gameState.put("currentPlayerIndex", game.getPlayers().indexOf(game.getCurrentPlayer()));

      // Add dealer information
      if (game.getDealerHand() != null) {
        gameState.put("dealerHand", game.getDealerHand().getHand());
        gameState.put("dealerValue", game.getDealerHand().getValue());
      }

      // Set hasAce for current player
      Player currentPlayer = game.getCurrentPlayer();
      gameState.put("hasAce", currentPlayer.getHasAce());

      System.out.println("Game state is: " + gameState);
    }
    return gameState;
  }
}