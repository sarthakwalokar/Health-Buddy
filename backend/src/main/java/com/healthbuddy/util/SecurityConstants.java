package com.healthbuddy.util;

public final class SecurityConstants {
    private SecurityConstants() {}

    public static final String TOKEN_HEADER = "Authorization";
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String TOKEN_TYPE = "Bearer";
    public static final String CLAIM_USER_ID = "userId";
    public static final String CLAIM_ROLES = "roles";
    public static final String CLAIM_EMAIL = "email";
}
