package no.trygginn.backend.controller.dto;

import java.util.List;

public record DaycareGroupResponse(
        Long id,
        String name,
        String description,
        Long daycareId,
        String daycareName,
        List<StaffChildResponse> children
) {
}
