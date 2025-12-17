package no.trygginn.backend.controller.dto;

import java.time.LocalDate;

/**
 * DTO for opprettelse av barn.
 */
public record CreateChildRequest(
        Long guardianUserId,
        Long daycareGroupId,
        Long createdByUserId,
        String firstName,
        String lastName,
        LocalDate dateOfBirth
) {}