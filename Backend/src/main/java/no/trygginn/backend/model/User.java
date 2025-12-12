package no.trygginn.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(unique = true)
    private String email;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "external_auth_id")
    private String externalAuthId;

    @Column(name = "auth_provider")
    private String authProvider;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Forelder -> barn
    @ManyToMany
    @JoinTable(
            name = "guardians_children",
            joinColumns = @JoinColumn(name = "guardian_id"),
            inverseJoinColumns = @JoinColumn(name = "child_id")
    )
    private Set<Child> children = new HashSet<>();

    // Forelder -> barnehage
    @ManyToMany
    @JoinTable(
            name = "guardians_daycare",
            joinColumns = @JoinColumn(name = "guardian_id"),
            inverseJoinColumns = @JoinColumn(name = "daycare_id")
    )
    private Set<Daycare> daycares = new HashSet<>();

    @OneToMany(mappedBy = "createdBy")
    private Set<DaycareAccessCode> createdAccessCodes = new HashSet<>();

    // Ansatt/forelder -> attendance-events de har registrert
    @OneToMany(mappedBy = "performedBy")
    private Set<Attendance> attendanceEvents = new HashSet<>();

    public User() {}

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getExternalAuthId() {
        return externalAuthId;
    }

    public void setExternalAuthId(String externalAuthId) {
        this.externalAuthId = externalAuthId;
    }

    public String getAuthProvider() {
        return authProvider;
    }

    public void setAuthProvider(String authProvider) {
        this.authProvider = authProvider;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Set<Child> getChildren() {
        return children;
    }

    public Set<Daycare> getDaycares() {
        return daycares;
    }

    public Set<DaycareAccessCode> getCreatedAccessCodes() {
        return createdAccessCodes;
    }

    public Set<Attendance> getAttendanceEvents() {
        return attendanceEvents;
    }
}
