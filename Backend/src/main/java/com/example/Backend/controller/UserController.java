package com.example.Backend.controller;

import com.example.Backend.dto.PasswordChangeRequest;
import com.example.Backend.dto.DoctorDTO;
import com.example.Backend.model.User;
import com.example.Backend.model.UserDetails;
import com.example.Backend.repository.UserDetailsRepository;
import com.example.Backend.repository.UserRepository;
import com.example.Backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;
    private final UserDetailsRepository userDetailsRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    public UserController(UserService service,
                          UserDetailsRepository userDetailsRepository,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.service = service;
        this.userDetailsRepository = userDetailsRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }



    @GetMapping
    public List<User> getAllUsers() {
        return service.getAllUsers();
    }


    @GetMapping("/{email}")
    public Optional<User> getUserByEmail(@PathVariable String email) {
        return service.getUserByEmail(email);
    }


    @GetMapping("/id/{id}")
    public Optional<User> getUserById(@PathVariable String id) {
        return service.getUserById(id);
    }


    @PostMapping
    public User addUser(@RequestBody User user) {
        return service.addUser(user);
    }


    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        service.deleteUser(id);
    }



    @GetMapping("/{userId}/details")
    public ResponseEntity<?> getUserDetails(@PathVariable String userId) {
        Optional<UserDetails> details = userDetailsRepository.findByUserId(userId);
        if (details.isPresent()) {
            return ResponseEntity.ok(details.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Detalii utilizator negăsite.");
        }
    }

    @PutMapping("/{userId}/details")
    public ResponseEntity<?> updateUserDetails(@PathVariable String userId, @RequestBody UserDetails updatedDetails) {
        Optional<UserDetails> existingDetailsOpt = userDetailsRepository.findByUserId(userId);

        if (existingDetailsOpt.isPresent()) {
            UserDetails existing = existingDetailsOpt.get();

            existing.setFirstName(updatedDetails.getFirstName());
            existing.setLastName(updatedDetails.getLastName());
            existing.setHeight(updatedDetails.getHeight());
            existing.setWeight(updatedDetails.getWeight());
            existing.setBirthDate(updatedDetails.getBirthDate());
            existing.setSex(updatedDetails.getSex());
            if(updatedDetails.getExtrainfo() != null) {
                existing.setExtrainfo(updatedDetails.getExtrainfo());
            }

            userDetailsRepository.save(existing);
            return ResponseEntity.ok("Date actualizate cu succes.");
        } else {
            updatedDetails.setUserId(userId);
            userDetailsRepository.save(updatedDetails);
            return ResponseEntity.ok("Date create cu succes.");
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody PasswordChangeRequest request) {
        Optional<User> userOpt = service.getUserById(request.getUserId());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilizator negăsit.");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Parola curentă este incorectă.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok("Parola a fost schimbată cu succes.");
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorDTO>> getAllDoctors() {
        List<User> doctors = userRepository.findByRole("doctor");
        List<DoctorDTO> doctorDTOS = new ArrayList<>();

        for (User doc : doctors) {
            String fullName = "Doctor (Fără Nume)";
            String specialization = "General";

            Optional<UserDetails> detailsOpt = userDetailsRepository.findByUserId(doc.getId());
            if (detailsOpt.isPresent()) {
                UserDetails details = detailsOpt.get();
                if (details.getFirstName() != null && details.getLastName() != null) {
                    fullName = "Dr. " + details.getFirstName() + " " + details.getLastName();
                }
                if (details.getExtrainfo() != null) {
                    specialization = details.getExtrainfo();
                }
            } else {
                fullName = doc.getEmail();
            }

            doctorDTOS.add(new DoctorDTO(doc.getId(), fullName, specialization));
        }

        return ResponseEntity.ok(doctorDTOS);
    }
}