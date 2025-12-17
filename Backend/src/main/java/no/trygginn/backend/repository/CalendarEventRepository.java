package no.trygginn.backend.repository;

import no.trygginn.backend.model.CalendarEvent;
import no.trygginn.backend.model.DaycareGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository for kalenderhendelser.
 */
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {

    /**
     * Henter alle kalenderhendelser for en barnehage,
     * sortert etter starttid.
     */
    List<CalendarEvent> findByDaycare_IdOrderByStartTimeAsc(Long daycareId);

    /**
     * Henter relevante kalenderhendelser for en foresatt,
     * basert på barnehage og barnets grupper.
     */
    @Query("""
        SELECT e
        FROM CalendarEvent e
        WHERE e.daycare.id = :daycareId
          AND (e.daycareGroup IS NULL OR e.daycareGroup IN :groups)
        ORDER BY e.startTime ASC
    """)
    List<CalendarEvent> findRelevantForGuardian(
            @Param("daycareId") Long daycareId,
            @Param("groups") List<DaycareGroup> groups
    );
}
