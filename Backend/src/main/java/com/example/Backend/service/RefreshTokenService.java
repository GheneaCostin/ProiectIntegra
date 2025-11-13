package com.example.Backend.service;

import com.example.Backend.model.RefreshToken;
import com.example.Backend.repository.RefreshTokenRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {
    public static final int SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenService (RefreshTokenRepository refreshTokenRepository){
        this.refreshTokenRepository= refreshTokenRepository;
    }
    public RefreshToken createRefreshToken(String userId) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserId(userId);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(new Date(System.currentTimeMillis() + SEVEN_DAYS));
        return refreshTokenRepository.save(refreshToken);
    }
    public boolean validateRefreshToken(String token) {
        Optional<RefreshToken> rt = refreshTokenRepository.findByToken(token);
        return rt.isPresent() && rt.get().getExpiryDate().after(new Date());
    }
    public void deleteRefreshToken(String token) {
        Optional<RefreshToken> rt = refreshTokenRepository.findByToken(token);
        refreshTokenRepository.deleteByToken(token);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }
}