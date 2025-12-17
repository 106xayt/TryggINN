package no.trygginn.backend.controller.dto;

/**
 * DTO for notat knyttet til et barn.
 */
public record ChildNoteResponse(
        Long childId,
        String childName,
        String note
) {}
