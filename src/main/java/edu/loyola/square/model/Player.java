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
    return name;
  }

  public Hand getHand() {
    return hand;
  }

  public int getBet() {
    return bet;
  }

  /**
   * This function sets the players payout (winnings) based on how the game played out
   * @param multiplier 0, 1.0, or 1.5 depending if they lost, won, or got blackjack
   */
  public void setPayout(double multiplier) {
    payout = bet * multiplier;
  }

  public double getPayout() {
    return payout;
  }

} // Player
