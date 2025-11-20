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
        this.userDetailsService  = userDetailsService;
        this.service = service  ;
    }
    @GetMapping("/patients")
    public ResponseEntity<?> getAllPatients(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");

        if (!"doctor".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Nu ai drepturi să accesezi această resursă!");
        }

        List<User> patients = service.getAllPatients();
        if (patients.isEmpty()) {
            return ResponseEntity.ok("Nu există pacienți în baza de date!");
        }

        return ResponseEntity.ok(patients);
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
