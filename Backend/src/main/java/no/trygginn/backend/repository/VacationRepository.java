package no.trygginn.backend.repository;

import no.trygginn.backend.model.Vacation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository for ferie.
 */
public interface VacationRepository extends JpaRepository<Vacation, Long> {

    /**
     * Henter alle ferier for et barn.
     */
    List<Vacation> findByChild_Id(Long childId);
}
