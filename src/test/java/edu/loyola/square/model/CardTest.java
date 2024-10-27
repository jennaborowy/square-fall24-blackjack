//package edu.loyola.square.model;
//
//import org.junit.jupiter.api.Test;
//import static org.junit.jupiter.api.Assertions.*;
//
//class CardTest {
//
//  @Test
//  void getRank() {
//    // Test number card
//    Card numberCard = new Card("7", "H");
//    assertEquals("7", numberCard.getRank());
//
//    // Test face card
//    Card faceCard = new Card("K", "S");
//    assertEquals("K", faceCard.getRank());
//
//    // Test ace
//    Card aceCard = new Card("A", "S");
//    assertEquals("A", aceCard.getRank());
//  }
//
//  @Test
//  void getSuit() {
//    // Test all suits
//    Card heartCard = new Card("2", "H");
//    assertEquals("H", heartCard.getSuit());
//
//    Card spadeCard = new Card("3", "S");
//    assertEquals("S", spadeCard.getSuit());
//
//    Card diamondCard = new Card("4", "D");
//    assertEquals("D", diamondCard.getSuit());
//
//    Card clubCard = new Card("5", "C");
//    assertEquals("C", clubCard.getSuit());
//  }
//
//  @Test
//  void getValue() {
//    // Test number cards
//    Card two = new Card("2", "H");
//    assertEquals(2, two.getValue(1)); // aceValue parameter doesn't matter for number cards
//
//    Card nine = new Card("9", "S");
//    assertEquals(9, nine.getValue(1));
//
//    // Test face cards
//    Card jack = new Card("J", "D");
//    assertEquals(10, jack.getValue(1));
//
//    Card queen = new Card("Q", "C");
//    assertEquals(10, queen.getValue(1));
//
//    Card king = new Card("K", "H");
//    assertEquals(10, king.getValue(1));
//
//    // Test ace with different values
//    Card ace = new Card("A", "S");
//    assertEquals(1, ace.getValue(1));
//    assertEquals(11, ace.getValue(11));
//  }
//
//  @Test
//  void testToString() {
//    // Test number card
//    Card numberCard = new Card("7", "H");
//    assertEquals("7H", numberCard.toString());
//
//    // Test face card
//    Card faceCard = new Card("K", "S");
//    assertEquals("KS", faceCard.toString());
//
//    // Test ace
//    Card aceCard = new Card("A", "D");
//    assertEquals("AD", aceCard.toString());
//
//    // Test with all suits
//    Card clubCard = new Card("J", "C");
//    assertEquals("JC", clubCard.toString());
//  }
//}