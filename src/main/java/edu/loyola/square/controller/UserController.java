package edu.loyola.square.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.auth.UserRecord.CreateRequest;
import com.google.firebase.auth.UserRecord.UpdateRequest;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.DocumentReference;
import edu.loyola.square.controller.service.UserService;
import edu.loyola.square.model.dto.AuthDTO;
import edu.loyola.square.model.dto.UserDTO;
import edu.loyola.square.model.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import jakarta.validation.Valid;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/user")
@CrossOrigin
public class UserController {

  private static final String EMAIL_REGEX = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
  private static final Pattern pattern = Pattern.compile(EMAIL_REGEX);
  private static final Logger logger = LoggerFactory.getLogger(UserController.class);

  private final FirebaseAuth firebaseAuth;
  private final Firestore firestore;
  private final UserService userService;

  public UserController(FirebaseAuth firebaseAuth, Firestore firestore, UserService userService) {
    this.firebaseAuth = firebaseAuth;
    this.firestore = firestore;
    this.userService = userService;
  }

  // Example usage
  @GetMapping("/{uid}")
  public ResponseEntity<User> getUser(@PathVariable String uid) {
    try {
      User user = userService.getUser(uid);
      if (user == null) {
        return ResponseEntity.notFound().build();
      }
      return ResponseEntity.ok(user);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }

  @PostMapping("/reset-password")
  public ResponseEntity<Object> resetPassword(@Valid @RequestBody AuthDTO authDTO) {
    try {
      // THIS IS HIP TOO
      // Jenna - this code required using FirebaseAdmin. Going through FirebaseAdmin required using the Controller,
      //   which adds a protective layer from someone having easy access to changing a password.
      //   I find it interesting, because we don't have direct access to the passwords stored by Firebase,
      //   but as long as the uid is valid, we can change the password.
      UpdateRequest request = new UserRecord.UpdateRequest(authDTO.getUid())
              .setPassword(authDTO.getPassword());

      UserRecord userRecord = FirebaseAuth.getInstance().updateUser(request);
      return ResponseEntity.ok(userRecord);

    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }


  @PostMapping("/reset-username")
  public ResponseEntity<Object> resetUsername(@Valid @RequestBody AuthDTO authDTO) {
    try {
      //make sure username is not already used
      User user = userService.getUserByUsername(authDTO.getUsername());
      if (user != null) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Username is already in our records");
      }

      //update auth
      UpdateRequest request = new UserRecord.UpdateRequest(authDTO.getUid())
              .setDisplayName(authDTO.getUsername());
      UserRecord userRecord = FirebaseAuth.getInstance().updateUser(request);

      //update firestore doc
      UserService service = new UserService();
      service.updateUsername(authDTO.getUid(), authDTO.getUsername());

      return ResponseEntity.ok(userRecord);

    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }


  @DeleteMapping("/delete")
  public ResponseEntity<String> deleteUser(@RequestBody AuthDTO authDTO) {
    try {
      // deletes auth instance
      firebaseAuth.deleteUser(authDTO.getUid());
      DocumentReference docRef = firestore.collection("users").document(authDTO.getUid());
      // deletes document from users collection
      docRef.delete();
      System.out.println("Successfully deleted user.");
      return ResponseEntity.noContent().build();
    } catch (FirebaseAuthException e) {
      return ResponseEntity.status(500).body("Failed to delete user from Authentication: " + e.getMessage());
    }
  }

  // fix to avoid anonymous users
  @GetMapping("/")
  public ResponseEntity<List<Map<String, Object>>> all() throws ExecutionException, InterruptedException {
    List<Map<String, Object>> users = new ArrayList<>();
    firestore.collection("users").get().get().getDocuments().forEach(document ->
            users.add(document.getData())
    );
    System.out.println(users);
    ResponseEntity<List<Map<String, Object>>> response = ResponseEntity.status(HttpStatus.ACCEPTED).body(users);
    System.out.println(response);
    System.out.println(response.getBody());
    return ResponseEntity.status(HttpStatus.ACCEPTED).body(users);
  }

  @PostMapping("/guest")
  public ResponseEntity<Object> createGuest(@Valid @RequestBody UserDTO userDTO) throws ExecutionException, InterruptedException {
    User user = userService.getUserByUsername(userDTO.getUsername());
    if (user != null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Username is already in our records");
    }
    Map<String, Object> userData = new HashMap<>();
    userData.put("username", userDTO.getUsername());
    userData.put("chipBalance", 2500);
    userData.put("totalWins", 0);
    userData.put("totalLosses", 0);

    return ResponseEntity.status(HttpStatus.CREATED).body(userData);
  }

  @PostMapping("/signup")
  public ResponseEntity<?> create(@Valid @RequestBody UserDTO userDTO) throws ExecutionException, InterruptedException, FirebaseAuthException {
    try {
      // create account user
      CreateRequest request = new CreateRequest()
              .setEmail(userDTO.getEmail())
              .setPassword(userDTO.getPassword())
              .setDisplayName(userDTO.getUsername());

      logger.info(userDTO.getEmail());
      logger.info(userDTO.getPassword());

      User user = userService.getUserByUsername(userDTO.getUsername());
      if (user != null) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Username is already in our records");
      }
      user = userService.getUserByEmail(userDTO.getEmail());
      if (user != null) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email is already in our records");
      }

      // this createUser uses firebase's authentication
      UserRecord userRecord = firebaseAuth.createUser(request);

      // Store additional user data in Firestore
      Map<String, Object> userData = new HashMap<>();

      userData.put("username", userDTO.getUsername());
      userData.put("chipBalance", 2500);
      userData.put("totalWins", 0);
      userData.put("totalLosses", 0);
      userData.put("email", userDTO.getEmail());
      userData.put("firstName", userDTO.getFirstName());
      userData.put("lastName", userDTO.getLastName());
      userData.put("friends", new ArrayList<>());
      userData.put("uid", userRecord.getUid());
      try {
        userData.put("role", userDTO.getEmail().endsWith("@admin.wh.com") ? "admin" : "accountUser");
      }catch (Exception e){
        System.out.println("error setting role" + e.getMessage());
      }

      DocumentReference docRef = firestore.collection("users").document(userRecord.getUid());
      docRef.set(userData).get();

      Map<String, Object> claims = new HashMap<>();
      if(userDTO.getEmail().endsWith("@admin.wh.com")) {
        claims.put("admin", true);
      }
      else {
        claims.put("accountUser", true);
      }
      firebaseAuth.setCustomUserClaims(userRecord.getUid(), claims);

      System.out.println("Response: " + ResponseEntity.status(HttpStatus.CREATED).body(userData));
      return ResponseEntity.status(HttpStatus.CREATED).body(userData);
    } catch (IllegalArgumentException e) {
      if (!pattern.matcher(userDTO.getEmail()).matches()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email format");
      }
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, e.getMessage());
    }
  }

  @PostMapping("/login")
  public ResponseEntity<Object> login(@RequestBody UserDTO login) {
    try {
          // grab user info from backend
          User user = userService.getUserByUsername(login.getUsername());

          // check if account exists for username
          if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
          }

          Map<String, Object> response = new HashMap<>();

          // add the email from the user
          response.put("email", user.getEmail());

          // frontend verifies password with "signInWithUsernameAndPassword()" by firebase

          return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
          return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (ExecutionException | InterruptedException e) {
          throw new RuntimeException(e);
        }

  }

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<Map<String, String>> handleConstraintViolationException(ResponseStatusException e) {
    Map<String, String> errorResponse = new HashMap<>();
    errorResponse.put("message", e.getReason());
    return new ResponseEntity<>(errorResponse, e.getStatusCode());
  }

}