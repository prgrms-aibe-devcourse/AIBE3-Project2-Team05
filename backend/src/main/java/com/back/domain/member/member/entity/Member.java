package com.back.domain.member.member.entity;

import com.back.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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

    private String refreshToken;

    private LocalDateTime refreshTokenExpiry;  // 만료 시간

    public Member(String username, String nickname, String password, String email) {
        this.username = username;
        this.nickname = nickname;
        this.password = password;
        this.email = email;
    }

    public Member (long id, String username, String nickname) {
        this.id = id;
        this.username = username;
        this.nickname = nickname;
    }

    public void changePassword(String newPassword, PasswordEncoder passwordEncoder) {
        this.password = passwordEncoder.encode(newPassword);
    }

    public void updateEmail(String email) {
        this.email = email;
    }

    public void updateNickName(String nickname) {
        this.nickname = nickname;
    }
    public void issueRefreshToken() {
        this.refreshToken = UUID.randomUUID().toString();
        this.refreshTokenExpiry = LocalDateTime.now().plusDays(14);
    }
    public void logout() {
        this.refreshToken = null;
        this.refreshTokenExpiry = null;
    }
}
