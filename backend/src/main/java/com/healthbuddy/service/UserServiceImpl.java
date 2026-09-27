package com.healthbuddy.service;

import com.healthbuddy.dto.response.UserResponse;
import com.healthbuddy.entity.User;
import com.healthbuddy.exception.ResourceNotFoundException;
import com.healthbuddy.mapper.UserMapper;
import com.healthbuddy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public User getUserEntityById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserEntityByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID userId) {
        User user = getUserEntityById(userId);
        return userMapper.toUserResponse(user);
    }
}
