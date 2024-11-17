package edu.loyola.square.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.Serializable;
import java.util.*;

@RestController
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class GameController implements Serializable {
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
        }
      }

      // Deal initial cards
      dealerHand.add(deck.dealCard());
      dealerHand.add(deck.dealCard());

      Map<String, Object> gameState = getGameState();

      String currentPlayer = players.get(playerIndex);
      if (playerTurnComplete.get(currentPlayer)) {
        nextPlayer();
      }
      return ResponseEntity.ok(gameState);
    }
  }

  @PostMapping("/hit")
  public ResponseEntity<Map<String, Object>> playerHit() {
    synchronized (lock) {
      String currentPlayer = players.get(playerIndex);
      List<Card> currentHand = playerHands.get(currentPlayer);
      currentHand.add(deck.dealCard());

      int handValue = calculateHandValue(currentHand);
      Map<String, Object> gameState = getGameState();

      if (handValue > 21) {
        playerTurnComplete.put(currentPlayer, true);
        playerStatuses.put(currentPlayer, GameStatus.PLAYER_BUST);

        if (shouldDealerPlay()) {
          playDealer();
        } else {
          nextPlayer();
        }
      } else if (handValue == 21) {
        playerTurnComplete.put(currentPlayer, true);
        playerStatuses.put(currentPlayer, GameStatus.PLAYER_WIN);

        if (shouldDealerPlay()) {
          playDealer();
        } else {
          nextPlayer();
        }
      }
      return ResponseEntity.ok(gameState);
    }
  }

  @PostMapping("/stand")
  public ResponseEntity<Map<String, Object>> playerStand() {
    synchronized (lock) {
      String currentPlayer = players.get(playerIndex);
      playerTurnComplete.put(currentPlayer, true);

      if (shouldDealerPlay()) {
        playDealer();
      } else {
        nextPlayer();
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
        } else {
          nextPlayer();
        }
      } else if (handValue == 21) {
        playerTurnComplete.put(currentPlayer, true);
        playerStatuses.put(currentPlayer, GameStatus.PLAYER_WIN);

        if (shouldDealerPlay()) {
          playDealer();
        } else {
          nextPlayer();
        }
      }

      return ResponseEntity.ok(getGameState());
    }
  }

  private void playDealer() {
    while (calculateHandValue(dealerHand) < 17) {
      dealerHand.add(deck.dealCard());
    }

    int dealerValue = calculateHandValue(dealerHand);
    boolean dealerBust = dealerValue > 21;

    for (String playerId : players) {
      if (playerStatuses.get(playerId) == GameStatus.PLAYER_BUST) {
        continue;
      }

      int playerValue = calculateHandValue(playerHands.get(playerId));

      if (dealerBust) {
        playerStatuses.put(playerId, GameStatus.DEALER_BUST);
      } else if (dealerValue > playerValue) {
        playerStatuses.put(playerId, GameStatus.DEALER_WIN);
      } else if (playerValue > dealerValue) {
        playerStatuses.put(playerId, GameStatus.PLAYER_WIN);
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

    String currentPlayer = players.get(playerIndex);
    //gameState.put("hasAce", hasAce(playerHands.get(currentPlayer)));
    gameState.put("isCurrentPlayerActive", !playerTurnComplete.get(currentPlayer));

    return gameState;
  }

  private boolean shouldDealerPlay() {
    return playerTurnComplete.values().stream().allMatch(complete -> complete);
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

  private void nextPlayer() {
    playerIndex = (playerIndex + 1);
  }
}