package edu.loyola.square.controller.service;

import java.util.concurrent.ExecutionException;

import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import edu.loyola.square.model.entity.User;
import org.springframework.stereotype.Service;

@Service
public class UserService {
  private final Firestore firestore;
  private final CollectionReference usersCollection;

  public UserService() {
    this.firestore = FirestoreClient.getFirestore();
    this.usersCollection = firestore.collection("users");
  }

  public User getUser(String uid) throws ExecutionException, InterruptedException {
    DocumentSnapshot document = usersCollection.document(uid).get().get();
    return User.fromDocument(document);
  }

  public User getUserByEmail(String email) throws ExecutionException, InterruptedException {
    QuerySnapshot query = usersCollection
            .whereEqualTo("email", email)
            .limit(1)
            .get()
            .get();
    if (query.isEmpty()) {
      return null;
    }
    return User.fromDocument(query.getDocuments().get(0));
  }

  public User getUserByUsername(String username) throws ExecutionException, InterruptedException {
    QuerySnapshot query = usersCollection
            .whereEqualTo("username", username)
            .limit(1)
            .get()
            .get();

    if (query.isEmpty()) {
      return null;
    }
    return User.fromDocument(query.getDocuments().get(0));
  }

  public void updateUsername(String uid, String newUsername) throws ExecutionException, InterruptedException {
    DocumentReference docRef = usersCollection.document(uid);
    docRef.update("username", newUsername).get();
  }

}
