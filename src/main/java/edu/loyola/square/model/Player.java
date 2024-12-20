/**
 * This file contains the Player object.
 */
package edu.loyola.square.model;

import java.util.ArrayList;

public class Player {

  private String name;
  private Hand hand;
  private int bet;
  private double payout;
  private boolean hasAce;

  public Player(String name, int bet) {
    this.name = name;
    hand = new Hand(new ArrayList<Card>(), false);
    this.bet = bet;
    payout = 0.0;
    this.hasAce = false;
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
   * @return hand
   */
  public Hand setHand(Hand hand) {
    return this.hand = hand;
  }

  public int getBet() {
    return this.bet;
  }

  /**
   * This function sets the players payout (winnings) based on how the game played out
   * @param multiplier 0, 1.0, or 1.5 depending if they lost, won, or got blackjack
   */
  public void setPayout(double multiplier) {
    payout = bet * multiplier;
  }

  public double getPayout() {
    return this.payout;
  }
} // Player
