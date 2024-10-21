package edu.loyola.square.model;

import java.util.ArrayList;

public class Hand {

  private boolean isDealer;
  private ArrayList<Card> cards;
  private int aceCount;
  private int aceValue;

  private int value(int aceValue) {
    int v = 0;
    for (Card card : cards) {
      switch (card.getRank()) {
        case "A":
          v += aceValue;
          break;
        case "J":
        case "Q":
        case "K":
          v += 10;
          break;
        default:
          v += card.getValue(aceValue);
          break;
      }
    }
    return v;
  }

  private void optimizeAces() {
    if (aceCount > 0) {
      if (getValue(11) > 21) {
        setAceValue(1);
      } else {
        if (getValue(11) == 21) {
          setAceValue(11);
        }
      }
    }
  }

  public Hand(ArrayList<Card> cards, boolean isDealer) {
    this.isDealer = isDealer;
    this.cards = cards;
    aceValue = 1;
    for (Card card : cards) {
      if (card.getRank().equals("A")) {
        aceCount++;
      }
    }
  }

  public boolean isDealer() {
    return isDealer;
  }

  public ArrayList<Card> getHand() {
    return cards;
  }

  public void setAceValue(int value) {
    aceValue = value;
  }

  public void addCard(Card card) {
    cards.add(card);
    if (card.getRank().equals("A")) {
      aceCount++;
    }
    optimizeAces();
  }

  public boolean blackjack() {
    if (cards.size() == 2) {
      Card card1 = cards.get(0);
      Card card2 = cards.get(1);
      if (card1.getRank().equals("A") && card2.getValue(aceValue) == 10 || card2.getRank().equals("A") && card1.getValue(aceValue) == 10) {
        aceValue = 11;
        return true;
      }
    }
    return false;
  }

  public int getValue() {
    return value(aceValue);
  }

  public int getValue(int aceValue) {
    return value(aceValue);
  }

  public int getAceCount() {
    return aceCount;
  }

  public String toString() {
    String handString = "";
    for (Card card : cards) {
      handString += card.toString() + " ";
    }
    return handString;
  }

} // Hand