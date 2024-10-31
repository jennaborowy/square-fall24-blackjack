/*package edu.loyola.square.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import edu.loyola.square.controller.UserController;
import edu.loyola.square.controller.repositories.UserRepository;
import edu.loyola.square.model.dto.UserDTO;
import edu.loyola.square.model.entity.User;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

  @InjectMocks
  UserController userController;

  @Mock
  UserRepository userRepository;

  static UserDTO userDTO;
  static User user;
  static User user2;

  @BeforeAll
  static void init() {
    userDTO = new UserDTO("callie", "callie123", "Callie", "Walker", "callie@email.com");
    user = new User((long) 1, "jenna", 0, "jenna@email.com", 2500, "Borowy", "Jenna", "jenna123", 0);
    user2 = new User((long) 2, "callie", 0, "callie@email.com", 2500, "Walker", "Callie", "callie123", 0);
  }

  @Test
  void all() {
    User user3 = new User((long) 3, "emma", 0, "emma@email.com", 2500, "Heiser", "Emma", "emma0123", 0);
    User user4 = new User((long) 1, "chris", 0, "chris@email.com", 2500, "Plowman", "Chris", "chris123", 0);

    List<User> users = Arrays.asList(user, user2, user3, user4);

    when(userRepository.findAll()).thenReturn(users);

    List<User> result = userController.all();
    assertEquals(users, result);
    assertEquals(user, result.get(0));
    assertEquals(user2, result.get(1));
    assertEquals(user3, result.get(2));
    assertEquals(user4, result.get(3));


  }

  @Test
  void create() {
    // bad email
//    UserDTO badPassword = new UserDTO("bob", "m", "spongebob", "squarepants", "spongbob@email.com");
//    List<String> errors = new ArrayList<>();
//    errors.add("Password must be at least 8 characters");
//
//    assertEquals(new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST), userController.create(badPassword));
   // assertThrows(ConstraintViolationException.class, () -> userController.create(badPassword));

    // all constraints and everything met
    when(userRepository.save(any())).thenReturn(user2);

    ResponseEntity<?> response = userController.create(userDTO);
    assertEquals(ResponseEntity.status(HttpStatus.CREATED).body(user2), response);


    // username is in use for an existing account
//    UserDTO repeatEmail = new UserDTO("callie1", "callie123", "Callie", "Walker", "callie@email.com");
//    assertEquals(userDTO.getEmail(), repeatEmail.getEmail());
//
//    assertThrows(DataIntegrityViolationException.class, () -> userController.create(repeatEmail));

  }

  @Test
  void login() {

    UserDTO userDTO1 = new UserDTO("callie", "callie123");

    // when user does not exist in repository
    assertThrows(ResponseStatusException.class, () -> userController.login(userDTO1));

    // when user exists and password matches
    when(userRepository.save(any())).thenReturn(user2);
    ResponseEntity<?> response = userController.create(userDTO);
    when(userRepository.findByUsername("callie")).thenReturn(List.of(user2));
    ResponseEntity<?> logged = userController.login(userDTO1);
    assertEquals(logged.getStatusCodeValue(), 200);
    assertEquals(new ResponseEntity<>("Welcome back!", HttpStatus.OK), userController.login(userDTO1));

    // user exists and password does not match
    UserDTO userDTO2 = new UserDTO("callie", "callie444");
    assertThrows(ResponseStatusException.class, () -> userController.login(userDTO2));
  }
}*/