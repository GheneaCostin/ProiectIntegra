package com.example.Backend.controller;

import com.example.Backend.dto.PasswordChangeRequest;
import com.example.Backend.model.User;
import com.example.Backend.model.UserDetails;
import com.example.Backend.repository.UserDetailsRepository;
import com.example.Backend.repository.UserRepository;
import com.example.Backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;
    private final UserDetailsRepository userDetailsRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Constructor cu injecția tuturor dependențelor necesare
    public UserController(UserService service,
                          UserDetailsRepository userDetailsRepository,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.service = service;
        this.userDetailsRepository = userDetailsRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // --- ENDPOINT-URI EXISTENTE ---

    @GetMapping
    public List<User> getAllUsers() {
        return service.getAllUsers();
    }

    // GET: user după email
    @GetMapping("/{email}")
    public Optional<User> getUserByEmail(@PathVariable String email) {
        return service.getUserByEmail(email);
    }

    // GET: user după id
    @GetMapping("/id/{id}")
    public Optional<User> getUserById(@PathVariable String id) {
        return service.getUserById(id);
    }

    // POST: adaugă un nou user
    @PostMapping
    public User addUser(@RequestBody User user) {
        return service.addUser(user);
    }

    // DELETE: șterge un user după id
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        service.deleteUser(id);
    }

    // --- ENDPOINT-URI NOI (Profil & Parolă) ---

    /**
     * Endpoint pentru a prelua detaliile utilizatorului curent (Profil)
     * URL: GET /api/users/{userId}/details
     */
    @GetMapping("/{userId}/details")
    public ResponseEntity<?> getUserDetails(@PathVariable String userId) {
        Optional<UserDetails> details = userDetailsRepository.findByUserId(userId);
        if (details.isPresent()) {
            return ResponseEntity.ok(details.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Detalii utilizator negăsite.");
        }
    }

    /**
     * Endpoint pentru a actualiza detaliile utilizatorului
     * URL: PUT /api/users/{userId}/details
     */
    @PutMapping("/{userId}/details")
    public ResponseEntity<?> updateUserDetails(@PathVariable String userId, @RequestBody UserDetails updatedDetails) {
        Optional<UserDetails> existingDetailsOpt = userDetailsRepository.findByUserId(userId);

        if (existingDetailsOpt.isPresent()) {
            UserDetails existing = existingDetailsOpt.get();

            // Actualizăm câmpurile permise
            existing.setFirstName(updatedDetails.getFirstName());
            existing.setLastName(updatedDetails.getLastName());
            existing.setHeight(updatedDetails.getHeight());
            existing.setWeight(updatedDetails.getWeight());
            existing.setBirthDate(updatedDetails.getBirthDate());
            existing.setSex(updatedDetails.getSex());

            userDetailsRepository.save(existing);
            return ResponseEntity.ok("Date actualizate cu succes.");
        } else {
            // Dacă nu există detalii, creăm unele noi (Edge case)
            updatedDetails.setUserId(userId);
            userDetailsRepository.save(updatedDetails);
            return ResponseEntity.ok("Date create cu succes.");
        }
    }

    /**
     * Endpoint pentru schimbarea parolei
     * URL: POST /api/users/change-password
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody PasswordChangeRequest request) {
        // Căutăm userul folosind serviciul existent
        Optional<User> userOpt = service.getUserById(request.getUserId());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilizator negăsit.");
        }

        User user = userOpt.get();

        // 1. Verificăm dacă parola veche trimisă de user corespunde cu cea din DB
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Parola curentă este incorectă.");
        }

        // 2. Criptăm noua parolă și o salvăm
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok("Parola a fost schimbată cu succes.");
    }
}