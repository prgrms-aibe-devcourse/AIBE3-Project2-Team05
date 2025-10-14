package com.back.domain.member.member.dto;

import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.entity.Role;

import java.time.LocalDateTime;
import java.util.List;

public record MemberDto(
        long id,
        LocalDateTime createDate,
        LocalDateTime modifyDate,
        String username,
        String nickname,
        String email,
        List<Role> roles
) {

    public MemberDto(Member member) {
        this(
                member.getId(),
                member.getCreateDate(),
                member.getModifyDate(),
                member.getUsername(),
                member.getNickname(),
                member.getEmail(),
                member.getRoles()
        );
    }
}
