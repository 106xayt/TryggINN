package no.trygginn.backend.controller.dto;

import org.springframework.lang.Nullable;

/**
 * DTO for bruk av tilgangskode.
 */
public record UseAccessCodeRequest(
        String code,
        @Nullable Long guardianUserId
) {}