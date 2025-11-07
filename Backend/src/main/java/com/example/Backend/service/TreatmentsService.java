package com.example.Backend.service;


import com.example.Backend.models.Treatments;
import com.example.Backend.repository.TreatmentsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TreatmentsService {

    @Autowired
    private TreatmentsRepository treatmentsRepository;

    public TreatmentsService(TreatmentsRepository treatmentsRepository) {
        this.treatmentsRepository = treatmentsRepository;
    }


    public List<Treatments> getAllTreatments() {
        return treatmentsRepository.findAll();
    }

    public Treatments getTreatmentById(String id) {
        return treatmentsRepository.findById(id).orElse(null);
    }

    public Treatments addTreatment(Treatments treatment) {
        return treatmentsRepository.save(treatment);
    }

    public void deleteTreatment(String id) {
        treatmentsRepository.deleteById(id);
    }

}
