package edu.loyola.square.model;

import org.junit.jupiter.api.Test;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;

class HandTest {

  @Test
  void getHand() {
    // Arrange
    ArrayList<Card> cards = new ArrayList<>();
    cards.add(new Card("K", "H"));
    cards.add(new Card("7", "H"));
    Hand hand = new Hand(cards, false);

    // Act
    ArrayList<Card> result = hand.getHand();

    // Assert
    assertEquals(2, result.size());
    assertEquals("K", result.get(0).getRank());
    assertEquals("7", result.get(1).getRank());
  }

  @Test
  void setAceValue() {
    // Arrange
    ArrayList<Card> cards = new ArrayList<>();
    cards.add(new Card("A", "S"));
    Hand hand = new Hand(cards, false);

    // Act & Assert
    hand.setAceValue(11);
    assertEquals(11, hand.getValue());

    hand.setAceValue(1);
    assertEquals(1, hand.getValue());
  }

  @Test
  void addCard() {
    // Arrange
    ArrayList<Card> cards = new ArrayList<>();
    cards.add(new Card("K", "D"));
    Hand hand = new Hand(cards, false);

    // Act
    hand.addCard(new Card("A", "H"));

    // Assert
    assertEquals(2, hand.getHand().size());
    assertEquals(1, hand.getAceCount());
    assertEquals("K", hand.getHand().get(0).getRank());
    assertEquals("A", hand.getHand().get(1).getRank());
  }

  @Test
  void blackjack() {
    // Test case 1: Ace + 10
    ArrayList<Card> blackjackHand1 = new ArrayList<>();
    blackjackHand1.add(new Card("A", "S"));
    blackjackHand1.add(new Card("K", "H"));
    Hand hand1 = new Hand(blackjackHand1, false);
    assertTrue(hand1.blackjack());

    // Test case 2: 10 + Ace
    ArrayList<Card> blackjackHand2 = new ArrayList<>();
    blackjackHand2.add(new Card("Q", "S"));
    blackjackHand2.add(new Card("A", "H"));
    Hand hand2 = new Hand(blackjackHand2, false);
    assertTrue(hand2.blackjack());

    // Test case 3: Not blackjack
    ArrayList<Card> notBlackjackHand = new ArrayList<>();
    notBlackjackHand.add(new Card("K", "S"));
    notBlackjackHand.add(new Card("Q", "H"));
    Hand hand3 = new Hand(notBlackjackHand, false);
    assertFalse(hand3.blackjack());
  }

  @Test
  void getValue() {
    // Test case 1: Simple hand without aces
    ArrayList<Card> simpleHand = new ArrayList<>();
    simpleHand.add(new Card("K", "S"));
    simpleHand.add(new Card("7", "H"));
    Hand hand1 = new Hand(simpleHand, false);
    assertEquals(17, hand1.getValue());

    // Test case 2: Hand with ace counting as 11
    ArrayList<Card> aceHand11 = new ArrayList<>();
    aceHand11.add(new Card("A", "S"));
    aceHand11.add(new Card("8", "H"));
    Hand hand2 = new Hand(aceHand11, false);
    hand2.setAceValue(11);
    assertEquals(19, hand2.getValue());

    // Test case 3: Hand with ace counting as 1 (would bust if 11)
    ArrayList<Card> aceHandBust = new ArrayList<>();
    aceHandBust.add(new Card("A", "S"));
    aceHandBust.add(new Card("K", "H"));
    aceHandBust.add(new Card("5", "D"));
    Hand hand3 = new Hand(aceHandBust, false);
    assertEquals(16, hand3.getValue()); // Should automatically optimize to use ace as 1
  }

  @Test
  void getAceCount() {
    // Test case 1: No aces
    ArrayList<Card> noAces = new ArrayList<>();
    noAces.add(new Card("K", "S"));
    noAces.add(new Card("7", "H"));
    Hand hand1 = new Hand(noAces, false);
    assertEquals(0, hand1.getAceCount());

    // Test case 2: One ace
    ArrayList<Card> oneAce = new ArrayList<>();
    oneAce.add(new Card("A", "S"));
    oneAce.add(new Card("7", "H"));
    Hand hand2 = new Hand(oneAce, false);
    assertEquals(1, hand2.getAceCount());

    // Test case 3: Multiple aces
    ArrayList<Card> multipleAces = new ArrayList<>();
    multipleAces.add(new Card("A", "S"));
    multipleAces.add(new Card("A", "H"));
    multipleAces.add(new Card("7", "D"));
    Hand hand3 = new Hand(multipleAces, false);
    assertEquals(2, hand3.getAceCount());
  }
}