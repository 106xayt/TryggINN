package no.trygginn.backend.controller;

import no.trygginn.backend.controller.dto.AttendanceEventRequest;
import no.trygginn.backend.controller.dto.AttendanceEventResponse;
import no.trygginn.backend.controller.dto.ChildStatusResponse;
import no.trygginn.backend.model.Attendance;
import no.trygginn.backend.model.AttendanceEventType;
import no.trygginn.backend.model.User;
import no.trygginn.backend.service.AttendanceService;
import no.trygginn.backend.service.ChildService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import no.trygginn.backend.model.Child;

import java.util.Locale;

/**
 * REST-controller for inn- og utsjekk (oppmøte).
 */
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final ChildService childService;

    public AttendanceController(AttendanceService attendanceService,
                                ChildService childService) {
        this.attendanceService = attendanceService;
        this.childService = childService;
    }

    /**
     * Registrerer en inn- eller utsjekk for et barn.
     */
    @PostMapping
    public ResponseEntity<AttendanceEventResponse> registerEvent(
            @RequestBody AttendanceEventRequest request
    ) {

        AttendanceEventType type = parseEventType(request.eventType());

        Attendance attendance = attendanceService.registerEvent(
                request.childId(),
                request.performedByUserId(),
                type,
                request.note()
        );

        return ResponseEntity.ok(toResponse(attendance));
    }

    /**
     * Henter siste registrerte status for et barn.
     */
    @GetMapping("/child/{childId}/latest")
    public ResponseEntity<ChildStatusResponse> getLatestStatus(@PathVariable Long childId) {

        Child child = childService.getChildById(childId);
        var latestOpt = attendanceService.getLatestEventForChild(childId);

        if (latestOpt.isEmpty()) {
            ChildStatusResponse response = new ChildStatusResponse(
                    child.getId(),
                    child.getFirstName() + " " + child.getLastName(),
                    null,
                    null,
                    "Ingen inn-/utsjekk er registrert ennå."
            );
            return ResponseEntity.ok(response);
        }

        Attendance latest = latestOpt.get();

        String statusText = switch (latest.getEventType()) {
            case IN -> "Sist sjekket INN " + latest.getEventTime();
            case OUT -> "Sist sjekket UT " + latest.getEventTime();
        };

        ChildStatusResponse response = new ChildStatusResponse(
                child.getId(),
                child.getFirstName() + " " + child.getLastName(),
                latest.getEventType().name(),
                latest.getEventTime(),
                statusText
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Parser og validerer eventType fra request.
     */
    private AttendanceEventType parseEventType(String raw) {
        if (raw == null) {
            throw new IllegalArgumentException("eventType må være 'IN' eller 'OUT'.");
        }
        try {
            return AttendanceEventType.valueOf(raw.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "Ugyldig eventType: " + raw + " (bruk 'IN' eller 'OUT')"
            );
        }
    }

    /**
     * Mapper Attendance-entity til respons-DTO.
     */
    private AttendanceEventResponse toResponse(Attendance attendance) {
        Child child = attendance.getChild();
        User performer = attendance.getPerformedBy();

        return new AttendanceEventResponse(
                attendance.getId(),
                child != null ? child.getId() : null,
                child != null ? child.getFirstName() + " " + child.getLastName() : null,
                attendance.getEventType().name(),
                attendance.getEventTime(),
                attendance.getNote(),
                performer != null ? performer.getId() : null,
                performer != null ? performer.getFullName() : null
        );
    }
}
