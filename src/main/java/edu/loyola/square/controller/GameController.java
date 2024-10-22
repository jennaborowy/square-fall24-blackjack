package edu.loyola.square.controller;
import edu.loyola.square.model.Deck;
import edu.loyola.square.model.Card;
import edu.loyola.square.model.Player;
import edu.loyola.square.model.Hand;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;


@RestController
public class GameController
{

  //establish player hand and dealer hand
  //deal to both (or draw card) [start game]

  //player hit -> could be implemented in game and then called here
  //player stand

  private Deck deck;
  private Hand playerHand;
  private Hand dealerHand;

  @GetMapping("/hello")
  public String hello()
  {
    return "Hello World";
  }
  //using hashmap, so information of the game can be added in key,value pairs and returned in JSON
  @PostMapping("/stand")
  public Map<String, Object> playerStand() {
    while(dealerHand.getValue() < 17)
      dealerHand.addCard(deck.dealCard());
    String res = "You win"; //winner statement -> make winner function
    return getGameState(res);
  }

  //nothing to update (game isnt over)
  private Map<String, Object> getGameState()
  {
    return getGameState(null);
  }

  private Map<String, Object> getGameState(String res)
  {
    Map<String, Object> gameState = new HashMap<String, Object>();
    //put player hand, get hand
    //put dealer hand, get hand
    //put player total, get point
    //put dealer total, get points

    return gameState;
  }

  @GetMapping("/draw/{count}")
  public ArrayList<Card> drawCards(@PathVariable int count)
  {
    ArrayList<Card> drawnCards = new ArrayList<Card>();
    for (int i = 0; i < count; i++)
    {
      Card card = deck.dealCard(); // Deal a card from the deck
      if (card != null)
      {
        drawnCards.add(card);
      }
    }
    return drawnCards; // Return the list of drawn cards
  }

}


