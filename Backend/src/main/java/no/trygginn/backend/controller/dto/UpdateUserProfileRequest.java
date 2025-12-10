package no.trygginn.backend.controller.dto;

public record UpdateUserProfileRequest(
        String fullName,
        String email,
        String phoneNumber
) {
}
