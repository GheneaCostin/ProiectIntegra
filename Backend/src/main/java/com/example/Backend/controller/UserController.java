package com.example.Backend.controller;

import com.example.Backend.model.User;
import com.example.Backend.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service  ;
    }


    @GetMapping
    public List<User> getAllUsers() {
        return service.getAllUsers();
    }

    // GET: user după email
    @GetMapping("/{email}")
    public Optional<User> getUserByEmail(@PathVariable String email) {
        return service.getUserByEmail(email);
    }
    // GET: user după id
    @GetMapping("/id/{id}")
    public Optional<User> getUserById(@PathVariable String id) {
        return service.getUserById(id);
    }

    // POST: adaugă un nou user
    @PostMapping
    public User addUser(@RequestBody User user) {
        return service.addUser(user);
    }

    // DELETE: șterge un user după id
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        service.deleteUser(id);
    }
}