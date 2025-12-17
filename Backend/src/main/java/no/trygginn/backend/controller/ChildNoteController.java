package no.trygginn.backend.controller;

import no.trygginn.backend.controller.dto.ChildNoteResponse;
import no.trygginn.backend.controller.dto.UpdateChildNoteRequest;
import no.trygginn.backend.model.Child;
import no.trygginn.backend.service.ChildService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST-controller for notater knyttet til barn.
 */
@RestController
@RequestMapping("/api/children")
public class ChildNoteController {

    private final ChildService childService;

    public ChildNoteController(ChildService childService) {
        this.childService = childService;
    }

    /**
     * Henter notat for et barn.
     */
    @GetMapping("/{childId}/note")
    public ResponseEntity<ChildNoteResponse> getNote(
            @PathVariable Long childId
    ) {

        Child child = childService.getChildById(childId);
        String childName = child.getFirstName() + " " + child.getLastName();

        return ResponseEntity.ok(
                new ChildNoteResponse(
                        child.getId(),
                        childName,
                        child.getNote()
                )
        );
    }

    /**
     * Oppdaterer notat for et barn.
     */
    @PutMapping("/{childId}/note")
    public ResponseEntity<ChildNoteResponse> updateNote(
            @PathVariable Long childId,
            @RequestBody UpdateChildNoteRequest request
    ) {

        Child updated = childService.updateChildNote(
                childId,
                request.note()
        );

        String childName = updated.getFirstName() + " " + updated.getLastName();

        return ResponseEntity.ok(
                new ChildNoteResponse(
                        updated.getId(),
                        childName,
                        updated.getNote()
                )
        );
    }
}
