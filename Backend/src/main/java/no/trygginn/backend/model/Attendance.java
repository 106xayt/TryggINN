package no.trygginn.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity som representerer inn- og utsjekk for et barn.
 */
@Entity
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Barnet hendelsen gjelder
    @ManyToOne(optional = false)
    @JoinColumn(name = "child_id")
    private Child child;

    // Type hendelse (IN / OUT)
    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private AttendanceEventType eventType;

    // Tidspunkt for inn- eller utsjekk
    @Column(name = "event_time", nullable = false)
    private LocalDateTime eventTime;

    // Eventuell kommentar
    @Column(name = "note")
    private String note;

    // Brukeren som utførte handlingen
    @ManyToOne(optional = false)
    @JoinColumn(name = "performed_by_user_id")
    private User performedBy;

    // Tidspunkt for opprettelse
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() {
        return id;
    }

    public Child getChild() {
        return child;
    }

    public void setChild(Child child) {
        this.child = child;
    }

    public AttendanceEventType getEventType() {
        return eventType;
    }

    public void setEventType(AttendanceEventType eventType) {
        this.eventType = eventType;
    }

    public LocalDateTime getEventTime() {
        return eventTime;
    }

    public void setEventTime(LocalDateTime eventTime) {
        this.eventTime = eventTime;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public User getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(User performedBy) {
        this.performedBy = performedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
