package no.trygginn.backend.controller.dto;

/**
 * DTO for oppdatering av brukerprofil.
 */
public record UpdateUserProfileRequest(
        String fullName,
        String email,
        String phoneNumber
) {}