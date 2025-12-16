package no.trygginn.backend.service;

import lombok.RequiredArgsConstructor;
import no.trygginn.backend.model.*;
import no.trygginn.backend.repository.CalendarEventRepository;
import no.trygginn.backend.repository.DaycareGroupRepository;
import no.trygginn.backend.repository.DaycareRepository;
import no.trygginn.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CalendarEventService {

    private final CalendarEventRepository calendarEventRepository;
    private final DaycareRepository daycareRepository;
    private final DaycareGroupRepository daycareGroupRepository;
    private final UserRepository userRepository;

    public CalendarEvent createEvent(
            Long daycareId,
            Long daycareGroupId,
            String title,
            String description,
            String location,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Long createdByUserId
    ) {
        User user = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == UserRole.PARENT) {
            throw new RuntimeException("Parents cannot create calendar events");
        }

        Daycare daycare = daycareRepository.findById(daycareId)
                .orElseThrow(() -> new RuntimeException("Daycare not found"));

        DaycareGroup daycareGroup = null;
        if (daycareGroupId != null) {
            daycareGroup = daycareGroupRepository.findById(daycareGroupId)
                    .orElseThrow(() -> new RuntimeException("Daycare group not found"));
        }

        CalendarEvent event = new CalendarEvent();
        event.setDaycare(daycare);
        event.setDaycareGroup(daycareGroup);
        event.setTitle(title);
        event.setDescription(description);
        event.setLocation(location);
        event.setStartTime(startTime);
        event.setEndTime(endTime);
        event.setCreatedByUser(user);

        return calendarEventRepository.save(event);
    }

    public CalendarEvent updateEvent(
            Long eventId,
            String title,
            String description,
            String location,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Long updatedByUserId
    ) {
        User user = userRepository.findById(updatedByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == UserRole.PARENT) {
            throw new RuntimeException("Parents cannot update calendar events");
        }

        CalendarEvent event = calendarEventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Calendar event not found"));

        event.setTitle(title);
        event.setDescription(description);
        event.setLocation(location);
        event.setStartTime(startTime);
        event.setEndTime(endTime);

        return calendarEventRepository.save(event);
    }

    public void deleteEvent(Long eventId, Long deletedByUserId) {
        User user = userRepository.findById(deletedByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == UserRole.PARENT) {
            throw new RuntimeException("Parents cannot delete calendar events");
        }

        CalendarEvent event = calendarEventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Calendar event not found"));

        calendarEventRepository.delete(event);
    }

    public List<CalendarEvent> getEventsForDaycare(Long daycareId) {
        return calendarEventRepository.findByDaycare_IdOrderByStartTimeAsc(daycareId);
    }

    public List<CalendarEvent> getEventsForGuardian(Long guardianId) {
        User guardian = userRepository.findById(guardianId)
                .orElseThrow(() -> new RuntimeException("Guardian not found"));

        Long daycareId = guardian.getDaycares().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Guardian not linked to daycare"))
                .getId();

        List<DaycareGroup> groups = guardian.getChildren().stream()
                .map(Child::getDaycareGroup)
                .distinct()
                .toList();

        return calendarEventRepository.findRelevantForGuardian(daycareId, groups);
    }
}
