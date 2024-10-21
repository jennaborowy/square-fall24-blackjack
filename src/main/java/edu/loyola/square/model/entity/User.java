package edu.loyola.square.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "users")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long userID;

  @Column(name = "username", nullable = false, unique = true)
  private String username;

  // need to figure out bcrypt here?
  @Size(min = 8, message = "Password must be at least 8 characters")
  @Column(name = "password", nullable = false)
  private String password;

  @Column(name = "firstName", nullable = false)
  private String firstName;

  @Column(name = "lastName", nullable = false)
  private String lastName;

  @Column(name = "chipBalance", nullable = false, columnDefinition = "INTEGER")
  private int chipBalance = 2500;

  @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          message = "Invalid email address format")
  @Column(name = "email", nullable = false)
  private String email;

  @Column(name = "totalWins", nullable = false, columnDefinition = "INTEGER")
  private int totalWins;

  @Column(name = "totalLosses", nullable = false, columnDefinition = "INTEGER")
  private int totalLosses;

  protected User() {} // needed internally

  public User(String username) {
    this.username = username;
  }

  @Override
  public String toString() {
    return "User " + username;
  }

  public Long getId() { return userID;}
  public String getUsername() { return username;}

  public @Size(min = 8, message = "Password must be at least 8 characters") String getPassword() {
    return password;
  }

  public void setPassword(@Size(min = 8, message = "Password must be at least 8 characters") String password) {
    this.password = password;
  }

  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public String getLastName() {
    return lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  public int getChipBalance() {
    return chipBalance;
  }

  public void setChipBalance(int chipBalance) {
    this.chipBalance = chipBalance;
  }

  public @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          message = "Invalid email address format") String getEmail() {
    return email;
  }

  public void setEmail(@Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          message = "Invalid email address format") String email) {
    this.email = email;
  }

  public int getTotalWins() {
    return totalWins;
  }

  public void setTotalWins(int totalWins) {
    this.totalWins = totalWins;
  }

  public int getTotalLosses() {
    return totalLosses;
  }

  public void setTotalLosses(int totalLosses) {
    this.totalLosses = totalLosses;
  }
}
