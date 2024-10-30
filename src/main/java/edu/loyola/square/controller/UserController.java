package edu.loyola.square.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.auth.UserRecord.CreateRequest;
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.DocumentReference;
import edu.loyola.square.controller.service.UserService;
import edu.loyola.square.model.dto.UserDTO;
import edu.loyola.square.model.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
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

@RestController
@RequestMapping("/api/user")
@CrossOrigin
public class UserController {

  private final FirebaseAuth firebaseAuth;
  private final Firestore firestore;

  public UserController() {
    this.firebaseAuth = FirebaseAuth.getInstance();
    this.firestore = FirestoreClient.getFirestore();
  }

  @Autowired
  private UserService userService;

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

  @GetMapping("/")
  public ResponseEntity<List<Map<String, Object>>> all() throws ExecutionException, InterruptedException {
    List<Map<String, Object>> users = new ArrayList<>();
    firestore.collection("users").get().get().getDocuments().forEach(document ->
            users.add(document.getData())
    );
    return ResponseEntity.ok(users);
  }

  @PostMapping("/signup")
  public ResponseEntity<?> create(@Valid @RequestBody UserDTO userDTO) {
    try {
      // Create the user in Firebase Authentication
      CreateRequest request = new CreateRequest()
              .setEmail(userDTO.getEmail())
              .setPassword(userDTO.getPassword())
              .setDisplayName(userDTO.getFirstName() + " " + userDTO.getLastName());

      // this createUser uses firebase's authentication
      UserRecord userRecord = firebaseAuth.createUser(request);

      // Store additional user data in Firestore
      Map<String, Object> userData = new HashMap<>();
      userData.put("username", userDTO.getUsername());
      userData.put("email", userDTO.getEmail());
      userData.put("firstName", userDTO.getFirstName());
      userData.put("lastName", userDTO.getLastName());
      userData.put("uid", userRecord.getUid());

      DocumentReference docRef = firestore.collection("users").document(userRecord.getUid());
      docRef.set(userData).get();

      return ResponseEntity.status(HttpStatus.CREATED).body(userData);

    } catch (FirebaseAuthException e) {
      if (e.getErrorCode().equals("EMAIL_EXISTS")) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
      }
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
    }
  }

  @PostMapping("/login")
  public ResponseEntity<Object> login(@RequestBody UserDTO login) {
    try {
      // Verify the user exists using function defined in UserService (firebase doesn't provide finding by username)
      User user = userService.getUserByUsername(login.getUsername());

      // Generate a custom token for the client
      String customToken = firebaseAuth.createCustomToken(user.getUid());

      Map<String, Object> response = new HashMap<>();
      response.put("token", customToken);
      response.put("message", "Welcome back!");

      return ResponseEntity.ok(response);

    } catch (FirebaseAuthException e) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    } catch (ExecutionException e) {
      throw new RuntimeException(e);
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
  }

  // Add this middleware to verify Firebase ID tokens in protected routes
  private String verifyFirebaseToken(String authHeader) {
    try {
      if (authHeader != null && authHeader.startsWith("Bearer ")) {
        String idToken = authHeader.substring(7);
        return firebaseAuth.verifyIdToken(idToken).getUid();
      }
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No token provided");
    } catch (FirebaseAuthException e) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
    }
  }
}