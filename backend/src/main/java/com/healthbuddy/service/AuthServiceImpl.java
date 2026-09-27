package com.healthbuddy.service;

import com.healthbuddy.dto.request.*;
import com.healthbuddy.dto.response.AuthResponse;
import com.healthbuddy.dto.response.TokenRefreshResponse;
import com.healthbuddy.dto.response.UserResponse;
import com.healthbuddy.entity.*;
import com.healthbuddy.exception.BadRequestException;
import com.healthbuddy.exception.DuplicateResourceException;
import com.healthbuddy.exception.InvalidTokenException;
import com.healthbuddy.exception.ResourceNotFoundException;
import com.healthbuddy.mapper.UserMapper;
import com.healthbuddy.repository.DoctorProfileRepository;
import com.healthbuddy.repository.PatientProfileRepository;
import com.healthbuddy.repository.RefreshTokenRepository;
import com.healthbuddy.repository.RoleRepository;
import com.healthbuddy.repository.UserRepository;
import com.healthbuddy.security.JwtTokenProvider;
import com.healthbuddy.security.SecurityUtils;
import com.healthbuddy.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public AuthResponse registerPatient(PatientRegisterRequest request, String ipAddress, String userAgent) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and Confirm Password do not match");
        }

        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            auditLogService.logEvent(null, request.getEmail(), "REGISTRATION_FAILED", "/api/v1/auth/register/patient", "CONFLICT", ipAddress, userAgent, "Duplicate email registration attempt");
            throw new DuplicateResourceException("An account with email " + request.getEmail() + " already exists");
        }

        Role patientRole = roleRepository.findByName(RoleType.ROLE_PATIENT)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_PATIENT, "Patient role")));

        User user = User.builder()
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phone(request.getPhone())
                .enabled(true)
                .accountNonLocked(true)
                .roles(Set.of(patientRole))
                .build();

        User savedUser = userRepository.save(user);

        PatientProfile patientProfile = PatientProfile.builder()
                .user(savedUser)
                .build();
        patientProfileRepository.save(patientProfile);

        UserPrincipal principal = UserPrincipal.create(savedUser);
        String accessToken = tokenProvider.generateAccessToken(principal);
        RefreshToken refreshToken = createRefreshToken(savedUser);

        auditLogService.logEvent(savedUser.getId(), savedUser.getEmail(), "PATIENT_REGISTRATION", "/api/v1/auth/register/patient", "SUCCESS", ipAddress, userAgent, "Patient successfully registered");

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessExpirationMs() / 1000)
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(RoleType.ROLE_PATIENT.getSimpleName())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse registerDoctor(DoctorRegisterRequest request, String ipAddress, String userAgent) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and Confirm Password do not match");
        }

        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            auditLogService.logEvent(null, request.getEmail(), "REGISTRATION_FAILED", "/api/v1/auth/register/doctor", "CONFLICT", ipAddress, userAgent, "Duplicate email registration attempt");
            throw new DuplicateResourceException("An account with email " + request.getEmail() + " already exists");
        }

        Role doctorRole = roleRepository.findByName(RoleType.ROLE_DOCTOR)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_DOCTOR, "Doctor role")));

        User user = User.builder()
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phone(request.getPhone())
                .enabled(true)
                .accountNonLocked(true)
                .roles(Set.of(doctorRole))
                .build();

        User savedUser = userRepository.save(user);

        DoctorProfile doctorProfile = DoctorProfile.builder()
                .user(savedUser)
                .specialization(request.getSpecialization().trim())
                .qualification(request.getQualification().trim())
                .licenseNumber(request.getLicenseNumber().trim())
                .verificationStatus(DoctorVerificationStatus.PENDING_VERIFICATION)
                .build();
        doctorProfileRepository.save(doctorProfile);

        UserPrincipal principal = UserPrincipal.create(savedUser);
        String accessToken = tokenProvider.generateAccessToken(principal);
        RefreshToken refreshToken = createRefreshToken(savedUser);

        auditLogService.logEvent(savedUser.getId(), savedUser.getEmail(), "DOCTOR_REGISTRATION", "/api/v1/auth/register/doctor", "SUCCESS", ipAddress, userAgent, "Doctor registered with status PENDING_VERIFICATION");

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessExpirationMs() / 1000)
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(RoleType.ROLE_DOCTOR.getSimpleName())
                .verificationStatus(DoctorVerificationStatus.PENDING_VERIFICATION.name())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request, String ipAddress, String userAgent) {
        String email = request.getEmail().trim().toLowerCase();
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );

            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(principal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

            String accessToken = tokenProvider.generateAccessToken(principal);
            RefreshToken refreshToken = createRefreshToken(user);

            String roleName = principal.getAuthorities().stream()
                    .findFirst()
                    .map(a -> a.getAuthority().replace("ROLE_", ""))
                    .orElse("PATIENT");

            String verificationStatus = null;
            if (user.getDoctorProfile() != null) {
                verificationStatus = user.getDoctorProfile().getVerificationStatus().name();
            }

            auditLogService.logEvent(user.getId(), user.getEmail(), "LOGIN_SUCCESS", "/api/v1/auth/login", "SUCCESS", ipAddress, userAgent, "User logged in successfully");

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken.getToken())
                    .tokenType("Bearer")
                    .expiresIn(tokenProvider.getAccessExpirationMs() / 1000)
                    .userId(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(roleName)
                    .verificationStatus(verificationStatus)
                    .build();

        } catch (BadCredentialsException ex) {
            auditLogService.logEvent(null, email, "LOGIN_FAILURE", "/api/v1/auth/login", "UNAUTHORIZED", ipAddress, userAgent, "Invalid email or password");
            throw new BadCredentialsException("Invalid email or password");
        }
    }

    @Override
    @Transactional
    public TokenRefreshResponse refreshToken(RefreshTokenRequest request, String ipAddress, String userAgent) {
        RefreshToken token = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new InvalidTokenException("Refresh token is not recognized"));

        if (token.isRevoked() || token.isExpired()) {
            refreshTokenRepository.delete(token);
            auditLogService.logEvent(token.getUser().getId(), token.getUser().getEmail(), "TOKEN_REFRESH_FAILED", "/api/v1/auth/refresh", "UNAUTHORIZED", ipAddress, userAgent, "Expired or revoked refresh token");
            throw new InvalidTokenException("Refresh token is expired or revoked. Please log in again.");
        }

        User user = token.getUser();
        UserPrincipal principal = UserPrincipal.create(user);
        String newAccessToken = tokenProvider.generateAccessToken(principal);

        return TokenRefreshResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(token.getToken())
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessExpirationMs() / 1000)
                .build();
    }

    @Override
    @Transactional
    public void logout(String refreshToken, String ipAddress, String userAgent) {
        UUID currentUserId = null;
        String email = "ANONYMOUS";
        try {
            UserPrincipal principal = SecurityUtils.getCurrentUserPrincipal();
            currentUserId = principal.getId();
            email = principal.getEmail();
        } catch (Exception ignored) {}

        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenRepository.findByToken(refreshToken).ifPresent(token -> {
                token.setRevoked(true);
                refreshTokenRepository.save(token);
            });
        }

        auditLogService.logEvent(currentUserId, email, "LOGOUT", "/api/v1/auth/logout", "SUCCESS", ipAddress, userAgent, "User logged out");
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request, String ipAddress, String userAgent) {
        UserPrincipal principal = SecurityUtils.getCurrentUserPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            auditLogService.logEvent(user.getId(), user.getEmail(), "PASSWORD_CHANGE_FAILED", "/api/v1/auth/change-password", "BAD_REQUEST", ipAddress, userAgent, "Current password does not match");
            throw new BadRequestException("Current password does not match");
        }

        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new BadRequestException("New password and confirm password do not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Revoke all existing refresh tokens for security
        refreshTokenRepository.deleteByUser(user);

        auditLogService.logEvent(user.getId(), user.getEmail(), "PASSWORD_CHANGE_SUCCESS", "/api/v1/auth/change-password", "SUCCESS", ipAddress, userAgent, "Password changed successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        UserPrincipal principal = SecurityUtils.getCurrentUserPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
        return userMapper.toUserResponse(user);
    }

    private RefreshToken createRefreshToken(User user) {
        // Delete previous tokens for clean session management
        refreshTokenRepository.deleteByUser(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(tokenProvider.getRefreshExpirationMs()))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }
}
