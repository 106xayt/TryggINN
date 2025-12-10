package no.trygginn.backend.controller.dto;

import java.time.LocalDateTime;


public record AttendanceEventResponse(
        Long id,
        Long childId,
        String childName,
        String eventType,      // "IN" / "OUT"
        LocalDateTime eventTime,
        String note,
        Long performedByUserId,
        String performedByName
) {}
