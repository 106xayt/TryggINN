package no.trygginn.backend.controller.dto;

/**
 * DTO med detaljert informasjon om et barn.
 */
public record ChildDetailsResponse(
        Long id,
        String firstName,
        String lastName,
        String allergies,
        String medications,
        String favoriteFood
) {}
