package com.example.Backend.service;

import com.example.Backend.dto.RegisterRequest;
import com.example.Backend.model.User;
import com.example.Backend.model.UserDetails;
import com.example.Backend.repository.UserDetailsRepository;
import com.example.Backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserDetailsRepository userDetailsRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       UserDetailsRepository userDetailsRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userDetailsRepository = userDetailsRepository;
        this.passwordEncoder = passwordEncoder;
    }



    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizator negăsit"));


        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Credențiale invalide");
        }

        return user;
    }


    @Transactional
    public void register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }


        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("patient");

        User savedUser = userRepository.save(user);


        UserDetails userDetails = new UserDetails();
        userDetails.setUserId(savedUser.getId());
        userDetails.setFirstName(request.getFirstName());
        userDetails.setLastName(request.getLastName());
        userDetails.setSex(request.getSex());
        userDetails.setHeight(request.getHeight());
        userDetails.setWeight(request.getWeight());
        userDetails.setBirthDate(request.getBirthDate());

        userDetails.setExtrainfo("Profil nou creat");

        userDetailsRepository.save(userDetails);
    }
}