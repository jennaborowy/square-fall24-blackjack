package edu.loyola.square.model.repositories;

import java.util.List;
import org.springframework.data.repository.CrudRepository;
import edu.loyola.square.model.entity.User;

public interface UserRepository extends CrudRepository {
  List<User> findByUsername(String name);

  // lists all users; good for list before filtering users
  List<User> findAll();

  User findById(long id);
}
