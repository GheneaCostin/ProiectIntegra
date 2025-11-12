package com.example.Backend.service;

import com.example.Backend.model.User;
import com.example.Backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserService(UserRepository repository) {
        this.userRepository = repository;
    }


    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // POST: adaugă un nou user

    public User addUser(@RequestBody User user) {
        return userRepository.save(user);
    }


    public Optional<User> getUserByEmail(@PathVariable String email) {
        return userRepository.findByEmail(email);
    }


    public Optional<User> getUserById(@PathVariable String id) {
        return userRepository.findById(id);
    }

    // DELETE: șterge un user după id

    public void deleteUser(@PathVariable String id) {
        userRepository.deleteById(id);
    }



}
