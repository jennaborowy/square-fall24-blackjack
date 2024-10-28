package edu.loyola.square.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DeckTest {
  private Deck deck;

  @BeforeEach
  void setUp() {
    deck = new Deck();
  }

  @Test
  void dealCard() {
    // Test dealing all 52 cards
    int cardCount = 52;
    for (int i = 0; i < cardCount; i++) {
      Card card = deck.dealCard();
      assertNotNull(card, "Card should not be null when deck is not empty");
      assertTrue(isValidCard(card), "Card should have valid rank and suit");
    }

    // Test dealing from empty deck
    Card emptyDeckCard = deck.dealCard();
    assertNull(emptyDeckCard, "Should return null when deck is empty");
  }

  @Test
  void testDealCard() {
    // Test dealing specific valid cards
    Card kingHearts = deck.dealCard("K", "H");
    assertNotNull(kingHearts);
    assertEquals("K", kingHearts.getRank());
    assertEquals("H", kingHearts.getSuit());

    Card aceSpades = deck.dealCard("A", "S");
    assertNotNull(aceSpades);
    assertEquals("A", aceSpades.getRank());
    assertEquals("S", aceSpades.getSuit());

    // Test dealing the same card twice (should throw exception)
    Exception exception = assertThrows(IllegalArgumentException.class, () -> {
      deck.dealCard("K", "H");
    });
    String expectedMessage = "the card \"KH\" has already been dealt";
    String actualMessage = exception.getMessage();
    assertTrue(actualMessage.contains(expectedMessage));

    // Test dealing from empty deck
    // First, deal all remaining cards
    while (deck.dealCard() != null) {
      // Keep dealing until deck is empty
    }

    // Now try to deal a specific card from empty deck
    Card emptyDeckCard = deck.dealCard("2", "D");
    assertNull(emptyDeckCard, "Should return null when deck is empty");
  }

  // Helper method to validate card properties
  private boolean isValidCard(Card card) {
    String[] validRanks = {"2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"};
    String[] validSuits = {"H", "D", "C", "S"};

    boolean validRank = false;
    boolean validSuit = false;

    for (String rank : validRanks) {
      if (rank.equals(card.getRank())) {
        validRank = true;
        break;
      }
    }

    for (String suit : validSuits) {
      if (suit.equals(card.getSuit())) {
        validSuit = true;
        break;
      }
    }

    return validRank && validSuit;
  }

  @Test
  void testInitialDeckSize() {
    int cardCount = 0;
    Card card;
    while ((card = deck.dealCard()) != null) {
      cardCount++;
    }
    assertEquals(52, cardCount, "A new deck should contain exactly 52 cards");
  }

  @Test
  void testDeckContainsAllCards() {
    // Create arrays to track which cards have been seen
    boolean[][] seenCards = new boolean[13][4]; // [rank][suit]

    // Deal all cards and mark them as seen
    Card card;
    while ((card = deck.dealCard()) != null) {
      int rankIndex = getRankIndex(card.getRank());
      int suitIndex = getSuitIndex(card.getSuit());
      assertFalse(seenCards[rankIndex][suitIndex], "Duplicate card found: " + card.toString());
      seenCards[rankIndex][suitIndex] = true;
    }

    // Verify all cards were seen exactly once
    for (int i = 0; i < 13; i++) {
      for (int j = 0; j < 4; j++) {
        assertTrue(seenCards[i][j], "Missing card: " + getRankFromIndex(i) + getSuitFromIndex(j));
      }
    }
  }

  // Helper methods for card tracking
  private int getRankIndex(String rank) {
    String[] ranks = {"2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"};
    for (int i = 0; i < ranks.length; i++) {
      if (ranks[i].equals(rank)) return i;
    }
    return -1;
  }

  private int getSuitIndex(String suit) {
    String[] suits = {"H", "D", "C", "S"};
    for (int i = 0; i < suits.length; i++) {
      if (suits[i].equals(suit)) return i;
    }
    return -1;
  }

  private String getRankFromIndex(int index) {
    String[] ranks = {"2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"};
    return ranks[index];
  }

  private String getSuitFromIndex(int index) {
    String[] suits = {"H", "D", "C", "S"};
    return suits[index];
  }
}