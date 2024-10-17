package src.main.java.edu.loyola.square.model;

public class Card
{
  private String suit;
  private String rank;
  private int value;

  public Card(String suit, String rank) {
    this.suit = suit;
    this.rank = rank;
    this.value = findValue();
  }

  public int findValue() {
    switch (rank) {
      case "A":
        return 11;
      case "J":
      case "Q":
      case "K":
        return 10;
      default:
        return Integer.parseInt(rank);
    }
  }

  public String getSuit() {
    return suit;
  }

  public String getRank() {
    return rank;
  }

  public int getValue() {
    return value;
  }

  public void setAceValue(int value) {
    this.value = value;
  }

  @Override
  public String toString(){
    return rank + "" + suit;
  }
}
