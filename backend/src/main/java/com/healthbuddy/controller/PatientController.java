package com.healthbuddy.controller;

import com.healthbuddy.dto.request.*;
import com.healthbuddy.dto.response.*;
import com.healthbuddy.service.AuthService;
import com.healthbuddy.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/patient")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
@Tag(name = "Patient Portal & Medical History", description = "Endpoints restricted exclusively to authenticated PATIENT users")
public class PatientController {

    private final PatientService patientService;
    private final AuthService authService;

    // ==========================================
    // 1. DASHBOARD & PROFILE
    // ==========================================

    @GetMapping("/dashboard")
    @Operation(summary = "Patient dashboard summary", description = "Retrieves base overview info for the authenticated patient")
    public ResponseEntity<ApiResponse<UserResponse>> getDashboard() {
        UserResponse user = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Patient dashboard loaded", user));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get personal health profile", description = "Retrieves complete demographic and body health profile of authenticated patient")
    public ResponseEntity<ApiResponse<PatientProfileResponse>> getProfile() {
        PatientProfileResponse profile = patientService.getMyProfile();
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update personal health profile", description = "Updates demographics, body metrics, emergency contact, and address")
    public ResponseEntity<ApiResponse<PatientProfileResponse>> updateProfile(
            @Valid @RequestBody UpdatePatientProfileRequest request) {
        PatientProfileResponse updated = patientService.updateMyProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    // ==========================================
    // 2. ALLERGIES
    // ==========================================

    @GetMapping("/allergies")
    @Operation(summary = "List allergies", description = "Retrieves all allergies recorded for the authenticated patient")
    public ResponseEntity<ApiResponse<List<AllergyResponse>>> getAllergies() {
        return ResponseEntity.ok(ApiResponse.success(patientService.getAllergies()));
    }

    @PostMapping("/allergies")
    @Operation(summary = "Record allergy", description = "Adds a new allergy to the authenticated patient's profile")
    public ResponseEntity<ApiResponse<AllergyResponse>> createAllergy(
            @Valid @RequestBody CreateAllergyRequest request) {
        AllergyResponse response = patientService.createAllergy(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Allergy recorded successfully", response));
    }

    @PutMapping("/allergies/{id}")
    @Operation(summary = "Update allergy", description = "Updates an existing allergy record")
    public ResponseEntity<ApiResponse<AllergyResponse>> updateAllergy(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAllergyRequest request) {
        AllergyResponse response = patientService.updateAllergy(id, request);
        return ResponseEntity.ok(ApiResponse.success("Allergy updated successfully", response));
    }

    @DeleteMapping("/allergies/{id}")
    @Operation(summary = "Delete allergy", description = "Removes an allergy record")
    public ResponseEntity<ApiResponse<Void>> deleteAllergy(@PathVariable UUID id) {
        patientService.deleteAllergy(id);
        return ResponseEntity.ok(ApiResponse.success("Allergy deleted successfully", null));
    }

    // ==========================================
    // 3. CHRONIC CONDITIONS
    // ==========================================

    @GetMapping("/conditions")
    @Operation(summary = "List medical conditions", description = "Retrieves chronic conditions for the authenticated patient")
    public ResponseEntity<ApiResponse<List<ConditionResponse>>> getConditions() {
        return ResponseEntity.ok(ApiResponse.success(patientService.getConditions()));
    }

    @PostMapping("/conditions")
    @Operation(summary = "Record medical condition", description = "Adds a diagnosed condition to patient medical history")
    public ResponseEntity<ApiResponse<ConditionResponse>> createCondition(
            @Valid @RequestBody CreateConditionRequest request) {
        ConditionResponse response = patientService.createCondition(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Condition recorded successfully", response));
    }

    @PutMapping("/conditions/{id}")
    @Operation(summary = "Update medical condition", description = "Updates an existing condition record")
    public ResponseEntity<ApiResponse<ConditionResponse>> updateCondition(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateConditionRequest request) {
        ConditionResponse response = patientService.updateCondition(id, request);
        return ResponseEntity.ok(ApiResponse.success("Condition updated successfully", response));
    }

    @DeleteMapping("/conditions/{id}")
    @Operation(summary = "Delete medical condition", description = "Removes a condition record")
    public ResponseEntity<ApiResponse<Void>> deleteCondition(@PathVariable UUID id) {
        patientService.deleteCondition(id);
        return ResponseEntity.ok(ApiResponse.success("Condition deleted successfully", null));
    }

    // ==========================================
    // 4. SURGICAL HISTORY
    // ==========================================

    @GetMapping("/surgeries")
    @Operation(summary = "List surgical history", description = "Retrieves all past surgeries for the authenticated patient")
    public ResponseEntity<ApiResponse<List<SurgeryResponse>>> getSurgeries() {
        return ResponseEntity.ok(ApiResponse.success(patientService.getSurgeries()));
    }

    @PostMapping("/surgeries")
    @Operation(summary = "Record surgery", description = "Adds a surgical procedure to patient history")
    public ResponseEntity<ApiResponse<SurgeryResponse>> createSurgery(
            @Valid @RequestBody CreateSurgeryRequest request) {
        SurgeryResponse response = patientService.createSurgery(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Surgery recorded successfully", response));
    }

    @PutMapping("/surgeries/{id}")
    @Operation(summary = "Update surgery", description = "Updates an existing surgical procedure record")
    public ResponseEntity<ApiResponse<SurgeryResponse>> updateSurgery(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSurgeryRequest request) {
        SurgeryResponse response = patientService.updateSurgery(id, request);
        return ResponseEntity.ok(ApiResponse.success("Surgery updated successfully", response));
    }

    @DeleteMapping("/surgeries/{id}")
    @Operation(summary = "Delete surgery", description = "Removes a surgical procedure record")
    public ResponseEntity<ApiResponse<Void>> deleteSurgery(@PathVariable UUID id) {
        patientService.deleteSurgery(id);
        return ResponseEntity.ok(ApiResponse.success("Surgery record deleted successfully", null));
    }

    // ==========================================
    // 5. FAMILY MEDICAL HISTORY
    // ==========================================

    @GetMapping("/family-history")
    @Operation(summary = "List family medical history", description = "Retrieves recorded hereditary family health history")
    public ResponseEntity<ApiResponse<List<FamilyHistoryResponse>>> getFamilyHistories() {
        return ResponseEntity.ok(ApiResponse.success(patientService.getFamilyHistories()));
    }

    @PostMapping("/family-history")
    @Operation(summary = "Record family history", description = "Adds a family medical history entry")
    public ResponseEntity<ApiResponse<FamilyHistoryResponse>> createFamilyHistory(
            @Valid @RequestBody CreateFamilyHistoryRequest request) {
        FamilyHistoryResponse response = patientService.createFamilyHistory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Family history entry recorded successfully", response));
    }

    @PutMapping("/family-history/{id}")
    @Operation(summary = "Update family history", description = "Updates a family medical history entry")
    public ResponseEntity<ApiResponse<FamilyHistoryResponse>> updateFamilyHistory(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateFamilyHistoryRequest request) {
        FamilyHistoryResponse response = patientService.updateFamilyHistory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Family history updated successfully", response));
    }

    @DeleteMapping("/family-history/{id}")
    @Operation(summary = "Delete family history", description = "Removes a family history record")
    public ResponseEntity<ApiResponse<Void>> deleteFamilyHistory(@PathVariable UUID id) {
        patientService.deleteFamilyHistory(id);
        return ResponseEntity.ok(ApiResponse.success("Family history record deleted successfully", null));
    }

    // ==========================================
    // 6. LIFESTYLE
    // ==========================================

    @GetMapping("/lifestyle")
    @Operation(summary = "Get lifestyle profile", description = "Retrieves diet, sleep, activity and habit indicators")
    public ResponseEntity<ApiResponse<LifestyleResponse>> getLifestyle() {
        return ResponseEntity.ok(ApiResponse.success(patientService.getLifestyle()));
    }

    @PutMapping("/lifestyle")
    @Operation(summary = "Update lifestyle profile", description = "Updates lifestyle factors (smoking, alcohol, activity, sleep, hydration)")
    public ResponseEntity<ApiResponse<LifestyleResponse>> updateLifestyle(
            @Valid @RequestBody UpdateLifestyleRequest request) {
        LifestyleResponse response = patientService.updateLifestyle(request);
        return ResponseEntity.ok(ApiResponse.success("Lifestyle profile updated successfully", response));
    }

    // ==========================================
    // 7. HEALTH GOALS
    // ==========================================

    @GetMapping("/health-goals")
    @Operation(summary = "List personal health goals", description = "Retrieves active and completed health goals")
    public ResponseEntity<ApiResponse<List<HealthGoalResponse>>> getHealthGoals() {
        return ResponseEntity.ok(ApiResponse.success(patientService.getHealthGoals()));
    }

    @PostMapping("/health-goals")
    @Operation(summary = "Create health goal", description = "Sets a new personal health wellness target")
    public ResponseEntity<ApiResponse<HealthGoalResponse>> createHealthGoal(
            @Valid @RequestBody CreateHealthGoalRequest request) {
        HealthGoalResponse response = patientService.createHealthGoal(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Health goal created successfully", response));
    }

    @PutMapping("/health-goals/{id}")
    @Operation(summary = "Update health goal", description = "Updates progress or status of a health goal")
    public ResponseEntity<ApiResponse<HealthGoalResponse>> updateHealthGoal(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateHealthGoalRequest request) {
        HealthGoalResponse response = patientService.updateHealthGoal(id, request);
        return ResponseEntity.ok(ApiResponse.success("Health goal updated successfully", response));
    }

    @DeleteMapping("/health-goals/{id}")
    @Operation(summary = "Delete health goal", description = "Removes a health goal")
    public ResponseEntity<ApiResponse<Void>> deleteHealthGoal(@PathVariable UUID id) {
        patientService.deleteHealthGoal(id);
        return ResponseEntity.ok(ApiResponse.success("Health goal deleted successfully", null));
    }

    // ==========================================
    // 8. HEALTH TIMELINE FOUNDATION
    // ==========================================

    @GetMapping("/timeline")
    @Operation(summary = "Get patient health timeline", description = "Retrieves chronological clinical events and health milestone entries")
    public ResponseEntity<ApiResponse<List<TimelineEventResponse>>> getTimeline() {
        return ResponseEntity.ok(ApiResponse.success(patientService.getTimelineEvents()));
    }
}
