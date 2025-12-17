package no.trygginn.backend.controller.dto;

import java.time.LocalDateTime;

/**
 * DTO for statusinformasjon om et barn.
 */
public record ChildStatusResponse(
        Long childId,
        String childName,
        String lastEventType,
        LocalDateTime lastEventTime,
        String statusText
) {}
