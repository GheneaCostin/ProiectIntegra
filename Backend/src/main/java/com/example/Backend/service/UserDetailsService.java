package com.example.Backend.service;


import com.example.Backend.models.UserDetails;
import com.example.Backend.repository.UserDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.List;
import java.util.Optional;

@Service
public class UserDetailsService {


    @Autowired
    private UserDetailsRepository userDetailsRepository;

    public UserDetailsService(UserDetailsRepository repository) {
        this.userDetailsRepository = repository;
    }


    public List<UserDetails> getAllUsersDetails() {
        return userDetailsRepository.findAll();
    }


    public UserDetails addUserDetails(UserDetails userDetails) {
        return userDetailsRepository.save(userDetails);
    }


    public Optional<UserDetails> getUserDetailsById(String id) {
        return userDetailsRepository.findById(id);
    }

    public void deleteUserDetails(String id) {
        userDetailsRepository.deleteById(id);
    }

    public List<UserDetails> searchPatients(String name) {
        return userDetailsRepository.findByFirstNameContainingOrLastNameContaining(name,name);
    }


}

