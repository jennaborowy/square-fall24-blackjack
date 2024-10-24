package edu.loyola.square.controller;
import edu.loyola.square.model.Deck;
import edu.loyola.square.model.Card;
import edu.loyola.square.model.Player;
import edu.loyola.square.model.Hand;
import edu.loyola.square.model.Game;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RestController
//@SessionAttributes("game")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class GameController
{

  private final Object lock = new Object();
  //game needs to persist for the session (the player)
  @ModelAttribute("game")
  //parameter could be edited later to have a list of players
  public Game newGame() {
    Game game = new Game(new Player("Player 1", 100));
    return game;
  }
 //test server
  @GetMapping("/hello")
  public String hello() {
    return "Hello World";
  }

  @PostMapping("/gamestart")
  public ResponseEntity<Map<String, Object>> startGame(HttpSession session) {
    //remove existing game (reset cookies for a new session)
    session.removeAttribute("game");
    //instance of game established at beginning of session (persistence
    Game newGame = new Game(new Player("Player 1", 100));
    if (newGame != null) {
      System.out.println("Game is found");
      newGame.initializeGame();
      session.setAttribute("game", newGame);
      Map<String, Object> gameState = getGameState(newGame);
      System.out.println(gameState);
      //game could end here if winner gets Blackjack, so return the result
      return ResponseEntity.ok(gameState);
    }
    return ResponseEntity.badRequest().body(Map.of("Error:", "Game failed to start"));

  }

  //using hashmap, so information of the game can be added in key,value pairs and returned in JSON
  @PostMapping("/stand")
  public ResponseEntity<Map<String, Object>> playerStand(HttpSession session) {
    //need to lock so http response can come back before updating gamestate
    synchronized (lock) {
      Game game = (Game) session.getAttribute("game");
      if (game != null) {
        game.stand();
        Map<String, Object> gameState = getGameState(game);
        return ResponseEntity.ok(gameState);
      }
      return ResponseEntity.badRequest().body(Map.of("Error:", "Game failed to start"));
    }
  }

  @PostMapping("/hit")
  public ResponseEntity<Map<String, Object>> playerHit(HttpSession session) {
    //need to lock so http response can come back before updating gamestate
    synchronized (lock) {
      System.out.println("hit top; ");
      Game game = (Game) session.getAttribute("game");
      System.out.println("hit here");
      boolean gameNull = game != null ? true : false;
      System.out.println(gameNull);
      if (game != null) {
        System.out.println("hit here not null");
        game.hit(game.getPlayers().getPlayerHand());
        Map<String, Object> gameState = getGameState(game);
        if(game.getPlayers().getPlayerHand().getValue() >= 21) {
          Map<String, Object> status = game.endGameStatus();
          gameState.put("status", status);
        }
        session.setAttribute("game", game);

        System.out.println("Hit Gamestate" + gameState);

        return ResponseEntity.ok(gameState);
      }
      return ResponseEntity.badRequest().body(Map.of("Error:", "Game failed to start"));
    }
  }

  //updates the game parameters/information (hands, points, status)
  private Map<String, Object> getGameState(Game game) {
    Map<String, Object> gameState = new HashMap<String, Object>();
    if (game != null) {
      //updates json hashmap of hand data as game continues
      gameState.put("playerHand", game.getPlayers().getPlayerHand().getHand());
      gameState.put("playerValue", game.getPlayers().getPlayerHand().getValue());
      if (game.getDealerHand() != null) {
        gameState.put("dealerHand", game.getDealerHand().getHand());
        gameState.put("dealerValue", game.getDealerHand().getValue());
      }
      System.out.println("Game state is: " + gameState);
    }
    return gameState;
  }
}


