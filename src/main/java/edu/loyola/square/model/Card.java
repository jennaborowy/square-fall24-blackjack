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
   * @return rank - the value of the card
   */
  public int getValue() {
    return switch (rank) {
      case "A" -> 11;
      case "K", "Q", "J" -> 10;
      default -> Integer.parseInt(rank);
    };
  }

  @Override
  public String toString() {
    return rank + suit;
  }

} // Card
