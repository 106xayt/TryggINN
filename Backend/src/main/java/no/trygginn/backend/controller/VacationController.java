package no.trygginn.backend.controller;

import no.trygginn.backend.controller.dto.VacationRequest;
import no.trygginn.backend.controller.dto.VacationResponse;
import no.trygginn.backend.model.Child;
import no.trygginn.backend.model.User;
import no.trygginn.backend.model.Vacation;
import no.trygginn.backend.service.VacationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST-controller for håndtering av ferie.
 */
@RestController
@RequestMapping("/api/vacation")
public class VacationController {

    private final VacationService vacationService;

    public VacationController(VacationService vacationService) {
        this.vacationService = vacationService;
    }

    /**
     * Registrerer ferie for et barn.
     */
    @PostMapping
    public ResponseEntity<VacationResponse> registerVacation(
            @RequestBody VacationRequest request
    ) {

        Vacation vacation = vacationService.registerVacation(
                request.childId(),
                request.reportedByUserId(),
                request.startDate(),
                request.endDate(),
                request.note()
        );

        return ResponseEntity.ok(toResponse(vacation));
    }

    /**
     * Henter alle ferier for et barn.
     */
    @GetMapping("/child/{childId}")
    public ResponseEntity<List<VacationResponse>> getVacationsForChild(
            @PathVariable Long childId
    ) {

        List<Vacation> vacations =
                vacationService.getVacationsForChild(childId);

        List<VacationResponse> responses = vacations.stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(responses);
    }

    /**
     * Mapper Vacation-entity til respons-DTO.
     */
    private VacationResponse toResponse(Vacation vacation) {

        Child child = vacation.getChild();
        User reporter = vacation.getReportedBy();

        String childName = child != null
                ? child.getFirstName() + " " + child.getLastName()
                : null;

        String reporterName = reporter != null
                ? reporter.getFullName()
                : null;

        return new VacationResponse(
                vacation.getId(),
                child != null ? child.getId() : null,
                childName,
                reporter != null ? reporter.getId() : null,
                reporterName,
                vacation.getStartDate(),
                vacation.getEndDate(),
                vacation.getNote(),
                vacation.getCreatedAt()
        );
    }
}
