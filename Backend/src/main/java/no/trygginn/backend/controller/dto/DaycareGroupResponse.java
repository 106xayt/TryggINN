package no.trygginn.backend.controller.dto;


public record DaycareGroupResponse(
        Long id,
        String name,
        String description,
        Long daycareId,
        String daycareName
) {}