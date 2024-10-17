package src.main.java.edu.loyola.model;

import java.util.ArrayList;
import java.util.Scanner;
public class Game
{
  double PAYOUT_RATIO = 1.5;

  private Deck deck;
  private Hand playerHand;
  private Hand dealerHand;
  private Player player;

  //playerName will need to be a list of players. Player will have a bet
  public Game(Player player)
  {

    // Initialize the player
    this.player = player;
    deck = new Deck();

    ArrayList<Card> dealtCard = new ArrayList<Card>();
    playerHand = new Hand(new ArrayList<Card>(), false, 0);
    dealerHand = new Hand(new ArrayList<Card>(), true, 0);



    // Deal two cards to player and dealer each at the start of the game
    playerHand.addCard(deck.dealCard());
    playerHand.addCard(deck.dealCard());

    dealerHand.addCard(deck.dealCard());
    dealerHand.addCard(deck.dealCard());
  }

  // Method to start the game
  public void start()
  {
    Scanner scanner = new Scanner(System.in);

    // Show player's cards and one of dealer's cards (the other is hidden)
    System.out.println("Player's Hand: " + playerHand);
    System.out.println("Dealer's Hand: " + dealerHand.getHand().get(0) + " [Hidden]");

    // Player's turn
    while (true)
    {
      System.out.println("Your hand value: " + playerHand.getPointValue());

      if (playerHand.getPointValue() == 21)
      {
        System.out.println("Blackjack! You win!");
        PAYOUT_RATIO = 2.0;
        System.out.println("You won " + player.getBet()*PAYOUT_RATIO + " !");
        return;
      }

      System.out.println("Do you want to (H)it or (S)tand?");
      String action = scanner.nextLine().toUpperCase();

      if (action.equals("H"))
      {
        playerHand.addCard(deck.dealCard());
        System.out.println("Player's Hand: " + playerHand);

        // Check if player busts
        if (playerHand.getPointValue() > 21)
        {
          System.out.println("You busted! Game over.");
          return;
        }
        if (playerHand.getPointValue() == 21)
        {
          System.out.println("You won " + player.getBet()*PAYOUT_RATIO + " !");
          return;
        }

      }
      else if (action.equals("S"))
      {
        break; // Player chooses to stand
      }
    }
// Dealer's turn
    System.out.println("Dealer reveals hidden card: " + dealerHand);
    while (dealerHand.getPointValue() < 17)
    {
      System.out.println("Dealer hits...");
      dealerHand.addCard(deck.dealCard());
      System.out.println("Dealer's Hand: " + dealerHand);

      // Check if dealer busts
      if (dealerHand.getPointValue() > 21)
      {
        System.out.println("Dealer busted! You win!");
        //a 3 to 2 payout ratio
        System.out.println("You won " + player.getBet()*PAYOUT_RATIO + " !");
        PAYOUT_RATIO = 1.5;
        return;
      }
    }

    // Compare hands
    int playerTotal = playerHand.getPointValue();
    int dealerTotal = dealerHand.getPointValue();

    System.out.println("Player's final hand: " + playerTotal);
    System.out.println("Dealer's final hand: " + dealerTotal);

    if (playerTotal > dealerTotal)
    {
      System.out.println("You win!");
      //a 3 to 2 payout ratio
      System.out.println("You won " + player.getBet()*PAYOUT_RATIO + " !");
      PAYOUT_RATIO = 1.5;
    }
    else if (dealerTotal > playerTotal)
    {
      System.out.println("Dealer wins!");
    }
    else
    {
      System.out.println("It's a push!");
    }
  }
}