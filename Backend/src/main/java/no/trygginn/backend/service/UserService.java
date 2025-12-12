package no.trygginn.backend.service;

import no.trygginn.backend.model.User;
import no.trygginn.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

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
            user.setFullName(fullName);
        }

        if (email != null && !email.isBlank()) {
            user.setEmail(email);
        }

        if (phoneNumber != null && !phoneNumber.isBlank()) {
            user.setPhoneNumber(phoneNumber);
        }

        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = getUserById(userId);


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
}

