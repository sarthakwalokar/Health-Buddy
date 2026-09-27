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
import java.time.LocalTime;
import java.util.Collections;
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
public class PatientMedicationIntegrationTest {

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
    private MedicationRepository medicationRepository;

    @Autowired
    private MedicationScheduleRepository medicationScheduleRepository;

    @Autowired
    private MedicationDoseRepository medicationDoseRepository;

    @Autowired
    private MedicationReminderRepository medicationReminderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String patientAToken;
    private String patientBToken;
    private String doctorToken;
    private PatientProfile patientAProfile;
    private PatientProfile patientBProfile;

    @BeforeEach
    void setUp() {
        medicationReminderRepository.deleteAll();
        medicationDoseRepository.deleteAll();
        medicationScheduleRepository.deleteAll();
        medicationRepository.deleteAll();
        patientProfileRepository.deleteAll();
        userRepository.deleteAll();

        Role patientRole = roleRepository.findByName(RoleType.ROLE_PATIENT)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleType.ROLE_PATIENT).build()));
        Role doctorRole = roleRepository.findByName(RoleType.ROLE_DOCTOR)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleType.ROLE_DOCTOR).build()));

        // Patient A
        User userA = User.builder()
                .email("patientA.meds@healthbuddy.com")
                .passwordHash(passwordEncoder.encode("Password@123"))
                .fullName("Alice Patient")
                .roles(Set.of(patientRole))
                .enabled(true)
                .build();
        userA = userRepository.save(userA);
        patientAProfile = patientProfileRepository.save(PatientProfile.builder().user(userA).build());
        patientAToken = jwtTokenProvider.generateAccessToken(UserPrincipal.create(userA));

        // Patient B
        User userB = User.builder()
                .email("patientB.meds@healthbuddy.com")
                .passwordHash(passwordEncoder.encode("Password@123"))
                .fullName("Bob Patient")
                .roles(Set.of(patientRole))
                .enabled(true)
                .build();
        userB = userRepository.save(userB);
        patientBProfile = patientProfileRepository.save(PatientProfile.builder().user(userB).build());
        patientBToken = jwtTokenProvider.generateAccessToken(UserPrincipal.create(userB));

        // Doctor
        User doctor = User.builder()
                .email("doctor.meds@healthbuddy.com")
                .passwordHash(passwordEncoder.encode("Password@123"))
                .fullName("Dr. Evelyn Wright")
                .roles(Set.of(doctorRole))
                .enabled(true)
                .build();
        doctor = userRepository.save(doctor);
        doctorToken = jwtTokenProvider.generateAccessToken(UserPrincipal.create(doctor));
    }

    @Test
    @DisplayName("Should successfully record a medication with schedules and auto-generate upcoming doses")
    void testCreateMedicationWithSchedules() throws Exception {
        CreateMedicationRequest request = CreateMedicationRequest.builder()
                .medicineName("Metformin")
                .genericName("Metformin Hydrochloride")
                .strength("500 mg")
                .dosageAmount(new BigDecimal("1.0"))
                .dosageUnit("tablet")
                .route(MedicationRoute.ORAL)
                .frequencyType(FrequencyType.TWICE_DAILY)
                .frequencyValue("Twice a day with breakfast and dinner")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(3))
                .instructions("Take with meals to avoid stomach upset")
                .reason("Blood glucose management")
                .prescribedBy("Dr. Chen")
                .reminderEnabled(true)
                .reminderMinutesBefore(15)
                .schedules(List.of(
                        MedicationScheduleRequest.builder()
                                .scheduleType(ScheduleType.FIXED_TIME)
                                .timeOfDay(LocalTime.of(8, 0))
                                .doseAmount(new BigDecimal("1.0"))
                                .doseUnit("tablet")
                                .build(),
                        MedicationScheduleRequest.builder()
                                .scheduleType(ScheduleType.FIXED_TIME)
                                .timeOfDay(LocalTime.of(20, 0))
                                .doseAmount(new BigDecimal("1.0"))
                                .doseUnit("tablet")
                                .build()
                ))
                .build();

        mockMvc.perform(post("/api/v1/patient/medications")
                        .header("Authorization", "Bearer " + patientAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.medicineName").value("Metformin"))
                .andExpect(jsonPath("$.data.strength").value("500 mg"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.schedules", hasSize(2)));

        List<Medication> meds = medicationRepository.findByPatientOrderByCreatedAtDesc(patientAProfile);
        assertEquals(1, meds.size());

        List<MedicationDose> doses = medicationDoseRepository.findByMedicationAndScheduledAtBetweenOrderByScheduledAtAsc(
                meds.get(0), LocalDate.now().atStartOfDay().toInstant(java.time.ZoneOffset.UTC),
                LocalDate.now().plusDays(8).atStartOfDay().toInstant(java.time.ZoneOffset.UTC));
        assertFalse(doses.isEmpty(), "Upcoming scheduled doses should be generated");
    }

    @Test
    @DisplayName("Should retrieve paginated medications and detail with adherence")
    void testGetMedicationsAndDetail() throws Exception {
        Medication med = medicationRepository.save(Medication.builder()
                .patient(patientAProfile)
                .medicineName("Atorvastatin")
                .strength("20 mg")
                .dosageAmount(new BigDecimal("1.0"))
                .dosageUnit("tablet")
                .route(MedicationRoute.ORAL)
                .frequencyType(FrequencyType.ONCE_DAILY)
                .startDate(LocalDate.now().minusDays(10))
                .status(MedicationStatus.ACTIVE)
                .reminderEnabled(true)
                .build());

        mockMvc.perform(get("/api/v1/patient/medications")
                        .header("Authorization", "Bearer " + patientAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].medicineName").value("Atorvastatin"));

        mockMvc.perform(get("/api/v1/patient/medications/" + med.getId())
                        .header("Authorization", "Bearer " + patientAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(med.getId().toString()))
                .andExpect(jsonPath("$.data.medicineName").value("Atorvastatin"));
    }

    @Test
    @DisplayName("Should pause, resume, stop, and complete medication status")
    void testMedicationStatusTransitions() throws Exception {
        Medication med = medicationRepository.save(Medication.builder()
                .patient(patientAProfile)
                .medicineName("Lisinopril")
                .strength("10 mg")
                .frequencyType(FrequencyType.ONCE_DAILY)
                .startDate(LocalDate.now())
                .status(MedicationStatus.ACTIVE)
                .build());

        // Pause
        mockMvc.perform(post("/api/v1/patient/medications/" + med.getId() + "/pause")
                        .header("Authorization", "Bearer " + patientAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PAUSED"));

        // Resume
        mockMvc.perform(post("/api/v1/patient/medications/" + med.getId() + "/resume")
                        .header("Authorization", "Bearer " + patientAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));

        // Stop
        mockMvc.perform(post("/api/v1/patient/medications/" + med.getId() + "/stop")
                        .header("Authorization", "Bearer " + patientAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("STOPPED"));

        // Complete
        mockMvc.perform(post("/api/v1/patient/medications/" + med.getId() + "/complete")
                        .header("Authorization", "Bearer " + patientAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));
    }

    @Test
    @DisplayName("Should mark dose as taken, skipped, and missed")
    void testDoseActions() throws Exception {
        Medication med = medicationRepository.save(Medication.builder()
                .patient(patientAProfile)
                .medicineName("Amlodipine")
                .strength("5 mg")
                .frequencyType(FrequencyType.ONCE_DAILY)
                .startDate(LocalDate.now())
                .status(MedicationStatus.ACTIVE)
                .build());

        MedicationDose dose1 = medicationDoseRepository.save(MedicationDose.builder()
                .medication(med)
                .patient(patientAProfile)
                .scheduledAt(java.time.Instant.now())
                .status(DoseStatus.SCHEDULED)
                .build());

        MedicationDose dose2 = medicationDoseRepository.save(MedicationDose.builder()
                .medication(med)
                .patient(patientAProfile)
                .scheduledAt(java.time.Instant.now().plusSeconds(3600))
                .status(DoseStatus.SCHEDULED)
                .build());

        // Mark Taken
        RecordDoseActionRequest takenReq = RecordDoseActionRequest.builder()
                .notes("Taken with glass of water")
                .build();

        mockMvc.perform(post("/api/v1/patient/medication-doses/" + dose1.getId() + "/taken")
                        .header("Authorization", "Bearer " + patientAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(takenReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("TAKEN"))
                .andExpect(jsonPath("$.data.notes").value("Taken with glass of water"));

        // Mark Skipped
        RecordDoseActionRequest skipReq = RecordDoseActionRequest.builder()
                .notes("Skipped as advised by doctor")
                .build();

        mockMvc.perform(post("/api/v1/patient/medication-doses/" + dose2.getId() + "/skipped")
                        .header("Authorization", "Bearer " + patientAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(skipReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SKIPPED"));
    }

    @Test
    @DisplayName("Should retrieve today's medication doses and adherence summary")
    void testGetTodayDosesAndAdherence() throws Exception {
        Medication med = medicationRepository.save(Medication.builder()
                .patient(patientAProfile)
                .medicineName("Omeprazole")
                .strength("20 mg")
                .frequencyType(FrequencyType.ONCE_DAILY)
                .startDate(LocalDate.now())
                .status(MedicationStatus.ACTIVE)
                .build());

        medicationDoseRepository.save(MedicationDose.builder()
                .medication(med)
                .patient(patientAProfile)
                .scheduledAt(java.time.Instant.now())
                .status(DoseStatus.SCHEDULED)
                .build());

        mockMvc.perform(get("/api/v1/patient/medication-doses/today")
                        .header("Authorization", "Bearer " + patientAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalScheduledToday").value(1))
                .andExpect(jsonPath("$.data.activeMedicationsCount").value(1));

        mockMvc.perform(get("/api/v1/patient/medication-doses/adherence?period=30_DAYS")
                        .header("Authorization", "Bearer " + patientAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.period").value("30_DAYS"));
    }

    @Test
    @DisplayName("Should enforce zero-trust ownership: Patient A cannot access or tamper with Patient B medications")
    void testCrossPatientMedicationAccessDenial() throws Exception {
        Medication medB = medicationRepository.save(Medication.builder()
                .patient(patientBProfile)
                .medicineName("Bob Secret Medication")
                .strength("100 mg")
                .frequencyType(FrequencyType.ONCE_DAILY)
                .startDate(LocalDate.now())
                .status(MedicationStatus.ACTIVE)
                .build());

        MedicationDose doseB = medicationDoseRepository.save(MedicationDose.builder()
                .medication(medB)
                .patient(patientBProfile)
                .scheduledAt(java.time.Instant.now())
                .status(DoseStatus.SCHEDULED)
                .build());

        // Patient A trying to get Patient B's medication -> 404
        mockMvc.perform(get("/api/v1/patient/medications/" + medB.getId())
                        .header("Authorization", "Bearer " + patientAToken))
                .andExpect(status().isNotFound());

        // Patient A trying to pause Patient B's medication -> 404
        mockMvc.perform(post("/api/v1/patient/medications/" + medB.getId() + "/pause")
                        .header("Authorization", "Bearer " + patientAToken))
                .andExpect(status().isNotFound());

        // Patient A trying to delete Patient B's medication -> 404
        mockMvc.perform(delete("/api/v1/patient/medications/" + medB.getId())
                        .header("Authorization", "Bearer " + patientAToken))
                .andExpect(status().isNotFound());

        // Patient A trying to mark Patient B's dose as taken -> 404
        mockMvc.perform(post("/api/v1/patient/medication-doses/" + doseB.getId() + "/taken")
                        .header("Authorization", "Bearer " + patientAToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should reject unauthenticated or unauthorized Doctor access to patient medication endpoints")
    void testRoleIsolationAndUnauthenticatedAccess() throws Exception {
        // Unauthenticated
        mockMvc.perform(get("/api/v1/patient/medications"))
                .andExpect(status().isUnauthorized());

        // Doctor attempting patient-scoped medication endpoints -> 403 Forbidden
        mockMvc.perform(get("/api/v1/patient/medications")
                        .header("Authorization", "Bearer " + doctorToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should validate required medication fields and reject invalid data")
    void testMedicationValidation() throws Exception {
        CreateMedicationRequest invalidReq = CreateMedicationRequest.builder()
                .medicineName("") // blank
                .startDate(null)  // null
                .frequencyType(null)
                .build();

        mockMvc.perform(post("/api/v1/patient/medications")
                        .header("Authorization", "Bearer " + patientAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isBadRequest());
    }
}
