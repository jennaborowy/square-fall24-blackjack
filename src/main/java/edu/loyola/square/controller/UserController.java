package edu.loyola.square.controller;

import edu.loyola.square.controller.repositories.UserRepository;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import edu.loyola.square.model.entity.User;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
@CrossOrigin
public class UserController extends SpringBootServletInitializer {

  public static UserRepository userRepository = null;
  public static void setRepo(UserRepository repo) { userRepository = repo;}

  @PostMapping("/login")
  public ResponseEntity<String> login(@RequestBody Map<String, String> login) {
    String username = login.get("username");
    String password = login.get("password");

    if (userRepository == null) {
      return new ResponseEntity<>("user repository empty", HttpStatus.BAD_REQUEST);
    } else {
      List<User> list = userRepository.findByUsername(username);
      if (list.isEmpty()) {
        return new ResponseEntity<>("User doesn't exist", HttpStatus.UNAUTHORIZED);
      } else {
        User user = list.get(0);
        return new ResponseEntity<>("Welcome back!", HttpStatus.OK);
      }
    }
  }
}
