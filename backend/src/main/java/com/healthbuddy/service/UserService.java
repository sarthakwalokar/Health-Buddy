package com.healthbuddy.service;

import com.healthbuddy.dto.response.UserResponse;
import com.healthbuddy.entity.User;

import java.util.UUID;

public interface UserService {
    User getUserEntityById(UUID userId);
    User getUserEntityByEmail(String email);
    UserResponse getUserById(UUID userId);
}
