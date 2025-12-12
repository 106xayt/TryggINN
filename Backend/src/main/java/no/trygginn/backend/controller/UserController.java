package no.trygginn.backend.controller;

import no.trygginn.backend.controller.dto.UpdateUserProfileRequest;
import no.trygginn.backend.controller.dto.UserProfileResponse;
import no.trygginn.backend.controller.dto.ChangePasswordRequest;
import no.trygginn.backend.model.User;
import no.trygginn.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getUser(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(toResponse(user));
    }


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


    private UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole() != null ? user.getRole().name() : null
        );
    }

    public record ChangePasswordRequest(String currentPassword, String newPassword) {}

    @PutMapping("/{id}/password")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long id,
            @RequestBody ChangePasswordRequest req
    ) {
        userService.changePassword(id, req.currentPassword(), req.newPassword());
        return ResponseEntity.noContent().build();
    }

}

