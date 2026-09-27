package com.healthbuddy.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePatientProfileRequest {

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @Size(max = 20, message = "Gender must be at most 20 characters")
    private String gender;

    @Pattern(regexp = "^(A\\+|A-|B\\+|B-|AB\\+|AB-|O\\+|O-)?$", message = "Blood group must be valid (e.g. A+, O-, AB+)")
    private String bloodGroup;

    @DecimalMin(value = "30.0", message = "Height must be at least 30 cm")
    @DecimalMax(value = "300.0", message = "Height must be at most 300 cm")
    private BigDecimal heightCm;

    @DecimalMin(value = "2.0", message = "Weight must be at least 2 kg")
    @DecimalMax(value = "500.0", message = "Weight must be at most 500 kg")
    private BigDecimal weightKg;

    @Size(max = 255, message = "Occupation must be at most 255 characters")
    private String occupation;

    @Size(max = 50, message = "Marital status must be at most 50 characters")
    private String maritalStatus;

    @Size(max = 1024, message = "Profile photo URL must be at most 1024 characters")
    private String profilePhotoUrl;

    @Size(max = 255, message = "Emergency contact name must be at most 255 characters")
    private String emergencyContactName;

    @Pattern(regexp = "^(\\+?[0-9]{7,15})?$", message = "Emergency contact phone must be valid digits between 7 and 15 characters")
    private String emergencyContactPhone;

    @Size(max = 100, message = "Emergency contact relationship must be at most 100 characters")
    private String emergencyContactRelationship;

    @Size(max = 255, message = "Address line must be at most 255 characters")
    private String addressLine;

    @Size(max = 100, message = "City must be at most 100 characters")
    private String city;

    @Size(max = 100, message = "State must be at most 100 characters")
    private String state;

    @Size(max = 50, message = "Postal code must be at most 50 characters")
    private String postalCode;

    @Size(max = 100, message = "Country must be at most 100 characters")
    private String country;
}
