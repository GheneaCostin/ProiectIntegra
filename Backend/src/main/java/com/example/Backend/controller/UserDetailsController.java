package com.example.Backend.controller;


import com.example.Backend.model.UserDetails;
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
    public List<UserDetails> getAllUsersDetails() {
        return userDetailsService.getAllUsersDetails();
    }

    @PostMapping
    public UserDetails addUserDetails(@RequestBody UserDetails userDetails) {
        return userDetailsService.addUserDetails(userDetails);
    }
    @GetMapping("/id/{id}")
    public Optional<UserDetails> getUserDetailsById(@PathVariable String id) {
        return userDetailsService.getUserDetailsById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteUserDetailsById(@PathVariable String id) {
        userDetailsService.deleteUserDetails(id);
    }

    @GetMapping("/search")
    public List<UserDetails> searchPatients(@RequestParam String name) {
        return userDetailsService.searchPatients(name);
    }

}
