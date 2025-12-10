package no.trygginn.backend.controller.dto;

import java.time.LocalDateTime;


public record CreateAccessCodeRequest(
        Long daycareId,
        Long createdByUserId,
        Integer maxUses,
        LocalDateTime expiresAt
) {}
