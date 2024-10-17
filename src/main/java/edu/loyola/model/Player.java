package src.main.java.edu.loyola.model;
import java.util.ArrayList;

public class Player {
  private String name;
  private Hand hand;
  private int bet;

  public Player(String name, int bet) {
    ArrayList<Card> playerCards = new ArrayList<Card>();
    hand = new Hand(playerCards, false, 0);
    this.name = name;
    this.bet = bet;
  }

  public String getName() {
    return name;
  }

  public Hand getHand() {
    return hand;
  }

  public int getBet() {
    return bet;
  }

  public int getHandTotal() {
    return hand.getPointValue();
  }
}
