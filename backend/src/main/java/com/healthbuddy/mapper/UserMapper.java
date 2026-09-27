package com.healthbuddy.mapper;

import com.healthbuddy.dto.response.UserResponse;
import com.healthbuddy.entity.Role;
import com.healthbuddy.entity.User;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserResponse toUserResponse(User user) {
        if (user == null) return null;

        UserResponse.UserResponseBuilder builder = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .roles(user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .collect(Collectors.toSet()));

        if (user.getDoctorProfile() != null) {
            builder.verificationStatus(user.getDoctorProfile().getVerificationStatus().name());
            builder.specialization(user.getDoctorProfile().getSpecialization());
        }

        return builder.build();
    }
}
