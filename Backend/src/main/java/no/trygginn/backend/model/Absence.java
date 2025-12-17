package no.trygginn.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Entity som representerer fravær for et barn.
 */
@Entity
@Table(name = "absence")
public class Absence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Barnet fraværet gjelder
    @ManyToOne(optional = false)
    @JoinColumn(name = "child_id")
    private Child child;

    // Brukeren som rapporterte fraværet
    @ManyToOne(optional = false)
    @JoinColumn(name = "reported_by_user_id")
    private User reportedBy;

    // Dato for fraværet
    @Column(nullable = false)
    private LocalDate date;

    // Årsak til fraværet
    @Column(nullable = false)
    private String reason;

    // Eventuell tilleggsinformasjon
    private String note;

    // Tidspunkt for opprettelse
    @Column(name = "created_at", nullable = false)
    private LocalDate createdAt = LocalDate.now();

    public Long getId() {
        return id;
    }

    public Child getChild() {
        return child;
    }

    public void setChild(Child child) {
        this.child = child;
    }

    public User getReportedBy() {
        return reportedBy;
    }

    public void setReportedBy(User reportedBy) {
        this.reportedBy = reportedBy;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }
}
