package no.trygginn.backend.controller.dto;

/**
 * DTO for forespørsel om passordendring.
 */
public record ChangePasswordRequest(
        String currentPassword,
        String newPassword
) {}
