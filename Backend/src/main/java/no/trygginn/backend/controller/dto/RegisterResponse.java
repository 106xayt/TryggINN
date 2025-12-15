package no.trygginn.backend.controller.dto;

public record RegisterResponse(
        Long userId,
        String fullName,
        String email,
        String role,
        String message
) {}
