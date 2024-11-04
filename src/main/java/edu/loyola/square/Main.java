package edu.loyola.square;

import edu.loyola.square.model.Game;
import edu.loyola.square.model.Player;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

@SpringBootApplication
public class Main implements WebMvcConfigurer {

  public static void main(String[] args) {
    SpringApplication.run(Main.class, args);

    Scanner scanner = new Scanner(System.in);

    // Create a list of players
    List<Player> players = new ArrayList<>();
    players.add(new Player("Player 1", 100));
    players.add(new Player("Player 2", 100));

    // Initialize and start the game with multiple players
    new Game(players).play();
  }

} // Main