package no.trygginn.backend.repository;

import no.trygginn.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    @Query("""
        select (count(d) > 0)
        from User u
        join u.daycares d
        where u.id = :guardianId and d.id = :daycareId
    """)
    boolean isGuardianLinkedToDaycare(@Param("guardianId") Long guardianId,
                                      @Param("daycareId") Long daycareId);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
