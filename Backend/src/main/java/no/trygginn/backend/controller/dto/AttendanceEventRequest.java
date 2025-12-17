package no.trygginn.backend.controller.dto;

/**
 * DTO for registrering av oppmøtehendelser.
 */
public record AttendanceEventRequest(
        Long childId,
        Long performedByUserId,
        String eventType,
        String note
) {}
