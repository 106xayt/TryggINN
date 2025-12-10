package no.trygginn.backend.controller;

import no.trygginn.backend.controller.dto.CreateAccessCodeRequest;
import no.trygginn.backend.controller.dto.CreateAccessCodeResponse;
import no.trygginn.backend.controller.dto.UseAccessCodeRequest;
import no.trygginn.backend.controller.dto.UseAccessCodeResponse;
import no.trygginn.backend.model.Daycare;
import no.trygginn.backend.model.DaycareAccessCode;
import no.trygginn.backend.service.AccessCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/access-codes")
public class AccessCodeController {

    private final AccessCodeService accessCodeService;

    public AccessCodeController(AccessCodeService accessCodeService) {
        this.accessCodeService = accessCodeService;
    }


    @PostMapping("/use")
    public ResponseEntity<UseAccessCodeResponse> useAccessCode(
            @RequestBody UseAccessCodeRequest request
    ) {
        Daycare daycare = accessCodeService.useAccessCode(
                request.code(),
                request.guardianUserId()
        );

        UseAccessCodeResponse response = new UseAccessCodeResponse(
                daycare.getId(),
                daycare.getName(),
                "Koden ble brukt og du er nå koblet til barnehagen."
        );

        return ResponseEntity.ok(response);
    }


    @PostMapping
    public ResponseEntity<CreateAccessCodeResponse> createAccessCode(
            @RequestBody CreateAccessCodeRequest request
    ) {
        int maxUses = request.maxUses() != null ? request.maxUses() : 100;

        DaycareAccessCode accessCode = accessCodeService.createAccessCode(
                request.daycareId(),
                request.createdByUserId(),
                maxUses,
                request.expiresAt()
        );

        CreateAccessCodeResponse response = new CreateAccessCodeResponse(
                accessCode.getCode(),
                accessCode.getDaycare().getId(),
                accessCode.getMaxUses(),
                accessCode.getUsedCount(),
                accessCode.isActive(),
                accessCode.getExpiresAt()
        );

        return ResponseEntity.ok(response);
    }
}
