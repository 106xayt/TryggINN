package no.trygginn.backend.controller.dto;

/**
 * DTO for tilbakestilling av passord.
 */
public record ResetPasswordRequest(
        String email,
        String newPassword
) {}
