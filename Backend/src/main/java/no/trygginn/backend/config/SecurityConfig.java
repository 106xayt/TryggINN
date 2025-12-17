package no.trygginn.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Konfigurasjonsklasse for sikkerhetsrelaterte beans.
 * Denne brukes av Spring til å sette opp komponenter
 * som trengs for autentisering og passordhåndtering.
 */
@Configuration
public class SecurityConfig {

    /**
     * Definerer en PasswordEncoder som brukes i hele applikasjonen.
     * BCrypt brukes fordi den er sikker, treg (mot brute force),
     * og automatisk håndterer salt.
     * @return en PasswordEncoder basert på BCrypt
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
