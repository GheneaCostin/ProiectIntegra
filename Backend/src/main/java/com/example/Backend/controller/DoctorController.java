package com.example.Backend.controller;

import com.example.Backend.model.Treatment;
import com.example.Backend.model.User;
import com.example.Backend.model.UserDetails;
import com.example.Backend.service.DoctorService;
import com.example.Backend.service.UserDetailsService;
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
        this.service = service;
    }

    @CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
    @GetMapping("/patients")
    public ResponseEntity<?> getPatients(HttpServletRequest request) {

        String role = (String) request.getAttribute("role");
        if (role != null && !"doctor".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }


        List<User> patients = service.getAllPatients();


        List<UserDetails> combinedList = new ArrayList<>();

        for (User user : patients) {

            Optional<UserDetails> detailsOpt = userDetailsService.getUserDetailsById(user.getId());

            if (detailsOpt.isPresent()) {

                combinedList.add(detailsOpt.get());
            } else {

                UserDetails placeholder = new UserDetails();
                placeholder.setUserId(user.getId());
                placeholder.setFirstName(user.getEmail());
                placeholder.setLastName("");
                placeholder.setAge(0); // Sau null
                placeholder.setSex("-");
                placeholder.setExtrainfo("Fără detalii medicale completate.");
                combinedList.add(placeholder);
            }
        }

        return ResponseEntity.ok(combinedList);
    }

    @PostMapping
    public ResponseEntity<?> prescribeTreatment(HttpServletRequest request, @RequestBody Treatment treatment) {
        service.addTreatmentToPatient(treatment);
        return ResponseEntity.ok("Treatment prescribed successfully.");
    }
}