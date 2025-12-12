package no.trygginn.backend.controller.dto;

import java.time.LocalDateTime;


public record CreateAccessCodeResponse(
        String code,
        Long daycareId,
        int maxUses,
        int usedCount,
        boolean active,
        LocalDateTime expiresAt
) {}
