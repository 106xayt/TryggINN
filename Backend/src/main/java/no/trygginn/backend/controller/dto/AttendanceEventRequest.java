package no.trygginn.backend.controller.dto;


public record AttendanceEventRequest(
        Long childId,
        Long performedByUserId,
        String eventType,
        String note
) {}
