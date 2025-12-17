package no.trygginn.backend.repository;

import no.trygginn.backend.model.DaycareGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository for barnehagegrupper.
 */
public interface DaycareGroupRepository extends JpaRepository<DaycareGroup, Long> {

    /**
     * Henter alle grupper tilknyttet en barnehage.
     */
    List<DaycareGroup> findByDaycare_Id(Long daycareId);
}
