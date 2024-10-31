package edu.loyola.square.model.dto;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
public class UserDTO {

//  @Id
//  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long userID;

//  @Column(name = "username", nullable = false, unique = true)
  private String username;

//  @Size(min = 8, message = "Password must be at least 8 characters")
//  @Column(name = "password", nullable = false)
  private String password;

//  @Column(name = "first_name", nullable = false)
  private String firstName;

//  @Column(name = "last_name", nullable = false)
  private String lastName;

//  @Column(name = "chip_balance", nullable = false, columnDefinition = "INTEGER")
  private int chipBalance = 2500;

//  @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
//          message = "Invalid email address format")
//  @Column(name = "email", nullable = false, unique = true)
  private String email;

//  @Column(name = "total_wins", nullable = false, columnDefinition = "INTEGER")
  private int totalWins;

//  @Column(name = "total_losses", nullable = false, columnDefinition = "INTEGER")
  private int totalLosses;

  protected UserDTO() {} // needed internally

  public UserDTO(String username, String password) {
    this.username = username;
    this.password = password;
  }

  public UserDTO(String username, String password, String firstName, String lastName, String email) {
    this.username = username;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
  }

  public String toString() {
    return "User " + username;
  }

  public Long getId() { return userID;}

  public String getUsername() { return username;}

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
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

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
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
