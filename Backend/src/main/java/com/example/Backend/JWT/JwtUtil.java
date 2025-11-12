package com.example.Backend.JWT;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {
    public static final Date TIMP_de_peste_o_ora = new Date(System.currentTimeMillis() + 1000L * 60 * 60);
    private static final String SECRET_KEY =
            "ThisIsASecretKeyForJWTWithAtLeast256BitsLength!";
    public String generateToken(String userId, String role) {
        return Jwts.builder()
                .setHeaderParam("typ"
                        ,
                        "JWT")

                .setSubject(userId)
                .claim("role"
                        , role)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(TIMP_de_peste_o_ora)
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }
}