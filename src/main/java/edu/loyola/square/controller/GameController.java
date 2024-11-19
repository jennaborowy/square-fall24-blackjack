package edu.loyola.square.controller;

import edu.loyola.square.model.Card;
import edu.loyola.square.model.Deck;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.Serializable;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@SpringBootApplication
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

  private final Map<String, GameState> tableGames = new ConcurrentHashMap<>();

  // GameState class to hold all state for a single table's game
  private static class GameState implements Serializable {
    private final Object lock = new Object();
    Deck deck;
    List<Card> dealerHand;
    Map<String, List<Card>> playerHands;
    List<String> players;
    int playerIndex;
    boolean gameStarted;
    Map<String, Boolean> playerTurnComplete;
    Map<String, GameStatus> playerStatuses;

    GameState() {
      this.deck = new Deck();
      this.dealerHand = new ArrayList<>();
      this.playerHands = new HashMap<>();
      this.players = new ArrayList<>();
      this.playerIndex = 0;
      this.gameStarted = false;
      this.playerTurnComplete = new HashMap<>();
      this.playerStatuses = new HashMap<>();
    }
  }


  @PostMapping("/gamestart")
  public ResponseEntity<Map<String, Object>> startGame(@RequestBody Map<String, Object> request) {
    String tableId = (String) request.get("tableId");
    if (tableId == null) {
      return ResponseEntity.badRequest().body(Map.of("error", "No table ID provided"));
    }

    GameState gameState = tableGames.computeIfAbsent(tableId, k -> new GameState());
    synchronized (gameState.lock) {
      gameState.deck = new Deck();
      gameState.players = (List<String>) request.get("players");
      gameState.playerIndex = 0;
      gameState.gameStarted = true;
      gameState.playerHands = new HashMap<>();
      gameState.playerTurnComplete = new HashMap<>();
      gameState.dealerHand = new ArrayList<>();
      gameState.playerStatuses = new HashMap<>();

        // Initial deal
      for (String playerId : gameState.players) {
        gameState.playerStatuses.put(playerId, GameStatus.IN_PROGRESS);
        gameState.playerTurnComplete.put(playerId, false);

        List<Card> hand = new ArrayList<>();
        hand.add(gameState.deck.dealCard());
        hand.add(gameState.deck.dealCard());
        gameState.playerHands.put(playerId, hand);

        // Check for initial blackjack
        if (calculateHandValue(hand, false) == 21) {
          gameState.playerTurnComplete.put(playerId, true);
          gameState.playerStatuses.put(playerId, GameStatus.PLAYER_BLACKJACK);
        }
      }

      // Deal initial dealer cards
      gameState.dealerHand.add(gameState.deck.dealCard());
      gameState.dealerHand.add(gameState.deck.dealCard());

      if (!gameState.players.isEmpty() && gameState.playerTurnComplete.get(gameState.players.get(0))) {
        updatePlayerIndex(gameState);
      }

      return ResponseEntity.ok(getGameState(gameState));
    }
  }

  @PostMapping("/hit")
  public ResponseEntity<Map<String, Object>> playerHit(@RequestBody Map<String, Object> request) {
    String tableId = (String) request.get("tableId");

    if (tableId == null) {
      return ResponseEntity.badRequest().body(Map.of("error", "Invalid table ID in request"));
    }

    GameState gameState = tableGames.get(tableId);

    if (gameState == null) {
      return ResponseEntity.badRequest().body(Map.of("error", "Invalid table ID in map look up " + tableId));
    }

    synchronized (gameState.lock) {
      if (gameState.playerIndex >= gameState.players.size()) {
        return ResponseEntity.ok(getGameState(gameState));
      }

      String currentPlayer = gameState.players.get(gameState.playerIndex);

      GameStatus playerStatus = gameState.playerStatuses.get(currentPlayer);
      if (playerStatus == GameStatus.PLAYER_BUST ||
              playerStatus == GameStatus.PLAYER_WIN ||
              gameState.playerTurnComplete.get(currentPlayer)) {
        return ResponseEntity.badRequest().body(Map.of(
                "error", "Invalid player state for hit.",
                "playerStatus", playerStatus,
                "playerIndex", gameState.playerIndex,
                "currentPlayer", currentPlayer
        ));
      }

      List<Card> currentHand = gameState.playerHands.get(currentPlayer);
      currentHand.add(gameState.deck.dealCard());

      int handValue = calculateHandValue(currentHand, false);
      if (handValue > 21) {
        gameState.playerStatuses.put(currentPlayer, GameStatus.PLAYER_BUST);
        gameState.playerTurnComplete.put(currentPlayer, true);
        updatePlayerIndex(gameState);
      } else if (handValue == 21) {
        gameState.playerStatuses.put(currentPlayer, GameStatus.PLAYER_WIN);
        gameState.playerTurnComplete.put(currentPlayer, true);
        updatePlayerIndex(gameState);
      }

      Map<String, Object> response = getGameState(gameState);
      response.put("currentPlayerIndex", gameState.playerIndex);
      response.put("currentPlayerStatus", gameState.playerStatuses.get(currentPlayer));

      return ResponseEntity.ok(response);
    }
  }

  @PostMapping("/stand")
  public ResponseEntity<Map<String, Object>> playerStand(@RequestBody Map<String, Object> request) {
    String tableId = (String) request.get("tableId");
    GameState gameState = tableGames.get(tableId);
    synchronized (gameState.lock) {
      if (gameState.playerIndex >= gameState.players.size()) {
        return ResponseEntity.ok(getGameState(gameState));
      }

      String currentPlayer = gameState.players.get(gameState.playerIndex);
      gameState.playerTurnComplete.put(currentPlayer, true);
      updatePlayerIndex(gameState);

      if (shouldDealerPlay(gameState)) {
        playDealer(gameState);
      }

      return ResponseEntity.ok(getGameState(gameState));
    }
  }

  @PostMapping("/promptAce")
  public ResponseEntity<Map<String, Object>> promptAce(@RequestBody Map<String, Object> request) {
    String tableId = (String) request.get("tableId");
    GameState gameState = tableGames.get(tableId);

    synchronized (gameState.lock) {
      String currentPlayer = gameState.players.get(gameState.playerIndex);
      List<Card> currentHand = gameState.playerHands.get(currentPlayer);
      int handValue = calculateHandValue(currentHand, false);

      if (handValue > 21) {
        gameState.playerTurnComplete.put(currentPlayer, true);
        gameState.playerStatuses.put(currentPlayer, GameStatus.PLAYER_BUST);
        updatePlayerIndex(gameState);

        if (shouldDealerPlay(gameState)) {
          playDealer(gameState);
        }
      } else if (handValue == 21) {
        gameState.playerTurnComplete.put(currentPlayer, true);
        gameState.playerStatuses.put(currentPlayer, GameStatus.PLAYER_WIN);
        updatePlayerIndex(gameState);

        if (shouldDealerPlay(gameState)) {
          playDealer(gameState);
        }
      }

      return ResponseEntity.ok(getGameState(gameState));
    }
  }

  @PostMapping("/dealerTurn")
  public ResponseEntity<Map<String, Object>> playDealerTurn(@RequestBody Map<String, Object> request) {
    String tableId = (String) request.get("tableId");
    GameState gameState = tableGames.get(tableId);
    synchronized (gameState.lock) {
      playDealer(gameState);
      return ResponseEntity.ok(getGameState(gameState));
    }
  }

  // handles the cleanup of the game's local state
  @PostMapping("/endgame")
  public ResponseEntity<Void> endGame(@RequestBody Map<String, Object> request) {
    String tableId = (String) request.get("tableId");
    tableGames.remove(tableId);
    return ResponseEntity.ok().build();
  }


  // calculates the given hand and optimizes it depending on the value and if the hand is the dealer's
  private int calculateHandValue(List<Card> hand, boolean isDealer) {
    int value = 0;
    int numberOfAces = 0;

    for (Card card : hand) {
      if (card.getRank().equals("A")) {
        numberOfAces++;
      } else {
        value += card.getValue();
      }
    }

    if (numberOfAces > 0 && value == 10) {
      return 21;
    }

    if (isDealer) {
      for (int i = 0; i < numberOfAces; i++) {
        value += 11;
        if (value > 21) {
          value -= 10;
        }
      }
    } else {
      for (int i = 0; i < numberOfAces; i++) {
        if (value + 11 == 21) {
          value += 11;
        } else if (value + 11 > 21) {
          value += 1;
        } else {
          value += 1;
        }
      }
    }

    return value;
  }

  // checks to see if the player should be prompted for ace value
  private boolean needsAcePrompt(List<Card> hand) {
    if (!hasAce(hand)) return false;

    int baseValue = 0;
    int numberOfAces = 0;
    for (Card card : hand) {
      if (card.getRank().equals("A")) {
        numberOfAces++;
      } else {
        baseValue += card.getValue();
      }
    }

    if (baseValue == 10 && numberOfAces == 1) return false;

    return ( baseValue + 11 <= 21 || (numberOfAces > 1));
  }

  // returns if the given hand has an ace
  private boolean hasAce(List<Card> hand) {
    return hand.stream().anyMatch(card -> card.getRank().equals("A"));
  }

  // moves to the next player's turn
  private void updatePlayerIndex(GameState gameState) {
    if (gameState.playerIndex >= gameState.players.size()) return;

    gameState.playerIndex++;

    // If we've reached the end of players, check if dealer should play
    if (gameState.playerIndex >= gameState.players.size()) {
      if (shouldDealerPlay(gameState)) {
        playDealer(gameState);
      }
    } else {
      // If the next player has blackjack or is complete, keep updating
      while (gameState.playerIndex < gameState.players.size() &&
              gameState.playerTurnComplete.get(gameState.players.get(gameState.playerIndex))) {
        gameState.playerIndex++;

        if (gameState.playerIndex >= gameState.players.size() && shouldDealerPlay(gameState)) {
          playDealer(gameState);
          break;
        }
      }
    }
  }


  // checks if the dealer should play
  private boolean shouldDealerPlay(GameState gameState) {
    boolean allPlayersComplete = gameState.players.stream()
            .allMatch(playerId -> gameState.playerTurnComplete.get(playerId));

    return gameState.playerIndex >= gameState.players.size() &&
            allPlayersComplete &&
            areAnyPlayersStillActive(gameState);
  }


  // returns a status if there are any player's still active (haven't busted)
  private boolean areAnyPlayersStillActive(GameState gameState) {
    return gameState.players.stream().anyMatch(playerId -> {
      GameStatus status = gameState.playerStatuses.get(playerId);
      return status != GameStatus.PLAYER_BUST &&
              status != GameStatus.PLAYER_BLACKJACK;
    });
  }


  // plays out the dealer's turn
  private void playDealer(GameState gameState) {
    int dealerValue = calculateHandValue(gameState.dealerHand, true);
    boolean dealerHasBlackjack = dealerValue == 21 && gameState.dealerHand.size() == 2;

    if (dealerHasBlackjack) {
      for (String playerId : gameState.players) {
        if (gameState.playerStatuses.get(playerId) != GameStatus.PLAYER_BLACKJACK) {
          gameState.playerStatuses.put(playerId, GameStatus.DEALER_BLACKJACK);
        }
      }
      return;
    }

    boolean allPlayersBusted = gameState.players.stream()
            .allMatch(playerId -> gameState.playerStatuses.get(playerId) == GameStatus.PLAYER_BUST);

    if (!allPlayersBusted) {
      while (calculateHandValue(gameState.dealerHand, true) < 17) {
        gameState.dealerHand.add(gameState.deck.dealCard());
      }
    }

    // Process final outcomes for each player, skipping those who have busted
    dealerValue = calculateHandValue(gameState.dealerHand, true);
    boolean dealerBust = dealerValue > 21;

    for (String playerId : gameState.players) {
      GameStatus currentStatus = gameState.playerStatuses.get(playerId);
      if (currentStatus == GameStatus.PLAYER_BUST ||
              currentStatus == GameStatus.PLAYER_BLACKJACK) {
        continue;
      }

      int playerValue = calculateHandValue(gameState.playerHands.get(playerId), false);

      if (dealerBust) {
        gameState.playerStatuses.put(playerId, GameStatus.DEALER_BUST);
      } else if (dealerValue > playerValue) {
        gameState.playerStatuses.put(playerId, GameStatus.DEALER_WIN);
      } else if (dealerValue < playerValue) {
        gameState.playerStatuses.put(playerId, GameStatus.PLAYER_WIN);
      } else {
        gameState.playerStatuses.put(playerId, GameStatus.PUSH);
      }
    }
  }


  // individual player state mapping
  private Map<String, Object> getGameState(GameState gameState) {
    Map<String, Object> state = new HashMap<>();
    List<Map<String, Object>> playerStates = new ArrayList<>();

    for (String playerId : gameState.players) {
      Map<String, Object> playerState = new HashMap<>();
      List<Card> hand = gameState.playerHands.get(playerId);
      playerState.put("hand", hand);
      playerState.put("value", calculateHandValue(hand, false));
      playerState.put("hasAce", needsAcePrompt(hand));
      playerState.put("isActive", !gameState.playerTurnComplete.get(playerId));
      playerState.put("status", gameState.playerStatuses.get(playerId));
      playerStates.add(playerState);
    }

    state.put("players", playerStates);
    state.put("currentPlayerIndex", gameState.playerIndex);
    state.put("dealerHand", gameState.dealerHand);
    state.put("dealerValue", calculateHandValue(gameState.dealerHand, true));

    if (gameState.playerIndex < gameState.players.size()) {
      String currentPlayer = gameState.players.get(gameState.playerIndex);
      state.put("hasAce", needsAcePrompt(gameState.playerHands.get(currentPlayer)));
      state.put("isCurrentPlayerActive", !gameState.playerTurnComplete.get(currentPlayer));
    } else {
      state.put("hasAce", false);
      state.put("isCurrentPlayerActive", false);
    }

    return state;
  }
}