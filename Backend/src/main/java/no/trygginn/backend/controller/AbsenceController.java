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

@RestController
@RequestMapping("/api/absence")
public class AbsenceController {

    private final AbsenceService absenceService;

    public AbsenceController(AbsenceService absenceService) {
        this.absenceService = absenceService;
    }

    @PostMapping
    public ResponseEntity<AbsenceResponse> registerAbsence(@RequestBody AbsenceRequest request) {

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

    @GetMapping("/child/{childId}")
    public ResponseEntity<List<AbsenceResponse>> getAbsences(@PathVariable Long childId) {
        List<Absence> absences = absenceService.getAbsencesForChild(childId);

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
