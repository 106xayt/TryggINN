package no.trygginn.backend.controller.dto;

import java.time.LocalDate;

public record VacationRequest(
        Long childId,
        Long reportedByUserId,
        LocalDate startDate,
        LocalDate endDate,
        String note
) {
}
