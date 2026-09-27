package com.healthbuddy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private boolean success;
    private int status;
    private String error;
    private String message;
    private String path;
    private Map<String, String> validationErrors;
    
    @Builder.Default
    private Instant timestamp = Instant.now();
}
