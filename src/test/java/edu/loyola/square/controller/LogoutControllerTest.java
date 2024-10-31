package edu.loyola.square.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.aot.generate.AccessControl;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

@ExtendWith(MockitoExtension.class)
class LogoutControllerTest {

  @InjectMocks
  LogoutController logoutController;

  @Test
  void logout() throws IOException {
    MockHttpServletRequest request = new MockHttpServletRequest();
    MockHttpServletResponse response = new MockHttpServletResponse();
    HttpSession session = mock(HttpSession.class);

    logoutController.logout(request, response);

    assertEquals("text/plain", response.getContentType());
   // assertEquals("http://localhost:3000", request.getHeaders("Access-Control-Request-Headers").nextElement());
  }

}