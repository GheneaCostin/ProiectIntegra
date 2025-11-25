package com.example.Backend.controller;

import com.example.Backend.JWT.JwtUtil;
import com.example.Backend.model.RefreshToken;
import com.example.Backend.model.User;
import com.example.Backend.service.RefreshTokenService;
import com.example.Backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {


    private final RefreshTokenService refreshTokenService;
    private final UserService userService;

    public AuthController(RefreshTokenService refreshTokenService, UserService userService) {
        this.refreshTokenService = refreshTokenService;
        this.userService = userService;
    }


    @Autowired
    private JwtUtil jwtUtil;
    @CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");
        User user = userService.getUserByEmail(email).orElse(null);
        if (user == null || !user.getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credențiale invalide");
        }
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
        String token = jwtUtil.generateToken(user.getId(), user.getRole());
        return ResponseEntity.ok(

                Map.of(
                        "refreshToken",
                        refreshToken.getToken(),
                        "token"
                        , token,
                        "role"
                        , user.getRole(),

                        // 🚨 CORECȚIA FINALĂ: Trimitem doar emailul doctorului
                        "email",
                        user.getEmail(),

                        "userId",
                        user.getId()
                )
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshAccessToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshTokenService.validateRefreshToken(refreshToken)) {
            String userId = refreshTokenService.findByToken(refreshToken).get().getUserId();
            Optional<User> user =  userService.getUserById(userId);
            String newAccessToken = jwtUtil.generateToken(userId,
                    user.get().getRole());
            String newRefreshToken = refreshTokenService.createRefreshToken(userId).getToken();
            refreshTokenService.deleteRefreshToken(refreshToken);
            return ResponseEntity.ok(Map.of("accessToken"
                    , newAccessToken
                    , "refreshToken",
                    newRefreshToken
            ));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token invalid sau expirat.");
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userService.getUserByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already in use.");
        }
        user.setRole("Pacient");
        User newUser = userService.addUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
    }
}