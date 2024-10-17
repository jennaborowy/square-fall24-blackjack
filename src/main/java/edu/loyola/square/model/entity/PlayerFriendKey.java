package edu.loyola.square.model.entity;

import java.io.Serializable;
import jakarta.persistence.Embeddable;

// composite key for Friend table
@Embeddable
public final class PlayerFriendKey implements Serializable {

  private Integer friendPlayerFK;
  private int playerFK;

  // default constructor
  public PlayerFriendKey() {}

  // constructor
  public PlayerFriendKey(int friendPlayerFK, int playerFK) {
    this.setFriendPlayerFK(friendPlayerFK);
    this.setPlayerFK(playerFK);
  }

  // required for composite key by jakarta
  @Override
  public int hashCode() {
    return ((this.getFriendPlayerFK() == null
            ? 0 : this.getFriendPlayerFK().hashCode())
            ^ ((int) this.getPlayerFK()));
  }

  @Override
  public boolean equals(Object otherOb) {
    if (this == otherOb) {
      return true;
    }
    if (!(otherOb instanceof PlayerFriendKey)) {
      return false;
    }
    PlayerFriendKey other = (PlayerFriendKey) otherOb;
    return ((this.getFriendPlayerFK() == null
            ? other.getFriendPlayerFK() == null : this.getFriendPlayerFK()
            .equals(other.getFriendPlayerFK()))
            && (this.getPlayerFK() == other.getPlayerFK()));
  }

  @Override
  public String toString() {
    return getFriendPlayerFK() + "-" + getPlayerFK();
  }

  // Getters and setters
  public Integer getFriendPlayerFK() {
    return friendPlayerFK;
  }

  public void setFriendPlayerFK(int friendPlayerFK) {
    this.friendPlayerFK = friendPlayerFK;
  }

  public int getPlayerFK() {
    return playerFK;
  }

  public void setPlayerFK(int playerFK) {
    this.playerFK = playerFK;
  }

}
