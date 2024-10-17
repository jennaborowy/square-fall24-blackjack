package src.main.java.edu.loyola.square.model;

import java.util.ArrayList;
import java.util.Collections;

public class Deck
{
  private ArrayList<Card> cardsUndealt;
  String[] suitStr = {"H", "D", "C", "S"};
  String[] rankStr = {"2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"};

  public Deck() {
    cardsUndealt = new ArrayList<>();
    for (String suit: suitStr) {
      for (String rank : rankStr) {
        cardsUndealt.add(new Card(suit, rank));
      }
    }
    shuffle();
  }
  public void shuffle() {
    Collections.shuffle(cardsUndealt);
  }

  public Card dealCard() {
    if(cardsUndealt.isEmpty()) {
      return null;
    }
    return cardsUndealt.remove(cardsUndealt.size()-1);

  }
  public int remainingCard() {
    return cardsUndealt.size();
  }

}


