package edu.loyola.square.model;

import java.util.ArrayList;
import java.util.Collections;

public class Deck {

  String[] rankStr = { "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A" };
  String[] suitStr = { "H", "D", "C", "S" };
  private ArrayList<Card> cards;

  public Deck() {
    cards = new ArrayList<>();
    for (String rank: rankStr) {
      for (String suit : suitStr) {
        cards.add(new Card(rank, suit));
      }
    }
    Collections.shuffle(cards);
  }

  /**
   * This function deals a card from the deck
   * @return The card that is being dealt
   */
  // deal a random card
  public Card dealCard() {
    return cards.isEmpty() ? null : cards.remove(cards.size()-1);
  }

  // deal a specific card during testing
  public Card dealCard(String rank, String suit) {
    if (cards.isEmpty()) {
      return null;
    }
    Card card = new Card(rank, suit);
    if (cards.removeIf(ii -> ii.getRank() == rank && ii.getSuit() == suit)) {
      return card;
    }
    throw new IllegalArgumentException(String.format("the card \"%s\" has already been dealt", card.toString()));
  }

} // Deck
