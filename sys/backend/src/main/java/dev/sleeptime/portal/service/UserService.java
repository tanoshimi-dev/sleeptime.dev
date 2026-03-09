package dev.sleeptime.portal.service;

import dev.sleeptime.portal.dto.UserProfileResponse;
import dev.sleeptime.portal.dto.UserProfileUpdateRequest;
import dev.sleeptime.portal.entity.User;
import dev.sleeptime.portal.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User findOrCreateUser(String auth0Sub, String email, String name, String picture) {
        return userRepository.findByAuth0Sub(auth0Sub)
            .orElseGet(() -> {
                User user = new User();
                user.setAuth0Sub(auth0Sub);
                user.setEmail(email);
                user.setDisplayName(name);
                user.setAvatarUrl(picture);
                return userRepository.save(user);
            });
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String auth0Sub) {
        User user = userRepository.findByAuth0Sub(auth0Sub)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return toResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(String auth0Sub, UserProfileUpdateRequest request) {
        User user = userRepository.findByAuth0Sub(auth0Sub)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.displayName() != null) {
            user.setDisplayName(request.displayName());
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl());
        }
        if (request.locale() != null) {
            user.setLocale(request.locale());
        }

        user = userRepository.save(user);
        return toResponse(user);
    }

    private UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(
            user.getId(),
            user.getAuth0Sub(),
            user.getEmail(),
            user.getDisplayName(),
            user.getAvatarUrl(),
            user.getRole(),
            user.getLocale(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}
