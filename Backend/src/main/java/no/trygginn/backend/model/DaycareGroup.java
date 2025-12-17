package no.trygginn.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity som representerer en gruppe i en barnehage.
 */
@Entity
@Table(name = "daycare_group")
public class DaycareGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Barnehagen gruppen tilhører
    @ManyToOne(optional = false)
    @JoinColumn(name = "daycare_id")
    private Daycare daycare;

    // Navn på gruppen
    @Column(nullable = false)
    private String name;

    private String description;

    // Opprettelsestidspunkt
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Barn i gruppen
    @OneToMany(mappedBy = "daycareGroup")
    private Set<Child> children = new HashSet<>();

    public DaycareGroup() {}

    public Long getId() {
        return id;
    }

    public Daycare getDaycare() {
        return daycare;
    }

    public void setDaycare(Daycare daycare) {
        this.daycare = daycare;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Set<Child> getChildren() {
        return children;
    }
}
