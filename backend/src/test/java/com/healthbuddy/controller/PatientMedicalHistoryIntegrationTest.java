package com.healthbuddy.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthbuddy.dto.request.*;
import com.healthbuddy.entity.*;
import com.healthbuddy.repository.*;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class PatientMedicalHistoryIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PatientProfileRepository patientProfileRepository;

    @Autowired
    private PatientAllergyRepository allergyRepository;

    @Autowired
    private PatientConditionRepository conditionRepository;

    @Autowired
    private PatientSurgeryRepository surgeryRepository;

    @Autowired
    private PatientFamilyHistoryRepository familyHistoryRepository;

    @Autowired
    private PatientLifestyleRepository lifestyleRepository;

    @Autowired
    private PatientHealthGoalRepository healthGoalRepository;

    @Autowired
    private com.healthbuddy.repository.MedicalReportRepository medicalReportRepository;

    @Autowired
    private com.healthbuddy.repository.HealthMeasurementRepository measurementRepository;

    @Autowired
    private com.healthbuddy.repository.HealthAlertRepository alertRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User patientA;
    private User patientB;
    private User doctorUser;
    private PatientProfile profileA;
    private PatientProfile profileB;
    private String tokenPatientA;
    private String tokenPatientB;
    private String tokenDoctor;

    @BeforeEach
    void setUp() {
        alertRepository.deleteAll();
        measurementRepository.deleteAll();
        healthGoalRepository.deleteAll();
        lifestyleRepository.deleteAll();
        familyHistoryRepository.deleteAll();
        surgeryRepository.deleteAll();
        conditionRepository.deleteAll();
        allergyRepository.deleteAll();
        medicalReportRepository.deleteAll();
        patientProfileRepository.deleteAll();
        auditLogRepository.deleteAll();
        userRepository.deleteAll();

        Role patientRole = roleRepository.findByName(RoleType.ROLE_PATIENT)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_PATIENT, "Patient")));
        Role doctorRole = roleRepository.findByName(RoleType.ROLE_DOCTOR)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_DOCTOR, "Doctor")));

        // 1. Patient A
        patientA = User.builder()
                .email("alice.patient@test.com")
                .passwordHash(passwordEncoder.encode("Password@123"))
                .fullName("Alice Johnson")
                .roles(Set.of(patientRole))
                .enabled(true)
                .accountNonLocked(true)
                .build();
        patientA = userRepository.save(patientA);
        profileA = patientProfileRepository.save(PatientProfile.builder().user(patientA).build());
        tokenPatientA = jwtTokenProvider.generateAccessToken(UserPrincipal.create(patientA));

        // 2. Patient B
        patientB = User.builder()
                .email("bob.patient@test.com")
                .passwordHash(passwordEncoder.encode("Password@123"))
                .fullName("Bob Miller")
                .roles(Set.of(patientRole))
                .enabled(true)
                .accountNonLocked(true)
                .build();
        patientB = userRepository.save(patientB);
        profileB = patientProfileRepository.save(PatientProfile.builder().user(patientB).build());
        tokenPatientB = jwtTokenProvider.generateAccessToken(UserPrincipal.create(patientB));

        // 3. Doctor
        doctorUser = User.builder()
                .email("dr.brown@test.com")
                .passwordHash(passwordEncoder.encode("Password@123"))
                .fullName("Dr. Emmet Brown")
                .roles(Set.of(doctorRole))
                .enabled(true)
                .accountNonLocked(true)
                .build();
        doctorUser = userRepository.save(doctorUser);
        tokenDoctor = jwtTokenProvider.generateAccessToken(UserPrincipal.create(doctorUser));
    }

    @Test
    @DisplayName("Phase 3 - 1: Retrieve and Update Patient Profile Demographics with Completion %")
    void testPatientProfile_GetAndUpdate() throws Exception {
        UpdatePatientProfileRequest updateRequest = UpdatePatientProfileRequest.builder()
                .dateOfBirth(LocalDate.of(1990, 5, 15))
                .gender("Female")
                .bloodGroup("O+")
                .heightCm(BigDecimal.valueOf(168.5))
                .weightKg(BigDecimal.valueOf(62.0))
                .occupation("Software Engineer")
                .maritalStatus("Single")
                .emergencyContactName("Mark Johnson")
                .emergencyContactPhone("+15551234567")
                .emergencyContactRelationship("Brother")
                .addressLine("123 Health Ave")
                .city("San Francisco")
                .state("CA")
                .postalCode("94102")
                .country("USA")
                .build();

        mockMvc.perform(put("/api/v1/patient/profile")
                        .header("Authorization", "Bearer " + tokenPatientA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.gender").value("Female"))
                .andExpect(jsonPath("$.data.bloodGroup").value("O+"))
                .andExpect(jsonPath("$.data.heightCm").value(168.5))
                .andExpect(jsonPath("$.data.weightKg").value(62.0))
                .andExpect(jsonPath("$.data.completionPercentage").value(greaterThan(50)));

        // Verify GET returns the updated profile
        mockMvc.perform(get("/api/v1/patient/profile")
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("alice.patient@test.com"))
                .andExpect(jsonPath("$.data.city").value("San Francisco"));
    }

    @Test
    @DisplayName("Phase 3 - 2: Allergy CRUD and Cross-Patient Access Prevention")
    void testAllergy_CRUD_And_CrossPatientProtection() throws Exception {
        // 1. Patient A creates an allergy
        CreateAllergyRequest createReq = CreateAllergyRequest.builder()
                .allergen("Penicillin")
                .reaction("Anaphylactic rash")
                .severity(AllergySeverity.SEVERE)
                .status(AllergyStatus.ACTIVE)
                .notes("Discovered during childhood dental procedure")
                .build();

        String responseBody = mockMvc.perform(post("/api/v1/patient/allergies")
                        .header("Authorization", "Bearer " + tokenPatientA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.allergen").value("Penicillin"))
                .andExpect(jsonPath("$.data.severity").value("SEVERE"))
                .andReturn().getResponse().getContentAsString();

        UUID allergyId = UUID.fromString(objectMapper.readTree(responseBody).get("data").get("id").asText());

        // 2. Patient A retrieves list containing Penicillin
        mockMvc.perform(get("/api/v1/patient/allergies")
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].allergen").value("Penicillin"));

        // 3. SECURITY: Patient B tries to UPDATE Patient A's allergy -> MUST FAIL (404 / Forbidden)
        UpdateAllergyRequest updateReq = UpdateAllergyRequest.builder()
                .reaction("Hacked reaction")
                .build();

        mockMvc.perform(put("/api/v1/patient/allergies/" + allergyId)
                        .header("Authorization", "Bearer " + tokenPatientB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isNotFound());

        // 4. SECURITY: Patient B tries to DELETE Patient A's allergy -> MUST FAIL (404)
        mockMvc.perform(delete("/api/v1/patient/allergies/" + allergyId)
                        .header("Authorization", "Bearer " + tokenPatientB))
                .andExpect(status().isNotFound());

        // 5. Patient A deletes their own allergy -> SUCCESS
        mockMvc.perform(delete("/api/v1/patient/allergies/" + allergyId)
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isOk());

        // 6. Verify empty list
        mockMvc.perform(get("/api/v1/patient/allergies")
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    @DisplayName("Phase 3 - 3: Chronic Conditions CRUD & Clinical Provenance Labels")
    void testConditions_CRUD_And_Provenance() throws Exception {
        CreateConditionRequest conditionReq = CreateConditionRequest.builder()
                .conditionName("Hypertension")
                .diagnosedDate(LocalDate.of(2021, 3, 10))
                .status(ConditionStatus.ACTIVE)
                .source(ConditionSource.PATIENT_REPORTED)
                .notes("Managed with daily lifestyle modifications")
                .build();

        String res = mockMvc.perform(post("/api/v1/patient/conditions")
                        .header("Authorization", "Bearer " + tokenPatientA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(conditionReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.conditionName").value("Hypertension"))
                .andExpect(jsonPath("$.data.sourceLabel").value("Patient reported"))
                .andReturn().getResponse().getContentAsString();

        UUID conditionId = UUID.fromString(objectMapper.readTree(res).get("data").get("id").asText());

        // Update condition
        UpdateConditionRequest updateReq = UpdateConditionRequest.builder()
                .notes("Updated notes following annual health checkup")
                .status(ConditionStatus.RESOLVED)
                .build();

        mockMvc.perform(put("/api/v1/patient/conditions/" + conditionId)
                        .header("Authorization", "Bearer " + tokenPatientA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("RESOLVED"));
    }

    @Test
    @DisplayName("Phase 3 - 4: Surgical History CRUD & Future Date Validation Rejection")
    void testSurgery_CRUD_And_Validation() throws Exception {
        // Future date validation failure
        CreateSurgeryRequest futureSurgery = CreateSurgeryRequest.builder()
                .procedureName("Future Procedure")
                .dateOfSurgery(LocalDate.now().plusMonths(2))
                .build();

        mockMvc.perform(post("/api/v1/patient/surgeries")
                        .header("Authorization", "Bearer " + tokenPatientA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(futureSurgery)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.dateOfSurgery").isNotEmpty());

        // Valid surgery
        CreateSurgeryRequest validSurgery = CreateSurgeryRequest.builder()
                .procedureName("Appendectomy")
                .dateOfSurgery(LocalDate.of(2018, 7, 22))
                .hospitalName("City General Hospital")
                .notes("Laparoscopic, no complications")
                .build();

        mockMvc.perform(post("/api/v1/patient/surgeries")
                        .header("Authorization", "Bearer " + tokenPatientA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validSurgery)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.procedureName").value("Appendectomy"));
    }

    @Test
    @DisplayName("Phase 3 - 5: Family Medical History CRUD")
    void testFamilyHistory_CRUD() throws Exception {
        CreateFamilyHistoryRequest req = CreateFamilyHistoryRequest.builder()
                .relationship(FamilyRelationship.FATHER)
                .condition("Coronary Artery Disease")
                .ageOfOnset(55)
                .notes("Diagnosed during routine cardiac screening")
                .build();

        mockMvc.perform(post("/api/v1/patient/family-history")
                        .header("Authorization", "Bearer " + tokenPatientA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.relationship").value("FATHER"))
                .andExpect(jsonPath("$.data.ageOfOnset").value(55));
    }

    @Test
    @DisplayName("Phase 3 - 6: Lifestyle Profile Updates & Health Goals")
    void testLifestyle_And_HealthGoals() throws Exception {
        // 1. Update Lifestyle
        UpdateLifestyleRequest lifestyleReq = UpdateLifestyleRequest.builder()
                .smokingStatus(SmokingStatus.NEVER)
                .alcoholStatus(AlcoholStatus.FORMER)
                .activityLevel(ActivityLevel.MODERATE)
                .dietaryPreference(DietaryPreference.VEGETARIAN)
                .sleepHours(BigDecimal.valueOf(7.5))
                .waterIntakeLiters(BigDecimal.valueOf(2.5))
                .occupationType("Desk / Remote")
                .build();

        mockMvc.perform(put("/api/v1/patient/lifestyle")
                        .header("Authorization", "Bearer " + tokenPatientA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(lifestyleReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.smokingStatus").value("NEVER"))
                .andExpect(jsonPath("$.data.sleepHours").value(7.5));

        // 2. Create Health Goal
        CreateHealthGoalRequest goalReq = CreateHealthGoalRequest.builder()
                .goalType(HealthGoalType.HYDRATION)
                .description("Drink 3 liters of water daily")
                .targetValue("3.0")
                .targetUnit("liters")
                .targetDate(LocalDate.now().plusMonths(1))
                .status(HealthGoalStatus.ACTIVE)
                .build();

        mockMvc.perform(post("/api/v1/patient/health-goals")
                        .header("Authorization", "Bearer " + tokenPatientA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(goalReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.goalType").value("HYDRATION"));
    }

    @Test
    @DisplayName("Phase 3 - 7: Health Timeline Aggregation")
    void testHealthTimeline_Aggregation() throws Exception {
        // Add one allergy & one surgery
        allergyRepository.save(PatientAllergy.builder()
                .patient(profileA)
                .allergen("Peanuts")
                .severity(AllergySeverity.MODERATE)
                .status(AllergyStatus.ACTIVE)
                .build());

        surgeryRepository.save(PatientSurgery.builder()
                .patient(profileA)
                .procedureName("Wisdom Tooth Extraction")
                .dateOfSurgery(LocalDate.of(2019, 10, 5))
                .build());

        mockMvc.perform(get("/api/v1/patient/timeline")
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(2))));
    }

    @Test
    @DisplayName("Phase 3 - 8: Doctor Cannot Access Patient Health Profile Without Consent (403 Forbidden)")
    void testDoctorCannotAccessPatientEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/patient/profile")
                        .header("Authorization", "Bearer " + tokenDoctor))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/patient/allergies")
                        .header("Authorization", "Bearer " + tokenDoctor))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/patient/lifestyle")
                        .header("Authorization", "Bearer " + tokenDoctor))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Phase 3 - 9: Audit Logging for Patient Health Events")
    void testAuditLogging_PatientHealthEvents() throws Exception {
        CreateAllergyRequest req = CreateAllergyRequest.builder()
                .allergen("Latex")
                .severity(AllergySeverity.MILD)
                .build();

        mockMvc.perform(post("/api/v1/patient/allergies")
                        .header("Authorization", "Bearer " + tokenPatientA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        List<AuditLog> logs = auditLogRepository.findAll();
        boolean hasAllergyLog = logs.stream()
                .anyMatch(l -> "ALLERGY_CREATED".equals(l.getAction()) && 
                               "alice.patient@test.com".equals(l.getUserEmail()));

        assertTrue(hasAllergyLog, "Expected ALLERGY_CREATED audit log to be recorded in audit_logs");
    }
}
