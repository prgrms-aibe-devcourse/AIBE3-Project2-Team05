package com.back.domain.member.member.entity;

import com.back.global.jpa.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
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

    // ✅ 프리랜서 평균 평점 캐싱용 필드
    @Builder.Default
    private Double averageRating = 0.0;

    // ✅ 리뷰 수 (평균 계산시 분모)
    @Column(nullable = true)
    @Builder.Default
    private int reviewCount = 0;

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
