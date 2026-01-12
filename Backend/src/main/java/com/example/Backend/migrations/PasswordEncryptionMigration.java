package com.example.Backend.migrations;

import com.example.Backend.model.User;
import com.example.Backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Profile("migration")
public class PasswordEncryptionMigration implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public PasswordEncryptionMigration(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        System.out.println("--- ÎNCEPERE MIGRARE PAROLE ---");

        List<User> users = userRepository.findAll();
        int updatedCount = 0;
        int skippedCount = 0;

        for (User user : users) {
            String currentPassword = user.getPassword();

            if (!isEncrypted(currentPassword)) {
                System.out.println("Migrare utilizator: " + user.getEmail());
                String encodedPassword = passwordEncoder.encode(currentPassword);
                user.setPassword(encodedPassword);
                userRepository.save(user);
                updatedCount++;
            } else {
                skippedCount++;
            }
        }

        System.out.println("--- MIGRARE FINALIZATĂ ---");
        System.out.println("Utilizatori actualizați: " + updatedCount);
        System.out.println("Utilizatori deja criptați (skip): " + skippedCount);
    }

    private boolean isEncrypted(String password) {
        if (password == null) return false;
        return password.startsWith("{bcrypt}") ||
                password.startsWith("{argon2}") ||
                password.startsWith("{pbkdf2}") ||
                password.startsWith("$2a$") ||
                password.startsWith("$2b$") ||
                password.startsWith("$2y$");
    }
}