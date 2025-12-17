package no.trygginn.backend.controller.dto;

/**
 * DTO for fraværsrapportering fra frontend.
 */
public record AbsenceRequest(
        Long childId,           // Barnet fraværet gjelder
        Long reportedByUserId,  // Brukeren som rapporterer
        String date,            // Dato for fraværet
        String reason,          // Årsak
        String note             // Eventuell kommentar
) {}
