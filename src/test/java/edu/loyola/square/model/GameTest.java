package edu.loyola.square.model;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.AfterEach;

import edu.loyola.square.model.*;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.ArrayList;

public class GameTest {

  private Game game;
  private Player player;
  private Deck deck;
  private ByteArrayInputStream testIn;
  private ByteArrayOutputStream testOut;
  private Hand TestPlayerHand;
  private Hand TestDealerHand;

  @BeforeEach
  public void setUp() {
    // Create player and deck instances
    player = new Player("Test Player", 100);
    deck = new Deck();
    TestDealerHand = new Hand(new ArrayList<Card>(), true);
    TestPlayerHand = new Hand(new ArrayList<Card>(), false);

    TestDealerHand.addCard(deck.dealCard());
    TestDealerHand.addCard(deck.dealCard());

    TestPlayerHand.addCard(deck.dealCard());
    TestPlayerHand.addCard(deck.dealCard());

    // Set up output capture
    testOut = new ByteArrayOutputStream();
    System.setOut(new PrintStream(testOut));
  }

  @Test
  public void testPlayerStands() {
    // Simulate player input of "s" for stand
    String input = "s\n";
    testIn = new ByteArrayInputStream(input.getBytes());
    System.setIn(testIn);

    game = new Game(player);
    game.play();

    // Verify output contains "Game Over"
    String output = testOut.toString();
    assertTrue(output.contains("Game Over"));
  }

  @Test
  public void testPlayerHits() {
    // Simulate player input of "h" then "s"
    String input = "h\ns\n";
    testIn = new ByteArrayInputStream(input.getBytes());
    System.setIn(testIn);

    game = new Game(player);
    game.play();

    // Verify output contains player receiving a new card
    String output = testOut.toString();
    assertTrue(output.contains("Game Over"));
    assertTrue(output.contains("Test Player:"));
  }

  @Test
  public void testPlayerAceChoice() {
    // Simulate player choosing ace value then standing
    String input = "a\n11\ns\n";
    testIn = new ByteArrayInputStream(input.getBytes());
    System.setIn(testIn);

    game = new Game(player);
    game.play();

    String output = testOut.toString();
    assertTrue(output.contains("Game Over"));
  }

  @Test
  public void testPlayerBusts() {
    // Simulate player hitting until bust
    String input = "h\nh\nh\nh\nh\n";
    testIn = new ByteArrayInputStream(input.getBytes());
    System.setIn(testIn);

    game = new Game(player);
    game.play();

    String output = testOut.toString();
    assertTrue(output.contains("Player Bust!"));
  }

  @Test
  public void testDealerPlay() {
    // Simulate player standing to force dealer play
    String input = "s\n";
    testIn = new ByteArrayInputStream(input.getBytes());
    System.setIn(testIn);

    game = new Game(player);
    game.play();

    String output = testOut.toString();
    assertTrue(output.contains("Dealer:"));
    assertTrue(output.contains("Game Over"));
  }

  @AfterEach
  public void restoreStreams() {
    System.setOut(System.out);
    System.setIn(System.in);
  }
}