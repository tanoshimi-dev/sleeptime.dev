package dev.sleeptime.portal.dto;

public record UserProfileUpdateRequest(
    String displayName,
    String avatarUrl,
    String locale
) {}
