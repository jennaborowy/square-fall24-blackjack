package edu.loyola.square.controller;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;

import edu.loyola.square.controller.repositories.UserRepository;
import edu.loyola.square.model.dto.UserDTO;

import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import edu.loyola.square.model.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@RestController
@Validated
@RequestMapping("/api/user")
@CrossOrigin
public class UserController extends SpringBootServletInitializer {

  private final UserRepository userRepository;

  @Autowired
  public UserController(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @GetMapping("/")
  public List<User> all()
  {
    return userRepository.findAll();
  }

  @PostMapping("/signup")
  public ResponseEntity<?> create(@Valid @RequestBody UserDTO userDTO) throws ResponseStatusException {
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

    User savedUser = userRepository.save(user);
    return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
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

  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<List<String>> handleConstraintViolationException(ConstraintViolationException e) {
    List<String> errors = new ArrayList<>();
    for (ConstraintViolation<?> violation : e.getConstraintViolations()) {
      String message = violation.getMessage();
      errors.add(message);
    }
    return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<List<String>> handleDataIntegrityViolationException(DataIntegrityViolationException e) {
    List<String> errors = new ArrayList<>();
    errors.add("The username or email is already taken. Please choose a different one.");
    return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
  }
}
