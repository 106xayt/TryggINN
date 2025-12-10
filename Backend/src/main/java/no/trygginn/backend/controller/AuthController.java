package no.trygginn.backend.controller;

import no.trygginn.backend.controller.dto.LoginRequest;
import no.trygginn.backend.controller.dto.LoginResponse;
import no.trygginn.backend.model.User;
import no.trygginn.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }


    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        User user = authService.login(request.email(), request.password());

        LoginResponse response = new LoginResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name()
        );

        return ResponseEntity.ok(response);
    }
}
