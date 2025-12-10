package no.trygginn.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "absence")
public class Absence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "child_id")
    private Child child;

    @ManyToOne(optional = false)
    @JoinColumn(name = "reported_by_user_id")
    private User reportedBy;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String reason;

    private String note;

    @Column(name = "created_at", nullable = false)
    private LocalDate createdAt = LocalDate.now();

    // Getters & Setters

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
