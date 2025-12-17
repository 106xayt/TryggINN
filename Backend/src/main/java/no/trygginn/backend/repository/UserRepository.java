package no.trygginn.backend.repository;

import no.trygginn.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * Repository for brukere.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Sjekker om en foresatt er knyttet til en barnehage.
     */
    @Query("""
        select (count(d) > 0)
        from User u
        join u.daycares d
        where u.id = :guardianId and d.id = :daycareId
    """)
    boolean isGuardianLinkedToDaycare(
            @Param("guardianId") Long guardianId,
            @Param("daycareId") Long daycareId
    );

    /**
     * Henter bruker basert på e-postadresse.
     */
    Optional<User> findByEmail(String email);

    /**
     * Sjekker om e-postadresse allerede er i bruk.
     */
    boolean existsByEmail(String email);
}
