package no.trygginn.backend.controller.dto;

public record UserProfileResponse(
        Long id,
        String fullName,
        String email,
        String phoneNumber,
        String role
) {
}
