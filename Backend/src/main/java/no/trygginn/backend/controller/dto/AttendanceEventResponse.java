package no.trygginn.backend.controller.dto;

import java.time.LocalDateTime;

/**
 * DTO for respons ved henting av oppmøtehendelser.
 */
public record AttendanceEventResponse(
        Long id,
        Long childId,
        String childName,
        String eventType,
        LocalDateTime eventTime,
        String note,
        Long performedByUserId,
        String performedByName
) {}
