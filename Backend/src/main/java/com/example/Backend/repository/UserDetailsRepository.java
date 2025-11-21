package com.example.Backend.repository;

import com.example.Backend.model.UserDetails;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface UserDetailsRepository extends MongoRepository<UserDetails, String> {

    Optional<UserDetails> findByUserId(String userId);


    List<UserDetails> findByFirstNameContainingOrLastNameContaining(String firstName, String lastName);
}