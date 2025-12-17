package no.trygginn.backend.controller;

import no.trygginn.backend.model.Child;
import no.trygginn.backend.controller.dto.AbsenceRequest;
import no.trygginn.backend.controller.dto.AbsenceResponse;
import no.trygginn.backend.model.Absence;
import no.trygginn.backend.model.User;
import no.trygginn.backend.service.AbsenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST-controller for håndtering av fravær.
 */
@RestController
@RequestMapping("/api/absence")
public class AbsenceController {

    private final AbsenceService absenceService;

    public AbsenceController(AbsenceService absenceService) {
        this.absenceService = absenceService;
    }

    /**
     * Registrerer nytt fravær for et barn.
     */
    @PostMapping
    public ResponseEntity<AbsenceResponse> registerAbsence(@RequestBody AbsenceRequest request) {

        // Konverterer dato fra String til LocalDate
        LocalDate date = LocalDate.parse(request.date());

        Absence a = absenceService.registerAbsence(
                request.childId(),
                request.reportedByUserId(),
                date,
                request.reason(),
                request.note()
        );

        Child c = a.getChild();
        User u = a.getReportedBy();

        // Mapper entity til respons-DTO
        AbsenceResponse response = new AbsenceResponse(
                a.getId(),
                c != null ? c.getId() : null,
                c != null ? c.getFirstName() + " " + c.getLastName() : null,
                a.getDate(),
                a.getReason(),
                a.getNote(),
                u != null ? u.getId() : null,
                u != null ? u.getFullName() : null
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Henter alt fravær for et spesifikt barn.
     */
    @GetMapping("/child/{childId}")
    public ResponseEntity<List<AbsenceResponse>> getAbsences(@PathVariable Long childId) {

        List<Absence> absences = absenceService.getAbsencesForChild(childId);

        // Mapper liste av Absence til liste av AbsenceResponse
        List<AbsenceResponse> response = absences.stream()
                .map(a -> {
                    Child c = a.getChild();
                    User u = a.getReportedBy();
                    return new AbsenceResponse(
                            a.getId(),
                            c != null ? c.getId() : null,
                            c != null ? c.getFirstName() + " " + c.getLastName() : null,
                            a.getDate(),
                            a.getReason(),
                            a.getNote(),
                            u != null ? u.getId() : null,
                            u != null ? u.getFullName() : null
                    );
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
