package com.healthbuddy.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthbuddy.dto.response.ErrorResponse;
import com.healthbuddy.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;
    private final AuditLogService auditLogService;

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication != null ? authentication.getName() : "ANONYMOUS";
        UUID userId = null;

        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            userId = principal.getId();
        }

        log.warn("Access Denied for user [{}] attempting to access [{}]", userEmail, request.getRequestURI());

        // Audit Log Unauthorized Access Attempt
        try {
            auditLogService.logEvent(
                    userId,
                    userEmail,
                    "UNAUTHORIZED_ACCESS_ATTEMPT",
                    request.getRequestURI(),
                    "FORBIDDEN",
                    request.getRemoteAddr(),
                    request.getHeader("User-Agent"),
                    "User attempted to access restricted resource without required role privileges"
            );
        } catch (Exception e) {
            log.error("Failed to persist unauthorized access audit log", e);
        }

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .success(false)
                .status(HttpStatus.FORBIDDEN.value())
                .error(HttpStatus.FORBIDDEN.getReasonPhrase())
                .message("Access Denied: You do not have the required permissions or role to access this resource")
                .path(request.getRequestURI())
                .timestamp(Instant.now())
                .build();

        objectMapper.writeValue(response.getOutputStream(), errorResponse);
    }
}
