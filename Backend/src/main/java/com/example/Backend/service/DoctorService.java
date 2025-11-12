package com.example.Backend.service;
import com.example.Backend.model.Treatment;
import com.example.Backend.repository.TreatmentsRepository;
import  com.example.Backend.repository.UserRepository;
import com.example.Backend.model.User;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private final UserRepository userRepository;
    private final TreatmentsRepository treatmentsRepository;

    public DoctorService(UserRepository userRepository,
                         TreatmentsRepository treatmentsRepository) {
        this.userRepository = userRepository;
        this.treatmentsRepository = treatmentsRepository;
    }

    public List<User> getAllPatients() {
        return userRepository.findAll().stream().filter(user -> user.getRole().equals("Pacient")).collect(Collectors.toList());
    }

    public Treatment addTreatmentToPatient(@RequestBody Treatment treatment) {
       return treatmentsRepository.save(treatment);
    }




}
