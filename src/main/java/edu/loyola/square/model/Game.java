package edu.loyola.square.model;
import java.util.ArrayList;
import java.util.Scanner;

public class Game {
  private Deck deck;
  private Hand playerHand;
  private Hand dealerHand;
  private Player player;
  private Scanner scanner;

  public Game(Player player) {
    this.player = player;
    this.deck = new Deck();
    this.playerHand = new Hand(new ArrayList<Card>(), false, 0);
    this.dealerHand = new Hand(new ArrayList<Card>(), true, 0);
    this.scanner = new Scanner(System.in);
  }

  public void start() {
    dealInitialCards();
    showHands();

    if (hasNaturalBlackjack()) {
      System.out.println("Natural Blackjack! You win!");
      payout(2.0);
      return;
    }

    handleInitialAces();

    if (playerHand.getPointValue() == 21) {
      System.out.println("21! You win!");
      payout(1.5);
      return;
    }

    playerTurn();
  }

  private boolean hasNaturalBlackjack() {
    if (playerHand.getHand().size() == 2) {
      Card card1 = playerHand.getHand().get(0);
      Card card2 = playerHand.getHand().get(1);

      if ((card1.getRank().equals("A") && isValueTen(card2)) ||
        (card2.getRank().equals("A") && isValueTen(card1))) {
        setAllAcesInHand(playerHand, 11);
        return true;
      }
    }
    return false;
  }

  private boolean isValueTen(Card card) {
    return card.getValue() == 10;
  }

  private void dealInitialCards() {
    dealerHand.addCard(deck.dealCard());
    dealerHand.addCard(deck.dealCard());

    playerHand.addCard(deck.dealCard());
    playerHand.addCard(deck.dealCard());

    // Initialize all aces to 1 by default
    if (hasAces(playerHand)) {
      setAllAcesInHand(playerHand, 1);
    }
  }

  private void handleInitialAces() {
    if (hasAces(playerHand)) {
      optimizeAceValues();
      if (playerHand.getPointValue() != 21) {
        promptForAceValue();
      }
    }
  }

  private void optimizeAceValues() {
    int nonAceTotal = getNonAceTotal(playerHand);
    int numAces = countAces(playerHand);

    // If setting all aces to 11 would bust, set them all to 1
    if (nonAceTotal + (11 * numAces) > 21) {
      setAllAcesInHand(playerHand, 1);
    } else {
      setAllAcesInHand(playerHand, 11);
    }
  }

  private void showCurrentHand() {
    System.out.println("Current hand: " + playerHand);
    System.out.println("Current point value: " + playerHand.getPointValue());
  }

  private void showHands() {
    System.out.println("\nPlayer's Hand: " + playerHand);
    System.out.println("Current hand value: " + playerHand.getPointValue());
    System.out.println("Dealer's Hand: " + dealerHand.getHand().get(0) + " [Hidden]");
  }

  private void promptForAceValue() {
    System.out.println("\nYou have " + countAces(playerHand) + " ace(s) in your hand.");
    showCurrentHand();
    System.out.println("Choose the value for all aces (1 or 11):");

    while (true) {
      try {
        int aceValue = Integer.parseInt(scanner.nextLine());
        if (aceValue == 1 || aceValue == 11) {
          setAllAcesInHand(playerHand, aceValue);
          System.out.println("All aces set to " + aceValue);
          showCurrentHand();
          return;
        } else {
          System.out.println("Invalid value. Please enter 1 or 11:");
        }
      } catch (NumberFormatException e) {
        System.out.println("Invalid input. Please enter 1 or 11:");
      }
    }
  }

  private void playerTurn() {
    while (true) {
      showPlayerOptions();
      String action = scanner.nextLine().toUpperCase();

      switch (action) {
        case "H":
          Card newCard = deck.dealCard();
          playerHand.addCard(newCard);
          System.out.println("\nYou drew: " + newCard);

          if (hasAces(playerHand)) {
            optimizeAceValues();
            if (playerHand.getPointValue() > 21) {
              setAllAcesInHand(playerHand, 1);
            }
          }

          showCurrentHand();

          if (playerHand.getPointValue() == 21) {
            System.out.println("21! You win!");
            payout(1.5);
            return;
          }
          if (playerHand.getPointValue() > 21) {
            System.out.println("You busted! Dealer wins.");
            return;
          }
          break;
        case "S":
          if (playerHand.getPointValue() == 21) {
            System.out.println("21! You win!");
            payout(1.5);
          } else {
            dealerTurn();
            determineOutcome();
          }
          return;
        case "A":
          if (hasAces(playerHand)) {
            promptForAceValue();
          } else {
            System.out.println("No aces in your hand!");
          }
          break;
        default:
          System.out.println("Invalid option. Please try again.");
      }
    }
  }

  private void showPlayerOptions() {
    System.out.println("\nYour options:");
    System.out.println("(H)it - Draw another card");
    System.out.println("(S)tand - End your turn");
    if (hasAces(playerHand)) {
      System.out.println("(A)ces - Change ace values");
    }
    System.out.println("\nWhat would you like to do?");
  }

  private void setAllAcesInHand(Hand hand, int value) {
    for (Card card : hand.getHand()) {
      if (card.getRank().equals("A")) {
        card.setAceValue(value);
      }
    }
    hand.recalculatePoints();
  }

  private int getNonAceTotal(Hand hand) {
    int total = 0;
    for (Card card : hand.getHand()) {
      if (!card.getRank().equals("A")) {
        total += card.getValue();
      }
    }
    return total;
  }

  private int countAces(Hand hand) {
    int count = 0;
    for (Card card : hand.getHand()) {
      if (card.getRank().equals("A")) {
        count++;
      }
    }
    return count;
  }

  private boolean hasAces(Hand hand) {
    for (Card card : hand.getHand()) {
      if (card.getRank().equals("A")) {
        return true;
      }
    }
    return false;
  }

  private void dealerTurn() {
    System.out.println("\nDealer reveals hidden card: " + dealerHand);
    while (dealerHand.getPointValue() < 17) {
      System.out.println("Dealer hits...");
      Card newCard = deck.dealCard();
      dealerHand.addCard(newCard);
      System.out.println("Dealer drew: " + newCard);
      System.out.println("Dealer's Hand: " + dealerHand);

      if (dealerHand.getPointValue() > 21 && hasAces(dealerHand)) {
        setAllAcesInHand(dealerHand, 1);
      }

      if (dealerHand.getPointValue() > 21) {
        System.out.println("Dealer busted! You win!");
        payout(1.5);
        return;
      }
    }
  }

  private void determineOutcome() {
    int playerTotal = playerHand.getPointValue();
    int dealerTotal = dealerHand.getPointValue();

    System.out.println("\nFinal hands:");
    System.out.println("Player: " + playerTotal);
    System.out.println("Dealer: " + dealerTotal);

    if (playerTotal > dealerTotal) {
      System.out.println("You win!");
      payout(1.5);
    } else if (dealerTotal > playerTotal) {
      System.out.println("Dealer wins!");
    } else {
      System.out.println("It's a push!");
      payout(0.0);
    }
  }

  private void payout(double multiplier) {
    double winnings = player.getBet() * multiplier;
    if (winnings > 0) {
      System.out.println("You won $" + winnings + "!");
    } else if (winnings == 0) {
      System.out.println("Your bet is returned.");
    }
  }
}