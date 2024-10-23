package edu.loyola.square.model;

import java.util.ArrayList;
import java.util.Scanner;

public class Game {

  private Deck deck;
  private Hand dealerHand;
  private Hand playerHand;
  private Player player;
  private Scanner scanner;
  private boolean gameOver;

  public Game(Player player) {
    deck = new Deck();
    dealerHand = new Hand(new ArrayList<Card>(), true);
    playerHand = new Hand(new ArrayList<Card>(), false);
    this.player = player;
    scanner = new Scanner(System.in);
    gameOver = false;
  }

  /**
   * This function drives the main game, dealing cards and starting the player's turn
   */
  public void play() {
    // deal dealer hand
    dealerHand.addCard(deck.dealCard());
    dealerHand.addCard(deck.dealCard());
    System.out.println("Dealer: " + dealerHand.getHand().get(0) + " ??  (??)");

    // deal player hand
    playerHand.addCard(deck.dealCard());
    playerHand.addCard(deck.dealCard());
    showPlayerHand();

    // see if we were dealt "pocket blackjack"
    if (playerHand.blackjack()) {
      gameOver();
    }
    else {
      takePlayerTurn();
    }
  }

  /**
   * This function shows the players hand to the screen
   */
  private void showPlayerHand() {
    System.out.println(player.getName() + ": " + playerHand + " (" + playerHand.getValue() + ")");
  }

  /**
   * This function shows the dealers hand to the screen
   */
  private void showDealerHand() {
    System.out.println("Dealer: " + dealerHand + " (" + dealerHand.getValue() + ")");
  }

  /**
   * This function shows what options the player has at that point in the game
   */
  private void showPlayerOptions() {
    System.out.println("(h)it");
    System.out.println("(s)tand");
    if ((playerHand.getAceCount() > 0) && (playerHand.getValue(11) <= 21)) {
      System.out.println("(a)ces");
    }
  }

  /**
   * This function asks the player what value (1 or 11) the player wants their ace to be
   */
  private void promptPlayerAce() {
    System.out.println("Ace value (1 or 11): ");
    while (true) {
      try {
        int value = Integer.parseInt(scanner.nextLine());
        if (value == 1 || value == 11) {
          playerHand.setAceValue(value);
          showPlayerHand();
          return;
        }
        else {
          System.out.println("Invalid value. Please enter 1 or 11.");
        }
      } catch (NumberFormatException e) {
        System.out.println("Invalid value. Please enter 1 or 11.");
      }
    }
  }

  /**
   * This function plays out the players turn, accepting user input and implementing game logic
   */
  private void takePlayerTurn() {
    while (!gameOver) {
      showPlayerOptions();
      String action = scanner.nextLine().toUpperCase();
      switch (action) {
        case "H":
          Card newCard = deck.dealCard();
          playerHand.addCard(newCard);
          showPlayerHand();
          if (playerHand.getValue() > 21) {
            gameOver();
          }
          else if (playerHand.getValue() == 21) {
            takeDealerTurn();
            gameOver();
          }
          break;
        case "S":
          takeDealerTurn();
          gameOver();
          break;
        case "A":
          if ((playerHand.getAceCount() > 0) && (playerHand.getValue(11) <= 21)) {
            promptPlayerAce();
          }
          else {
            System.out.println("Invalid option. Please try again.");
          }
          break;
        default:
          System.out.println("Invalid option. Please try again.");
      }
    }
  }

  /**
   * This function plays the dealer's turn once the player's turn is over
   */
  private void takeDealerTurn() {
    while (dealerHand.getValue() < 17) {
      Card newCard = deck.dealCard();
      dealerHand.addCard(newCard);
    }
  }

  /**
   * This function resolves the outcome of the game and determines who won
   */
  private void gameOver() {
    gameOver = true;
    System.out.println("Game Over");
    showDealerHand();
    showPlayerHand();
    if (playerHand.blackjack()) {
      if (dealerHand.getValue() == 21) {
        System.out.println("Push!");
        player.setPayout(0.0);
      }
      else {
        System.out.println("Blackjack!");
        player.setPayout(1.5);
      }
    }
    else {
      if (playerHand.getValue() == dealerHand.getValue()) {
          System.out.println("Push!");
          player.setPayout(0.0);
      }
      else if (playerHand.getValue() > 21) {
        System.out.println("Player Bust!");
        player.setPayout(0.0);
      }
      else if (dealerHand.getValue() > 21) {
        System.out.println("Dealer Bust!");
        player.setPayout(1.0);
      }
      else if (playerHand.getValue() > dealerHand.getValue()) {
        System.out.println("Player Wins!");
        player.setPayout(1.0);
      }
      else {
        System.out.println("Dealer Wins!");
        player.setPayout(0.0);
      }
      System.out.printf("$%1.02f\n", player.getPayout());
    }
  }
} // Game