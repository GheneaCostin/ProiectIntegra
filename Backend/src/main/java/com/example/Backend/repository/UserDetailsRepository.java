package com.example.Backend.repository;

import com.example.Backend.model.UserDetails;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface UserDetailsRepository extends MongoRepository<UserDetails, String> {

    List<UserDetails>findByFirstNameContainingOrLastNameContaining(String firstName, String lastName);
}
