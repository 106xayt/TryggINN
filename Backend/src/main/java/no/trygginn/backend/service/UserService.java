package no.trygginn.backend.service;

import no.trygginn.backend.model.User;
import no.trygginn.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fant ikke bruker med id " + id));
    }

    public User updateUserProfile(Long id, String fullName, String email, String phoneNumber) {
        User user = getUserById(id);

        if (fullName != null && !fullName.isBlank()) {
            user.setFullName(fullName.trim());
        }

        if (email != null && !email.isBlank()) {
            String normalized = email.trim();

            if (user.getEmail() == null || !normalized.equalsIgnoreCase(user.getEmail())) {
                if (userRepository.existsByEmail(normalized)) {
                    throw new IllegalArgumentException("E-postadressen er allerede i bruk.");
                }
            }

            user.setEmail(normalized);
        }

        if (phoneNumber != null) {
            String trimmed = phoneNumber.trim();
            user.setPhoneNumber(trimmed.isBlank() ? null : trimmed);
        }

        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = getUserById(userId);

        // Hvis currentPassword er sendt inn og ikke tom -> verifiser
        if (currentPassword != null && !currentPassword.isBlank()) {
            if (user.getPasswordHash() == null ||
                    !passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
                throw new IllegalArgumentException("Gammelt passord er feil.");
            }
        }

        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("Nytt passord kan ikke være tomt.");
        }

        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("Nytt passord må være minst 6 tegn.");
        }

        String encoded = passwordEncoder.encode(newPassword);
        user.setPasswordHash(encoded);

        userRepository.save(user);
    }
    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("E-post kan ikke være tom.");
        }
        return userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Fant ingen bruker med denne e-posten."));
    }

}
