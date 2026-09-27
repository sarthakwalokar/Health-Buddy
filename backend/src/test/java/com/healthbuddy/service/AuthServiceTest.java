package com.healthbuddy.service;

import com.healthbuddy.dto.request.DoctorRegisterRequest;
import com.healthbuddy.dto.request.LoginRequest;
import com.healthbuddy.dto.request.PatientRegisterRequest;
import com.healthbuddy.dto.response.AuthResponse;
import com.healthbuddy.entity.*;
import com.healthbuddy.exception.BadRequestException;
import com.healthbuddy.exception.DuplicateResourceException;
import com.healthbuddy.mapper.UserMapper;
import com.healthbuddy.repository.DoctorProfileRepository;
import com.healthbuddy.repository.PatientProfileRepository;
import com.healthbuddy.repository.RefreshTokenRepository;
import com.healthbuddy.repository.RoleRepository;
import com.healthbuddy.repository.UserRepository;
import com.healthbuddy.security.JwtTokenProvider;
import com.healthbuddy.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private PatientProfileRepository patientProfileRepository;
    @Mock
    private DoctorProfileRepository doctorProfileRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider tokenProvider;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UserMapper userMapper;
    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AuthServiceImpl authService;

    private Role patientRole;
    private Role doctorRole;
    private User testPatient;
    private User testDoctor;

    @BeforeEach
    void setUp() {
        patientRole = new Role(1L, RoleType.ROLE_PATIENT, "Patient");
        doctorRole = new Role(2L, RoleType.ROLE_DOCTOR, "Doctor");

        testPatient = User.builder()
                .id(UUID.randomUUID())
                .email("patient@test.com")
                .fullName("John Doe")
                .passwordHash("encodedPassword")
                .roles(Set.of(patientRole))
                .build();

        testDoctor = User.builder()
                .id(UUID.randomUUID())
                .email("doctor@test.com")
                .fullName("Dr. Sarah Smith")
                .passwordHash("encodedPassword")
                .roles(Set.of(doctorRole))
                .build();
    }

    @Test
    @DisplayName("Test 1: Patient registration successful")
    void registerPatient_Success() {
        PatientRegisterRequest request = PatientRegisterRequest.builder()
                .fullName("John Doe")
                .email("patient@test.com")
                .phone("+1234567890")
                .password("Password@123")
                .confirmPassword("Password@123")
                .build();

        when(userRepository.existsByEmailIgnoreCase(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashedPassword");
        when(roleRepository.findByName(RoleType.ROLE_PATIENT)).thenReturn(Optional.of(patientRole));
        when(userRepository.save(any(User.class))).thenReturn(testPatient);
        when(tokenProvider.generateAccessToken(any(UserPrincipal.class))).thenReturn("mock-jwt-token");
        when(tokenProvider.getAccessExpirationMs()).thenReturn(900000L);
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(
                RefreshToken.builder().token("mock-refresh-token").expiryDate(Instant.now().plusSeconds(3600)).build()
        );

        AuthResponse response = authService.registerPatient(request, "127.0.0.1", "JUnit-Agent");

        assertNotNull(response);
        assertEquals("patient@test.com", response.getEmail());
        assertEquals("PATIENT", response.getRole());
        assertEquals("mock-jwt-token", response.getAccessToken());
        verify(passwordEncoder, times(1)).encode("Password@123");
        verify(patientProfileRepository, times(1)).save(any(PatientProfile.class));
    }

    @Test
    @DisplayName("Test 2: Doctor registration creates PENDING_VERIFICATION")
    void registerDoctor_Success() {
        DoctorRegisterRequest request = DoctorRegisterRequest.builder()
                .fullName("Dr. Sarah Smith")
                .email("doctor@test.com")
                .phone("+1234567890")
                .password("Password@123")
                .confirmPassword("Password@123")
                .specialization("Cardiology")
                .qualification("MD, DM")
                .licenseNumber("MED-12345")
                .build();

        when(userRepository.existsByEmailIgnoreCase(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashedPassword");
        when(roleRepository.findByName(RoleType.ROLE_DOCTOR)).thenReturn(Optional.of(doctorRole));
        when(userRepository.save(any(User.class))).thenReturn(testDoctor);
        when(tokenProvider.generateAccessToken(any(UserPrincipal.class))).thenReturn("mock-doctor-jwt");
        when(tokenProvider.getAccessExpirationMs()).thenReturn(900000L);
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(
                RefreshToken.builder().token("mock-refresh-token").expiryDate(Instant.now().plusSeconds(3600)).build()
        );

        AuthResponse response = authService.registerDoctor(request, "127.0.0.1", "JUnit-Agent");

        assertNotNull(response);
        assertEquals("doctor@test.com", response.getEmail());
        assertEquals("DOCTOR", response.getRole());
        assertEquals("PENDING_VERIFICATION", response.getVerificationStatus());
        verify(doctorProfileRepository, times(1)).save(argThat(p -> 
            p.getVerificationStatus() == DoctorVerificationStatus.PENDING_VERIFICATION &&
            p.getLicenseNumber().equals("MED-12345")
        ));
    }

    @Test
    @DisplayName("Test 3: Duplicate email registration fails")
    void register_DuplicateEmail_ThrowsException() {
        PatientRegisterRequest request = PatientRegisterRequest.builder()
                .fullName("Duplicate User")
                .email("existing@test.com")
                .password("Password@123")
                .confirmPassword("Password@123")
                .build();

        when(userRepository.existsByEmailIgnoreCase("existing@test.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> 
                authService.registerPatient(request, "127.0.0.1", "JUnit-Agent"));
    }

    @Test
    @DisplayName("Test 4: Password mismatch validation fails")
    void register_PasswordMismatch_ThrowsException() {
        PatientRegisterRequest request = PatientRegisterRequest.builder()
                .fullName("Mismatch User")
                .email("mismatch@test.com")
                .password("Password@123")
                .confirmPassword("Password@999")
                .build();

        assertThrows(BadRequestException.class, () -> 
                authService.registerPatient(request, "127.0.0.1", "JUnit-Agent"));
    }

    @Test
    @DisplayName("Test 5 & 8: Login bad credentials throws BadCredentialsException")
    void login_InvalidPassword_ThrowsBadCredentials() {
        LoginRequest request = new LoginRequest("patient@test.com", "WrongPassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> 
                authService.login(request, "127.0.0.1", "JUnit-Agent"));

        verify(auditLogService, times(1)).logEvent(
                isNull(), eq("patient@test.com"), eq("LOGIN_FAILURE"), anyString(), eq("UNAUTHORIZED"), anyString(), anyString(), anyString()
        );
    }

    @Test
    @DisplayName("Test 19: Password hashing never stores plaintext")
    void passwordHashing_Verification() {
        PatientRegisterRequest request = PatientRegisterRequest.builder()
                .fullName("Security Check")
                .email("security@test.com")
                .password("PlaintextSecret123!")
                .confirmPassword("PlaintextSecret123!")
                .build();

        when(userRepository.existsByEmailIgnoreCase(any())).thenReturn(false);
        when(passwordEncoder.encode("PlaintextSecret123!")).thenReturn("$2a$12$e0MYz4/EncodedBCryptHash");
        when(roleRepository.findByName(RoleType.ROLE_PATIENT)).thenReturn(Optional.of(patientRole));
        when(userRepository.save(any(User.class))).thenReturn(testPatient);
        when(tokenProvider.generateAccessToken(any())).thenReturn("token");
        when(tokenProvider.getAccessExpirationMs()).thenReturn(900000L);
        when(refreshTokenRepository.save(any())).thenReturn(RefreshToken.builder().token("r-token").expiryDate(Instant.now()).build());

        authService.registerPatient(request, "127.0.0.1", "JUnit-Agent");

        verify(userRepository).save(argThat(user -> 
            !user.getPasswordHash().equals("PlaintextSecret123!") &&
            user.getPasswordHash().startsWith("$2a$12$")
        ));
    }
}
