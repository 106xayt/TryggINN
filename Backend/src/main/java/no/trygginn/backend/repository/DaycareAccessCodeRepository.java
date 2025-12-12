package no.trygginn.backend.repository;

import no.trygginn.backend.model.DaycareAccessCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.time.LocalDateTime;

public interface DaycareAccessCodeRepository extends JpaRepository<DaycareAccessCode, Long> {

    Optional<DaycareAccessCode> findByCodeAndActiveTrue(String code);

    Optional<DaycareAccessCode> findByCodeAndActiveTrueAndExpiresAtAfterOrExpiresAtIsNull(
            String code,
            LocalDateTime now
    );
}
