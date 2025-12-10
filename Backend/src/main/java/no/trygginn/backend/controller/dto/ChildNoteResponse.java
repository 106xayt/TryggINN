package no.trygginn.backend.controller.dto;

public record ChildNoteResponse(
        Long childId,
        String childName,
        String note
) {
}
