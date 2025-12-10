package no.trygginn.backend.controller.dto;

public record ResetPasswordRequest(
        String email,
        String newPassword
) {
}
