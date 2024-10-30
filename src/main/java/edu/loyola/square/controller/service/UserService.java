package edu.loyola.square.controller.service;

import java.util.concurrent.ExecutionException;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import edu.loyola.square.model.entity.User;
import org.springframework.stereotype.Service;// UserService class to handle Firestore operations

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
