package no.trygginn.backend.controller.dto;

public record UpdateChildDetailsRequest(
        String allergies,
        String medications,
        String favoriteFood
) {
}
