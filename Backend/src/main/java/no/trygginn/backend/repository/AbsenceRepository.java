package no.trygginn.backend.repository;

import no.trygginn.backend.model.Absence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository for tilgang til fraværsdata.
 */
public interface AbsenceRepository extends JpaRepository<Absence, Long> {

    /**
     * Henter fravær for et barn, sortert etter dato (nyeste først).
     */
    List<Absence> findByChild_IdOrderByDateDesc(Long childId);
}
