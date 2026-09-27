package com.healthbuddy.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthbuddy.dto.request.CreateVitalRequest;
import com.healthbuddy.dto.request.UpdateVitalRequest;
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
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class PatientVitalIntegrationTest {

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
    private HealthMeasurementRepository measurementRepository;

    @Autowired
    private HealthAlertRepository alertRepository;

    @Autowired
    private MedicalReportRepository medicalReportRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User patientUserA;
    private PatientProfile patientProfileA;
    private String tokenPatientA;

    private User patientUserB;
    private PatientProfile patientProfileB;
    private String tokenPatientB;

    private User doctorUser;
    private String tokenDoctor;

    @BeforeEach
    void setUp() {
        alertRepository.deleteAll();
        measurementRepository.deleteAll();
        medicalReportRepository.deleteAll();
        patientProfileRepository.deleteAll();
        userRepository.deleteAll();

        Role patientRole = roleRepository.findByName(RoleType.ROLE_PATIENT)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleType.ROLE_PATIENT).build()));

        Role doctorRole = roleRepository.findByName(RoleType.ROLE_DOCTOR)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleType.ROLE_DOCTOR).build()));

        // Setup Patient A
        patientUserA = User.builder()
                .email("patientA.vitals@healthbuddy.com")
                .passwordHash(passwordEncoder.encode("Password@123"))
                .fullName("Alice Vital Patient")
                .enabled(true)
                .roles(Set.of(patientRole))
                .build();
        patientUserA = userRepository.save(patientUserA);

        patientProfileA = PatientProfile.builder()
                .user(patientUserA)
                .heightCm(BigDecimal.valueOf(175.0))
                .weightKg(BigDecimal.valueOf(70.0))
                .build();
        patientProfileA = patientProfileRepository.save(patientProfileA);

        tokenPatientA = jwtTokenProvider.generateAccessToken(UserPrincipal.create(patientUserA));

        // Setup Patient B
        patientUserB = User.builder()
                .email("patientB.vitals@healthbuddy.com")
                .passwordHash(passwordEncoder.encode("Password@123"))
                .fullName("Bob Vital Patient")
                .enabled(true)
                .roles(Set.of(patientRole))
                .build();
        patientUserB = userRepository.save(patientUserB);

        patientProfileB = PatientProfile.builder()
                .user(patientUserB)
                .heightCm(BigDecimal.valueOf(180.0))
                .weightKg(BigDecimal.valueOf(80.0))
                .build();
        patientProfileB = patientProfileRepository.save(patientProfileB);

        tokenPatientB = jwtTokenProvider.generateAccessToken(UserPrincipal.create(patientUserB));

        // Setup Doctor
        doctorUser = User.builder()
                .email("doctor.vitals@healthbuddy.com")
                .passwordHash(passwordEncoder.encode("Password@123"))
                .fullName("Dr. Gregory Vitals")
                .enabled(true)
                .roles(Set.of(doctorRole))
                .build();
        doctorUser = userRepository.save(doctorUser);

        tokenDoctor = jwtTokenProvider.generateAccessToken(UserPrincipal.create(doctorUser));
    }

    @Test
    @DisplayName("Record Blood Pressure Measurement — Success")
    void recordBloodPressure_success() throws Exception {
        CreateVitalRequest request = CreateVitalRequest.builder()
                .measurementType(MeasurementType.BLOOD_PRESSURE)
                .systolic(BigDecimal.valueOf(120))
                .diastolic(BigDecimal.valueOf(80))
                .measurementTime(Instant.now().minus(1, ChronoUnit.HOURS))
                .measurementContext(MeasurementContext.RESTING)
                .notes("Morning resting reading")
                .build();

        mockMvc.perform(post("/api/v1/patient/vitals")
                        .header("Authorization", "Bearer " + tokenPatientA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.measurementType", is("BLOOD_PRESSURE")))
                .andExpect(jsonPath("$.data.systolic", notNullValue()))
                .andExpect(jsonPath("$.data.diastolic", notNullValue()))
                .andExpect(jsonPath("$.data.unit", is("mmHg")))
                .andExpect(jsonPath("$.data.formattedValue", containsString("120/80 mmHg")));
    }

    @Test
    @DisplayName("Record Heart Rate, Glucose, SpO2, Temperature — Success")
    void recordVariousVitals_success() throws Exception {
        // Heart Rate
        CreateVitalRequest hrReq = CreateVitalRequest.builder()
                .measurementType(MeasurementType.HEART_RATE)
                .valueNumeric(BigDecimal.valueOf(72))
                .measurementTime(Instant.now())
                .build();

        mockMvc.perform(post("/api/v1/patient/vitals")
                        .header("Authorization", "Bearer " + tokenPatientA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(hrReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.measurementType", is("HEART_RATE")))
                .andExpect(jsonPath("$.data.valueNumeric", notNullValue()))
                .andExpect(jsonPath("$.data.unit", is("bpm")));

        // Blood Glucose Fasting
        CreateVitalRequest glucoseReq = CreateVitalRequest.builder()
                .measurementType(MeasurementType.BLOOD_GLUCOSE)
                .valueNumeric(BigDecimal.valueOf(95.5))
                .measurementContext(MeasurementContext.FASTING)
                .measurementTime(Instant.now())
                .build();

        mockMvc.perform(post("/api/v1/patient/vitals")
                        .header("Authorization", "Bearer " + tokenPatientA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(glucoseReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.measurementType", is("BLOOD_GLUCOSE")))
                .andExpect(jsonPath("$.data.valueNumeric", notNullValue()))
                .andExpect(jsonPath("$.data.measurementContext", is("FASTING")));
    }

    @Test
    @DisplayName("Record Weight Automatically Computes and Persists BMI")
    void recordWeight_autoCalculatesBmi() throws Exception {
        CreateVitalRequest weightReq = CreateVitalRequest.builder()
                .measurementType(MeasurementType.WEIGHT)
                .valueNumeric(BigDecimal.valueOf(70.0))
                .measurementTime(Instant.now())
                .build();

        mockMvc.perform(post("/api/v1/patient/vitals")
                        .header("Authorization", "Bearer " + tokenPatientA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(weightReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.measurementType", is("WEIGHT")))
                .andExpect(jsonPath("$.data.valueNumeric", notNullValue()));

        // Verify BMI was auto-calculated: 70 / (1.75 * 1.75) = 22.857 -> 22.9
        var bmiOpt = measurementRepository.findFirstByPatientAndMeasurementTypeOrderByMeasurementTimeDesc(
                patientProfileA, MeasurementType.BMI);
        assertTrue(bmiOpt.isPresent());
        assertEquals(22.9, bmiOpt.get().getValueNumeric().doubleValue(), 0.1);
        assertEquals(MeasurementSource.SYSTEM_CALCULATED, bmiOpt.get().getSource());
    }

    @Test
    @DisplayName("Validation Rejects Invalid & Impossible Values")
    void validation_rejectsInvalidValues() throws Exception {
        // Negative Heart Rate
        CreateVitalRequest invalidHr = CreateVitalRequest.builder()
                .measurementType(MeasurementType.HEART_RATE)
                .valueNumeric(BigDecimal.valueOf(-10))
                .measurementTime(Instant.now())
                .build();

        mockMvc.perform(post("/api/v1/patient/vitals")
                        .header("Authorization", "Bearer " + tokenPatientA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidHr)))
                .andExpect(status().isBadRequest());

        // Future Timestamp (more than 5 mins in future)
        CreateVitalRequest futureReq = CreateVitalRequest.builder()
                .measurementType(MeasurementType.SPO2)
                .valueNumeric(BigDecimal.valueOf(98))
                .measurementTime(Instant.now().plus(2, ChronoUnit.DAYS))
                .build();

        mockMvc.perform(post("/api/v1/patient/vitals")
                        .header("Authorization", "Bearer " + tokenPatientA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(futureReq)))
                .andExpect(status().isBadRequest());

        // Blood Pressure Missing Diastolic
        CreateVitalRequest bpNoDiastolic = CreateVitalRequest.builder()
                .measurementType(MeasurementType.BLOOD_PRESSURE)
                .systolic(BigDecimal.valueOf(120))
                .measurementTime(Instant.now())
                .build();

        mockMvc.perform(post("/api/v1/patient/vitals")
                        .header("Authorization", "Bearer " + tokenPatientA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bpNoDiastolic)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Cross-Patient Access Denial — Patient B Cannot Access Patient A's Vital (404)")
    void crossPatientAccess_returns404() throws Exception {
        HealthMeasurement measurementA = measurementRepository.save(HealthMeasurement.builder()
                .patient(patientProfileA)
                .measurementType(MeasurementType.HEART_RATE)
                .valueNumeric(BigDecimal.valueOf(75))
                .unit("bpm")
                .measurementTime(Instant.now())
                .source(MeasurementSource.MANUAL)
                .build());

        // Patient B tries to get Patient A's vital
        mockMvc.perform(get("/api/v1/patient/vitals/" + measurementA.getId())
                        .header("Authorization", "Bearer " + tokenPatientB))
                .andExpect(status().isNotFound());

        // Patient B tries to update Patient A's vital
        UpdateVitalRequest updateReq = UpdateVitalRequest.builder()
                .valueNumeric(BigDecimal.valueOf(80))
                .build();

        mockMvc.perform(put("/api/v1/patient/vitals/" + measurementA.getId())
                        .header("Authorization", "Bearer " + tokenPatientB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isNotFound());

        // Patient B tries to delete Patient A's vital
        mockMvc.perform(delete("/api/v1/patient/vitals/" + measurementA.getId())
                        .header("Authorization", "Bearer " + tokenPatientB))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Update & Delete Vital Measurement — Success for Owner")
    void updateAndDeleteVital_success() throws Exception {
        HealthMeasurement measurementA = measurementRepository.save(HealthMeasurement.builder()
                .patient(patientProfileA)
                .measurementType(MeasurementType.TEMPERATURE)
                .valueNumeric(BigDecimal.valueOf(37.0))
                .unit("°C")
                .measurementTime(Instant.now())
                .source(MeasurementSource.MANUAL)
                .build());

        // Update
        UpdateVitalRequest updateReq = UpdateVitalRequest.builder()
                .valueNumeric(BigDecimal.valueOf(37.5))
                .notes("After afternoon walk")
                .build();

        mockMvc.perform(put("/api/v1/patient/vitals/" + measurementA.getId())
                        .header("Authorization", "Bearer " + tokenPatientA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.valueNumeric", notNullValue()))
                .andExpect(jsonPath("$.data.notes", is("After afternoon walk")));

        // Delete
        mockMvc.perform(delete("/api/v1/patient/vitals/" + measurementA.getId())
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isOk());

        assertFalse(measurementRepository.findById(measurementA.getId()).isPresent());
    }

    @Test
    @DisplayName("Trend Analytics & Statistical Summaries Calculation")
    void trendAnalytics_calculation() throws Exception {
        Instant baseTime = Instant.now().minus(5, ChronoUnit.DAYS);

        // Record 3 Weight readings: 68.0, 69.0, 70.0
        measurementRepository.save(HealthMeasurement.builder()
                .patient(patientProfileA)
                .measurementType(MeasurementType.WEIGHT)
                .valueNumeric(BigDecimal.valueOf(68.0))
                .unit("kg")
                .measurementTime(baseTime.minus(3, ChronoUnit.DAYS))
                .build());

        measurementRepository.save(HealthMeasurement.builder()
                .patient(patientProfileA)
                .measurementType(MeasurementType.WEIGHT)
                .valueNumeric(BigDecimal.valueOf(69.0))
                .unit("kg")
                .measurementTime(baseTime.minus(1, ChronoUnit.DAYS))
                .build());

        measurementRepository.save(HealthMeasurement.builder()
                .patient(patientProfileA)
                .measurementType(MeasurementType.WEIGHT)
                .valueNumeric(BigDecimal.valueOf(70.0))
                .unit("kg")
                .measurementTime(baseTime)
                .build());

        mockMvc.perform(get("/api/v1/patient/vitals/trends/WEIGHT?period=30_DAYS")
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.measurementType", is("WEIGHT")))
                .andExpect(jsonPath("$.data.totalReadings", is(3)))
                .andExpect(jsonPath("$.data.minValue", notNullValue()))
                .andExpect(jsonPath("$.data.maxValue", notNullValue()))
                .andExpect(jsonPath("$.data.averageValue", notNullValue()))
                .andExpect(jsonPath("$.data.descriptiveSummary", containsString("an increase of 2.0 kg")));
    }

    @Test
    @DisplayName("Clinical Rule Engine Generates Informational Safety Alert on Elevated Reading")
    void ruleEngine_generatesAlert() throws Exception {
        // Record Elevated BP (150/95 mmHg)
        CreateVitalRequest highBpReq = CreateVitalRequest.builder()
                .measurementType(MeasurementType.BLOOD_PRESSURE)
                .systolic(BigDecimal.valueOf(150))
                .diastolic(BigDecimal.valueOf(95))
                .measurementTime(Instant.now())
                .build();

        mockMvc.perform(post("/api/v1/patient/vitals")
                        .header("Authorization", "Bearer " + tokenPatientA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(highBpReq)))
                .andExpect(status().isCreated());

        // Verify alert was generated for Patient A
        var alerts = alertRepository.findByPatientOrderByCreatedAtDesc(patientProfileA, null);
        assertFalse(alerts.getContent().isEmpty());
        HealthAlert alert = alerts.getContent().get(0);
        assertEquals(AlertStatus.UNREAD, alert.getStatus());
        assertEquals("ELEVATED_BLOOD_PRESSURE", alert.getAlertType());

        // Patient A acknowledges alert
        mockMvc.perform(post("/api/v1/patient/alerts/" + alert.getId() + "/acknowledge")
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("ACKNOWLEDGED")));
    }

    @Test
    @DisplayName("Unauthenticated & Doctor Role Protection")
    void securityAuthorization_tests() throws Exception {
        // Unauthenticated -> 401
        mockMvc.perform(get("/api/v1/patient/vitals"))
                .andExpect(status().isUnauthorized());

        // Doctor role attempting patient vitals endpoint -> 403
        mockMvc.perform(get("/api/v1/patient/vitals")
                        .header("Authorization", "Bearer " + tokenDoctor))
                .andExpect(status().isForbidden());
    }
}
