package src.main.java.edu.loyola.model;

import java.util.ArrayList;

public class Hand
{
  private ArrayList<Card> cards;
  //use for dealer's hand
  private boolean isDealer;
  private int pointValue;

  public Hand(ArrayList<Card> cards, boolean isDealer, int pointValue) {
    this.cards = cards;
    this.isDealer = isDealer;
    this.pointValue = pointValue;
  }

  public ArrayList<Card> getHand() {
    return cards;
  }

  public boolean isDealer() {
    return isDealer;
  }
  public int getPointValue() {
    return pointValue;
  }
  public void addCard(Card newCard) {
    cards.add(newCard);
    changePoints(newCard);
  }

  public int changePoints(Card newCard) {
    pointValue += newCard.getValue();
    return pointValue;
  }

  public String toString() {
    String handString = "";
    for (Card card : cards) {
      handString += card.toString() + " ";
    }
    return handString;
  }
}
