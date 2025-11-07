package com.example.Backend.repository;

import com.example.Backend.models.Treatments;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TreatmentsRepository extends MongoRepository<Treatments,String> {
}
