package com.healthbuddy.repository;

import com.healthbuddy.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    Page<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);
    List<AuditLog> findByUserIdOrderByTimestampDesc(UUID userId);
    List<AuditLog> findByActionOrderByTimestampDesc(String action);
}
