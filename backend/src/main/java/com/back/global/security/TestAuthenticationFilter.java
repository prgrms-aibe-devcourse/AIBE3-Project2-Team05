package com.back.global.security;

import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.repository.MemberRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * 개발 환경 테스트용 인증 필터
 * X-Test-Member-Id 헤더로 회원 ID를 받아서 인증 처리
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
public class TestAuthenticationFilter extends OncePerRequestFilter {

    private final MemberRepository memberRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String testMemberId = request.getHeader("X-Test-Member-Id");

        // 헤더에 없으면 쿠키에서 찾기
        if (testMemberId == null && request.getCookies() != null) {
            for (var cookie : request.getCookies()) {
                if ("X-Test-Member-Id".equals(cookie.getName())) {
                    testMemberId = cookie.getValue();
                    break;
                }
            }
        }

        if (testMemberId != null) {
            try {
                Long memberId = Long.parseLong(testMemberId);
                Member member = memberRepository.findById(memberId).orElse(null);

                if (member != null) {
                    SecurityUser securityUser = new SecurityUser(member, Collections.emptyList());
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    securityUser,
                                    null,
                                    Collections.emptyList()
                            );
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (NumberFormatException e) {
                // Invalid member ID format, skip authentication
            }
        }

        filterChain.doFilter(request, response);
    }
}
