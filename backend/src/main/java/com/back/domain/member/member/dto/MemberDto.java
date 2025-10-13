package com.back.domain.member.member.dto;

import com.back.domain.member.member.entity.Member;

/**
 * 회원 정보 DTO
 */
public record MemberDto(
        Long id,
        String username,
        String nickname,
        String email,
        String role  // "PM" or "FREELANCER"
) {
    public MemberDto(Member member, String role) {
        this(
                member.getId(),
                member.getUsername(),
                member.getNickname(),
                member.getEmail(),
                role
        );
    }
}
