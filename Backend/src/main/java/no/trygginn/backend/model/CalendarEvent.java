package no.trygginn.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity som representerer en kalenderhendelse.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "calendar_event")
public class CalendarEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Barnehagen hendelsen tilhører
    @ManyToOne(optional = false)
    @JoinColumn(name = "daycare_id", nullable = false)
    private Daycare daycare;

    // Valgfri barnehagegruppe (null = hele barnehagen)
    @ManyToOne
    @JoinColumn(name = "daycare_group_id")
    private DaycareGroup daycareGroup;

    // Tittel på hendelsen
    @Column(nullable = false)
    private String title;

    private String description;
    private String location;

    // Start- og sluttidspunkt
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    // Brukeren som opprettet hendelsen
    @ManyToOne(optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdByUser;

    // Tidsstempler
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    /**
     * Setter tidsstempler ved opprettelse.
     */
    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    /**
     * Oppdaterer oppdatert-tidspunkt ved endring.
     */
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
