package com.example.Backend.controller;


import com.example.Backend.models.Treatments;
import com.example.Backend.service.TreatmentsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/treatments")
public class TreatmentController {

    private final TreatmentsService treatmentsService;

    public TreatmentController(TreatmentsService treatmentsService) {
        this.treatmentsService = treatmentsService;
    }

    @GetMapping
    public Optional<Treatments> getTreatmentById(String id) {
        return Optional.ofNullable(treatmentsService.getTreatmentById(id));
    }

    @GetMapping
    public List<Treatments> getAllTreatments() {
        return treatmentsService.getAllTreatments();
    }

    @PostMapping
    public Treatments addTreatment(Treatments treatment) {
        return treatmentsService.addTreatment(treatment);
    }

    @DeleteMapping
    public void deleteTreatment(@PathVariable String id) {
        treatmentsService.deleteTreatment(id);
    }

}
