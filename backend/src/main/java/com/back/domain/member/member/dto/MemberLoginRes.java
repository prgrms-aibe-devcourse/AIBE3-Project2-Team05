package com.back.domain.member.member.dto;

public record MemberLoginRes(
        MemberDto MemberDto,
        String refreshToken,
        String accessToken
        ) {
}
