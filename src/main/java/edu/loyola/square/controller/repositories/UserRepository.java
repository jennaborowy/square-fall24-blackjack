package edu.loyola.square.controller.repositories;

import java.util.List;
import org.springframework.data.repository.CrudRepository;
import edu.loyola.square.model.entity.User;
import org.springframework.stereotype.Repository;

public interface UserRepository extends CrudRepository<User, Long> {
  List<User> findByUsername(String name);

  List<User> findByEmail(String email);

  // lists all users; good for list before filtering users
  List<User> findAll();

  User findById(long id);

  void deleteAll();

}
