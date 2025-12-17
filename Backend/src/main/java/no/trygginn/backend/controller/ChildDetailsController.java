package no.trygginn.backend.controller;

import no.trygginn.backend.controller.dto.ChildDetailsResponse;
import no.trygginn.backend.controller.dto.UpdateChildDetailsRequest;
import no.trygginn.backend.model.Child;
import no.trygginn.backend.service.ChildService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST-controller for detaljer om barn.
 */
@RestController
@RequestMapping("/api/children")
public class ChildDetailsController {

    private final ChildService childService;

    public ChildDetailsController(ChildService childService) {
        this.childService = childService;
    }

    /**
     * Henter detaljer om et barn.
     */
    @GetMapping("/{childId}/details")
    public ResponseEntity<ChildDetailsResponse> getDetails(
            @PathVariable Long childId
    ) {

        Child child = childService.getChildById(childId);

        return ResponseEntity.ok(
                new ChildDetailsResponse(
                        child.getId(),
                        child.getFirstName(),
                        child.getLastName(),
                        child.getAllergies(),
                        child.getMedications(),
                        child.getFavoriteFood()
                )
        );
    }

    /**
     * Oppdaterer detaljer om et barn.
     */
    @PutMapping("/{childId}/details")
    public ResponseEntity<ChildDetailsResponse> updateDetails(
            @PathVariable Long childId,
            @RequestBody UpdateChildDetailsRequest req
    ) {

        Child updated = childService.updateChildDetails(
                childId,
                req.allergies(),
                req.medications(),
                req.favoriteFood()
        );

        return ResponseEntity.ok(
                new ChildDetailsResponse(
                        updated.getId(),
                        updated.getFirstName(),
                        updated.getLastName(),
                        updated.getAllergies(),
                        updated.getMedications(),
                        updated.getFavoriteFood()
                )
        );
    }
}
