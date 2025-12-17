package no.trygginn.backend.controller.dto;

/**
 * DTO for enkel visning av barn for ansatte.
 */
public record StaffChildResponse(
        Long id,
        String firstName,
        String lastName
) {}