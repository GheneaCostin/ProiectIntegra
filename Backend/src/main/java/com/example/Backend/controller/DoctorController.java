package com.example.Backend.controller;


import com.example.Backend.model.Treatment;
import com.example.Backend.model.User;
import com.example.Backend.service.DoctorService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
