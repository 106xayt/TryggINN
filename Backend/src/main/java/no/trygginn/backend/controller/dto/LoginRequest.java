package no.trygginn.backend.controller.dto;

/**
 * DTO for innlogging.
 */
public record LoginRequest(
        String email,
        String password
) {}
