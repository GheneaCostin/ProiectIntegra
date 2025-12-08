package com.example.Backend.service;


import com.example.Backend.dto.TreatmentDTO;
import com.example.Backend.model.Treatment;
import com.example.Backend.repository.TreatmentsRepository;
import com.example.Backend.repository.UserDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TreatmentsService {

    @Autowired
    private TreatmentsRepository treatmentsRepository;
    private final MongoTemplate mongoTemplate;

    private final UserDetailsRepository userDetailsRepository;
    public TreatmentsService(TreatmentsRepository treatmentsRepository, UserDetailsRepository userDetailsRepository,MongoTemplate mongoTemplate) {
        this.userDetailsRepository = userDetailsRepository;
        this.treatmentsRepository = treatmentsRepository;
        this.mongoTemplate = mongoTemplate;
    }   


    public List<Treatment> getAllTreatments() {
        return treatmentsRepository.findAll();
    }

    public Page<TreatmentDTO> getTreatmentsByDoctorIdPaginated(String doctorId, Pageable pageable) {
        Page<Treatment> treatmentsPage = treatmentsRepository.findByDoctorId(doctorId, pageable);
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

    public Page<TreatmentDTO> getTreatmentsByDoctorPaginatedFiltered(
            String doctorId,
            Pageable pageable,
            String search,
            String filter) {

        Query query = new Query();

        query.addCriteria(Criteria.where("doctorId").is(doctorId));


        if (search != null && !search.isEmpty()) {

            String regex = ".*" + search.toLowerCase() + ".*";

            query.addCriteria(Criteria.where("medicationName").regex(regex, "i"));


        }

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        Date todayDate = Date.from(todayStart.atZone(ZoneId.of("UTC")).toInstant());


        if (filter != null && !filter.equalsIgnoreCase("All")) {
            switch (filter.toLowerCase()) {
                case "active":

                    query.addCriteria(Criteria.where("endDate").gt(todayDate));
                    break;
                case "ended":

                    query.addCriteria(Criteria.where("endDate").lt(todayDate));
                    break;
                case "noend":

                    query.addCriteria(new Criteria().orOperator(
                            Criteria.where("endDate").exists(false),
                            Criteria.where("endDate").is(null),
                            Criteria.where("endDate").is("")
                    ));
                    break;
            }
        }


        long total = mongoTemplate.count(query, Treatment.class);
        query.with(pageable);
        List<Treatment> results = mongoTemplate.find(query, Treatment.class);


        List<TreatmentDTO> dtos = results.stream()
                .map(t -> new TreatmentDTO(t, userDetailsRepository))
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, total);
    }


}
