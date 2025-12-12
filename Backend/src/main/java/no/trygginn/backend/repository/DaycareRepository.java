package no.trygginn.backend.repository;

import no.trygginn.backend.model.Daycare;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DaycareRepository extends JpaRepository<Daycare, Long> {
}
