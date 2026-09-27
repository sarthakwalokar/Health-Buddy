package com.healthbuddy.service;

import com.healthbuddy.entity.AuditLog;
import com.healthbuddy.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional
    public void logEvent(UUID userId, String userEmail, String action, String resource, String status, String ipAddress, String userAgent, String details) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userId(userId)
                    .userEmail(userEmail)
                    .action(action)
                    .resource(resource)
                    .status(status)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .details(details)
                    .timestamp(Instant.now())
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit log recorded: action={}, user={}, status={}", action, userEmail, status);
        } catch (Exception e) {
            log.error("Failed to write audit log entry: {}", e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLog> getAllAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByUser(UUID userId) {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }
}
