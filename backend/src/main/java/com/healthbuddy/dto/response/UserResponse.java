package com.healthbuddy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String email;
    private String fullName;
    private String phone;
    private Set<String> roles;
    private boolean enabled;
    private Instant createdAt;
    
    // Role-specific summary
    private String verificationStatus; // For doctors
    private String specialization;     // For doctors
}
