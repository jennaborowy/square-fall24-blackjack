package edu.loyola.square.model.dto;

public class UserDTO {

  private String userID;

  private String username;

  private String password;

  private String firstName;

  private String lastName;

  private int chipBalance = 2500;

  private String email;

  private int totalWins;

  private int totalLosses;

  protected UserDTO() {} // needed internally

  public UserDTO(String username) {
    this.username = username;
  }

  public UserDTO(String username, String password) {
    this.username = username;
    this.password = password;
  }

  public UserDTO(String userID, String username, String password, String firstName, String lastName, String email) {
    this.userID = userID;
    this.username = username;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
  }

  public String toString() {
    return "User " + username;
  }

  public String getId() { return userID;}

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
