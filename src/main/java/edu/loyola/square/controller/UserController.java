package edu.loyola.square.controller;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import edu.loyola.square.controller.repositories.UserRepository;
import edu.loyola.square.model.dto.UserDTO;

import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import edu.loyola.square.model.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;


import java.util.List;

@RestController
@RequestMapping("/api/user")
@CrossOrigin
public class UserController extends SpringBootServletInitializer {

  private static final Logger logger = LoggerFactory.getLogger(UserController.class);

  private final UserRepository userRepository;

  @Autowired
  public UserController(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @GetMapping("/")
  public List<User> all() {
    return userRepository.findAll();
  }

  @PostMapping("/signup")
  public ResponseEntity<?> create(@RequestBody UserDTO userDTO) throws ResponseStatusException {
    String username = userDTO.getUsername();
    String password = userDTO.getPassword();
    String email = userDTO.getEmail();
    String firstName = userDTO.getFirstName();
    String lastName = userDTO.getLastName();

    User user = new User();
    user.setUsername(username);
    user.setPassword(password);
    user.setEmail(email);
    user.setFirstName(firstName);
    user.setLastName(lastName);

    logger.info("user:  " + user);


    try {
      User savedUser = userRepository.save(user);
      logger.info("User saved with ID: " + savedUser.getId());
      return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    } catch (Exception e) {
      logger.error("unexpected error: " + e.getMessage());
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("unexpected error occurred");
    }

  }

  @PostMapping("/login")
  public ResponseEntity<Object> login(@RequestBody UserDTO login) {

    String username = login.getUsername();
    String password = login.getPassword();

    if (userRepository == null) {
      return new ResponseEntity<>("user repository empty", HttpStatus.BAD_REQUEST);
    } else {
      List<User> list = userRepository.findByUsername(username);

      if (list.isEmpty()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User doesn't exist");
      } else {
        User user = list.get(0);
        if (!user.getPassword().equals(password)) {
          throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Password doesn't match our records.");
        }
        return new ResponseEntity<>("Welcome back!", HttpStatus.OK);
      }
    }
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<String> handleException(Exception e) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
  }

}
