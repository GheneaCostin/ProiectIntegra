package com.example.Backend.config;

import com.example.Backend.filter.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
    
@Configuration
@EnableWebSecurity // Activează suportul pentru securitate web
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    // Injectează filtrul JWT pe care l-ați creat
    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    // 1. Configurarea Bean-ului CorsConfigurationSource pentru a permite accesul din frontend
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 🚨 CRUCIAL: Lista de origini permise (portul React)
        // Adăugați orice port React pe care îl utilizați
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3002"));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Permite header-ele esențiale, inclusiv Authorization pentru JWT
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Cache-Control"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // 2. Configurarea Lanțului de Filtre de Securitate
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Aplica setările CORS definite mai sus
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Dezactivează protecția CSRF (necesar pentru API-uri fără sesiuni)
                .csrf(csrf -> csrf.disable())

                // Stabilește politica de sesiune ca stateless (fără sesiuni de server)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Definește regulile de autorizare a cererilor (care rute sunt permise)
                .authorizeHttpRequests(auth -> auth
                        // Permite accesul public la endpoint-urile de autentificare
                        .requestMatchers("/api/auth/**").permitAll()
                        // Toate celelalte cereri necesită autentificare (token valid)
                        .anyRequest().authenticated()
                );

        // 🚨 Adaugă filtrul JWT înainte de filtrul standard de autentificare
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}