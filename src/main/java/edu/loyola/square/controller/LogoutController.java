package edu.loyola.square.controller;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@CrossOrigin
@RestController
@RequestMapping("/api/logout")
public class LogoutController {

  @PostMapping("/")
  public void logout(HttpServletRequest request, HttpServletResponse response) throws IOException {
    HttpSession session = request.getSession();
    session.invalidate();
    response.setContentType("text/plain");
    response.getWriter().write("Logout successful");
    response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  }
}
