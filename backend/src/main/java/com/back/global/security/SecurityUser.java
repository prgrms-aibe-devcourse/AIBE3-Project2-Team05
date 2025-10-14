package com.back.global.security;

import com.back.domain.member.member.entity.Role;
import lombok.Getter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.List;

public class SecurityUser extends User {
    @Getter
    private long id;
    @Getter
    private String nickname;

    public SecurityUser(
            long id,
            String username,
            String password,
            String nickname,
            List<Role> roles
    ) {
        super(username, password != null ? password : "",
                roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.name()))
                        .toList());

        this.id = id;
        this.nickname = nickname;
    }

}
