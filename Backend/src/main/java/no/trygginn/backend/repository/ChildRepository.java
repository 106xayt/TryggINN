package no.trygginn.backend.repository;

import no.trygginn.backend.model.Child;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository for barn.
 */
public interface ChildRepository extends JpaRepository<Child, Long> {

    /**
     * Henter alle barn knyttet til en foresatt.
     */
    List<Child> findByGuardians_Id(Long guardianId);
}
