/**
 * This file contains the Card object.
 */
package edu.loyola.square.model;

import java.io.Serializable;

public class Card implements Serializable {

  private String rank;
  private String suit;

  public Card(String rank, String suit) {
    this.rank = rank;
    this.suit = suit;
  }

  public String getRank() {
    return rank;
  }

  public String getSuit() {
    return suit;
  }

  /**
   * this function returns the numeric value of a given card
   * @param aceValue - the hand's ace value
   * @return rank - the value of the card
   */
  public int getValue(int aceValue) {
    switch (rank) {
      case "A":
        return aceValue;
      case "J":
      case "Q":
      case "K":
        return 10;
      default:
        return Integer.parseInt(rank);
    }
  }

  @Override
  public String toString() {
    return rank + suit;
  }

} // Card
