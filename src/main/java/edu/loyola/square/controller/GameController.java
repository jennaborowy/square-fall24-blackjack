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
@SessionAttributes("game")
@CrossOrigin(origins = "http://localhost:3001")
public class GameController
{

  //establish player hand and dealer hand
  //deal to both (or draw card) [start game]

  //player hit -> could be implemented in game and then called here
  //player stand

  private Deck deck;
  //private Player player;
  private Hand dealerHand;
  private final Object lock = new Object();


  //game needs to persist for the session (the player)
  @ModelAttribute("game")
  //parameter could be edited later to have a list of players

  public Game newGame() {
    Game game = new Game(new Player("Player 1", 100));
    return game;
  }
  @GetMapping("/hello")
  public String hello() {
    return "Hello World";
  }

  //using hashmap, so information of the game can be added in key,value pairs and returned in JSON
  @PostMapping("/stand")
  public ResponseEntity<Map<String,Object>> playerStand(HttpSession session) {
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
  /*
   public ResponseEntity playerStand(@ModelAttribute("game") Game game) {
    //could pose issue: will the JSON information parse before dealer finishes their turn?
    game.stand();
    //game ends after dealer's turn
    return ResponseEntity.ok(getGameState(game));
  }
*/


  @PostMapping("/gamestart")
  public Map<String, Object> startGame(HttpSession session)
  {
    //instance of game established at beginning of session (persistence
    Game newGame = new Game(new Player("Player 1", 100));
    session.setAttribute("game", newGame);
    //Game game = new Game(new Player("Player 1", 100));
    this.deck = new Deck();
    //need to use this new deck when drawing cards
    this.dealerHand = new Hand(drawCards(deck,2), true);
    newGame.getPlayers().setHand(new Hand(drawCards(deck,2), false));
    newGame.beginPlay();
    Map<String, Object> gameState = getGameState(newGame);
    //game could end here if winner gets Blackjack, so return the result
    return gameState;

}

  @PostMapping("/hit")
  public ResponseEntity<Map<String,Object>> playerHit(HttpSession session) {
    //need to lock so http response can come back before updating gamestate
    synchronized (lock) {
      Game game = (Game) session.getAttribute("game");
      if (game != null) {
        game.hit(game.getPlayers().getHand());
        Map<String, Object> gameState = getGameState(game);
        return ResponseEntity.ok(gameState);
      }
      return ResponseEntity.badRequest().body(Map.of("Error:", "Game failed to start"));
    }
  }

  private Map<String, Object> getGameState(@ModelAttribute("game")Game game)
  {
    Map<String, Object> gameState = new HashMap<String, Object>();
    if(game != null)
    {
      gameState.put("playerHand", game.getPlayers().getHand());
      gameState.put("playerValue", game.getPlayers().getHand().getValue());
      if (dealerHand != null)
      {
        gameState.put("dealerHand", dealerHand.getHand());
        gameState.put("dealerValue", dealerHand.getValue());
      }
      System.out.println("Game state is: " + gameState);
      //updates json hashmap of hand data as game continues
    }
    return gameState;
  }

  @GetMapping("/draw/{count}")
  public ArrayList<Card> drawCards(Deck deck, @PathVariable int count)
  {
    ArrayList<Card> drawnCards = new ArrayList<Card>();
    for (int i = 0; i < count; i++)
    {
      Card card = deck.dealCard();
      if (card != null)
      {
        drawnCards.add(card);
      }
    }
    return drawnCards;
  }

}


