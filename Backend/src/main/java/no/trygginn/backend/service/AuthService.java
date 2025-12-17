package no.trygginn.backend.service;

import no.trygginn.backend.model.User;
import no.trygginn.backend.model.UserRole;
import no.trygginn.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service for autentisering og brukerregistrering.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Logger inn bruker med e-post og passord.
     */
    public User login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Feil e-post eller passord."));

        String stored = user.getPasswordHash();
        if (stored == null || stored.isBlank()) {
            throw new IllegalArgumentException("Denne brukeren kan ikke logge inn med passord.");
        }

        boolean matches;

        // Støtter både BCrypt og eldre passord
        if (stored.startsWith("$2")) {
            matches = passwordEncoder.matches(password, stored);
        } else {
            matches = stored.equals(password);
        }

        if (!matches) {
            throw new IllegalArgumentException("Feil e-post eller passord.");
        }

        return user;
    }

    /**
     * Registrerer ny forelder-bruker.
     */
    public User registerParent(
            String fullName,
            String email,
            String phoneNumber,
            String password
    ) {

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("E-post er allerede i bruk.");
        }

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPhoneNumber(phoneNumber);
        user.setRole(UserRole.PARENT);
        user.setPasswordHash(passwordEncoder.encode(password));

        return userRepository.save(user);
    }
}
