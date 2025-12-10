package no.trygginn.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "daycare_group")
public class DaycareGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "daycare_id")
    private Daycare daycare;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

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
