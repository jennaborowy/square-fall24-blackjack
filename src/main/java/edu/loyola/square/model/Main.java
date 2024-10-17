package src.main.java.edu.loyola.square.model;

import java.util.Scanner;

public class Main
{
  public static void main (String[] args) {
    Scanner scanner = new Scanner(System.in);
    Player p1 = new Player("p1", 100);
    Game game = new Game(p1);
    game.start();
  }
}
