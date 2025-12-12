package no.trygginn.backend.repository;

import no.trygginn.backend.model.Absence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AbsenceRepository extends JpaRepository<Absence, Long> {

    List<Absence> findByChild_IdOrderByDateDesc(Long childId);
}
