package com.example.Backend.controller;


import com.example.Backend.model.Treatment;
import com.example.Backend.model.User;
import com.example.Backend.model.UserDetails;
import com.example.Backend.service.DoctorService;
import com.example.Backend.service.UserDetailsService;
import com.example.Backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {

    private final DoctorService service;
    private final UserDetailsService userDetailsService;
    public DoctorController(DoctorService service, UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
        this.service = service  ;
    }

    @GetMapping("/patients")
    public ResponseEntity<?> getPatients(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        if (!"doctor".equalsIgnoreCase(role)) {
            String message = "Access denied.";
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(message);
        }
        List<User> patients = service.getAllPatients();
        List<UserDetails> patientDetailsList = new ArrayList<>();
        for (User patient : patients) {
            String userId = patient.getId();

            Optional<UserDetails> userDetailsOptional = userDetailsService.getUserDetailsById(userId);

            if (userDetailsOptional.isPresent()) {
                patientDetailsList.add(userDetailsOptional.get());
            }
        }
        return ResponseEntity.ok(patientDetailsList);
    }

    @PostMapping
    public ResponseEntity<?> prescribeTreatment(HttpServletRequest request, @RequestBody Treatment treatment) {
        String role = (String) request.getAttribute("role");
        if (!"doctor".equalsIgnoreCase(role)) {
            String message = "Access denied.";
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(message);
        }
        service.addTreatmentToPatient(treatment);
        String message = "Treatment prescribed successfully.";
        return ResponseEntity.ok(message);
    }

}
