package no.trygginn.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity som representerer en tilgangskode til en barnehage.
 */
@Entity
@Table(name = "daycare_access_code")
public class DaycareAccessCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Selve tilgangskoden
    @Column(nullable = false, unique = true)
    private String code;

    // Barnehagen koden gjelder
    @ManyToOne(optional = false)
    @JoinColumn(name = "daycare_id")
    private Daycare daycare;

    // Brukeren som opprettet koden
    @ManyToOne(optional = false)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    // Maks antall ganger koden kan brukes
    @Column(name = "max_uses", nullable = false)
    private int maxUses = 100;

    // Antall ganger koden er brukt
    @Column(name = "used_count", nullable = false)
    private int usedCount = 0;

    // Om koden er aktiv
    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    // Tidspunkt for opprettelse
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Utløpstidspunkt (kan være null)
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    public DaycareAccessCode() {}

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Daycare getDaycare() {
        return daycare;
    }

    public void setDaycare(Daycare daycare) {
        this.daycare = daycare;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public int getMaxUses() {
        return maxUses;
    }

    public void setMaxUses(int maxUses) {
        this.maxUses = maxUses;
    }

    public int getUsedCount() {
        return usedCount;
    }

    public void setUsedCount(int usedCount) {
        this.usedCount = usedCount;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
}
