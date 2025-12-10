package no.trygginn.backend.service;

import no.trygginn.backend.model.User;
import no.trygginn.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Feil e-post eller passord."));

        String stored = user.getPasswordHash();

        if (stored == null || stored.isBlank()) {
            throw new IllegalArgumentException("Denne brukeren kan ikke logge inn med passord.");
        }

        boolean matches;
        if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
            matches = passwordEncoder.matches(password, stored);
        } else {
            matches = stored.equals(password);
        }

        if (!matches) {
            throw new IllegalArgumentException("Feil e-post eller passord.");
        }

        return user;
    }
}
