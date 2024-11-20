package edu.loyola.square.config;


import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URL;

@Configuration
public class FirebaseConfig {

  @Bean
  public FirebaseAuth firebaseAuth() {
    return FirebaseAuth.getInstance();
  }

  @Bean
  public Firestore firestore() {
    return FirestoreClient.getFirestore();
  }

  @PostConstruct
  public void initialize() {
    try {
      // Try multiple possible locations
      File credentialsFile = new File("./firebase-credentials.json");
      if (!credentialsFile.exists()) {
        // Try to load from resources folder
        URL resource = getClass().getClassLoader().getResource("square-fall24-blackjack-firebase-adminsdk-bp4ir-20879538b8.json");
        if (resource != null) {
          credentialsFile = new File(resource.getFile());
        }
      }

      if (!credentialsFile.exists()) {
        throw new FileNotFoundException("Firebase credentials file not found. Tried: " + credentialsFile.getAbsolutePath());
      }

      FileInputStream serviceAccount = new FileInputStream(credentialsFile);
      FirebaseOptions options = FirebaseOptions.builder()
              .setCredentials(GoogleCredentials.fromStream(serviceAccount))
              .build();

      if (FirebaseApp.getApps().isEmpty()) {
        FirebaseApp.initializeApp(options);
      }

      System.out.println("Firebase initialized successfully!");

    } catch (IOException e) {
      e.printStackTrace();
      throw new RuntimeException("Failed to initialize Firebase: " + e.getMessage(), e);
    }
  }
}