package edu.loyola.square.controller;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;

import com.google.firebase.ErrorCode;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;

import com.google.firebase.auth.UserRecord;
import edu.loyola.square.controller.service.UserService;
import edu.loyola.square.model.dto.AuthDTO;
import edu.loyola.square.model.dto.UserDTO;
import edu.loyola.square.model.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.main.allow-bean-definition-overriding=true"
})
class UserControllerTest {

  @MockBean
  private UserService userService;

  @MockBean
  private FirebaseAuth firebaseAuth;

  @MockBean
  private Firestore firestore;

  @MockBean
  private CollectionReference collectionReference;

  @MockBean
  private DocumentReference documentReference;

  @MockBean
  private QuerySnapshot querySnapshot;

  private UserController userController;

  private User testUser;
  private UserDTO testUserDTO;
  private AuthDTO testAuthDTO;

  @BeforeEach
  void setUp() {
    userController = new UserController(firebaseAuth, firestore, userService);

    testUser = new User();
    testUser.setUid("test123");
    testUser.setUsername("testUser");
    testUser.setEmail("test@example.com");
    testUser.setChipBalance(2500);
    testUser.setTotalWins(0);
    testUser.setTotalLosses(0);

    testUserDTO = new UserDTO("test123", "testUser", "password123", "Test", "Last", "test@example.com");

    testAuthDTO = new AuthDTO("test123", "newpassword123");

    when(firestore.collection("users")).thenReturn(collectionReference);
    when(collectionReference.document(anyString())).thenReturn(documentReference);
  }

  @Test
  void signupSuccessTest() throws ExecutionException, InterruptedException, FirebaseAuthException {
    // Mock user record creation
    UserRecord mockUserRecord = mock(UserRecord.class);
    when(mockUserRecord.getUid()).thenReturn("test123");
    when(mockUserRecord.getEmail()).thenReturn(testUserDTO.getEmail());
    when(mockUserRecord.getDisplayName()).thenReturn(testUserDTO.getUsername());

    // Mock the user creation in Firebase
    when(firebaseAuth.createUser(any(UserRecord.CreateRequest.class)))
            .thenReturn(mockUserRecord);

    // Mock the setCustomUserClaims call
    doNothing().when(firebaseAuth).setCustomUserClaims(
            eq("test123"),
            argThat(claims -> claims.containsKey("accountUser") && (Boolean)claims.get("accountUser"))
    );

    // Mock user service checks
    when(userService.getUserByUsername(testUserDTO.getUsername())).thenReturn(null);
    when(userService.getUserByEmail(testUserDTO.getEmail())).thenReturn(null);

    // Mock Firestore document creation
    @SuppressWarnings("unchecked")
    ApiFuture<WriteResult> mockFuture = mock(ApiFuture.class);
    WriteResult mockWriteResult = mock(WriteResult.class);
    when(mockFuture.get()).thenReturn(mockWriteResult);
    when(documentReference.set(any(Map.class))).thenReturn(mockFuture);

    // Execute the signup
    ResponseEntity<?> response = userController.create(testUserDTO);

    // Verify the response
    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    assertNotNull(response.getBody());

    // Verify all Firebase interactions
    verify(firebaseAuth).createUser(any(UserRecord.CreateRequest.class));
    verify(firebaseAuth).setCustomUserClaims(
            eq("test123"),
            argThat(claims -> claims.containsKey("accountUser") && (Boolean)claims.get("accountUser"))
    );
    verify(documentReference).set(any(Map.class));

    @SuppressWarnings("unchecked")
    Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
    assertEquals(testUserDTO.getUsername(), responseBody.get("username"));
    assertEquals(2500, responseBody.get("chipBalance"));
  }

  @Test
  void signupWithDuplicateUsernameTest() throws ExecutionException, InterruptedException {
    when(userService.getUserByUsername(testUserDTO.getUsername())).thenReturn(testUser);

    assertThrows(ResponseStatusException.class, () -> {
      userController.create(testUserDTO);
    });
  }

  @Test
  void signupWithInvalidEmailTest() throws ExecutionException, InterruptedException {
    testUserDTO.setEmail("invalid-email");

    assertThrows(ResponseStatusException.class, () -> {
      userController.create(testUserDTO);
    });
  }

  @Test
  void loginSuccessTest() throws ExecutionException, InterruptedException {
    when(userService.getUserByUsername(testUserDTO.getUsername())).thenReturn(testUser);

    ResponseEntity<Object> response = userController.login(testUserDTO);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    @SuppressWarnings("unchecked")
    Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
    assertEquals(testUser.getEmail(), responseBody.get("email"));
  }

  @Test
  void loginWithNonexistentUserTest() throws ExecutionException, InterruptedException {
    when(userService.getUserByUsername(testUserDTO.getUsername())).thenReturn(null);

    ResponseEntity<Object> response = userController.login(testUserDTO);

    assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    assertEquals("User not found", response.getBody());
  }

  @Test
  void signupAdminUserTest() throws ExecutionException, InterruptedException, FirebaseAuthException {
    // Create admin UserDTO
    UserDTO adminDTO = new UserDTO("admin123", "adminUser", "password123",
            "Admin", "User", "test@admin.wh.com");

    // Mock user record creation
    UserRecord mockUserRecord = mock(UserRecord.class);
    when(mockUserRecord.getUid()).thenReturn("admin123");
    when(mockUserRecord.getEmail()).thenReturn(adminDTO.getEmail());
    when(mockUserRecord.getDisplayName()).thenReturn(adminDTO.getUsername());

    // Mock Firebase auth
    when(firebaseAuth.createUser(any(UserRecord.CreateRequest.class)))
            .thenReturn(mockUserRecord);

    // Mock user service checks
    when(userService.getUserByUsername(adminDTO.getUsername())).thenReturn(null);
    when(userService.getUserByEmail(adminDTO.getEmail())).thenReturn(null);

    // Mock Firestore
    @SuppressWarnings("unchecked")
    ApiFuture<WriteResult> mockFuture = mock(ApiFuture.class);
    WriteResult mockWriteResult = mock(WriteResult.class);
    when(mockFuture.get()).thenReturn(mockWriteResult);
    when(documentReference.set(any(Map.class))).thenReturn(mockFuture);

    ResponseEntity<?> response = userController.create(adminDTO);

    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    verify(firebaseAuth).setCustomUserClaims(
            eq("admin123"),
            argThat(claims -> claims.containsKey("admin") && (Boolean)claims.get("admin"))
    );
  }

  @Test
  void signupWithDuplicateEmailTest() throws ExecutionException, InterruptedException {
    when(userService.getUserByEmail(testUserDTO.getEmail())).thenReturn(testUser);

    assertThrows(ResponseStatusException.class, () -> {
      userController.create(testUserDTO);
    });
  }

  @Test
  void loginWithIllegalArgumentExceptionTest() throws ExecutionException, InterruptedException {
    when(userService.getUserByUsername(testUserDTO.getUsername()))
            .thenThrow(new IllegalArgumentException("Invalid argument"));

    ResponseEntity<Object> response = userController.login(testUserDTO);

    assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    assertEquals("Invalid argument", response.getBody());
  }

  @Test
  void getUserWithExceptionTest() throws ExecutionException, InterruptedException {
    when(userService.getUser(anyString())).thenThrow(new RuntimeException("Database error"));

    ResponseEntity<User> response = userController.getUser("test123");

    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    assertNull(response.getBody());
  }

  @Test
  void resetPasswordSuccessTest() throws FirebaseAuthException {
    // Mock Firebase instance and user record
    UserRecord mockUserRecord = mock(UserRecord.class);
    FirebaseAuth mockFirebaseInstance = mock(FirebaseAuth.class);

    try (MockedStatic<FirebaseAuth> firebaseAuthMock = mockStatic(FirebaseAuth.class)) {
      // Mock the getInstance() call
      firebaseAuthMock.when(FirebaseAuth::getInstance).thenReturn(mockFirebaseInstance);

      // Mock the updateUser call
      when(mockFirebaseInstance.updateUser(any(UserRecord.UpdateRequest.class)))
              .thenReturn(mockUserRecord);

      ResponseEntity<Object> response = userController.resetPassword(testAuthDTO);

      assertEquals(HttpStatus.OK, response.getStatusCode());
      verify(mockFirebaseInstance).updateUser(any(UserRecord.UpdateRequest.class));
    }
  }

  @Test
  void resetPasswordFailureTest() throws FirebaseAuthException {
    when(firebaseAuth.updateUser(any(UserRecord.UpdateRequest.class)))
            .thenThrow(new FirebaseAuthException(ErrorCode.NOT_FOUND, "Failed to update password", null, null, null));

    ResponseEntity<Object> response = userController.resetPassword(testAuthDTO);

    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
  }

  @Test
  void deleteUserSuccessTest() throws FirebaseAuthException {
    doNothing().when(firebaseAuth).deleteUser(testAuthDTO.getUid());

    @SuppressWarnings("unchecked")
    ApiFuture<WriteResult> mockFuture = mock(ApiFuture.class);
    when(documentReference.delete()).thenReturn(mockFuture);

    ResponseEntity<String> response = userController.deleteUser(testAuthDTO);

    assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    verify(firebaseAuth).deleteUser(testAuthDTO.getUid());
    verify(documentReference).delete();
  }

  @Test
  void deleteUserFailureTest() throws FirebaseAuthException {
    doThrow(new FirebaseAuthException(ErrorCode.NOT_FOUND, "Failed to delete user", null, null, null))
            .when(firebaseAuth).deleteUser(testAuthDTO.getUid());

    ResponseEntity<String> response = userController.deleteUser(testAuthDTO);

    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    assertTrue(response.getBody().contains("Failed to delete user"));
  }

  @Test
  void getAllUsersSuccessTest() throws ExecutionException, InterruptedException {
    List<QueryDocumentSnapshot> documentSnapshots = new ArrayList<>();
    QueryDocumentSnapshot mockSnapshot = mock(QueryDocumentSnapshot.class);
    Map<String, Object> userData = Map.of(
            "username", "testUser",
            "chipBalance", 2500
    );
    when(mockSnapshot.getData()).thenReturn(userData);
    documentSnapshots.add(mockSnapshot);

    @SuppressWarnings("unchecked")
    ApiFuture<QuerySnapshot> mockFuture = mock(ApiFuture.class);
    when(mockFuture.get()).thenReturn(querySnapshot);
    when(collectionReference.get()).thenReturn(mockFuture);
    when(querySnapshot.getDocuments()).thenReturn(documentSnapshots);

    ResponseEntity<List<Map<String, Object>>> response = userController.all();

    assertEquals(HttpStatus.ACCEPTED, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(1, response.getBody().size());
    assertEquals("testUser", response.getBody().get(0).get("username"));
  }

  @Test
  void createGuestUserSuccessTest() throws ExecutionException, InterruptedException {
    when(userService.getUserByUsername(testUserDTO.getUsername())).thenReturn(null);

    ResponseEntity<Object> response = userController.createGuest(testUserDTO);

    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    @SuppressWarnings("unchecked")
    Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
    assertEquals(testUserDTO.getUsername(), responseBody.get("username"));
    assertEquals(2500, responseBody.get("chipBalance"));
    assertEquals(0, responseBody.get("totalWins"));
    assertEquals(0, responseBody.get("totalLosses"));
  }

  @Test
  void createGuestUserDuplicateUsernameTest() throws ExecutionException, InterruptedException {
    when(userService.getUserByUsername(testUserDTO.getUsername())).thenReturn(testUser);

    assertThrows(ResponseStatusException.class, () -> {
      userController.createGuest(testUserDTO);
    });
  }

  @Test
  void getUserSuccess() throws ExecutionException, InterruptedException {
    // Arrange
    when(userService.getUser("test123")).thenReturn(testUser);

    // Act
    ResponseEntity<User> response = userController.getUser("test123");

    // Assert
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(testUser, response.getBody());
    verify(userService).getUser("test123");
  }

  @Test
  void getUserNotFound() throws ExecutionException, InterruptedException {
    // Arrange
    when(userService.getUser("nonexistent")).thenReturn(null);

    // Act
    ResponseEntity<User> response = userController.getUser("nonexistent");

    // Assert
    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNull(response.getBody());
    verify(userService).getUser("nonexistent");
  }

  @Test
  void createGuestUserSuccess() throws ExecutionException, InterruptedException {
    // Arrange
    when(userService.getUserByUsername(testUserDTO.getUsername())).thenReturn(null);

    // Act
    ResponseEntity<Object> response = userController.createGuest(testUserDTO);

    // Assert
    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    @SuppressWarnings("unchecked")
    Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
    assertNotNull(responseBody);
    assertEquals(testUserDTO.getUsername(), responseBody.get("username"));
    assertEquals(2500, responseBody.get("chipBalance"));
    assertEquals(0, responseBody.get("totalWins"));
    assertEquals(0, responseBody.get("totalLosses"));
  }
}