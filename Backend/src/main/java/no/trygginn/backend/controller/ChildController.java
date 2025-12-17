package no.trygginn.backend.controller;

import no.trygginn.backend.model.Child;
import no.trygginn.backend.controller.dto.CreateChildRequest;
import no.trygginn.backend.controller.dto.ChildResponse;
import no.trygginn.backend.model.Daycare;
import no.trygginn.backend.model.DaycareGroup;
import no.trygginn.backend.service.ChildService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST-controller for håndtering av barn.
 */
@RestController
@RequestMapping("/api/children")
public class ChildController {

    private final ChildService childService;

    public ChildController(ChildService childService) {
        this.childService = childService;
    }

    /**
     * Oppretter et nytt barn.
     */
    @PostMapping
    public ResponseEntity<ChildResponse> createChild(
            @RequestBody CreateChildRequest request
    ) {

        Child child = childService.createChild(request);
        return ResponseEntity.ok(toResponse(child));
    }

    /**
     * Henter alle barn knyttet til en foresatt.
     */
    @GetMapping("/guardian/{guardianId}")
    public ResponseEntity<List<ChildResponse>> getChildrenForGuardian(
            @PathVariable Long guardianId
    ) {

        List<Child> children = childService.getChildrenForGuardian(guardianId);

        List<ChildResponse> responseList = children.stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(responseList);
    }

    /**
     * Henter informasjon om ett barn.
     */
    @GetMapping("/{childId}")
    public ResponseEntity<ChildResponse> getChild(
            @PathVariable Long childId
    ) {

        Child child = childService.getChildById(childId);
        return ResponseEntity.ok(toResponse(child));
    }

    /**
     * Mapper Child-entity til respons-DTO.
     */
    private ChildResponse toResponse(Child child) {

        DaycareGroup group = child.getDaycareGroup();
        Daycare daycare = group != null ? group.getDaycare() : null;

        return new ChildResponse(
                child.getId(),
                child.getFirstName(),
                child.getLastName(),
                child.getDateOfBirth(),
                child.isActive(),
                group != null ? group.getId() : null,
                group != null ? group.getName() : null,
                daycare != null ? daycare.getId() : null,
                daycare != null ? daycare.getName() : null
        );
    }
}
