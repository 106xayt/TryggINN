package no.trygginn.backend.repository;

import no.trygginn.backend.model.DaycareGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DaycareGroupRepository extends JpaRepository<DaycareGroup, Long> {

    List<DaycareGroup> findByDaycare_Id(Long daycareId);
}
