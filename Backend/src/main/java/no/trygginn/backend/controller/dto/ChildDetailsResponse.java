package no.trygginn.backend.controller.dto;

public record ChildDetailsResponse(
        Long id,
        String firstName,
        String lastName,
        String allergies,
        String medications,
        String favoriteFood
) {
}
