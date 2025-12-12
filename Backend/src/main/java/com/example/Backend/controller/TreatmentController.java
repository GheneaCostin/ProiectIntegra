package com.example.Backend.controller;


import com.example.Backend.dto.ExportDTO;
import com.example.Backend.model.Treatment;
import com.example.Backend.model.UserDetails;
import com.example.Backend.repository.TreatmentsRepository;
import com.example.Backend.service.TreatmentsService;
import com.example.Backend.util.PdfGenerator;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/treatments")
public class TreatmentController {

    private final TreatmentsService treatmentsService;
    private final TreatmentsRepository treatmentsRepository;

    public TreatmentController(TreatmentsService treatmentsService, TreatmentsRepository treatmentsRepository) {
        this.treatmentsService = treatmentsService;
        this.treatmentsRepository = treatmentsRepository;
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
    @PutMapping("/{id}")
    public ResponseEntity<Treatment> updateTreatment(@PathVariable String id, @RequestBody Treatment updatedTreatment) {
        Treatment treatment = treatmentsService.updateTreatment(id, updatedTreatment);

        if (treatment != null) {
            return ResponseEntity.ok(treatment);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/export")
    public ResponseEntity<byte[]> exportPdf(@RequestBody ExportDTO request) {
        try {

            UserDetails patient = treatmentsService.getPatientDetails(request.getPatientId());
            List<Treatment> treatments = treatmentsService.findTreatmentsForExport(
                    request.getPatientId(),
                    request.getStartDate(),
                    request.getEndDate()
            );


            if (patient == null) {
                patient = new UserDetails();
                patient.setFirstName("Necunoscut");
                patient.setLastName("");
            }


            byte[] pdfContent = PdfGenerator.generatePdf(patient, treatments);


            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            String filename = "Raport_" + (patient.getFirstName() != null ? patient.getFirstName() : "Pacient") + ".pdf";
            headers.setContentDispositionFormData("attachment", filename);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfContent);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
