package edu.loyola.square.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "friends")
public class Friend {

  @EmbeddedId
  private PlayerFriendKey id;

  // getters and setters
  public PlayerFriendKey getId() {
    return id;
  }

  public void setId(PlayerFriendKey id) {
    this.id = id;
  }

}
