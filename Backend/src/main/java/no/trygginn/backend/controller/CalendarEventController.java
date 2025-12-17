package no.trygginn.backend.controller;

import lombok.RequiredArgsConstructor;
import no.trygginn.backend.controller.dto.CalendarEventResponse;
import no.trygginn.backend.controller.dto.CreateCalendarEventRequest;
import no.trygginn.backend.controller.dto.UpdateCalendarEventRequest;
import no.trygginn.backend.model.CalendarEvent;
import no.trygginn.backend.service.CalendarEventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST-controller for kalenderhendelser.
 */
@RestController
@RequestMapping("/api/calendar-events")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CalendarEventController {

    private final CalendarEventService calendarEventService;

    /**
     * Oppretter en ny kalenderhendelse.
     */
    @PostMapping
    public ResponseEntity<CalendarEventResponse> create(
            @RequestBody CreateCalendarEventRequest req
    ) {

        CalendarEvent created = calendarEventService.createEvent(
                req.getDaycareId(),
                req.getDaycareGroupId(),
                req.getTitle(),
                req.getDescription(),
                req.getLocation(),
                req.getStartTime(),
                req.getEndTime(),
                req.getCreatedByUserId()
        );

        return ResponseEntity.ok(CalendarEventResponse.from(created));
    }

    /**
     * Oppdaterer en eksisterende kalenderhendelse.
     */
    @PutMapping("/{eventId}")
    public ResponseEntity<CalendarEventResponse> update(
            @PathVariable Long eventId,
            @RequestBody UpdateCalendarEventRequest req
    ) {

        CalendarEvent updated = calendarEventService.updateEvent(
                eventId,
                req.getTitle(),
                req.getDescription(),
                req.getLocation(),
                req.getStartTime(),
                req.getEndTime(),
                req.getUpdatedByUserId()
        );

        return ResponseEntity.ok(CalendarEventResponse.from(updated));
    }

    /**
     * Sletter en kalenderhendelse.
     */
    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long eventId,
            @RequestParam Long deletedByUserId
    ) {

        calendarEventService.deleteEvent(eventId, deletedByUserId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Henter kalenderhendelser for en barnehage.
     */
    @GetMapping("/daycare/{daycareId}")
    public ResponseEntity<List<CalendarEventResponse>> listForDaycare(
            @PathVariable Long daycareId
    ) {

        List<CalendarEventResponse> res = calendarEventService
                .getEventsForDaycare(daycareId)
                .stream()
                .map(CalendarEventResponse::from)
                .toList();

        return ResponseEntity.ok(res);
    }

    /**
     * Henter kalenderhendelser for en foresatt.
     */
    @GetMapping("/guardian/{guardianId}")
    public ResponseEntity<List<CalendarEventResponse>> listForGuardian(
            @PathVariable Long guardianId
    ) {

        List<CalendarEventResponse> res = calendarEventService
                .getEventsForGuardian(guardianId)
                .stream()
                .map(CalendarEventResponse::from)
                .toList();

        return ResponseEntity.ok(res);
    }
}
