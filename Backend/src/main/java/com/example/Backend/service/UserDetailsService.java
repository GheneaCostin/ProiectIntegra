package com.example.Backend.service;

import com.example.Backend.model.UserDetails;
import com.example.Backend.repository.UserDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserDetailsService {

    private final UserDetailsRepository userDetailsRepository;


    @Autowired
    public UserDetailsService(UserDetailsRepository userDetailsRepository) {
        this.userDetailsRepository = userDetailsRepository;
    }

    public List<UserDetails> getAllUsersDetails() {
        return userDetailsRepository.findAll();
    }

    public UserDetails addUserDetails(UserDetails userDetails) {
        return userDetailsRepository.save(userDetails);
    }


    public Optional<UserDetails> getUserDetailsById(String userId) {

        return userDetailsRepository.findByUserId(userId);
    }

    public void deleteUserDetails(String id) {
        userDetailsRepository.deleteById(id);
    }

    public List<UserDetails> searchPatients(String name) {
        return userDetailsRepository.findByFirstNameContainingOrLastNameContaining(name, name);
    }
}