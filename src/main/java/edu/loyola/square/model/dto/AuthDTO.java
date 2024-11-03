package edu.loyola.square.model.dto;

public class AuthDTO { ;


  private String username;

  private String uid;

  protected AuthDTO() {} // needed internally

  public AuthDTO(String uid) {
    this.uid = uid;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getUid() {
    return uid;
  }

  public void setUid(String uid) {
    this.uid = uid;
  }

}
