package edu.loyola.square.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;

public class Game implements Serializable
{
  public enum gameStatus {
    PLAYER_WIN,
    DEALER_WIN,
    PUSH,
    PLAYER_BLACKJACK,
    PLAYER_BUST,
    DEALER_BUST,
    IN_PROGRESS
  }

  private Deck deck;
  private Hand dealerHand;
  private Hand playerHand;
  private Player player;
  private Scanner scanner;
  private boolean gameOver;
  private gameStatus status;
  private double payout;
  public Game(Player player)
  {
    deck = new Deck();
    dealerHand = new Hand(new ArrayList<Card>(), true);
    playerHand = new Hand(new ArrayList<Card>(), false);
    this.player = player;
    scanner = new Scanner(System.in);
    gameOver = false;
  }

  public ArrayList<Card> drawCards(int count)
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

  public void initializeGame()
  {
    this.deck = new Deck();
    dealerHand = new Hand(drawCards(2), true);
    player.setHand(new Hand(drawCards(2), false));
  }

  public void play()
  {
    // deal dealer hand
    dealerHand.addCard(deck.dealCard());
    dealerHand.addCard(deck.dealCard());
    //dealerHand.addCard(deck.dealCard("A", "S"));
    //dealerHand.addCard(deck.dealCard("3", "C"));
    System.out.println("Dealer: " + dealerHand.getHand().get(0) + " ??  (??)");

    // deal player hand
    playerHand.addCard(deck.dealCard());
    playerHand.addCard(deck.dealCard());
    //playerHand.addCard(deck.dealCard("2", "D"));
    //playerHand.addCard(deck.dealCard("A", "H"));
    showPlayerHand();

    // see if we were dealt "pocket blackjack"
    if (playerHand.blackjack())
    {
      gameOver();
    }
    else
    {
      takePlayerTurn();
    }
  }

  /**
   * purpose: refactored hit to perform action of getting a new card at user request
   *
   * @param hand, the player's hand
   */
  public void hit(Hand hand)
  {
    if (deck != null)
    {
      Card newCard = deck.dealCard();
      if (newCard != null)
      {
        hand.addCard(newCard);
      }
    }
    if(player.getPlayerHand().getValue() > 21)
    {
      gameOver();
    }
    else if (player.getPlayerHand().getValue() == 21)
    {
      //takeDealerTurn();
      gameOver();
    }
  }

  /**
   * performs stand action in controller
   */
  public void stand()
  {
    takeDealerTurn();
    gameOver();
  }
  public Map<String, Object> endGameStatus()
  {
    gameOver = true;
    Map<String, Object> gameResult = new HashMap<String, Object>();
    if(player.getPlayerHand().blackjack())
    {
      if (dealerHand.getValue() == 21)
      {
        status =  gameStatus.PUSH;
        payout = 0.0;
      }
      else
      {
        status =  gameStatus.PLAYER_BLACKJACK;
        payout = 1.5;
      }
    }
    else
    {
      if (playerHand.getValue() == dealerHand.getValue())
      {
        status =  gameStatus.PUSH;
        payout = 0.0;
      }
      else if (playerHand.getValue() > 21)
      {
        status =  gameStatus.PLAYER_BUST;
        payout = 0.0;
      }
      else if (dealerHand.getValue() > 21)
      {
        status = gameStatus.DEALER_BUST;
        payout = 1.0;
      }
      else if (playerHand.getValue() > dealerHand.getValue())
      {
        status =  gameStatus.PLAYER_WIN;
        payout = 1.0;
      }
      else
      {
        status =  gameStatus.DEALER_WIN;
        payout = 0.0;
      }
    }
    player.setPayout(payout);
    gameResult.put("endStatus", status);
    gameResult.put("payout", payout);
    gameResult.put("endMessage", getResultMessage());
   return gameResult;
  }

  public String getResultMessage() {
    switch (status)
    {
      case PLAYER_WIN:
        return "Player Wins!";
      case DEALER_WIN:
        return "Dealer Wins!";
      case PUSH:
        return "PUSH";
      case PLAYER_BUST:
        return "Player Busted!";
      case DEALER_BUST:
        return "Dealer Busted!";
      case PLAYER_BLACKJACK:
        return "Blackjack!";
      default:
        return "IN_PLAY";
    }

  }
  public Hand getDealerHand()
  {
    return dealerHand;
  }

  public Hand getPlayerHand()
  {
    return player.getPlayerHand();
  }

  //can be changed to list of players later
  public Player getPlayers()
  {
    return this.player;
  }

  private void showPlayerHand()
  {
    System.out.println(player.getName() + ": " + playerHand + " (" + playerHand.getValue() + ")");
  }

  private void showDealerHand()
  {
    System.out.println("Dealer: " + dealerHand + " (" + dealerHand.getValue() + ")");
  }

  private void showPlayerOptions()
  {
    System.out.println("(h)it");
    System.out.println("(s)tand");
    if ((playerHand.getAceCount() > 0) && (playerHand.getValue(11) <= 21))
    {
      System.out.println("(a)ces");
    }
  }

  private void promptPlayerAce()
  {
    System.out.println("Ace value (1 or 11): ");
    while (true)
    {
      try
      {
        int value = Integer.parseInt(scanner.nextLine());
        if (value == 1 || value == 11)
        {
          playerHand.setAceValue(value);
          showPlayerHand();
          return;
        }
        else
        {
          System.out.println("Invalid value. Please enter 1 or 11.");
        }
      }
      catch (NumberFormatException e)
      {
        System.out.println("Invalid value. Please enter 1 or 11.");
      }
    }
  }

  private void takePlayerTurn() {
    while (!gameOver)
    {
      showPlayerOptions();
      String action = scanner.nextLine().toUpperCase();
      switch (action)
      {
        case "H":
          Card newCard = deck.dealCard();
          playerHand.addCard(newCard);
          showPlayerHand();
          if (playerHand.getValue() > 21)
          {
            gameOver();
          }
          else if (playerHand.getValue() == 21)
          {
            takeDealerTurn();
            gameOver();
          }
          break;
        case "S":
          takeDealerTurn();
          gameOver();
          break;
        case "A":
          if ((playerHand.getAceCount() > 0) && (playerHand.getValue(11) <= 21))
          {
            promptPlayerAce();
          }
          else
          {
            System.out.println("Invalid option. Please try again.");
          }
          break;
        default:
          System.out.println("Invalid option. Please try again.");
      }
    }
  }

  private void takeDealerTurn()
  {
    while (dealerHand.getValue() < 17)
    {
      Card newCard = deck.dealCard();
      dealerHand.addCard(newCard);
    }
  }

  private void gameOver()
  {
    gameOver = true;
    System.out.println("Game Over");
    showDealerHand();
    showPlayerHand();
    if (playerHand.blackjack())
    {
      if (dealerHand.getValue() == 21)
      {
        System.out.println("Push!");
        player.setPayout(0.0);
      }
      else
      {
        System.out.println("Blackjack!");
        player.setPayout(1.5);
      }
    }
    else
    {
      if (playerHand.getValue() == dealerHand.getValue())
      {
        System.out.println("Push!");
        player.setPayout(0.0);
      }
      else if (playerHand.getValue() > 21)
      {
        System.out.println("Player Bust!");
        player.setPayout(0.0);
      }
      else if (dealerHand.getValue() > 21)
      {
        System.out.println("Dealer Bust!");
        player.setPayout(1.0);
      }
      else if (playerHand.getValue() > dealerHand.getValue())
      {
        System.out.println("Player Wins!");
        player.setPayout(1.0);
      }
      else
      {
        System.out.println("Dealer Wins!");
        player.setPayout(0.0);
      }
      System.out.printf("$%1.02f\n", player.getPayout());
    }
  }
} // Game