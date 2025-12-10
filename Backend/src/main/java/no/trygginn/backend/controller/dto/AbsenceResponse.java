package no.trygginn.backend.controller.dto;

import java.time.LocalDate;

public record AbsenceResponse(
        Long id,
        Long childId,
        String childName,
        LocalDate date,
        String reason,
        String note,
        Long reportedByUserId,
        String reportedByName
) {}
