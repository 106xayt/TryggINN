package no.trygginn.backend.controller.dto;

/**
 * DTO for registrering av ny bruker.
 */
public record RegisterRequest(
        String fullName,
        String email,
        String phoneNumber,
        String password
) {}
