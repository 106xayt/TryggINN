package no.trygginn.backend.service;

import no.trygginn.backend.model.Daycare;
import no.trygginn.backend.model.DaycareAccessCode;
import no.trygginn.backend.model.User;
import no.trygginn.backend.model.UserRole;
import no.trygginn.backend.repository.DaycareAccessCodeRepository;
import no.trygginn.backend.repository.DaycareRepository;
import no.trygginn.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;

@Service
public class AccessCodeService {

    private final DaycareAccessCodeRepository accessCodeRepository;
    private final UserRepository userRepository;
    private final DaycareRepository daycareRepository;

    public AccessCodeService(DaycareAccessCodeRepository accessCodeRepository,
                             UserRepository userRepository,
                             DaycareRepository daycareRepository) {
        this.accessCodeRepository = accessCodeRepository;
        this.userRepository = userRepository;
        this.daycareRepository = daycareRepository;
    }


    @Transactional
    public Daycare useAccessCode(String code, Long guardianUserId) {
        DaycareAccessCode accessCode = accessCodeRepository
                .findByCodeAndActiveTrue(code)
                .orElseThrow(() ->
                        new IllegalArgumentException("Ugyldig eller deaktivert kode."));

        LocalDateTime now = LocalDateTime.now();

        if (accessCode.getExpiresAt() != null && accessCode.getExpiresAt().isBefore(now)) {
            throw new IllegalStateException("Koden er utløpt.");
        }

        if (accessCode.getUsedCount() >= accessCode.getMaxUses()) {
            throw new IllegalStateException("Koden er allerede brukt opp.");
        }

        User guardian = userRepository.findById(guardianUserId)
                .orElseThrow(() -> new IllegalArgumentException("Finner ikke bruker."));

        if (guardian.getRole() != UserRole.PARENT) {
            throw new IllegalStateException("Bare foreldre kan bruke barnehagekoder.");
        }

        Daycare daycare = accessCode.getDaycare();


        boolean alreadyLinked = guardian.getDaycares().stream()
                .anyMatch(d -> Objects.equals(d.getId(), daycare.getId()));

        if (!alreadyLinked) {
            guardian.getDaycares().add(daycare);
        }


        accessCode.setUsedCount(accessCode.getUsedCount() + 1);
        if (accessCode.getUsedCount() >= accessCode.getMaxUses()) {
            accessCode.setActive(false);
        }


        userRepository.save(guardian);
        accessCodeRepository.save(accessCode);

        return daycare;
    }


    @Transactional
    public DaycareAccessCode createAccessCode(Long daycareId,
                                              Long createdByUserId,
                                              int maxUses,
                                              LocalDateTime expiresAt) {
        if (maxUses <= 0) {
            throw new IllegalArgumentException("maxUses må være større enn 0.");
        }

        Daycare daycare = daycareRepository.findById(daycareId)
                .orElseThrow(() -> new IllegalArgumentException("Finner ikke barnehage."));

        User creator = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new IllegalArgumentException("Finner ikke bruker."));

        if (creator.getRole() == UserRole.PARENT) {
            throw new IllegalStateException("Foreldre kan ikke lage barnehagekoder.");
        }

        DaycareAccessCode accessCode = new DaycareAccessCode();
        accessCode.setDaycare(daycare);
        accessCode.setCreatedBy(creator);
        accessCode.setMaxUses(maxUses);
        accessCode.setExpiresAt(expiresAt);
        accessCode.setActive(true);

        // 6-tegns kode, A-Z + 0-9
        accessCode.setCode(generateRandomCode());

        return accessCodeRepository.save(accessCode);
    }

    private String generateRandomCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            int idx = (int) (Math.random() * chars.length());
            sb.append(chars.charAt(idx));
        }
        return sb.toString();
    }
}
