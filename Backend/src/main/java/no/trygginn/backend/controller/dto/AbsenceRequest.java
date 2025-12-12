package no.trygginn.backend.controller.dto;

public record AbsenceRequest(
        Long childId,
        Long reportedByUserId,
        String date,
        String reason,
        String note
) {}
