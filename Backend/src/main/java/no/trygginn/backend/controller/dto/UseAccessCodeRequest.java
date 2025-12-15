package no.trygginn.backend.controller.dto;

public record UseAccessCodeRequest(
        String code,
        Long guardianUserId // null = bare valider
) {}
