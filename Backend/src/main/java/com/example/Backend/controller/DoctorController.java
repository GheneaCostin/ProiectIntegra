package com.example.Backend.controller;


import com.example.Backend.models.User;
import com.example.Backend.service.DoctorService;
import com.example.Backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {

    private final DoctorService service;

    public DoctorController(DoctorService service) {
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
        return ResponseEntity.ok(patients);
    }

}
