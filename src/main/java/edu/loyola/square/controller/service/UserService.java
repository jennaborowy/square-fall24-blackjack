package edu.loyola.square.controller.service;

import java.util.concurrent.ExecutionException;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.cloud.FirestoreClient;
import edu.loyola.square.model.entity.User;
import org.springframework.stereotype.Service;

@Service
public class UserService {
  private final Firestore firestore;
  private final CollectionReference usersCollection;
  private final FirebaseAuth firebaseAuth;

  public UserService() {
    this.firestore = FirestoreClient.getFirestore();
    this.usersCollection = firestore.collection("users");
    this.firebaseAuth = FirebaseAuth.getInstance();
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

  public void saveUser(User user) throws ExecutionException, InterruptedException {
    usersCollection.document(user.getUid()).set(user.toDocument()).get();
  }

  public void updateChipBalance(String uid, int newBalance) throws ExecutionException, InterruptedException {
    usersCollection.document(uid).update("chipBalance", newBalance).get();
  }

  public void updateUsername(String uid, String newUsername) throws ExecutionException, InterruptedException {
    DocumentReference docRef = usersCollection.document(uid);
    docRef.update("username", newUsername).get();
  }


  public void incrementWins(String uid) throws ExecutionException, InterruptedException {
    DocumentReference docRef = usersCollection.document(uid);
    firestore.runTransaction(transaction -> {
      DocumentSnapshot snapshot = transaction.get(docRef).get();
      long currentWins = snapshot.getLong("totalWins") != null ?
              snapshot.getLong("totalWins") : 0;
      transaction.update(docRef, "totalWins", currentWins + 1);
      return null;
    }).get();
  }

  public void incrementLosses(String uid) throws ExecutionException, InterruptedException {
    DocumentReference docRef = usersCollection.document(uid);
    firestore.runTransaction(transaction -> {
      DocumentSnapshot snapshot = transaction.get(docRef).get();
      long currentLosses = snapshot.getLong("totalLosses") != null ?
              snapshot.getLong("totalLosses") : 0;
      transaction.update(docRef, "totalLosses", currentLosses + 1);
      return null;
    }).get();
  }
}
