package no.trygginn.backend.repository;

import no.trygginn.backend.model.Vacation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VacationRepository extends JpaRepository<Vacation, Long> {

    List<Vacation> findByChild_Id(Long childId);
}
