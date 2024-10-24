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

  @Column(name = "first_name", nullable = false)
  private String firstName;

  @Column(name = "last_name", nullable = false)
  private String lastName;

  @Column(name = "chip_balance", nullable = false, columnDefinition = "INTEGER")
  private int chipBalance = 2500;

  @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          message = "Invalid email address format")
  @Column(name = "email", nullable = false, unique = true)
  private String email;

  @Column(name = "total_wins", nullable = false, columnDefinition = "INTEGER")
  private int totalWins;

  @Column(name = "total_losses", nullable = false, columnDefinition = "INTEGER")
  private int totalLosses;

  public User() {} // needed internally

  public User(Long userID, String username, int totalWins, String email, int chipBalance, String lastName, String firstName, String password, int totalLosses)
  {
    this.userID = userID;
    this.username = username;
    this.totalWins = totalWins;
    this.email = email;
    this.chipBalance = chipBalance;
    this.lastName = lastName;
    this.firstName = firstName;
    this.password = password;
    this.totalLosses = totalLosses;
  }

  @Override
  public String toString() {
    return "User " + username;
  }

  public Long getId() { return userID;}

  public String getUsername() { return username;}

  public void setUsername(String username) {
    this.username = username;
  }

  public String getPassword() {
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
