package no.trygginn.backend.controller.dto;

import java.util.List;

/**
 * DTO for barnehagegruppe med tilhørende barn.
 */
public record DaycareGroupResponse(
        Long id,
        String name,
        String description,
        Long daycareId,
        String daycareName,
        List<StaffChildResponse> children
) {}
