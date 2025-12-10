package no.trygginn.backend.controller.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record VacationResponse(
        Long id,
        Long childId,
        String childName,
        Long reportedByUserId,
        String reportedByName,
        LocalDate startDate,
        LocalDate endDate,
        String note,
        LocalDateTime createdAt
) {
}
