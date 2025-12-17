package no.trygginn.backend.controller;

import no.trygginn.backend.controller.dto.DaycareGroupResponse;
import no.trygginn.backend.controller.dto.StaffChildResponse;
import no.trygginn.backend.model.Daycare;
import no.trygginn.backend.model.DaycareGroup;
import no.trygginn.backend.service.DaycareGroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST-controller for barnehagegrupper.
 */
@RestController
@RequestMapping("/api/daycare-groups")
public class DaycareGroupController {

    private final DaycareGroupService daycareGroupService;

    public DaycareGroupController(DaycareGroupService daycareGroupService) {
        this.daycareGroupService = daycareGroupService;
    }

    /**
     * Henter alle grupper for en barnehage.
     */
    @GetMapping("/daycare/{daycareId}")
    public ResponseEntity<List<DaycareGroupResponse>> getGroupsForDaycare(
            @PathVariable Long daycareId
    ) {

        List<DaycareGroup> groups =
                daycareGroupService.getGroupsForDaycare(daycareId);

        List<DaycareGroupResponse> response = groups.stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    /**
     * Mapper DaycareGroup-entity til respons-DTO.
     */
    private DaycareGroupResponse toResponse(DaycareGroup group) {

        Daycare daycare = group.getDaycare();

        var children = group.getChildren().stream()
                .map(c -> new StaffChildResponse(
                        c.getId(),
                        c.getFirstName(),
                        c.getLastName()
                ))
                .toList();

        return new DaycareGroupResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                daycare != null ? daycare.getId() : null,
                daycare != null ? daycare.getName() : null,
                children
        );
    }
}
