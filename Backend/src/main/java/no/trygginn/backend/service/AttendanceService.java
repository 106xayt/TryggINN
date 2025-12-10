package no.trygginn.backend.service;
import no.trygginn.backend.model.Child;
import no.trygginn.backend.model.Attendance;
import no.trygginn.backend.model.AttendanceEventType;
import no.trygginn.backend.model.User;
import no.trygginn.backend.model.UserRole;
import no.trygginn.backend.repository.AttendanceRepository;
import no.trygginn.backend.repository.ChildRepository;
import no.trygginn.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final ChildRepository childRepository;
    private final UserRepository userRepository;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             ChildRepository childRepository,
                             UserRepository userRepository) {
        this.attendanceRepository = attendanceRepository;
        this.childRepository = childRepository;
        this.userRepository = userRepository;
    }


    @Transactional
    public Attendance registerEvent(Long childId,
                                    Long performedByUserId,
                                    AttendanceEventType eventType,
                                    String note) {

        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new IllegalArgumentException("Finner ikke barn."));

        User performer = userRepository.findById(performedByUserId)
                .orElseThrow(() -> new IllegalArgumentException("Finner ikke bruker som utfører handlingen."));


        if (performer.getRole() != UserRole.PARENT
                && performer.getRole() != UserRole.STAFF
                && performer.getRole() != UserRole.ADMIN) {
            throw new IllegalStateException("Bruker har ikke lov til å sjekke inn/ut barn.");
        }

        Attendance attendance = new Attendance();
        attendance.setChild(child);
        attendance.setEventType(eventType);
        attendance.setEventTime(LocalDateTime.now());
        attendance.setNote(note);
        attendance.setPerformedBy(performer);

        return attendanceRepository.save(attendance);
    }


    @Transactional(readOnly = true)
    public Optional<Attendance> getLatestEventForChild(Long childId) {
        return attendanceRepository.findTop1ByChild_IdOrderByEventTimeDesc(childId);
    }
}
