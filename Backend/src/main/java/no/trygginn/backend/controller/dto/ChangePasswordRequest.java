package no.trygginn.backend.controller.dto;

public record ChangePasswordRequest(
        String currentPassword,
        String newPassword
) {
}
