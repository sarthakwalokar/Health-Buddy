package com.healthbuddy.config;

import com.healthbuddy.entity.Role;
import com.healthbuddy.entity.RoleType;
import com.healthbuddy.entity.User;
import com.healthbuddy.repository.RoleRepository;
import com.healthbuddy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Component
@Slf4j
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin-bootstrap.email:admin@healthbuddy.com}")
    private String adminEmail;

    @Value("${app.admin-bootstrap.password:Admin@HealthBuddy2026!}")
    private String adminPassword;

    @Value("${app.admin-bootstrap.full-name:System Administrator}")
    private String adminFullName;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking initial system roles and administrator account...");

        // Ensure all system roles are initialized
        Role patientRole = getOrCreateRole(RoleType.ROLE_PATIENT, "Patient role for health tracking");
        Role doctorRole = getOrCreateRole(RoleType.ROLE_DOCTOR, "Doctor role for clinical decision support");
        Role adminRole = getOrCreateRole(RoleType.ROLE_ADMIN, "System Administrator");

        // Bootstrap Admin Account if not already present
        if (!userRepository.existsByEmailIgnoreCase(adminEmail)) {
            log.info("Bootstrapping initial Administrator account for email: {}", adminEmail);

            User admin = User.builder()
                    .email(adminEmail.toLowerCase())
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .fullName(adminFullName)
                    .phone("+15550001111")
                    .enabled(true)
                    .accountNonLocked(true)
                    .roles(Set.of(adminRole))
                    .build();

            userRepository.save(admin);
            log.info("Administrator bootstrap completed successfully.");
        } else {
            log.info("Administrator account already exists.");
        }
    }

    private Role getOrCreateRole(RoleType roleType, String description) {
        return roleRepository.findByName(roleType)
                .orElseGet(() -> roleRepository.save(new Role(roleType, description)));
    }
}
