package edu.loyola.square.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PlayerTest {
  private Player player;
  private final String testName = "John Doe";
  private final int testBet = 100;

  @BeforeEach
  void setUp() {
    player = new Player(testName, testBet);
  }

  @Test
  void getName() {
    // Test basic name retrieval
    assertEquals(testName, player.getName(), "Player name should match constructor argument");

    // Test with different name
    Player player2 = new Player("Jane Doe", 50);
    assertEquals("Jane Doe", player2.getName(), "Player name should match constructor argument");
  }

  @Test
  void getHand() {
    // Test initial hand state
    Hand hand = player.getPlayerHand();
    assertNotNull(hand, "Hand should not be null");
    assertEquals(0, hand.getHand().size(), "Initial hand should be empty");
    assertFalse(hand.isDealer(), "Player hand should not be marked as dealer");

    // Test hand after adding cards
    Card card1 = new Card("A", "♠");
    Card card2 = new Card("K", "♥");
    hand.addCard(card1);
    hand.addCard(card2);

    assertEquals(2, player.getPlayerHand().getHand().size(), "Hand should contain added cards");
    assertEquals("A", player.getPlayerHand().getHand().get(0).getRank(), "First card should be Ace");
    assertEquals("K", player.getPlayerHand().getHand().get(1).getRank(), "Second card should be King");
  }

  @Test
  void getBet() {
    // Test initial bet amount
    assertEquals(testBet, player.getBet(), "Initial bet should match constructor argument");

    // Test with different bet amount
    Player player2 = new Player("Test Player", 50);
    assertEquals(50, player2.getBet(), "Bet amount should match constructor argument");

    // Test with zero bet
    Player player3 = new Player("Zero Bet", 0);
    assertEquals(0, player3.getBet(), "Should allow zero bet");
  }

  @Test
  void setPayout() {
    // Test normal win (1.0 multiplier)
    player.setPayout(1.0);
    assertEquals(testBet, player.getPayout(), "Payout should equal bet for 1.0 multiplier");

    // Test blackjack payout (1.5 multiplier)
    player.setPayout(1.5);
    assertEquals(testBet * 1.5, player.getPayout(), "Payout should be 1.5x bet for blackjack");

    // Test loss (0.0 multiplier)
    player.setPayout(0.0);
    assertEquals(0.0, player.getPayout(), "Payout should be zero for loss");

    // Test with different decimal multipliers
    player.setPayout(0.5);
    assertEquals(testBet * 0.5, player.getPayout(), "Payout should handle decimal multipliers");
  }

  @Test
  void getPayout() {
    // Test initial payout
    assertEquals(0.0, player.getPayout(), "Initial payout should be zero");

    // Test after setting different payouts
    player.setPayout(1.0);
    assertEquals(testBet, player.getPayout(), "Payout should reflect most recent setPayout call");

    player.setPayout(1.5);
    assertEquals(testBet * 1.5, player.getPayout(), "Payout should update with new multiplier");

    player.setPayout(0.0);
    assertEquals(0.0, player.getPayout(), "Payout should be zero after setting multiplier to 0");
  }

  @Test
  void testMultiplePayoutUpdates() {
    // Test sequence of payout updates
    player.setPayout(1.0);
    assertEquals(testBet, player.getPayout(), "First payout update");

    player.setPayout(1.5);
    assertEquals(testBet * 1.5, player.getPayout(), "Second payout update");

    player.setPayout(0.0);
    assertEquals(0.0, player.getPayout(), "Final payout update");
  }
}