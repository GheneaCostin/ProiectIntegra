package com.example.Backend.service;


import com.example.Backend.dto.TreatmentDTO;
import com.example.Backend.model.Treatment;
import com.example.Backend.model.UserDetails;
import com.example.Backend.dto.TreatmentIntakeDTO;
import com.example.Backend.model.TreatmentIntake;
import com.example.Backend.repository.TreatmentsRepository;
import com.example.Backend.repository.UserDetailsRepository;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
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

    public Page<Treatment> getTreatmentsByDoctorPaginatedFiltered(
            String doctorId,
            Pageable pageable,
            String search,
            String filter) {

        Criteria baseCriteria = Criteria.where("doctorId").is(doctorId);

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        Date todayDate = Date.from(todayStart.atZone(ZoneId.of("UTC")).toInstant());


        if (filter != null && !filter.equalsIgnoreCase("All")) {
            switch (filter.toLowerCase()) {
                case "active":
                    baseCriteria.and("endDate").gt(todayDate);
                    break;
                case "ended":
                    baseCriteria.and("endDate").lt(todayDate);
                    break;
                case "noend":
                    baseCriteria.orOperator(
                            Criteria.where("endDate").exists(false),
                            Criteria.where("endDate").is(null),
                            Criteria.where("endDate").is("")
                    );
                    break;
            }
        }


        MatchOperation matchDoctor = Aggregation.match(baseCriteria);

        LookupOperation lookupPatient = LookupOperation.newLookup()
                .from("userDetails")
                .localField("patientId")
                .foreignField("userId")
                .as("patient");


        UnwindOperation unwindPatient = Aggregation.unwind("patient", true);

        Criteria searchCriteria = new Criteria();
        if (search != null && !search.trim().isEmpty()) {
            String regex = ".*" + search.toLowerCase() + ".*";

            searchCriteria.orOperator(
                    Criteria.where("medicationName").regex(regex, "i"),
                    Criteria.where("patient.firstName").regex(regex, "i"),
                    Criteria.where("patient.lastName").regex(regex, "i")
            );
        }
        MatchOperation matchSearch = Aggregation.match(searchCriteria);

        Aggregation aggregation = Aggregation.newAggregation(
                matchDoctor,
                lookupPatient,
                unwindPatient,
                matchSearch,
                Aggregation.skip((long) pageable.getPageNumber() * pageable.getPageSize()),
                Aggregation.limit(pageable.getPageSize())
        );

        List<Treatment> results = mongoTemplate.aggregate(aggregation, "treatments", Treatment.class).getMappedResults();

        Aggregation countAggregation = Aggregation.newAggregation(
                matchDoctor,
                lookupPatient,
                unwindPatient,
                matchSearch,
                Aggregation.count().as("total")
        );


        AggregationResults<Document> countResults = mongoTemplate.aggregate(countAggregation, "treatments", Document.class);
        Document countDoc = countResults.getUniqueMappedResult();
        long total = countDoc != null ? countDoc.get("total", Number.class).longValue() : 0L;



        return new PageImpl<>(results, pageable, total);
    }

    public List<Treatment> findTreatmentsForExport(String patientId, Date startDate, Date endDate) {
        Query query = new Query();
        query.addCriteria(Criteria.where("patientId").is(patientId));
        if (startDate != null && endDate != null) {
            query.addCriteria(Criteria.where("startDate").gte(startDate).lte(endDate));
        }
        return mongoTemplate.find(query, Treatment.class);
    }

    public UserDetails getPatientDetails(String patientId) {
        return userDetailsRepository.findByUserId(patientId).orElse(null);
    }

    public Treatment markTreatmentIntake(TreatmentIntakeDTO treatmentIntakeDTO) {
        String treatmentId = treatmentIntakeDTO.getTreatmentId();
        String patientId = treatmentIntakeDTO.getPatientId();
        LocalDate date = treatmentIntakeDTO.getDate();
        Integer doseIndex = treatmentIntakeDTO.getDoseIndex();


        Treatment treatment = treatmentsRepository.findById(treatmentId)
                .orElseThrow(() -> new RuntimeException("Tratament inexistent"));


        if (!treatment.getPatientId().equals(patientId)) {
            throw new RuntimeException("Acces interzis: Tratamentul nu aparține acestui pacient.");
        }

        TreatmentIntake intake = treatment.getTreatmentIntakes()
                .stream()
                .filter(i -> {
                    LocalDate intakeDate = toLocalDate(i.getDate());
                    return intakeDate.equals(date) && i.getDoseIndex().equals(doseIndex);
                })
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Doza nu exista"));

        if (intake.getTakenAt() != null) {
            throw new RuntimeException("Doza este deja administrată.");
        }

        if (date.isBefore(toLocalDate(treatment.getStartDate())) ||
                (treatment.getEndDate() != null && date.isAfter(toLocalDate(treatment.getEndDate())))) {
            throw new RuntimeException("Data este în afara tratamentului.");
        }

        if (date.isAfter(LocalDate.now())) {
            throw new RuntimeException("Nu se poate marca o doza din viitor.");
        }


        intake.setTakenAt(new Date());


        return treatmentsRepository.save(treatment);
    }


    private LocalDate toLocalDate(Date date) {
        if (date == null) return null;
        return date.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
    }
}
