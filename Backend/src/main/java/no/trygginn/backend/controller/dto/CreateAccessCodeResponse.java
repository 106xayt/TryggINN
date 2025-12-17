package no.trygginn.backend.controller.dto;

import java.time.LocalDateTime;

/**
 * DTO for respons etter opprettelse av tilgangskode.
 */
public record CreateAccessCodeResponse(
        String code,
        Long daycareId,
        int maxUses,
        int usedCount,
        boolean active,
        LocalDateTime expiresAt
) {}
