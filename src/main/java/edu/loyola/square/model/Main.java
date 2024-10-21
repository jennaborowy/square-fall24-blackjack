package edu.loyola.square.model;

import java.util.Scanner;

public class Main {

  public static void main (String[] args) {
    Scanner scanner = new Scanner(System.in);
    new Game(new Player("Player", 100)).play();
  }

} // Main
