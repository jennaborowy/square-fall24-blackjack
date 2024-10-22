package edu.loyola.square.controller;

import edu.loyola.square.UserAlreadyExistsException;
import edu.loyola.square.controller.repositories.UserRepository;
import edu.loyola.square.model.dto.UserDTO;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import edu.loyola.square.model.entity.User;
import org.springframework.beans.factory.annotation.Autowired;


import java.util.List;

@RestController
@RequestMapping("/api/user")
@CrossOrigin
public class UserController extends SpringBootServletInitializer {


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
  public User create(@RequestBody UserDTO userDTO) throws UserAlreadyExistsException {
    String username = userDTO.getUsername();
    String password = userDTO.getPassword();
    String email = userDTO.getEmail();
    String firstName = userDTO.getFirstName();
    String lastName = userDTO.getLastName();

    if (userRepository != null) {
      List<User> list = userRepository.findByEmail(email);

      if (!list.isEmpty()) {
        throw new UserAlreadyExistsException("Account already exists for this email");

      }
    }

    User user = new User();
    user.setUsername(username);
    user.setPassword(password);
    user.setEmail(email);
    user.setFirstName(firstName);
    user.setLastName(lastName);

    return userRepository.save(user);

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
        return new ResponseEntity<>("User doesn't exist", HttpStatus.UNAUTHORIZED);
      } else {
        User user = list.get(0);
        if (!user.getPassword().equals(password)) {
          return new ResponseEntity<>("Wrong password", HttpStatus.UNAUTHORIZED);
        }
        return new ResponseEntity<>("Welcome back!", HttpStatus.OK);
      }
    }
  }
}
