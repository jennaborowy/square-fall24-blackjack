/**
 * The file implements main Game logic of blackjack.
 */
package edu.loyola.square.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;
import java.util.List;

public class Game implements Serializable {
  public enum gameStatus {
    PLAYER_WIN,
    DEALER_WIN,
    PUSH,
    PLAYER_BLACKJACK,
    DEALER_BLACKJACK,
    PLAYER_BUST,
    DEALER_BUST,
    IN_PROGRESS
  }

  private Deck deck;
  private Hand dealerHand;
  private List<Player> players;
  private Scanner scanner;
  private boolean gameOver;
  private gameStatus status;
  private int currentPlayerIndex;

  public Game(List<Player> players) {
    this.deck = new Deck();
    this.dealerHand = new Hand(new ArrayList<Card>(), true);
    this.players = players;
    this.scanner = new Scanner(System.in);
    this.gameOver = false;
    this.currentPlayerIndex = 0;
  }

  public ArrayList<Card> drawCards(int count) {
    ArrayList<Card> drawnCards = new ArrayList<Card>();
    for (int i = 0; i < count; i++) {
      Card card = deck.dealCard();
      if (card != null) {
        drawnCards.add(card);
      }
    }
    return drawnCards;
  }

  public void initializeGame() {
    this.deck = new Deck();
    dealerHand = new Hand(drawCards(2), true);
    for (Player player : players) {
      player.setHand(new Hand(drawCards(2), false));
    }
    if(dealerHand.getAceCount() > 0) {
      dealerHand.optimizeAces();
    }
  }

  public void play() {
    // deal dealer hand
    dealerHand.addCard(deck.dealCard());
    dealerHand.addCard(deck.dealCard());
    System.out.println("Dealer: " + dealerHand.getHand().get(0) + " ??  (??)");

    // deal player hands
    for (Player player : players) {
      Hand playerHand = new Hand(new ArrayList<Card>(), false);
      playerHand.addCard(deck.dealCard());
      playerHand.addCard(deck.dealCard());
      player.setHand(playerHand);
      showPlayerHand(player);
    }

    // check for initial blackjacks
    boolean allBlackjack = true;
    for (Player player : players) {
      if (!player.getPlayerHand().blackjack()) {
        allBlackjack = false;
        break;
      }
    }

    if (allBlackjack) {
      gameOver();
    } else {
      takePlayerTurns();
    }
  }

  public void hit(Hand hand) {
    if (deck != null) {
      Card newCard = deck.dealCard();
      if (newCard != null) {
        hand.addCard(newCard);
      }
    }
  }

  public Map<String, Object> endGameStatus(int endpoint) {
    gameOver = true;
    Map<String, Object> gameResult = new HashMap<String, Object>();
    Player currentPlayer = players.get(currentPlayerIndex);

    if(endpoint == 1) {
      if (currentPlayer.getPlayerHand().blackjack()) {
        if (dealerHand.getValue() == 21) {
          status = gameStatus.PUSH;
          currentPlayer.setPayout(0.0);
        } else {
          status = gameStatus.PLAYER_BLACKJACK;
          currentPlayer.setPayout(1.5);
        }
      }
    } else if(endpoint == 2) {
      if (currentPlayer.getPlayerHand().getValue() > 21) {
        status = gameStatus.PLAYER_BUST;
        currentPlayer.setPayout(0.0);
      }
      if (currentPlayer.getPlayerHand().getValue() == 21) {
        if(dealerHand.getValue() == 21) {
          status = gameStatus.PUSH;
          currentPlayer.setPayout(0.0);
        } else {
          status = gameStatus.PLAYER_WIN;
          currentPlayer.setPayout(1.0);
        }
      }
    } else if (endpoint == 3) {
      resolveFinalOutcome(currentPlayer);
    }

    gameResult.put("endStatus", status);
    gameResult.put("payout", currentPlayer.getPayout());
    gameResult.put("endMessage", getResultMessage());
    return gameResult;
  }

  private void resolveFinalOutcome(Player player) {
    if (player.getPlayerHand().getValue() == dealerHand.getValue()) {
      status = gameStatus.PUSH;
      player.setPayout(0.0);
    } else if (player.getPlayerHand().getValue() > dealerHand.getValue() && player.getPlayerHand().getValue() <= 21) {
      status = gameStatus.PLAYER_WIN;
      player.setPayout(1.0);
    } else if (dealerHand.getValue() > 21) {
      status = gameStatus.DEALER_BUST;
      player.setPayout(1.0);
    } else if (player.getPlayerHand().getValue() < dealerHand.getValue() && dealerHand.blackjack()) {
      status = gameStatus.DEALER_BLACKJACK;
      player.setPayout(0.0);
    } else if (player.getPlayerHand().getValue() < dealerHand.getValue() && dealerHand.getValue() <= 21) {
      status = gameStatus.DEALER_WIN;
      player.setPayout(0.0);
    }
  }

  public String getResultMessage() {
    return switch (status) {
      case PLAYER_WIN -> "Player Wins!";
      case DEALER_WIN -> "Dealer Wins!";
      case PUSH -> "PUSH";
      case PLAYER_BUST -> "Player Busted!";
      case DEALER_BUST -> "Dealer Busted!";
      case PLAYER_BLACKJACK -> "Blackjack!";
      case DEALER_BLACKJACK -> "Dealer Blackjack!";
      default -> "IN_PLAY";
    };
  }

  public Hand getDealerHand() {
    return dealerHand;
  }

  public List<Player> getPlayers() {
    return this.players;
  }

  public Player getCurrentPlayer() {
    return players.get(currentPlayerIndex);
  }

  public void nextPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.size();
  }

  private void showPlayerHand(Player player) {
    System.out.println(player.getName() + ": " + player.getPlayerHand() + " (" + player.getPlayerHand().getValue() + ")");
  }

  private void showDealerHand() {
    System.out.println("Dealer: " + dealerHand + " (" + dealerHand.getValue() + ")");
  }

  private void takePlayerTurns() {
    for (currentPlayerIndex = 0; currentPlayerIndex < players.size(); currentPlayerIndex++) {
      if (!players.get(currentPlayerIndex).getPlayerHand().blackjack()) {
        takePlayerTurn(players.get(currentPlayerIndex));
      }
    }
    takeDealerTurn();
    gameOver();
  }

  private void takePlayerTurn(Player player) {
    while (!gameOver) {
      showPlayerOptions();
      String action = scanner.nextLine().toUpperCase();
      switch (action) {
        case "H" -> handleHitAction(player);
        case "S" -> {
          return;
        }
        case "A" -> handleAceAction(player);
        default -> System.out.println("Invalid option. Please try again.");
      }
    }
  }

  private void handleHitAction(Player player) {
    Card newCard = deck.dealCard();
    player.getPlayerHand().addCard(newCard);
    showPlayerHand(player);
    if (player.getPlayerHand().getValue() > 21) {
      gameOver = true;
    }
  }

  private void handleAceAction(Player player) {
    if ((player.getPlayerHand().getAceCount() > 0) && (player.getPlayerHand().getValue(11) <= 21)) {
      promptPlayerAce(player);
    } else {
      System.out.println("Invalid option. Please try again.");
    }
  }

  private void showPlayerOptions() {
    System.out.println("(h)it");
    System.out.println("(s)tand");
    Player currentPlayer = players.get(currentPlayerIndex);
    if ((currentPlayer.getPlayerHand().getAceCount() > 0) &&
            (currentPlayer.getPlayerHand().getValue(11) <= 21)) {
      System.out.println("(a)ces");
    }
  }

  private void promptPlayerAce(Player player) {
    System.out.println("Ace value (1 or 11): ");
    while (true) {
      try {
        int value = Integer.parseInt(scanner.nextLine());
        if (value == 1 || value == 11) {
          player.getPlayerHand().setAceValue(value);
          showPlayerHand(player);
          return;
        } else {
          System.out.println("Invalid value. Please enter 1 or 11.");
        }
      } catch (NumberFormatException e) {
        System.out.println("Invalid value. Please enter 1 or 11.");
      }
    }
  }

  public void takeDealerTurn() {
    while (dealerHand.getValue() < 17) {
      Card newCard = deck.dealCard();
      dealerHand.addCard(newCard);
    }
  }

  private void gameOver() {
    gameOver = true;
    System.out.println("Game Over");
    showDealerHand();
    for (Player player : players) {
      showPlayerHand(player);
      resolvePlayerOutcome(player);
    }
  }

  private void resolvePlayerOutcome(Player player) {
    if (player.getPlayerHand().blackjack()) {
      handleBlackjackOutcome(player);
    } else {
      handleRegularOutcome(player);
    }
  }

  private void handleBlackjackOutcome(Player player) {
    if (dealerHand.getValue() == 21) {
      System.out.println("Push!");
      player.setPayout(0.0);
    } else {
      System.out.println("Blackjack!");
      player.setPayout(1.5);
    }
  }

  private void handleRegularOutcome(Player player) {
    if (player.getPlayerHand().getValue() == dealerHand.getValue()) {
      System.out.println("Push!");
      player.setPayout(0.0);
    } else if (player.getPlayerHand().getValue() > 21) {
      System.out.println("Player Bust!");
      player.setPayout(0.0);
    } else if (dealerHand.getValue() > 21) {
      System.out.println("Dealer Bust!");
      player.setPayout(1.0);
    } else if (player.getPlayerHand().getValue() > dealerHand.getValue()) {
      System.out.println("Player Wins!");
      player.setPayout(1.0);
    } else {
      System.out.println("Dealer Wins!");
      player.setPayout(0.0);
    }
    System.out.printf("$%1.02f\n", player.getPayout());
  }
}