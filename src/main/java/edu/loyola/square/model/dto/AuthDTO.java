package edu.loyola.square.model.dto;

public class AuthDTO { ;

  private String username;

  private String uid;

  private String password;

  protected AuthDTO() {} // needed internally

  public AuthDTO(String uid) {
    this.uid = uid;
  }

  public AuthDTO(String uid, String password) {
    this.uid = uid;
    this.password = password;
  }
  public String getPassword() { return password; }

  public void setPassword(String password) { this.password = password; }

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
