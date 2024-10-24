package edu.loyola.square.model;

import java.util.ArrayList;

public class Player {

  private String name;
  private Hand hand;
  private int bet;
  private double payout;

  public Player(String name, int bet) {
    this.name = name;
    hand = new Hand(new ArrayList<Card>(), false);
    this.bet = bet;
    payout = 0.0;
  }

  public String getName() {
    return this.name;
  }

  public Hand getPlayerHand() {
    return this.hand;
  }

  /**
   *
   * used in controller to access player's hand
   * @param hand
   * @return
   */
  public Hand setHand(Hand hand)
  {
    return this.hand = hand;

  }

  public int getBet() {
    return this.bet;
  }

  public void setPayout(double multiplier) {
    payout = bet * multiplier;
  }

  public double getPayout() {
    return this.payout;
  }

} // Player
