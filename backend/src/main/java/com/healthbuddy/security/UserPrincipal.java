package com.healthbuddy.security;

import com.healthbuddy.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Getter
@Builder
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private final UUID id;
    private final String email;
    private final String password;
    private final String fullName;
    private final boolean enabled;
    private final boolean accountNonLocked;
    private final Collection<? extends GrantedAuthority> authorities;

    public static UserPrincipal create(User user) {
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toList());

        return UserPrincipal.builder()
                .id(user.getId())
                .email(user.getEmail())
                .password(user.getPasswordHash())
                .fullName(user.getFullName())
                .enabled(user.isEnabled())
                .accountNonLocked(user.isAccountNonLocked())
                .authorities(authorities)
                .build();
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    public boolean hasRole(String roleName) {
        String target = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
        return authorities.stream().anyMatch(a -> a.getAuthority().equals(target));
    }
}
