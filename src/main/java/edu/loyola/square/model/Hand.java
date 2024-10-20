package edu.loyola.square.model;

import java.util.ArrayList;

public class Hand
{
  private ArrayList<Card> cards;
  private boolean isDealer;
  private int pointValue;

  public Hand(ArrayList<Card> cards, boolean isDealer, int pointValue) {
    this.cards = cards;
    this.isDealer = isDealer;
    this.pointValue = pointValue;
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

  public void recalculatePoints() {
    pointValue = 0;  // Reset point value
    for (Card card : cards) {
      pointValue += card.getValue();  // Sum the values of all cards again
    }
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

}
