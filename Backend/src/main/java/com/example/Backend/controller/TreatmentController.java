package com.example.Backend.controller;


import com.example.Backend.model.Treatment;
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

    @GetMapping("/id/{id}")
    public Optional<Treatment> getTreatmentById(@PathVariable String id) {
        return Optional.ofNullable(treatmentsService.getTreatmentById(id));
    }

    @GetMapping
    public List<Treatment> getAllTreatments() {
        return treatmentsService.getAllTreatments();
    }

    @PostMapping
    public Treatment addTreatment(@RequestBody Treatment treatment) {
        return treatmentsService.addTreatment(treatment);
    }

    @DeleteMapping("/{id}")
    public void deleteTreatment(@PathVariable String id) {
        treatmentsService.deleteTreatment(id);
    }

    @GetMapping("/search")
    public List<Treatment> searchTreatments(@RequestParam String name) {
        return treatmentsService.searchTreatmentsByName(name);
    }

    @GetMapping("/user/{userId}")
    public List<Treatment> getTreatmentsByUser(@PathVariable String userId) {
        return treatmentsService.getTreatMentByUser(userId);
    }


}
