package no.trygginn.backend.controller.dto;

/**
 * DTO for oppdatering av notat om barn.
 */
public record UpdateChildNoteRequest(
        String note
) {}
