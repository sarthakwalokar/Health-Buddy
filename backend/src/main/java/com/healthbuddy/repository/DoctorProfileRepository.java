package com.healthbuddy.repository;

import com.healthbuddy.entity.DoctorProfile;
import com.healthbuddy.entity.DoctorVerificationStatus;
import com.healthbuddy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, UUID> {
    Optional<DoctorProfile> findByUser(User user);
    Optional<DoctorProfile> findByUserId(UUID userId);
    List<DoctorProfile> findByVerificationStatus(DoctorVerificationStatus status);
}
