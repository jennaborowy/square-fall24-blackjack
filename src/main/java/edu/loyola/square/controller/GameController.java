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
  private GameStatus status;
  private Map<String, Boolean> playerTurnComplete;

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
      this.status = GameStatus.IN_PROGRESS;

      // Deal initial cards
      dealerHand.add(deck.dealCard());
      dealerHand.add(deck.dealCard());

      for (String playerId : players) {
        List<Card> hand = new ArrayList<>();
        hand.add(deck.dealCard());
        hand.add(deck.dealCard());
        playerHands.put(playerId, hand);
        playerTurnComplete.put(playerId, false);
      }

      Map<String, Object> gameState = getGameState();

      // Check for initial blackjack
      String currentPlayer = players.get(playerIndex);
      if (calculateHandValue(playerHands.get(currentPlayer)) == 21) {
        playerTurnComplete.put(currentPlayer, true);
        if (shouldDealerPlay()) {
          gameState.put("gameStatus", createGameStatus(GameStatus.PLAYER_BLACKJACK));
        } else {
          nextPlayer();
          gameState.put("gameStatus", createGameStatus(GameStatus.NEXT_PLAYER));
        }
      }

      gameState.put("hasAce", hasAce(playerHands.get(currentPlayer)));
      return ResponseEntity.ok(gameState);
    }
  }

  @PostMapping("/hit")
  public ResponseEntity<Map<String, Object>> playerHit() {
    synchronized (lock) {
      String currentPlayer = players.get(playerIndex);
      List<Card> currentHand = playerHands.get(currentPlayer);
      currentHand.add(deck.dealCard());

      Map<String, Object> gameState = getGameState();
      int handValue = calculateHandValue(currentHand);

      if (handValue > 21) {
        playerTurnComplete.put(currentPlayer, true);
        if (shouldDealerPlay()) {
          gameState.put("gameStatus", createGameStatus(GameStatus.PLAYER_BUST));
        } else {
          nextPlayer();
          gameState.put("gameStatus", createGameStatus(GameStatus.NEXT_PLAYER));
        }
      } else if (handValue == 21) {
        playerTurnComplete.put(currentPlayer, true);
        if (shouldDealerPlay()) {
          gameState.put("gameStatus", createGameStatus(GameStatus.PLAYER_WIN));
        } else {
          nextPlayer();
          gameState.put("gameStatus", createGameStatus(GameStatus.NEXT_PLAYER));
        }
      }

      gameState.put("hasAce", hasAce(currentHand));
      return ResponseEntity.ok(gameState);
    }
  }

  @PostMapping("/stand")
  public ResponseEntity<Map<String, Object>> playerStand() {
    synchronized (lock) {
      String currentPlayer = players.get(playerIndex);
      playerTurnComplete.put(currentPlayer, true);

      Map<String, Object> gameState = getGameState();

      if (shouldDealerPlay()) {
        // Complete dealer's turn
        while (calculateHandValue(dealerHand) < 17) {
          dealerHand.add(deck.dealCard());
        }

        determineFinalOutcomes();
        gameState = getGameState(); // Get updated state after determining outcomes
        gameState.put("gameStatus", createFinalGameStatus());
      } else {
        nextPlayer();
        gameState.put("gameStatus", createGameStatus(GameStatus.NEXT_PLAYER));
      }

      return ResponseEntity.ok(gameState);
    }
  }

  @PostMapping("/promptAce")
  public ResponseEntity<Map<String, Object>> promptAce(@RequestBody Map<String, Object> request) {
    synchronized (lock) {
      Integer aceValue = (Integer) request.get("aceValue");
      String currentPlayer = players.get(playerIndex);
      List<Card> currentHand = playerHands.get(currentPlayer);

      Map<String, Object> gameState = getGameState();
      gameState.put("aceValue", aceValue);

      int handValue = calculateHandValue(currentHand);
      if (handValue > 21) {
        playerTurnComplete.put(currentPlayer, true);
        if (shouldDealerPlay()) {
          gameState.put("gameStatus", createGameStatus(GameStatus.PLAYER_BUST));
        } else {
          nextPlayer();
          gameState.put("gameStatus", createGameStatus(GameStatus.NEXT_PLAYER));
        }
      } else if (handValue == 21) {
        playerTurnComplete.put(currentPlayer, true);
        if (shouldDealerPlay()) {
          gameState.put("gameStatus", createGameStatus(GameStatus.PLAYER_WIN));
        } else {
          nextPlayer();
          gameState.put("gameStatus", createGameStatus(GameStatus.NEXT_PLAYER));
        }
      }

      return ResponseEntity.ok(gameState);
    }
  }

  private boolean shouldDealerPlay() {
    return playerTurnComplete.values().stream().allMatch(complete -> complete);
  }

  private void determineFinalOutcomes() {
    int dealerValue = calculateHandValue(dealerHand);
    boolean dealerBust = dealerValue > 21;

    for (String playerId : players) {
      int playerValue = calculateHandValue(playerHands.get(playerId));

      if (playerValue > 21) {
        status = GameStatus.PLAYER_BUST;
      } else if (dealerBust) {
        status = GameStatus.DEALER_BUST;
      } else if (playerValue > dealerValue) {
        status = GameStatus.PLAYER_WIN;
      } else if (dealerValue > playerValue) {
        status = GameStatus.DEALER_WIN;
      } else {
        status = GameStatus.PUSH;
      }
    }
  }

  private Map<String, Object> createFinalGameStatus() {
    Map<String, Object> gameStatus = new HashMap<>();
    gameStatus.put("endStatus", status.toString());
    gameStatus.put("endMessage", getResultMessage(status));
    gameStatus.put("finalDealerHand", dealerHand);
    gameStatus.put("dealerValue", calculateHandValue(dealerHand));
    return gameStatus;
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
      playerStates.add(playerState);
    }

    gameState.put("players", playerStates);
    gameState.put("currentPlayerIndex", playerIndex);
    gameState.put("dealerHand", dealerHand);
    gameState.put("dealerValue", calculateHandValue(dealerHand));

    String currentPlayer = players.get(playerIndex);
    gameState.put("hasAce", hasAce(playerHands.get(currentPlayer)));
    gameState.put("isCurrentPlayerActive", !playerTurnComplete.get(currentPlayer));

    return gameState;
  }

  private Map<String, Object> createGameStatus(GameStatus status) {
    Map<String, Object> gameStatus = new HashMap<>();
    gameStatus.put("endStatus", status.toString());
    gameStatus.put("endMessage", getResultMessage(status));
    return gameStatus;
  }

  private String getResultMessage(GameStatus status) {
    return switch (status) {
      case PLAYER_WIN -> "Player Wins!";
      case DEALER_WIN -> "Dealer Wins!";
      case PUSH -> "Push!";
      case PLAYER_BLACKJACK -> "Blackjack!";
      case DEALER_BLACKJACK -> "Dealer Blackjack!";
      case PLAYER_BUST -> "Player Bust!";
      case DEALER_BUST -> "Dealer Bust!";
      case NEXT_PLAYER -> "Next Player's Turn";
      case IN_PROGRESS -> "IN_PLAY";
    };
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