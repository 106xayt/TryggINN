package no.trygginn.backend.service;

import no.trygginn.backend.model.Absence;
import no.trygginn.backend.model.Child;
import no.trygginn.backend.model.User;
import no.trygginn.backend.repository.AbsenceRepository;
import no.trygginn.backend.repository.ChildRepository;
import no.trygginn.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AbsenceService {

    private final AbsenceRepository absenceRepository;
    private final ChildRepository childRepository;
    private final UserRepository userRepository;

    public AbsenceService(
            AbsenceRepository absenceRepository,
            ChildRepository childRepository,
            UserRepository userRepository
    ) {
        this.absenceRepository = absenceRepository;
        this.childRepository = childRepository;
        this.userRepository = userRepository;
    }

    public Absence registerAbsence(Long childId,
                                   Long reportedByUserId,
                                   LocalDate date,
                                   String reason,
                                   String note) {

        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new IllegalArgumentException("Barn ble ikke funnet."));

        User reporter = userRepository.findById(reportedByUserId)
                .orElseThrow(() -> new IllegalArgumentException("Bruker ble ikke funnet."));

        Absence absence = new Absence();
        absence.setChild(child);
        absence.setReportedBy(reporter);
        absence.setDate(date);
        absence.setReason(reason);
        absence.setNote(note);

        return absenceRepository.save(absence);
    }

    public List<Absence> getAbsencesForChild(Long childId) {
        return absenceRepository.findByChild_IdOrderByDateDesc(childId);
    }
}
