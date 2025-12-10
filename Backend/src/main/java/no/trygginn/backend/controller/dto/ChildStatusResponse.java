package no.trygginn.backend.controller.dto;

import java.time.LocalDateTime;

public record ChildStatusResponse(
        Long childId,
        String childName,
        String lastEventType,
        LocalDateTime lastEventTime,
        String statusText
) {}
