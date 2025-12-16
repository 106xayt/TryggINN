package no.trygginn.backend.controller.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateCalendarEventRequest {
    private String title;
    private String description;
    private String location;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long updatedByUserId;
}
