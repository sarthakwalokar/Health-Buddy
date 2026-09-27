package com.healthbuddy.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthbuddy.dto.request.CreateParameterRequest;
import com.healthbuddy.dto.request.UpdateParameterRequest;
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
import org.springframework.mock.web.MockMultipartFile;
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
public class PatientMedicalReportIntegrationTest {

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
    private MedicalReportRepository medicalReportRepository;

    @Autowired
    private MedicalReportParameterRepository parameterRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private com.healthbuddy.repository.HealthMeasurementRepository measurementRepository;

    @Autowired
    private com.healthbuddy.repository.HealthAlertRepository alertRepository;

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
        parameterRepository.deleteAll();
        medicalReportRepository.deleteAll();
        patientProfileRepository.deleteAll();
        userRepository.deleteAll();

        Role rolePatient = roleRepository.findByName(RoleType.ROLE_PATIENT)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_PATIENT, "Patient Role")));
        Role roleDoctor = roleRepository.findByName(RoleType.ROLE_DOCTOR)
                .orElseGet(() -> roleRepository.save(new Role(RoleType.ROLE_DOCTOR, "Doctor Role")));

        // 1. Setup Patient A
        patientA = userRepository.save(User.builder()
                .email("patientA.report@healthbuddy.com")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .fullName("Alice Patient")
                .roles(Set.of(rolePatient))
                .enabled(true)
                .accountNonLocked(true)
                .build());
        profileA = patientProfileRepository.save(PatientProfile.builder()
                .user(patientA)
                .gender("FEMALE")
                .bloodGroup("A_POSITIVE")
                .build());
        tokenPatientA = jwtTokenProvider.generateAccessToken(UserPrincipal.create(patientA));

        // 2. Setup Patient B
        patientB = userRepository.save(User.builder()
                .email("patientB.report@healthbuddy.com")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .fullName("Bob Patient")
                .roles(Set.of(rolePatient))
                .enabled(true)
                .accountNonLocked(true)
                .build());
        profileB = patientProfileRepository.save(PatientProfile.builder()
                .user(patientB)
                .gender("MALE")
                .bloodGroup("O_POSITIVE")
                .build());
        tokenPatientB = jwtTokenProvider.generateAccessToken(UserPrincipal.create(patientB));

        // 3. Setup Doctor User
        doctorUser = userRepository.save(User.builder()
                .email("doctor.report@healthbuddy.com")
                .passwordHash(passwordEncoder.encode("DoctorPass123!"))
                .fullName("Dr. Sarah Wilson")
                .roles(Set.of(roleDoctor))
                .enabled(true)
                .accountNonLocked(true)
                .build());
        tokenDoctor = jwtTokenProvider.generateAccessToken(UserPrincipal.create(doctorUser));
    }

    // ==========================================
    // 1. PUBLIC SYSTEM STATUS ENDPOINT
    // ==========================================

    @Test
    @DisplayName("GET /api/v1/system/status returns operational status without authentication")
    void testPublicSystemStatusEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/system/status")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("OPERATIONAL")))
                .andExpect(jsonPath("$.api", is("UP")))
                .andExpect(jsonPath("$.database", is("UP")))
                .andExpect(jsonPath("$.timestamp", notNullValue()));
    }

    // ==========================================
    // 2. MEDICAL REPORT UPLOAD FLOW
    // ==========================================

    @Test
    @DisplayName("POST /api/v1/patient/reports successfully uploads PDF file and extracts metadata")
    void testUploadMedicalReportPdfSuccess() throws Exception {
        // Minimal valid PDF magic bytes header (%PDF-1.4 ...)
        byte[] pdfBytes = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n".getBytes();

        MockMultipartFile file = new MockMultipartFile(
                "file", "blood_test_cbc.pdf", "application/pdf", pdfBytes
        );

        mockMvc.perform(multipart("/api/v1/patient/reports")
                        .file(file)
                        .param("reportType", "LAB_REPORT")
                        .param("notes", "Routine checkup report")
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.originalFileName", is("blood_test_cbc.pdf")))
                .andExpect(jsonPath("$.data.reportType", is("LAB_REPORT")))
                .andExpect(jsonPath("$.data.processingStatus", is("PROCESSED")))
                .andExpect(jsonPath("$.data.verificationStatus", is("NOT_VERIFIED")))
                .andExpect(jsonPath("$.data.fileType", is("application/pdf")));

        // Verify audit log
        List<AuditLog> logs = auditLogRepository.findByUserIdOrderByTimestampDesc(patientA.getId());
        assertTrue(logs.stream().anyMatch(l -> "MEDICAL_REPORT_UPLOADED".equals(l.getAction())));
        assertTrue(logs.stream().anyMatch(l -> "MEDICAL_REPORT_PROCESSED".equals(l.getAction())));
    }

    @Test
    @DisplayName("POST /api/v1/patient/reports successfully uploads PNG image report")
    void testUploadMedicalReportImageSuccess() throws Exception {
        // Valid PNG header magic bytes (89 50 4E 47 0D 0A 1A 0A)
        byte[] pngBytes = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52};

        MockMultipartFile file = new MockMultipartFile(
                "file", "prescription_scan.png", "image/png", pngBytes
        );

        mockMvc.perform(multipart("/api/v1/patient/reports")
                        .file(file)
                        .param("reportType", "PRESCRIPTION")
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.originalFileName", is("prescription_scan.png")))
                .andExpect(jsonPath("$.data.reportType", is("PRESCRIPTION")))
                .andExpect(jsonPath("$.data.processingStatus", is("PROCESSED")));
    }

    @Test
    @DisplayName("POST /api/v1/patient/reports rejects empty file with 400 Bad Request")
    void testUploadEmptyFileFails() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file", "empty.pdf", "application/pdf", new byte[0]
        );

        mockMvc.perform(multipart("/api/v1/patient/reports")
                        .file(emptyFile)
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/patient/reports rejects executable / unsafe file extensions")
    void testUploadUnsafeFileTypeFails() throws Exception {
        MockMultipartFile exeFile = new MockMultipartFile(
                "file", "malware.exe", "application/octet-stream", "dummy data".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/patient/reports")
                        .file(exeFile)
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isBadRequest());
    }

    // ==========================================
    // 3. RETRIEVAL & FILTERING
    // ==========================================

    @Test
    @DisplayName("GET /api/v1/patient/reports returns list filtered by reportType and search")
    void testGetMyReportsListAndFilters() throws Exception {
        byte[] pdfBytes = "%PDF-1.4 dummy valid header bytes".getBytes();
        MockMultipartFile file1 = new MockMultipartFile("file", "lipid_profile.pdf", "application/pdf", pdfBytes);
        MockMultipartFile file2 = new MockMultipartFile("file", "xray_chest.pdf", "application/pdf", pdfBytes);

        mockMvc.perform(multipart("/api/v1/patient/reports").file(file1).param("reportType", "LAB_REPORT").header("Authorization", "Bearer " + tokenPatientA)).andExpect(status().isCreated());
        mockMvc.perform(multipart("/api/v1/patient/reports").file(file2).param("reportType", "IMAGING_REPORT").header("Authorization", "Bearer " + tokenPatientA)).andExpect(status().isCreated());

        // Search by name
        mockMvc.perform(get("/api/v1/patient/reports")
                        .param("search", "lipid")
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].originalFileName", is("lipid_profile.pdf")));

        // Filter by reportType
        mockMvc.perform(get("/api/v1/patient/reports")
                        .param("reportType", "IMAGING_REPORT")
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].originalFileName", is("xray_chest.pdf")));
    }

    // ==========================================
    // 4. OWNERSHIP & CROSS-PATIENT ISOLATION
    // ==========================================

    @Test
    @DisplayName("GET /api/v1/patient/reports/{id} denies cross-patient access (Patient A cannot view Patient B report)")
    void testCrossPatientReportAccessDenial() throws Exception {
        byte[] pdfBytes = "%PDF-1.4 dummy header".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "patientB_private_doc.pdf", "application/pdf", pdfBytes);

        String responseStr = mockMvc.perform(multipart("/api/v1/patient/reports")
                        .file(file)
                        .param("reportType", "LAB_REPORT")
                        .header("Authorization", "Bearer " + tokenPatientB))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String reportIdStr = objectMapper.readTree(responseStr).path("data").path("id").asText();
        UUID reportId = UUID.fromString(reportIdStr);

        // Patient A attempts to view Patient B's report -> Must be denied (404 ResourceNotFound)
        mockMvc.perform(get("/api/v1/patient/reports/" + reportId)
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/v1/patient/reports/{id}/file denies cross-patient file download")
    void testCrossPatientFileDownloadDenial() throws Exception {
        byte[] pdfBytes = "%PDF-1.4 dummy header".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "patientB_secret.pdf", "application/pdf", pdfBytes);

        String responseStr = mockMvc.perform(multipart("/api/v1/patient/reports")
                        .file(file)
                        .header("Authorization", "Bearer " + tokenPatientB))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String reportIdStr = objectMapper.readTree(responseStr).path("data").path("id").asText();
        UUID reportId = UUID.fromString(reportIdStr);

        // Patient A attempts to download Patient B's file -> 404
        mockMvc.perform(get("/api/v1/patient/reports/" + reportId + "/file")
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isNotFound());

        // Patient B (authorized owner) downloads file -> 200 OK
        mockMvc.perform(get("/api/v1/patient/reports/" + reportId + "/file")
                        .header("Authorization", "Bearer " + tokenPatientB))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("Content-Disposition", containsString("patientB_secret.pdf")));
    }

    // ==========================================
    // 5. PATIENT VERIFICATION & CORRECTIONS
    // ==========================================

    @Test
    @DisplayName("POST /api/v1/patient/reports/{id}/verify verifies report and marks all parameters verified")
    void testPatientVerificationWorkflow() throws Exception {
        byte[] pdfBytes = "%PDF-1.4 dummy header".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "thyroid_panel.pdf", "application/pdf", pdfBytes);

        String responseStr = mockMvc.perform(multipart("/api/v1/patient/reports")
                        .file(file)
                        .param("reportType", "LAB_REPORT")
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String reportIdStr = objectMapper.readTree(responseStr).path("data").path("id").asText();
        UUID reportId = UUID.fromString(reportIdStr);

        // Patient verifies the report
        mockMvc.perform(post("/api/v1/patient/reports/" + reportId + "/verify")
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.verificationStatus", is("PATIENT_VERIFIED")))
                .andExpect(jsonPath("$.data.verifiedAt", notNullValue()));

        // Audit log verified
        List<AuditLog> logs = auditLogRepository.findByUserIdOrderByTimestampDesc(patientA.getId());
        assertTrue(logs.stream().anyMatch(l -> "MEDICAL_REPORT_VERIFIED".equals(l.getAction())));
    }

    @Test
    @DisplayName("PUT /api/v1/patient/reports/{id}/parameters/{paramId} updates parameter value with audit tracking")
    void testUpdateAndCorrectParameter() throws Exception {
        byte[] pdfBytes = "%PDF-1.4 dummy header".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "cbc.pdf", "application/pdf", pdfBytes);

        String responseStr = mockMvc.perform(multipart("/api/v1/patient/reports")
                        .file(file)
                        .param("reportType", "LAB_REPORT")
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String reportIdStr = objectMapper.readTree(responseStr).path("data").path("id").asText();
        UUID reportId = UUID.fromString(reportIdStr);

        // Manually add a parameter first
        CreateParameterRequest createReq = CreateParameterRequest.builder()
                .parameterName("Hemoglobin")
                .parameterCode("HB")
                .valueNumeric(new BigDecimal("12.5"))
                .valueText("12.5")
                .unit("g/dL")
                .referenceRange("13.0 - 17.0 g/dL")
                .build();

        String paramResStr = mockMvc.perform(post("/api/v1/patient/reports/" + reportId + "/parameters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq))
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String paramIdStr = objectMapper.readTree(paramResStr).path("data").path("id").asText();
        UUID paramId = UUID.fromString(paramIdStr);

        // Now Patient corrects the parameter value from 12.5 to 14.2
        UpdateParameterRequest updateReq = UpdateParameterRequest.builder()
                .valueText("14.2")
                .valueNumeric(new BigDecimal("14.2"))
                .unit("g/dL")
                .patientVerified(true)
                .build();

        mockMvc.perform(put("/api/v1/patient/reports/" + reportId + "/parameters/" + paramId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq))
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.valueText", is("14.2")))
                .andExpect(jsonPath("$.data.originalValueText", is("12.5")))
                .andExpect(jsonPath("$.data.correctedByPatient", is(true)))
                .andExpect(jsonPath("$.data.patientVerified", is(true)));
    }

    // ==========================================
    // 6. DELETE REPORT
    // ==========================================

    @Test
    @DisplayName("DELETE /api/v1/patient/reports/{id} removes report and denies cross-patient deletion")
    void testDeleteReportAndCrossPatientDeleteDenial() throws Exception {
        byte[] pdfBytes = "%PDF-1.4 dummy header".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "delete_test.pdf", "application/pdf", pdfBytes);

        String responseStr = mockMvc.perform(multipart("/api/v1/patient/reports")
                        .file(file)
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String reportIdStr = objectMapper.readTree(responseStr).path("data").path("id").asText();
        UUID reportId = UUID.fromString(reportIdStr);

        // Patient B attempts to delete Patient A's report -> 404
        mockMvc.perform(delete("/api/v1/patient/reports/" + reportId)
                        .header("Authorization", "Bearer " + tokenPatientB))
                .andExpect(status().isNotFound());

        // Patient A deletes their own report -> 200 OK
        mockMvc.perform(delete("/api/v1/patient/reports/" + reportId)
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isOk());

        // Verify report is gone
        mockMvc.perform(get("/api/v1/patient/reports/" + reportId)
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isNotFound());
    }

    // ==========================================
    // 7. SECURITY & ROLE ISOLATION
    // ==========================================

    @Test
    @DisplayName("Doctor cannot access patient reports through patient-only endpoint")
    void testDoctorCannotAccessPatientReportsDirectly() throws Exception {
        mockMvc.perform(get("/api/v1/patient/reports")
                        .header("Authorization", "Bearer " + tokenDoctor))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unauthenticated request to patient reports is rejected with 401")
    void testUnauthenticatedAccessDenial() throws Exception {
        mockMvc.perform(get("/api/v1/patient/reports"))
                .andExpect(status().isUnauthorized());
    }

    // ==========================================
    // 8. TIMELINE INTEGRATION
    // ==========================================

    @Test
    @DisplayName("Health timeline includes MEDICAL_REPORT_UPLOADED and MEDICAL_REPORT_VERIFIED events")
    void testTimelineIncludesReportEvents() throws Exception {
        byte[] pdfBytes = "%PDF-1.4 dummy header".getBytes();
        MockMultipartFile file = new MockMultipartFile("file", "timeline_test_report.pdf", "application/pdf", pdfBytes);

        String responseStr = mockMvc.perform(multipart("/api/v1/patient/reports")
                        .file(file)
                        .param("reportType", "LAB_REPORT")
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String reportIdStr = objectMapper.readTree(responseStr).path("data").path("id").asText();
        UUID reportId = UUID.fromString(reportIdStr);

        // Verify report
        mockMvc.perform(post("/api/v1/patient/reports/" + reportId + "/verify")
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isOk());

        // Get Timeline
        mockMvc.perform(get("/api/v1/patient/timeline")
                        .header("Authorization", "Bearer " + tokenPatientA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(2))))
                .andExpect(jsonPath("$.data[*].eventType", hasItems("MEDICAL_REPORT_UPLOADED", "MEDICAL_REPORT_VERIFIED")));
    }
}
