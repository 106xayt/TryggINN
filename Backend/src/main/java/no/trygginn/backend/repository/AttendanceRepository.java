package no.trygginn.backend.repository;

import no.trygginn.backend.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for oppmøtehendelser.
 */
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    /**
     * Henter siste inn-/utsjekk for et barn.
     */
    Optional<Attendance> findTop1ByChild_IdOrderByEventTimeDesc(Long childId);

    /**
     * Henter oppmøtehendelser for et barn innenfor et tidsrom.
     */
    List<Attendance> findByChild_IdAndEventTimeBetween(
            Long childId,
            LocalDateTime start,
            LocalDateTime end
    );
}
