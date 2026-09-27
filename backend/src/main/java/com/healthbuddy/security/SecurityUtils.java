package com.healthbuddy.security;

import com.healthbuddy.entity.RoleType;
import com.healthbuddy.exception.ForbiddenException;
import com.healthbuddy.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static UserPrincipal getCurrentUserPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UserPrincipal)) {
            throw new UnauthorizedException("User is not authenticated");
        }

        return (UserPrincipal) authentication.getPrincipal();
    }

    public static UUID getCurrentUserId() {
        return getCurrentUserPrincipal().getId();
    }

    public static String getCurrentUserEmail() {
        return getCurrentUserPrincipal().getEmail();
    }

    public static boolean hasRole(RoleType roleType) {
        UserPrincipal principal = getCurrentUserPrincipal();
        return principal.hasRole(roleType.name());
    }

    public static void validateOwnership(UUID resourceOwnerUserId) {
        UUID currentUserId = getCurrentUserId();
        if (!currentUserId.equals(resourceOwnerUserId)) {
            throw new ForbiddenException("You are not authorized to access or modify this resource");
        }
    }
}
