package no.trygginn.backend.service;

import no.trygginn.backend.model.Daycare;
import no.trygginn.backend.model.DaycareGroup;
import no.trygginn.backend.repository.DaycareGroupRepository;
import no.trygginn.backend.repository.DaycareRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DaycareGroupService {

    private final DaycareGroupRepository daycareGroupRepository;
    private final DaycareRepository daycareRepository;

    public DaycareGroupService(DaycareGroupRepository daycareGroupRepository,
                               DaycareRepository daycareRepository) {
        this.daycareGroupRepository = daycareGroupRepository;
        this.daycareRepository = daycareRepository;
    }

    @Transactional(readOnly = true)
    public List<DaycareGroup> getGroupsForDaycare(Long daycareId) {
        Daycare daycare = daycareRepository.findById(daycareId)
                .orElseThrow(() -> new IllegalArgumentException("Finner ikke barnehage med id " + daycareId));


        return daycareGroupRepository.findByDaycare_Id(daycare.getId());
    }
}
