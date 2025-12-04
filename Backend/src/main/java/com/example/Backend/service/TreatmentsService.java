package com.example.Backend.service;


import com.example.Backend.dto.TreatmentDTO;
import com.example.Backend.model.Treatment;
import com.example.Backend.repository.TreatmentsRepository;
import com.example.Backend.repository.UserDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TreatmentsService {

    @Autowired
    private TreatmentsRepository treatmentsRepository;

    private final UserDetailsRepository userDetailsRepository;
    public TreatmentsService(TreatmentsRepository treatmentsRepository, UserDetailsRepository userDetailsRepository) {
        this.userDetailsRepository = userDetailsRepository;
        this.treatmentsRepository = treatmentsRepository;
    }   


    public List<Treatment> getAllTreatments() {
        return treatmentsRepository.findAll();
    }

    public Page<TreatmentDTO> getTreatmentsByDoctorIdPaginated(String doctorId, Pageable pageable) {
        Page<Treatment> treatmentsPage = treatmentsRepository.findByDoctorId(doctorId, pageable);

        // Mapăm fiecare element din Page<Treatment> în Page<TreatmentDTO>
        return treatmentsPage.map(treatment -> new TreatmentDTO(treatment, userDetailsRepository));
    }

    public Treatment getTreatmentById(String id) {
        return treatmentsRepository.findById(id).orElse(null);
    }

    public Treatment addTreatment(Treatment treatment) {
        return treatmentsRepository.save(treatment);
    }

    public List<Treatment> getTreatMentByUser (String patientId){
        return treatmentsRepository.findByPatientId(patientId);
    }

    public void deleteTreatment(String id) {
        treatmentsRepository.deleteById(id);
    }

    public List<Treatment> searchTreatmentsByName(String medicationName) {
        return treatmentsRepository.findBymedicationNameIgnoreCase(medicationName);
    }

    public List<Treatment> getTreatmentsByDoctorId(String doctorId) {
        return treatmentsRepository.findByDoctorId(doctorId);
    }

    public Treatment updateTreatment(String id, Treatment updatedTreatment) {
        return treatmentsRepository.findById(id).map(treatment -> {
            treatment.setMedicationName(updatedTreatment.getMedicationName());
            treatment.setDosage(updatedTreatment.getDosage());
            treatment.setFrequency(updatedTreatment.getFrequency());
            treatment.setNotes(updatedTreatment.getNotes());
            treatment.setStartDate(updatedTreatment.getStartDate());
            treatment.setEndDate(updatedTreatment.getEndDate());
            return treatmentsRepository.save(treatment);
        }).orElse(null);
    }


}
