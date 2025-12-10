package no.trygginn.backend.repository;

import no.trygginn.backend.model.Child;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChildRepository extends JpaRepository<Child, Long> {

    List<Child> findByGuardians_Id(Long guardianId);
}
