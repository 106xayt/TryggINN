package no.trygginn.backend.controller.dto;

/**
 * DTO for brukerprofil.
 */
public record UserProfileResponse(
        Long id,
        String fullName,
        String email,
        String phoneNumber,
        String role
) {}