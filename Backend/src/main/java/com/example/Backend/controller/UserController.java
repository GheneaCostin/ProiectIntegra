package com.example.Backend.controller;

import com.example.Backend.models.User;
import com.example.Backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository repository;

    public UserController(UserRepository repository) {
        this.repository = repository;
    }


    @GetMapping
    public List<User> getAllUsers() {
        return repository.findAll();
    }

    // GET: user după email
    @GetMapping("/{email}")
    public Optional<User> getUserByUsername(@PathVariable String email) {
        return repository.findByEmail(email);
    }

    // POST: adaugă un nou user
    @PostMapping
    public User addUser(@RequestBody User user) {
        return repository.save(user);
    }

    // DELETE: șterge un user după id
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        repository.deleteById(id);
    }
}