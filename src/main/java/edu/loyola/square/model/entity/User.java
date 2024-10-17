// SPDX-License-Identifier: MIT

package edu.loyola.square.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long userID;

  @Column(name = "username", nullable = false, unique = true)
  private String username;

  // need to figure out bcrypt here?
  @Column(name = "password", nullable = false)
  private String password;

  @Column(name = "firstName", nullable = false)
  private String firstName;

  @Column(name = "lastName", nullable = false)
  private String lastName;

  @Column(name = "chipBalance", nullable = false, columnDefinition = "INTEGER")
  private String chipBalance;

  @Column(name = "email", nullable = false)
  private String email;

  @Column(name = "totalWins", nullable = false, columnDefinition = "INTEGER")
  private String totalWins;

  @Column(name = "totalLosses", nullable = false, columnDefinition = "INTEGER")
  private String totalLosses;

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

}
