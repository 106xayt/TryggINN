package no.trygginn.backend.controller.dto;

/**
 * DTO for respons etter innlogging.
 */
public record LoginResponse(
        Long userId,
        String fullName,
        String email,
        String role
) {}
