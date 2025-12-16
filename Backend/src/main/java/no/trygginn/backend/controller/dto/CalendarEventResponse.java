package no.trygginn.backend.controller.dto;

import lombok.Builder;
import lombok.Data;
import no.trygginn.backend.model.CalendarEvent;

import java.time.LocalDateTime;

@Data
@Builder
public class CalendarEventResponse {

    private Long id;
    private String title;
    private String description;
    private String location;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private Long daycareId;
    private Long daycareGroupId;

    private String daycareGroupName;

    public static CalendarEventResponse from(CalendarEvent event) {
        return CalendarEventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .location(event.getLocation())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .daycareId(event.getDaycare().getId())
                .daycareGroupId(
                        event.getDaycareGroup() != null
                                ? event.getDaycareGroup().getId()
                                : null
                )
                .daycareGroupName(
                        event.getDaycareGroup() != null
                                ? event.getDaycareGroup().getName()
                                : "Hele barnehagen"
                )
                .build();
    }
}
