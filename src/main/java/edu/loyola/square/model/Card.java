package edu.loyola.square.model;

public class Card {

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
