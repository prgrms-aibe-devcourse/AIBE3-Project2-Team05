package com.back.global.security;

import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.AuthTokenService;
import com.back.domain.member.member.service.MemberService;
import com.back.global.exception.UnauthorizedException;
import com.back.global.rq.Rq;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationFilter extends OncePerRequestFilter {
    private final Rq rq;
    private final AuthTokenService authTokenService;
    private final MemberService memberService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        if (List.of("/member/login", "/member", "/auth/findId").contains(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        String refreshToken = rq.getCookieValue("refreshToken", "");
        String accessToken = rq.getCookieValue("accessToken", "");

        if (refreshToken.isBlank() && accessToken.isBlank()) {
            throw new UnauthorizedException("401-2", "로그인 후 사용하세요.");
        }

        Member member = null;
        boolean isAccessTokenExists = !accessToken.isBlank();
        boolean isAccessTokenValid = false;

        if (isAccessTokenExists) {
            Map<String, Object> payload = authTokenService.payload(accessToken);

            if (payload != null) {
                long id = ((Number) payload.get("id")).longValue();
                String username = (String) payload.get("username");
                String nickname = (String) payload.get("nickname");
                member = new Member(id, username, nickname);

                //토큰 검증
                isAccessTokenValid = true;
            }
        }
        if (member == null) {
            member = memberService.findByRefreshToken(refreshToken)
                    .orElseThrow(() -> new UnauthorizedException("401-3", "리프레시 토큰이 없습니다."));
        }
        if (isAccessTokenExists && !isAccessTokenValid) {
            String newAccessToken = authTokenService.genAccessToken(member);

            rq.setCookie("accessToken", newAccessToken);
        }
        UserDetails userDetails = new SecurityUser(
                member.getId(),
                member.getUsername(),
                "",
                member.getNickname(),
                member.getRoles()
        );

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        SecurityContextHolder
                .getContext()
                .setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }
}

