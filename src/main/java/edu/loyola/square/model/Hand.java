/**
 * This file contains the Hand object.
 */
package edu.loyola.square.model;

import java.io.Serializable;
import java.util.ArrayList;

public class Hand implements Serializable {

  private boolean isDealer;
  private ArrayList<Card> cards;
  private int aceCount;
  private int aceValue;

  /**
   * This function returns the total value of a hand
   * @param aceValue the ace value for that hand (1 or 11)
   * @return v - the total point total of the hand
   */
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

  /**
   * This function optimizes the players ace(s) to not let them change their ace(s) to 11 if they would bust, or give them 21 by changing the ace to an 11 if applicable
   */
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

  /**
   * This function adds a card to a hand and checks if that card is an ace
   * @param card the card being added to the hand
   */
  public void addCard(Card card) {
    cards.add(card);
    if (card.getRank().equals("A"))
    {
      aceCount++;
    }
    optimizeAces();
  }

  /**
   * This function checks if a particular hand got a "pocket blackjack" meaning the first 2 cards in their hand equal 21
   * @return T/F depending if the hand has a pocket blackjack
   */
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