package com.healthbuddy.service;

import com.healthbuddy.dto.request.*;
import com.healthbuddy.dto.response.*;

import java.util.List;
import java.util.UUID;

public interface PatientService {
    // 1. Profile
    PatientProfileResponse getMyProfile();
    PatientProfileResponse updateMyProfile(UpdatePatientProfileRequest updateRequest);

    // 2. Allergies
    List<AllergyResponse> getAllergies();
    AllergyResponse createAllergy(CreateAllergyRequest request);
    AllergyResponse updateAllergy(UUID allergyId, UpdateAllergyRequest request);
    void deleteAllergy(UUID allergyId);

    // 3. Conditions
    List<ConditionResponse> getConditions();
    ConditionResponse createCondition(CreateConditionRequest request);
    ConditionResponse updateCondition(UUID conditionId, UpdateConditionRequest request);
    void deleteCondition(UUID conditionId);

    // 4. Surgeries
    List<SurgeryResponse> getSurgeries();
    SurgeryResponse createSurgery(CreateSurgeryRequest request);
    SurgeryResponse updateSurgery(UUID surgeryId, UpdateSurgeryRequest request);
    void deleteSurgery(UUID surgeryId);

    // 5. Family History
    List<FamilyHistoryResponse> getFamilyHistories();
    FamilyHistoryResponse createFamilyHistory(CreateFamilyHistoryRequest request);
    FamilyHistoryResponse updateFamilyHistory(UUID historyId, UpdateFamilyHistoryRequest request);
    void deleteFamilyHistory(UUID historyId);

    // 6. Lifestyle
    LifestyleResponse getLifestyle();
    LifestyleResponse updateLifestyle(UpdateLifestyleRequest request);

    // 7. Health Goals
    List<HealthGoalResponse> getHealthGoals();
    HealthGoalResponse createHealthGoal(CreateHealthGoalRequest request);
    HealthGoalResponse updateHealthGoal(UUID goalId, UpdateHealthGoalRequest request);
    void deleteHealthGoal(UUID goalId);

    // 8. Health Timeline Foundation
    List<TimelineEventResponse> getTimelineEvents();
}
