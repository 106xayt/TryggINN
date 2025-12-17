package no.trygginn.backend.controller.dto;

/**
 * DTO for respons etter registrering.
 */
public record RegisterResponse(
        Long userId,
        String fullName,
        String email,
        String role,
        String message
) {}
