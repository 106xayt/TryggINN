package no.trygginn.backend.controller.dto;

import java.time.LocalDate;

/**
 * DTO for informasjon om barn.
 */
public record ChildResponse(
        Long id,
        String firstName,
        String lastName,
        LocalDate dateOfBirth,
        boolean active,
        Long daycareGroupId,
        String daycareGroupName,
        Long daycareId,
        String daycareName
) {}