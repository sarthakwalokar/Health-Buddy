package com.healthbuddy.entity;

public enum RoleType {
    ROLE_PATIENT,
    ROLE_DOCTOR,
    ROLE_ADMIN;

    public String getSimpleName() {
        return name().replace("ROLE_", "");
    }

    public static RoleType fromSimpleName(String simpleName) {
        if (simpleName == null) return null;
        String normalized = simpleName.trim().toUpperCase();
        if (normalized.startsWith("ROLE_")) {
            return RoleType.valueOf(normalized);
        }
        return RoleType.valueOf("ROLE_" + normalized);
    }
}
