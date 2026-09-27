package com.healthbuddy.mapper;

import com.healthbuddy.dto.response.SurgeryResponse;
import com.healthbuddy.entity.PatientSurgery;
import org.springframework.stereotype.Component;

@Component
public class PatientSurgeryMapper {

    public SurgeryResponse toSurgeryResponse(PatientSurgery surgery) {
        if (surgery == null) return null;

        return SurgeryResponse.builder()
                .id(surgery.getId())
                .procedureName(surgery.getProcedureName())
                .dateOfSurgery(surgery.getDateOfSurgery())
                .hospitalName(surgery.getHospitalName())
                .notes(surgery.getNotes())
                .createdAt(surgery.getCreatedAt())
                .updatedAt(surgery.getUpdatedAt())
                .build();
    }
}
