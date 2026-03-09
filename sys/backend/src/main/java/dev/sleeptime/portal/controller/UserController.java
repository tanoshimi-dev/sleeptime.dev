package dev.sleeptime.portal.controller;

import dev.sleeptime.portal.dto.UserProfileResponse;
import dev.sleeptime.portal.dto.UserProfileUpdateRequest;
import dev.sleeptime.portal.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserProfileResponse getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        ensureUserExists(jwt);
        return userService.getProfile(jwt.getSubject());
    }

    @PatchMapping("/me")
    public UserProfileResponse updateMyProfile(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody UserProfileUpdateRequest request) {
        ensureUserExists(jwt);
        return userService.updateProfile(jwt.getSubject(), request);
    }

    private void ensureUserExists(Jwt jwt) {
        userService.findOrCreateUser(
            jwt.getSubject(),
            jwt.getClaimAsString("https://sleeptime.dev/email"),
            jwt.getClaimAsString("name"),
            jwt.getClaimAsString("picture")
        );
    }
}
