package edu.loyola.square;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "edu.loyola.square")
public class Main {
  public static void main(String[] args) {
    SpringApplication.run(Main.class, args);
  }
}
