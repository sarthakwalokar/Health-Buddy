package com.healthbuddy.service;

import com.healthbuddy.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface AuditLogService {
    void logEvent(UUID userId, String userEmail, String action, String resource, String status, String ipAddress, String userAgent, String details);
    Page<AuditLog> getAllAuditLogs(Pageable pageable);
    List<AuditLog> getAuditLogsByUser(UUID userId);
}
