package no.trygginn.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "daycare")
public class Daycare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "org_number", unique = true, nullable = false)
    private String orgNumber;


    private String address;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "daycare")
    private Set<DaycareGroup> groups = new HashSet<>();

    @ManyToMany(mappedBy = "daycares")
    private Set<User> guardians = new HashSet<>();

    @OneToMany(mappedBy = "daycare")
    private Set<DaycareAccessCode> accessCodes = new HashSet<>();

    public Daycare() {}

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOrgNumber() {
        return orgNumber;
    }

    public void setOrgNumber(String orgNumber) {
        this.orgNumber = orgNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Set<DaycareGroup> getGroups() {
        return groups;
    }

    public Set<User> getGuardians() {
        return guardians;
    }

    public Set<DaycareAccessCode> getAccessCodes() {
        return accessCodes;
    }
}
