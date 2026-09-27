package com.healthbuddy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "medical_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalReport extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientProfile patient;

    @Column(name = "original_file_name", nullable = false)
    private String originalFileName;

    @Column(name = "stored_file_name", nullable = false)
    private String storedFileName;

    @Column(name = "file_type", nullable = false, length = 100)
    private String fileType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "storage_key", nullable = false, length = 512)
    private String storageKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false, length = 50)
    @Builder.Default
    private ReportType reportType = ReportType.UNKNOWN;

    @Column(name = "uploaded_at", nullable = false)
    @Builder.Default
    private Instant uploadedAt = Instant.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "processing_status", nullable = false, length = 50)
    @Builder.Default
    private ProcessingStatus processingStatus = ProcessingStatus.UPLOADED;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 50)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.NOT_VERIFIED;

    @Column(name = "extracted_text", columnDefinition = "TEXT")
    private String extractedText;

    @Column(name = "processed_at")
    private Instant processedAt;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<MedicalReportParameter> parameters = new ArrayList<>();

    public void addParameter(MedicalReportParameter parameter) {
        parameters.add(parameter);
        parameter.setReport(this);
    }

    public void removeParameter(MedicalReportParameter parameter) {
        parameters.remove(parameter);
        parameter.setReport(null);
    }
}
