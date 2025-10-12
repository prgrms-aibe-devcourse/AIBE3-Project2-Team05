package com.back.domain.member.member.entity;

import com.back.global.baseEntity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 임시 엔티티 - 매칭 시스템 개발/테스트용
 * TODO: [Member 담당자] - 정식 엔티티로 교체 필요
 * 브랜치: feature/matching-temp (main merge 대기)
 * 생성: 2025-10-12 임창기 (매칭 시스템)
 *
 * 회원 엔티티 (최소 필드만 구현)
 */
@Entity
@Table(name = "member")
@Getter
@NoArgsConstructor
public class Member extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * 로그인 ID
     */
    @Column(name = "username", nullable = false, length = 50, unique = true)
    private String username;

    /**
     * 비밀번호
     */
    @Column(name = "password", nullable = false)
    private String password;

    /**
     * 닉네임
     */
    @Column(name = "nickname", nullable = false, length = 50)
    private String nickname;

    /**
     * 이메일
     */
    @Column(name = "email", nullable = false, length = 100, unique = true)
    private String email;

    /**
     * 생성자
     */
    public Member(String username, String password, String nickname, String email) {
        this.username = username;
        this.password = password;
        this.nickname = nickname;
        this.email = email;
    }
}
