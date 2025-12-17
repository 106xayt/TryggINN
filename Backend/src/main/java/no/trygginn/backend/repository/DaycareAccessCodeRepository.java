package no.trygginn.backend.repository;

import no.trygginn.backend.model.DaycareAccessCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.time.LocalDateTime;

/**
 * Repository for tilgangskoder til barnehager.
 */
public interface DaycareAccessCodeRepository extends JpaRepository<DaycareAccessCode, Long> {

    /**
     * Henter en aktiv tilgangskode basert på kode.
     */
    Optional<DaycareAccessCode> findByCodeAndActiveTrue(String code);

    /**
     * Henter en aktiv og gyldig tilgangskode
     * (ikke utløpt eller uten utløpsdato).
     */
    Optional<DaycareAccessCode> findByCodeAndActiveTrueAndExpiresAtAfterOrExpiresAtIsNull(
            String code,
            LocalDateTime now
    );
}
