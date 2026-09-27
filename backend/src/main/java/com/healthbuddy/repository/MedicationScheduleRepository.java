package com.healthbuddy.repository;

import com.healthbuddy.entity.Medication;
import com.healthbuddy.entity.MedicationSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedicationScheduleRepository extends JpaRepository<MedicationSchedule, UUID> {

    List<MedicationSchedule> findByMedication(Medication medication);

    void deleteByMedication(Medication medication);
}
