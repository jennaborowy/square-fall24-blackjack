package edu.loyola.square.model;
import java.awt.Desktop;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

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

  public String getImageUrl() {
    // Convert rank and suit to match the API's naming convention
    String rankCode = rank.equals("10") ? "0" : rank;  // The API uses '0' for rank 10
    return "https://deckofcardsapi.com/static/img/" + rankCode + suit.substring(0, 1) + ".png";
  }

  public void openImageInBrowser() {
    try {
      URI uri = new URI(getImageUrl());
      Desktop.getDesktop().browse(uri);  // Opens the URL in the default browser
    } catch (IOException | URISyntaxException e) {
      e.printStackTrace();
    }
  }

  @Override
  public String toString(){
    return rank + "" + suit;
  }
}
