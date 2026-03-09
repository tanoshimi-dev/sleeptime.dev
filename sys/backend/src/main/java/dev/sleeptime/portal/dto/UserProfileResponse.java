package dev.sleeptime.portal.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UserProfileResponse(
    UUID id,
    String auth0Sub,
    String email,
    String displayName,
    String avatarUrl,
    String role,
    String locale,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
