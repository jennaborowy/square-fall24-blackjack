/**
 * This file contains the GameController which connects gameplay requests from the front end.
 */
package edu.loyola.square.controller;
import edu.loyola.square.model.Player;
import edu.loyola.square.model.Game;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class GameController {
  //utilized in hit and stand, game should lock to perform action before updating gameState
  private final Object lock = new Object();
  private int endGameLocation;
  //game needs to persist for the session. Establishes a cookie
  @ModelAttribute("game")
  //parameter could be edited later to have a list of players

  /**
   *
   *Output: a new Game with players
   *Purpose: to create a new game with Players
   */
  public Game newGame() {
    Game game = new Game(new Player("Player 1", 100));
    return game;
  }

  /**
   *
   *Returns 'Hello World' in the server
   *This function tests to make sure the server is receiving requests
   */
  @GetMapping("/hello")
  public String hello() {
    return "Hello World";
  }

  /**
   *@param session HttpSession - instantiates a http session to persist data across endpoints
   *Returns gameState as a map of strings and objects as a response entity
   *This function starts a game of blackjack and sends a Hashmap response to the front end
   */
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
      if(newGame.getPlayers().getPlayerHand().blackjack()) {
        endGameLocation = 1;
        Map<String, Object> status = newGame.endGameStatus(1);
        gameState.put("gameStatus", status);
      }
      System.out.println(gameState);
      //game could end here if winner gets Blackjack, so return the result
      //using hashmap, so information of the game can be added in key,value pairs and returned in JSON
      return ResponseEntity.ok(gameState);
    }
    return ResponseEntity.badRequest().body(Map.of("Error:", "Game failed to start"));

  }

  /**
   *@session HttpSession - instantiates a http session to persist data across endpoints.
   *Returns gameState as a map of strings and objects as a response entity.
   *This function performs player 'stand' action and intiates dealer's turn. Sends a Hashmap response to the front end.
   */
  @PostMapping("/stand")
  public ResponseEntity<Map<String, Object>> playerStand(HttpSession session) {
    //need to lock so http response can come back before updating gamestate
    synchronized (lock) {
      Game game = (Game) session.getAttribute("game");
      if (game != null) {
        game.stand();
        endGameLocation = 2;
        Map<String, Object> gameState = getGameState(game);
        Map<String, Object> status = game.endGameStatus(3);
        gameState.put("gameStatus", status);
        return ResponseEntity.ok(gameState);
      }
      return ResponseEntity.badRequest().body(Map.of("Error:", "Game failed to start"));
    }
  }
  /**
   *@param session HttpSession - instantiates a http session to persist data across endpoints.
   *Returns gameState as a map of strings and objects as a response entity.
   *This function performs player 'hit' action and ends the game if player busts. Sends a Hashmap response to the front end.
   */
  @PostMapping("/hit")
  public ResponseEntity<Map<String, Object>> playerHit(HttpSession session) {
    //need to lock so http response can come back before updating gamestate
    synchronized (lock) {
      Game game = (Game) session.getAttribute("game");
      boolean gameNull = game != null ? true : false;
      System.out.println(gameNull);
      if (game != null) {
        System.out.println("game not null");
        game.hit(game.getPlayers().getPlayerHand());
        Map<String, Object> gameState = getGameState(game);
        if(game.getPlayers().getPlayerHand().getValue() > 21) {
          endGameLocation = 3;
          Map<String, Object> status = game.endGameStatus(2);
          gameState.put("gameStatus", status);
        }
        session.setAttribute("game", game);
        System.out.println("Hit Gamestate" + gameState);
        return ResponseEntity.ok(gameState);
      }
      return ResponseEntity.badRequest().body(Map.of("Error:", "Game failed to start"));
    }
  }

  /**
   *@param game Game - the Game that has been persisted in the current session
   *Returns gameState - a hashmap including the player's hand, dealer's dan
   *This function updates a gameState hashmap to pass updated game information.
   */
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
      if(game.getPlayers().getHasAce() == true) {
        //indicate to front-end to prompt the user.
        gameState.put("hasAce", true);
      }
      else {
        gameState.put("hasAce", false);
      }
      System.out.println("Game state is: " + gameState);
    }
    return gameState;
  }
}


