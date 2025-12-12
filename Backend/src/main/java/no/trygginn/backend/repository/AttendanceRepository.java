package no.trygginn.backend.repository;

import no.trygginn.backend.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findTop1ByChild_IdOrderByEventTimeDesc(Long childId);

    List<Attendance> findByChild_IdAndEventTimeBetween(
            Long childId,
            LocalDateTime start,
            LocalDateTime end
    );
}
