package edu.loyola.square;

import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Main implements WebMvcConfigurer {

  public static void main(String[] args) {
    SpringApplication.run(Main.class, args);
  }
} // Main