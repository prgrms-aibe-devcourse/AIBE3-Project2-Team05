package com.back.domain.member.member.dto;

import com.back.domain.member.member.entity.Member;

import java.time.LocalDateTime;

public record MemberDto(
        long id,
        LocalDateTime createDate,
        LocalDateTime modifyDate,
        String username,
        String nickname,
        String email
) {

    public MemberDto(Member member) {
        this(
                member.getId(),
                member.getCreateDate(),
                member.getModifyDate(),
                member.getUsername(),
                member.getNickname(),
                member.getEmail()
        );
    }
}
