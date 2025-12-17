package no.trygginn.backend.controller;

import no.trygginn.backend.controller.dto.ChangePasswordRequest;
import no.trygginn.backend.controller.dto.UpdateUserProfileRequest;
import no.trygginn.backend.controller.dto.UserProfileResponse;
import no.trygginn.backend.model.User;
import no.trygginn.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST-controller for håndtering av brukere.
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Henter brukerprofil basert på ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getUser(
            @PathVariable Long id
    ) {

        User user = userService.getUserById(id);
        return ResponseEntity.ok(toResponse(user));
    }

    /**
     * Oppdaterer brukerprofil.
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserProfileResponse> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserProfileRequest request
    ) {

        User updated = userService.updateUserProfile(
                id,
                request.fullName(),
                request.email(),
                request.phoneNumber()
        );

        return ResponseEntity.ok(toResponse(updated));
    }

    /**
     * Endrer passord for bruker.
     */
    @PutMapping("/{id}/password")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long id,
            @RequestBody ChangePasswordRequest req
    ) {

        userService.changePassword(
                id,
                req.currentPassword(),
                req.newPassword()
        );

        return ResponseEntity.noContent().build();
    }

    /**
     * Henter bruker basert på e-postadresse.
     */
    @GetMapping("/by-email")
    public ResponseEntity<UserProfileResponse> getUserByEmail(
            @RequestParam String email
    ) {

        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(toResponse(user));
    }

    /**
     * Mapper User-entity til respons-DTO.
     */
    private UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole() != null ? user.getRole().name() : null
        );
    }
}
