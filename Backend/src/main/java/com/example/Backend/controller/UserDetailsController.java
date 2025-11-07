package com.example.Backend.controller;


import com.example.Backend.models.UserDetails;
import com.example.Backend.service.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/userdetails")
public class UserDetailsController {

    private final UserDetailsService userDetailsService;

    public UserDetailsController(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @GetMapping
    public List<UserDetails> getAllUsers() {
        return userDetailsService.getAllUsersDetails();
    }

    @GetMapping
    public UserDetails addUserDetails(UserDetails userDetails) {
        return userDetailsService.addUserDetails(userDetails);
    }
    @GetMapping
    public Optional<UserDetails> getUserById(@PathVariable String id) {
        return userDetailsService.getUserDetailsById(id);
    }

    @DeleteMapping
    public void deleteUserById(@PathVariable String id) {
        userDetailsService.deleteUserDetails(id);
    }



}
