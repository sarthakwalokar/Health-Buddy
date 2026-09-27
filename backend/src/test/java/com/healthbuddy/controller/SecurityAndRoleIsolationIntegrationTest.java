package com.healthbuddy.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthbuddy.dto.request.DoctorRegisterRequest;
import com.healthbuddy.dto.request.DoctorVerificationRequest;
import com.healthbuddy.dto.request.LoginRequest;
import com.healthbuddy.dto.request.PatientRegisterRequest;
import com.healthbuddy.entity.AuditLog;
import com.healthbuddy.entity.DoctorProfile;
import com.healthbuddy.entity.DoctorVerificationStatus;
import com.healthbuddy.entity.Role;
import com.healthbuddy.entity.RoleType;
import com.healthbuddy.entity.User;
import com.healthbuddy.repository.AuditLogRepository;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SecurityAndRoleIsolationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private DoctorProfileRepository doctorProfileRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PatientProfileRepository patientProfileRepository;

    @Autowired
    private com.healthbuddy.repository.MedicalReportRepository medicalReportRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User patientUser;
    private User doctorUser;
    private User adminUser;
    private String patientToken;
    private String doctorToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        refreshTokenRepository.deleteAll();
        medicalReportRepository.deleteAll();
        patientProfileRepository.deleteAll();
        doctorProfileRepository.deleteAll();
        auditLogRepository.deleteAll();
        userRepository.deleteAll();

        Role patientRole = roleRepository.findByName(RoleType.ROLE_PATIENT)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_PATIENT, "Patient")));
        Role doctorRole = roleRepository.findByName(RoleType.ROLE_DOCTOR)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_DOCTOR, "Doctor")));
        Role adminRole = roleRepository.findByName(RoleType.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_ADMIN, "Admin")));

        // 1. Create Patient User
        patientUser = User.builder()
                .email("patient.test@healthbuddy.com")
                .passwordHash(passwordEncoder.encode("Password@123"))
                .fullName("Jane Patient")
                .phone("+1234567890")
                .enabled(true)
                .accountNonLocked(true)
                .roles(Set.of(patientRole))
                .build();
        patientUser = userRepository.save(patientUser);
        patientToken = jwtTokenProvider.generateAccessToken(UserPrincipal.create(patientUser));

        // 2. Create Doctor User
        doctorUser = User.builder()
                .email("doctor.test@healthbuddy.com")
                .passwordHash(passwordEncoder.encode("Password@123"))
                .fullName("Dr. Alex Care")
                .phone("+1234567891")
                .enabled(true)
                .accountNonLocked(true)
                .roles(Set.of(doctorRole))
                .build();
        doctorUser = userRepository.save(doctorUser);

        DoctorProfile docProfile = DoctorProfile.builder()
                .user(doctorUser)
                .specialization("Neurology")
                .qualification("MD, PhD")
                .licenseNumber("NEURO-998877")
                .verificationStatus(DoctorVerificationStatus.PENDING_VERIFICATION)
                .build();
        doctorProfileRepository.save(docProfile);
        doctorToken = jwtTokenProvider.generateAccessToken(UserPrincipal.create(doctorUser));

        // 3. Create Admin User
        adminUser = User.builder()
                .email("admin.test@healthbuddy.com")
                .passwordHash(passwordEncoder.encode("Password@123"))
                .fullName("Root Admin")
                .phone("+1234567892")
                .enabled(true)
                .accountNonLocked(true)
                .roles(Set.of(adminRole))
                .build();
        adminUser = userRepository.save(adminUser);
        adminToken = jwtTokenProvider.generateAccessToken(UserPrincipal.create(adminUser));
    }

    @Test
    @DisplayName("1 & 19: Patient Registration & Password Hashing Verification")
    void testPatientRegistration_And_PasswordHashing() throws Exception {
        PatientRegisterRequest request = PatientRegisterRequest.builder()
                .fullName("New Patient")
                .email("newpatient@healthbuddy.com")
                .phone("+1999888777")
                .password("SecurePass@2026")
                .confirmPassword("SecurePass@2026")
                .build();

        mockMvc.perform(post("/api/v1/auth/register/patient")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("PATIENT"))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty());

        User created = userRepository.findByEmailIgnoreCase("newpatient@healthbuddy.com").orElseThrow();
        assertNotEquals("SecurePass@2026", created.getPasswordHash());
        assertTrue(passwordEncoder.matches("SecurePass@2026", created.getPasswordHash()));
    }

    @Test
    @DisplayName("2 & 21: Doctor Registration & Verification Status PENDING")
    void testDoctorRegistration_And_VerificationStatus() throws Exception {
        DoctorRegisterRequest request = DoctorRegisterRequest.builder()
                .fullName("Dr. Gregory House")
                .email("drhouse@healthbuddy.com")
                .phone("+1999888778")
                .password("SecurePass@2026")
                .confirmPassword("SecurePass@2026")
                .specialization("Diagnostics")
                .qualification("MD")
                .licenseNumber("DIAG-0001")
                .build();

        mockMvc.perform(post("/api/v1/auth/register/doctor")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("DOCTOR"))
                .andExpect(jsonPath("$.data.verificationStatus").value("PENDING_VERIFICATION"));

        User createdDocUser = userRepository.findByEmailIgnoreCase("drhouse@healthbuddy.com").orElseThrow();
        DoctorProfile profile = doctorProfileRepository.findByUser(createdDocUser).orElseThrow();

        assertEquals(DoctorVerificationStatus.PENDING_VERIFICATION, profile.getVerificationStatus());
        assertEquals("DIAG-0001", profile.getLicenseNumber());
        assertEquals("Diagnostics", profile.getSpecialization());
    }

    @Test
    @DisplayName("3: Duplicate Email Registration Returns 409 Conflict")
    void testDuplicateEmailRegistration() throws Exception {
        PatientRegisterRequest duplicateRequest = PatientRegisterRequest.builder()
                .fullName("Jane Duplicate")
                .email("patient.test@healthbuddy.com") // Already in DB
                .password("SecurePass@2026")
                .confirmPassword("SecurePass@2026")
                .build();

        mockMvc.perform(post("/api/v1/auth/register/patient")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message", containsString("already exists")));
    }

    @Test
    @DisplayName("4: Password Validation Constraint Rejection (400 Bad Request)")
    void testPasswordValidationConstraints() throws Exception {
        PatientRegisterRequest weakPasswordRequest = PatientRegisterRequest.builder()
                .fullName("Weak Password User")
                .email("weak@healthbuddy.com")
                .password("weak") // Does not meet length or complexity criteria
                .confirmPassword("weak")
                .build();

        mockMvc.perform(post("/api/v1/auth/register/patient")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(weakPasswordRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.validationErrors.password").isNotEmpty());
    }

    @Test
    @DisplayName("5, 6, 7: Login for Patient, Doctor, and Admin")
    void testLoginForAllRoles() throws Exception {
        // Patient Login
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("patient.test@healthbuddy.com", "Password@123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("PATIENT"));

        // Doctor Login
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("doctor.test@healthbuddy.com", "Password@123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("DOCTOR"));

        // Admin Login
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("admin.test@healthbuddy.com", "Password@123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("ADMIN"));
    }

    @Test
    @DisplayName("8: Incorrect Password Returns 401 Unauthorized")
    void testIncorrectPassword() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("patient.test@healthbuddy.com", "WrongPassword!"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message", containsString("Invalid email or password")));
    }

    @Test
    @DisplayName("9: Invalid JWT Returns 401 Unauthorized")
    void testInvalidJWT() throws Exception {
        mockMvc.perform(get("/api/v1/patient/profile")
                        .header("Authorization", "Bearer invalid.fake.token.xyz"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("11: Patient Accessing Patient Endpoint → SUCCESS (200)")
    void testPatientAccessingPatientEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/patient/profile")
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("patient.test@healthbuddy.com"));
    }

    @Test
    @DisplayName("12: Doctor Accessing Doctor Endpoint → SUCCESS (200)")
    void testDoctorAccessingDoctorEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/doctor/dashboard")
                        .header("Authorization", "Bearer " + doctorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.specialization").value("Neurology"));
    }

    @Test
    @DisplayName("13: Admin Accessing Admin Endpoint → SUCCESS (200)")
    void testAdminAccessingAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("admin.test@healthbuddy.com"));
    }

    @Test
    @DisplayName("14: Patient Accessing Doctor Endpoint → MUST FAIL (403 Forbidden)")
    void testPatientAccessingDoctorEndpoint_Fails() throws Exception {
        mockMvc.perform(get("/api/v1/doctor/dashboard")
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("15: Patient Accessing Admin Endpoint → MUST FAIL (403 Forbidden)")
    void testPatientAccessingAdminEndpoint_Fails() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard")
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("16: Doctor Accessing Patient Endpoint → MUST FAIL (403 Forbidden)")
    void testDoctorAccessingPatientEndpoint_Fails() throws Exception {
        mockMvc.perform(get("/api/v1/patient/profile")
                        .header("Authorization", "Bearer " + doctorToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("17: Doctor Accessing Admin Endpoint → MUST FAIL (403 Forbidden)")
    void testDoctorAccessingAdminEndpoint_Fails() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard")
                        .header("Authorization", "Bearer " + doctorToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("18: Unauthenticated Access → MUST FAIL (401 Unauthorized)")
    void testUnauthenticatedAccess_Fails() throws Exception {
        mockMvc.perform(get("/api/v1/patient/profile"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/doctor/profile"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/admin/dashboard"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("20: Logout Endpoint Behavior")
    void testLogoutBehavior() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("Logged out successfully")));
    }

    @Test
    @DisplayName("22: Unauthorized Access Attempt Triggers Audit Logging")
    void testUnauthorizedAccessAuditLogging() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + patientToken))
                .andExpect(status().isForbidden());

        List<AuditLog> auditLogs = auditLogRepository.findAll();
        boolean hasUnauthorizedLog = auditLogs.stream()
                .anyMatch(log -> "UNAUTHORIZED_ACCESS_ATTEMPT".equals(log.getAction()) && 
                                 "FORBIDDEN".equals(log.getStatus()));

        assertTrue(hasUnauthorizedLog, "Expected UNAUTHORIZED_ACCESS_ATTEMPT to be recorded in audit_logs");
    }

    @Test
    @DisplayName("Health Check: GET /api/v1/health")
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("Health Buddy API"))
                .andExpect(jsonPath("$.database").value("CONNECTED"));
    }
}
