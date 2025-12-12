package no.trygginn.backend.controller.dto;

public record LoginResponse(
        Long userId,
        String fullName,
        String email,
        String role
) {
}
