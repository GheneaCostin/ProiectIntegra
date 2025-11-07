package com.example.Backend.repository;

import com.example.Backend.models.User;
import com.example.Backend.models.UserDetails;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserDetailsRepository extends MongoRepository<UserDetails, String> {
}
