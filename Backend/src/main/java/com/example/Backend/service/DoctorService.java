package com.example.Backend.service;
import  com.example.Backend.repository.UserRepository;
import com.example.Backend.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllPatients() {
        return userRepository.findAll().stream().filter(user -> user.getRole().equals("Pacient")).collect(Collectors.toList());
    }




}
