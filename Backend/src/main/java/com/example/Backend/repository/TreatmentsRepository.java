package com.example.Backend.repository;

import com.example.Backend.models.Treatments;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TreatmentsRepository extends MongoRepository<Treatments,String> {
    List<Treatments> findBymedicationNameIgnoreCase(String medicationName);

}
