package no.trygginn.backend.service;

import no.trygginn.backend.model.Child;
import no.trygginn.backend.model.User;
import no.trygginn.backend.model.Vacation;
import no.trygginn.backend.repository.ChildRepository;
import no.trygginn.backend.repository.UserRepository;
import no.trygginn.backend.repository.VacationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Service for håndtering av ferie.
 */
@Service
public class VacationService {

    private final VacationRepository vacationRepository;
    private final ChildRepository childRepository;
    private final UserRepository userRepository;

    public VacationService(
            VacationRepository vacationRepository,
            ChildRepository childRepository,
            UserRepository userRepository
    ) {
        this.vacationRepository = vacationRepository;
        this.childRepository = childRepository;
        this.userRepository = userRepository;
    }

    /**
     * Registrerer ferie for et barn.
     */
    @Transactional
    public Vacation registerVacation(
            Long childId,
            Long reportedByUserId,
            LocalDate startDate,
            LocalDate endDate,
            String note
    ) {

        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start- og sluttdato må være satt.");
        }

        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("Sluttdato kan ikke være før startdato.");
        }

        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new IllegalArgumentException("Finner ikke barn."));

        User reportedBy = userRepository.findById(reportedByUserId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Finner ikke bruker som registrerer ferie."));

        Vacation vacation = new Vacation();
        vacation.setChild(child);
        vacation.setReportedBy(reportedBy);
        vacation.setStartDate(startDate);
        vacation.setEndDate(endDate);
        vacation.setNote(note);

        return vacationRepository.save(vacation);
    }

    /**
     * Henter alle ferier for et barn.
     */
    @Transactional(readOnly = true)
    public List<Vacation> getVacationsForChild(Long childId) {
        return vacationRepository.findByChild_Id(childId);
    }
}
