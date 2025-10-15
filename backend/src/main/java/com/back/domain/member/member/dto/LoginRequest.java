package com.back.domain.member.member.dto;

/**
 * 로그인 요청 DTO
 */
public record LoginRequest(
        String username,
        String password
) {
}
