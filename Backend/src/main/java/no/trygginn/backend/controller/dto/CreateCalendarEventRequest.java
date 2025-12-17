package no.trygginn.backend.controller.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO for opprettelse av kalenderhendelse.
 */
@Data
public class CreateCalendarEventRequest {

    private Long daycareId;
    private Long daycareGroupId; // null betyr hele barnehagen
    private String title;
    private String description;
    private String location;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long createdByUserId;
}
