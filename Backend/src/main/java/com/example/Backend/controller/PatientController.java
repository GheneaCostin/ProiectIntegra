package com.example.Backend.controller;

import com.example.Backend.dto.TreatmentDTO;
import com.example.Backend.model.Treatment;
import com.example.Backend.repository.UserDetailsRepository;
import com.example.Backend.service.TreatmentsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
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

    @GetMapping("/treatments/{patientId}/date/{date}")
    public ResponseEntity<List<TreatmentDTO>> getTreatmentsByDate(
            @PathVariable String patientId,
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {


        List<Treatment> allTreatments = treatmentsService.getTreatMentByUser(patientId);


        List<Treatment> filteredTreatments = allTreatments.stream()
                .filter(t -> isTreatmentActiveOnDate(t, date))
                .collect(Collectors.toList());

        if (filteredTreatments.isEmpty()) {
            return ResponseEntity.noContent().build();
        }


        List<TreatmentDTO> treatmentDTOS = filteredTreatments.stream()
                .map(treatment -> new TreatmentDTO(treatment, userDetailsRepository))
                .collect(Collectors.toList());

        return ResponseEntity.ok(treatmentDTOS);
    }


    private boolean isTreatmentActiveOnDate(Treatment treatment, LocalDate targetDate) {
        if (treatment.getStartDate() == null) return false;


        LocalDate start = convertToLocalDate(treatment.getStartDate());
        LocalDate end = treatment.getEndDate() != null ? convertToLocalDate(treatment.getEndDate()) : null;


        boolean afterStart = !start.isAfter(targetDate);
        boolean beforeEnd = (end == null) || !end.isBefore(targetDate);

        return afterStart && beforeEnd;
    }

    private LocalDate convertToLocalDate(Date dateToConvert) {
        return dateToConvert.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
    }
}