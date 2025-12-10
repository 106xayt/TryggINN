package no.trygginn.backend.controller.dto;


public record UseAccessCodeResponse(
        Long daycareId,
        String daycareName,
        String message
) {}
