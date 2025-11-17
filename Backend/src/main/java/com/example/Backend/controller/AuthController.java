package com.example.Backend.controller;

import com.example.Backend.JWT.JwtUtil;
import com.example.Backend.model.RefreshToken;
import com.example.Backend.model.User;
import com.example.Backend.service.RefreshTokenService;
import com.example.Backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");
        User user = userService.getUserByEmail(email).orElse(null);
        if (user == null || !user.getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credențiale invalide");
        }
        RefreshToken RefreshToken = refreshTokenService.createRefreshToken(user.getId());
        String token = jwtUtil.generateToken(user.getId(), user.getRole());
        return ResponseEntity.ok(

                Map.of(
                        "refreshToken",
                        RefreshToken.getToken(),
                        "token"
                , token,
                "role"
                , user.getRole())

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
                    , "RefreshToken",
                    newRefreshToken
            ));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token invalid sau expirat.");
    }
}
