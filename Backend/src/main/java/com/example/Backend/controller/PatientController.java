package com.example.Backend.controller;

import com.example.Backend.dto.TreatmentDTO;
import com.example.Backend.model.Treatment;
import com.example.Backend.repository.UserDetailsRepository;
import com.example.Backend.service.TreatmentsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patient")
public class PatientController {

    private final TreatmentsService treatmentsService;
    private final UserDetailsRepository userDetailsRepository;

    public PatientController(TreatmentsService treatmentsService, UserDetailsRepository userDetailsRepository) {
        this.treatmentsService = treatmentsService;
        this.userDetailsRepository = userDetailsRepository;
    }

    @GetMapping("/treatments/{patientId}")
    public ResponseEntity<List<TreatmentDTO>> getPatientTreatments(@PathVariable String patientId) {

        List<Treatment> treatments = treatmentsService.getTreatMentByUser(patientId);


        if (treatments.isEmpty()) {
            return ResponseEntity.noContent().build();
        }


        List<TreatmentDTO> treatmentDTOS = treatments.stream()
                .map(treatment -> new TreatmentDTO(treatment, userDetailsRepository))
                .collect(Collectors.toList());


        return ResponseEntity.ok(treatmentDTOS);
    }
}