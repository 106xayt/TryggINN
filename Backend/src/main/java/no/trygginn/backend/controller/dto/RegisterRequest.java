package no.trygginn.backend.controller.dto;

public record RegisterRequest(
        String fullName,
        String email,
        String phoneNumber,
        String password
) {}
