package no.trygginn.backend.controller.dto;

/**
 * DTO for oppdatering av barnedetaljer.
 */
public record UpdateChildDetailsRequest(
        String allergies,
        String medications,
        String favoriteFood
) {}
