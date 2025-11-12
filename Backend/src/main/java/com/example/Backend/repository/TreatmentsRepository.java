package com.example.Backend.repository;

import com.example.Backend.model.Treatment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TreatmentsRepository extends MongoRepository<Treatment,String> {
    List<Treatment> findBymedicationNameIgnoreCase(String medicationName);

}
