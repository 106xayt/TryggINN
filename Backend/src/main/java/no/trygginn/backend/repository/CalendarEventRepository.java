package no.trygginn.backend.repository;

import no.trygginn.backend.model.CalendarEvent;
import no.trygginn.backend.model.DaycareGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {

    List<CalendarEvent> findByDaycare_IdOrderByStartTimeAsc(Long daycareId);

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
