package edu.loyola.square.controller;

import edu.loyola.square.model.Card;
import edu.loyola.square.model.Game;
import edu.loyola.square.model.Player;
import jakarta.servlet.http.HttpSession;
import org.apache.catalina.session.StandardSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockHttpSession;

import static edu.loyola.square.model.Game.gameStatus.PLAYER_BUST;
import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

class GameControllerTest
{
  @InjectMocks
  private GameController gameController;
  @Mock
  private MockHttpSession session;
  private final Object lock = new Object();

  @BeforeEach
  public void setUp()
  {
    MockitoAnnotations.openMocks(this);
    gameController = new GameController();
    session = new MockHttpSession();
  }
  @Test
  void hello()
  {

  }
  @Test
  void newGame()
  {
    Game game = new Game(new Player("Test", 100));
    assertNotNull(game);
    assertTrue(game.getPlayers().getName() == "Test");
    assertFalse(game.getPlayers().getName() == "Tom");
    assertTrue(game.getPlayers().getBet() == 100);
    assertFalse(game.getPlayers().getBet() == 150);
  }
  @Test
  void testHelloEndpoint() {
    String response = gameController.hello();
    assertEquals("Hello World", response);
    assertNotEquals("Hello", response);
  }

  @Test
  void testGameStart() {
    var response = gameController.startGame(session);
    var gameState = response.getBody();
    assertNotNull(gameState);
    assertTrue(gameState.containsKey("playerHand"));
    assertTrue(gameState.containsKey("dealerHand"));
    var playerHand = (List<Card>) gameState.get("playerHand");
    assertEquals(2, playerHand.size());

    Game game = (Game) session.getAttribute("game");

    assertEquals(game.endGameStatus(1), 1);
    assertNotEquals(game.endGameStatus(1), 2);

  }

  @Test
  void playerStand()
  {
    gameController.startGame(session);
    var response = gameController.playerStand(session);
    var gameState = response.getBody();
    assertNotNull(gameState);
    assertTrue(gameState.containsKey("gameStatus"));
    Game game = (Game) session.getAttribute("game");

    assertEquals(game.endGameStatus(3), 3);
    assertNotEquals(game.endGameStatus(3), 1);
  }

  @Test
  void playerHit()
  {
    var startResponse = gameController.startGame(session);
    var initialState = startResponse.getBody();
    var initialPlayerHand = (List<Card>) initialState.get("playerHand");
    int initialHandSize = initialPlayerHand.size();
    var hitResponse = gameController.playerHit(session);
    var gameState = hitResponse.getBody();
    assertNotNull(gameState);
    var playerHand = (List<Card>) gameState.get("playerHand");
    assertEquals(initialHandSize + 1, playerHand.size());
    Game game = (Game) session.getAttribute("game");

    assertEquals(game.endGameStatus(2), 2);
    assertNotEquals(game.endGameStatus(2), 3);

  }

  @Test
  void getGameStatus()
  {
    gameController.startGame(session);
    var response = gameController.playerStand(session);
    var gameState = response.getBody();
    assertTrue(gameState.containsKey("playerHand"));
    assertTrue(gameState.containsKey("dealerHand"));

  }

  @Test
  void testHitWithNoGame() {
    var response = gameController.playerHit(session);
    assertEquals(400, response.getStatusCodeValue());
  }

  @Test
  void testStandWithNoGame() {
    var response = gameController.playerStand(session);
    assertEquals(400, response.getStatusCodeValue());
  }
}