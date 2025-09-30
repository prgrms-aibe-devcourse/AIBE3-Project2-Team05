package com.back.domain.member.member.entity;

import com.back.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Entity
@Table
public class Member extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String username;

    private String password;

    @Column(unique = true)
    private String nickname;

    @Column(unique = true)
    private String email;

    @ElementCollection(fetch = FetchType.LAZY)
    @Enumerated(EnumType.STRING)
    private List<Role> roles = new ArrayList<>();

    public Member(String username, String nickname, String password, String email) {
        this.username = username;
        this.nickname = nickname;
        this.password = password;
        this.email = email;
    }

    public void changePassword(String newPassword, PasswordEncoder passwordEncoder) {
        this.password = passwordEncoder.encode(newPassword);
    }
}
