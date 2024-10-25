package edu.loyola.square;

import edu.loyola.square.model.Game;
import edu.loyola.square.model.Player;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Scanner;

@SpringBootApplication
public class Main implements WebMvcConfigurer
{

  public static void main(String[] args)
  {
    SpringApplication.run(Main.class, args);

    Scanner scanner = new Scanner(System.in);
    new Game(new Player("Player", 100)).play();
  }

} // Main
