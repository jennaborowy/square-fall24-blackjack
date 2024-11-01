package edu.loyola.square.model.entity;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.annotation.DocumentId;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.HashMap;
import java.util.Map;

public class User {
  @DocumentId
  private String uid; // Firebase Auth UID

  //@Size(min = 3, message = "Username must be at least 3 characters")
  private String username;

  private String firstName;
  private String lastName;

  @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          message = "Invalid email address format")
  private String email;

  private int chipBalance = 2500;
  private int totalWins = 0;
  private int totalLosses = 0;

  // Default constructor required for Firestore
  public User() {}

  public User(String uid, String username, String email, String firstName, String lastName) {
    this.uid = uid;
    this.username = username;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
  }

  // Convert User object to Firestore document
  public Map<String, Object> toDocument() {
    Map<String, Object> document = new HashMap<>();
    document.put("username", username);
    document.put("firstName", firstName);
    document.put("lastName", lastName);
    document.put("email", email);
    document.put("chipBalance", chipBalance);
    document.put("totalWins", totalWins);
    document.put("totalLosses", totalLosses);
    return document;
  }

  // Create User object from Firestore document
  public static User fromDocument(DocumentSnapshot document) {
    if (document == null || !document.exists()) {
      return null;
    }

    User user = new User();
    user.uid = document.getId();
    user.username = document.getString("username");
    user.firstName = document.getString("firstName");
    user.lastName = document.getString("lastName");
    user.email = document.getString("email");
    user.chipBalance = document.getLong("chipBalance") != null ?
            document.getLong("chipBalance").intValue() : 2500;
    user.totalWins = document.getLong("totalWins") != null ?
            document.getLong("totalWins").intValue() : 0;
    user.totalLosses = document.getLong("totalLosses") != null ?
            document.getLong("totalLosses").intValue() : 0;
    return user;
  }

  // Getters and setters
  public String getUid() { return uid; }
  public void setUid(String uid) { this.uid = uid; }

  public String getUsername() { return username; }
  public void setUsername(String username) { this.username = username; }

  public String getFirstName() { return firstName; }
  public void setFirstName(String firstName) { this.firstName = firstName; }

  public String getLastName() { return lastName; }
  public void setLastName(String lastName) { this.lastName = lastName; }

  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }

  public int getChipBalance() { return chipBalance; }
  public void setChipBalance(int chipBalance) { this.chipBalance = chipBalance; }

  public int getTotalWins() { return totalWins; }
  public void setTotalWins(int totalWins) { this.totalWins = totalWins; }

  public int getTotalLosses() { return totalLosses; }
  public void setTotalLosses(int totalLosses) { this.totalLosses = totalLosses; }

  @Override
  public String toString() {
    return "User " + username;
  }
}