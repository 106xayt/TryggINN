package no.trygginn.backend.controller.dto;

import java.time.LocalDate;

/**
 * DTO for registrering av ferie.
 */
public record VacationRequest(
        Long childId,
        Long reportedByUserId,
        LocalDate startDate,
        LocalDate endDate,
        String note
) {}