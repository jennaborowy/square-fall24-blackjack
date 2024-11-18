package edu.loyola.square.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.Serializable;
import java.util.*;
import java.io.IOException;

@SpringBootApplication
@RestController
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class GameController implements Serializable {


  private static final Logger logger = LoggerFactory.getLogger(GameController.class);

  private void logDebug(String message) {
    logger.debug(message);  // Changed from info to debug
    logger.info(message);   // Keep info if needed
    System.out.println(message);  // Keep console output if needed
  }

  public enum GameStatus {
    PLAYER_WIN,
    DEALER_WIN,
    PUSH,
    PLAYER_BLACKJACK,
    DEALER_BLACKJACK,
    PLAYER_BUST,
    DEALER_BUST,
    IN_PROGRESS,
    NEXT_PLAYER
  }

  private final Object lock = new Object();
  private Deck deck;
  private List<Card> dealerHand;
  private Map<String, List<Card>> playerHands;
  private List<String> players;
  private int playerIndex;
  private boolean gameStarted;
  private Map<String, Boolean> playerTurnComplete;
  private Map<String, GameStatus> playerStatuses;

  private static class Card {
    private final String suit;
    private final String rank;

    public Card(String suit, String rank) {
      this.suit = suit;
      this.rank = rank;
    }

    public String getSuit() { return suit; }
    public String getRank() { return rank; }
    public int getValue() {
      return switch (rank) {
        case "A" -> 11;
        case "K", "Q", "J" -> 10;
        default -> Integer.parseInt(rank);
      };
    }
  }

  private static class Deck {
    private final List<Card> cards = new ArrayList<>();
    private static final String[] SUITS = {"H", "D", "C", "S"};
    private static final String[] RANKS = {"A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"};

    public Deck() {
      for (String suit : SUITS) {
        for (String rank : RANKS) {
          cards.add(new Card(suit, rank));
        }
      }
      Collections.shuffle(cards);
    }

    public Card dealCard() {
      return !cards.isEmpty() ? cards.remove(0) : null;
    }
  }

  @PostMapping("/gamestart")
  public ResponseEntity<Map<String, Object>> startGame(@RequestBody Map<String, Object> request) {
    synchronized (lock) {
      this.deck = new Deck();
      this.players = (List<String>) request.get("players");
      this.playerIndex = 0;
      this.gameStarted = true;
      this.playerHands = new HashMap<>();
      this.playerTurnComplete = new HashMap<>();
      this.dealerHand = new ArrayList<>();
      this.playerStatuses = new HashMap<>();

      // Set all players to in progress status at start of game
      for (String playerId : players) {
        playerStatuses.put(playerId, GameStatus.IN_PROGRESS);
        playerTurnComplete.put(playerId, false);

        List<Card> hand = new ArrayList<>();
        hand.add(deck.dealCard());
        hand.add(deck.dealCard());
        playerHands.put(playerId, hand);

        // Check for initial blackjack
        if (calculateHandValue(hand) == 21) {
          playerTurnComplete.put(playerId, true);
          playerStatuses.put(playerId, GameStatus.PLAYER_BLACKJACK);
          playerIndex = (playerIndex + 1);
        }
      }

      // Deal initial cards
      dealerHand.add(deck.dealCard());
      dealerHand.add(deck.dealCard());

      Map<String, Object> gameState = getGameState();
      return ResponseEntity.ok(gameState);
    }
  }

  @PostMapping("/hit")
  public ResponseEntity<Map<String, Object>> playerHit() {
    synchronized (lock) {
      if (playerIndex >= players.size()) {
        return ResponseEntity.ok(getGameState());
      }

      String currentPlayer = players.get(playerIndex);

      // Check if player has already busted or won
      GameStatus playerStatus = playerStatuses.get(currentPlayer);
      if (playerStatus == GameStatus.PLAYER_BUST ||
              playerStatus == GameStatus.PLAYER_WIN ||
              playerTurnComplete.get(currentPlayer)) {
        return ResponseEntity.badRequest().body(Map.of(
                "error", "Invalid player state for hit.",
                "playerStatus", playerStatus,
                "playerIndex", playerIndex,
                "currentPlayer", currentPlayer
        ));
      }

      List<Card> currentHand = playerHands.get(currentPlayer);
      currentHand.add(deck.dealCard());

      int handValue = calculateHandValue(currentHand);
      if (handValue > 21) {
        playerStatuses.put(currentPlayer, GameStatus.PLAYER_BUST);
        playerTurnComplete.put(currentPlayer, true);
        advanceTurn();
      } else if (handValue == 21) {
        playerStatuses.put(currentPlayer, GameStatus.PLAYER_WIN);
        playerTurnComplete.put(currentPlayer, true);
        advanceTurn();
      }

      Map<String, Object> response = getGameState();
      response.put("currentPlayerIndex", playerIndex);
      response.put("currentPlayerStatus", playerStatuses.get(currentPlayer));

      return ResponseEntity.ok(response);
    }
  }

  @PostMapping("/stand")
  public ResponseEntity<Map<String, Object>> playerStand() {
    synchronized (lock) {
      if (playerIndex >= players.size()) {
        return ResponseEntity.ok(getGameState()); // Return current state instead of error
      }

      String currentPlayer = players.get(playerIndex);
      playerTurnComplete.put(currentPlayer, true);
      advanceTurn();

      if (shouldDealerPlay()) {
        playDealer();
      }
      return ResponseEntity.ok(getGameState());
    }
  }

  @PostMapping("/promptAce")
  public ResponseEntity<Map<String, Object>> promptAce(@RequestBody Map<String, Object> request) {
    synchronized (lock) {
      Integer aceValue = (Integer) request.get("aceValue");
      String currentPlayer = players.get(playerIndex);
      List<Card> currentHand = playerHands.get(currentPlayer);
      int handValue = calculateHandValue(currentHand);

      if (handValue > 21) {
        playerTurnComplete.put(currentPlayer, true);
        playerStatuses.put(currentPlayer, GameStatus.PLAYER_BUST);

        if (shouldDealerPlay()) {
          playDealer();
        }
      } else if (handValue == 21) {
        playerTurnComplete.put(currentPlayer, true);
        playerStatuses.put(currentPlayer, GameStatus.PLAYER_WIN);

        if (shouldDealerPlay()) {
          playDealer();
        }
      }

      return ResponseEntity.ok(getGameState());
    }
  }

  @PostMapping("/dealerTurn")
  public ResponseEntity<Map<String, Object>> playDealerTurn() {
    synchronized (lock) {
      playDealer();
      return ResponseEntity.ok(getGameState());
    }
  }

  private boolean areAnyPlayersStillActive() {
    return players.stream().anyMatch(playerId -> {
      GameStatus status = playerStatuses.get(playerId);
      return status != GameStatus.PLAYER_BUST &&
              status != GameStatus.PLAYER_BLACKJACK;
    });
  }

  private void playDealer() {
    boolean allPlayersBusted = players.stream().allMatch(playerId -> playerStatuses.get(playerId) == GameStatus.PLAYER_BUST);
    if (!allPlayersBusted) {
      while (calculateHandValue(dealerHand) < 17) {
        dealerHand.add(deck.dealCard());
      }
    }

    int dealerValue = calculateHandValue(dealerHand);
    boolean dealerBust = dealerValue > 21;

    for (String playerId : players) {
      if (!playerTurnComplete.get(playerId)) continue;

      int playerValue = calculateHandValue(playerHands.get(playerId));
      GameStatus status = playerStatuses.get(playerId);

      // If player has already busted, their status stays as PLAYER_BUST
      if (status == GameStatus.PLAYER_BUST) continue;

      if (dealerBust) {
        playerStatuses.put(playerId, GameStatus.DEALER_BUST);
      } else if (playerValue > dealerValue) {
        playerStatuses.put(playerId, GameStatus.PLAYER_WIN);
      } else if (dealerValue > playerValue) {
        playerStatuses.put(playerId, GameStatus.DEALER_WIN);
      } else {
        playerStatuses.put(playerId, GameStatus.PUSH);
      }
    }
  }

  private Map<String, Object> getGameState() {
    Map<String, Object> gameState = new HashMap<>();
    List<Map<String, Object>> playerStates = new ArrayList<>();

    for (String playerId : players) {
      Map<String, Object> playerState = new HashMap<>();
      List<Card> hand = playerHands.get(playerId);
      playerState.put("hand", hand);
      playerState.put("value", calculateHandValue(hand));
      playerState.put("hasAce", hasAce(hand));
      playerState.put("isActive", !playerTurnComplete.get(playerId));
      playerState.put("status", playerStatuses.get(playerId));
      playerStates.add(playerState);
    }

    gameState.put("players", playerStates);
    gameState.put("currentPlayerIndex", playerIndex);
    gameState.put("dealerHand", dealerHand);
    gameState.put("dealerValue", calculateHandValue(dealerHand));

    // Add this check to handle when all players are done
    if (playerIndex < players.size()) {
      String currentPlayer = players.get(playerIndex);
      gameState.put("hasAce", hasAce(playerHands.get(currentPlayer)));
      gameState.put("isCurrentPlayerActive", !playerTurnComplete.get(currentPlayer));
    } else {
      gameState.put("hasAce", false);
      gameState.put("isCurrentPlayerActive", false);
    }

    return gameState;
  }

  private boolean shouldDealerPlay() {
    boolean allPlayersComplete = players.stream()
            .allMatch(playerId -> playerTurnComplete.get(playerId));

    return playerIndex >= players.size() &&
            allPlayersComplete &&
            areAnyPlayersStillActive();
  }

  private void advanceTurn() {
    playerIndex++;

    // Check if we've reached the end of players
    if (playerIndex >= players.size()) {
      if (shouldDealerPlay()) {
        playDealer();
      }
      return;
    }

    // Look for next valid player
    while (playerIndex < players.size()) {
      String currentPlayer = players.get(playerIndex);
      GameStatus status = playerStatuses.get(currentPlayer);

      if (status != GameStatus.PLAYER_BUST &&
              status != GameStatus.PLAYER_WIN &&
              status != GameStatus.PLAYER_BLACKJACK) {
        break;
      }
      playerIndex++;
    }

    // If we've gone through all players, check if dealer should play
    if (playerIndex >= players.size() && shouldDealerPlay()) {
      playDealer();
    }
  }

  private int calculateHandValue(List<Card> hand) {
    int value = 0;
    int aceCount = 0;

    for (Card card : hand) {
      if (card.getRank().equals("A")) {
        aceCount++;
      }
      value += card.getValue();
    }

    while (value > 21 && aceCount > 0) {
      value -= 10;
      aceCount--;
    }

    return value;
  }

  private boolean hasAce(List<Card> hand) {
    return hand.stream().anyMatch(card -> card.getRank().equals("A"));
  }
}