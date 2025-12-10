package no.trygginn.backend.controller.dto;

import java.time.LocalDate;


public record CreateChildRequest(
        Long guardianUserId,
        Long daycareGroupId,
        Long createdByUserId,
        String firstName,
        String lastName,
        LocalDate dateOfBirth
) {}
