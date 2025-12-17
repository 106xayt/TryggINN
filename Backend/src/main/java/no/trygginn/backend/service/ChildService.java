package no.trygginn.backend.service;

import no.trygginn.backend.controller.dto.CreateChildRequest;
import no.trygginn.backend.model.Child;
import no.trygginn.backend.model.Daycare;
import no.trygginn.backend.model.DaycareGroup;
import no.trygginn.backend.model.User;
import no.trygginn.backend.model.UserRole;
import no.trygginn.backend.repository.ChildRepository;
import no.trygginn.backend.repository.DaycareGroupRepository;
import no.trygginn.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for håndtering av barn.
 */
@Service
public class ChildService {

    private final ChildRepository childRepository;
    private final UserRepository userRepository;
    private final DaycareGroupRepository daycareGroupRepository;

    public ChildService(
            ChildRepository childRepository,
            UserRepository userRepository,
            DaycareGroupRepository daycareGroupRepository
    ) {
        this.childRepository = childRepository;
        this.userRepository = userRepository;
        this.daycareGroupRepository = daycareGroupRepository;
    }

    /**
     * Oppretter et nytt barn og knytter det til foresatt og barnehagegruppe.
     */
    @Transactional
    public Child createChild(CreateChildRequest request) {

        User creator = userRepository.findById(request.createdByUserId())
                .orElseThrow(() -> new IllegalArgumentException("Finner ikke opprettet-av bruker."));

        // Foreldre kan ikke registrere barn
        if (creator.getRole() == UserRole.PARENT) {
            throw new IllegalStateException("Foreldre kan ikke registrere barn.");
        }

        User guardian = userRepository.findById(request.guardianUserId())
                .orElseThrow(() -> new IllegalArgumentException("Finner ikke forelder."));

        if (guardian.getRole() != UserRole.PARENT) {
            throw new IllegalStateException("Barn må knyttes til en forelder (rolle PARENT).");
        }

        DaycareGroup group = daycareGroupRepository.findById(request.daycareGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Finner ikke barnehagegruppe."));

        Daycare daycare = group.getDaycare();

        // Sjekker at foresatt er koblet til barnehagen
        boolean guardianLinkedToDaycare =
                userRepository.isGuardianLinkedToDaycare(guardian.getId(), daycare.getId());

        if (!guardianLinkedToDaycare) {
            throw new IllegalStateException("Forelder er ikke koblet til denne barnehagen.");
        }

        Child child = new Child();
        child.setFirstName(request.firstName());
        child.setLastName(request.lastName());
        child.setDateOfBirth(request.dateOfBirth());
        child.setDaycareGroup(group);
        child.setActive(true);

        // Kobler barn og foresatt
        child.getGuardians().add(guardian);
        guardian.getChildren().add(child);

        Child saved = childRepository.save(child);
        userRepository.save(guardian);

        return saved;
    }

    /**
     * Henter alle barn for en foresatt.
     */
    @Transactional(readOnly = true)
    public List<Child> getChildrenForGuardian(Long guardianUserId) {
        return childRepository.findByGuardians_Id(guardianUserId);
    }

    /**
     * Henter barn basert på ID.
     */
    @Transactional(readOnly = true)
    public Child getChildById(Long childId) {
        return childRepository.findById(childId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Finner ikke barn med id " + childId));
    }

    /**
     * Oppdaterer helse- og tilleggsinformasjon for barn.
     */
    @Transactional
    public Child updateChildDetails(
            Long childId,
            String allergies,
            String medications,
            String favoriteFood
    ) {
        Child child = getChildById(childId);

        child.setAllergies(allergies);
        child.setMedications(medications);
        child.setFavoriteFood(favoriteFood);

        return childRepository.save(child);
    }

    /**
     * Oppdaterer internt notat for et barn.
     */
    @Transactional
    public Child updateChildNote(Long childId, String note) {
        Child child = getChildById(childId);
        child.setNote(note);
        return childRepository.save(child);
    }
}
