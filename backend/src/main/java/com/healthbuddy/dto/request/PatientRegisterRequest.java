package com.healthbuddy.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientRegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email format is invalid")
    private String email;

    @Pattern(regexp = "^(\\+?[0-9]{7,15})?$", message = "Phone number must be valid digits between 7 and 15 characters")
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters long")
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!._-]).{8,}$",
        message = "Password must contain at least one digit, one lowercase, one uppercase, and one special character"
    )
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;
}
