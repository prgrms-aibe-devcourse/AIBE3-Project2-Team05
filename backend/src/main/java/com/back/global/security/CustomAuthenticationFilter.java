package com.back.global.security;

import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.AuthTokenService;
import com.back.domain.member.member.service.JwtBlacklistService;
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
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationFilter extends OncePerRequestFilter {

    private final Rq rq;
    private final AuthTokenService authTokenService;
    private final JwtBlacklistService jwtBlacklistService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String uri = request.getRequestURI();
        String method = request.getMethod();

        // 허용 URI/메서드 체크
        if ((// OpenAPI/Swagger 관련 경로
                uri.startsWith("/v3/api-docs") ||
                uri.startsWith("/swagger-ui") ||
                uri.equals("/swagger-ui.html") ||
                uri.startsWith("/swagger-resources") ||
                uri.startsWith("/webjars") ||
                uri.startsWith("/webjars") ||
                uri.equals("/member") && method.equals("POST")) ||  // 회원가입
                (uri.equals("/member/login") && method.equals("POST")) || // 로그인
                (uri.equals("/auth/findId/verify") && method.equals("POST")) ||
                (uri.equals("/auth/findId/sendCode") && method.equals("POST")) ||
                (uri.equals("/auth/updatePassword/sendCode") && method.equals("POST")) ||
                (uri.equals("/auth/updatePassword/verify") && method.equals("PUT")) ||
                (uri.equals("/auth/refresh") && method.equals("POST"))) {

            filterChain.doFilter(request, response);
            return;
        }

        // JWT 체크
        String accessToken = rq.getCookieValue("accessToken", "");
        if (accessToken.isBlank()) {
            throw new UnauthorizedException("401-2", "로그인 후 사용하세요.");
        }

        if (jwtBlacklistService.isBlacklisted(accessToken)) {
            throw new UnauthorizedException("401-4", "로그아웃된 토큰입니다.");
        }

        Map<String, Object> payload = authTokenService.payload(accessToken);
        if (payload == null) {
            throw new UnauthorizedException("401-3", "AccessToken이 유효하지 않습니다.");
        }

        long id = ((Number) payload.get("id")).longValue();
        String username = (String) payload.get("username");
        String nickname = (String) payload.get("nickname");

        Member member = new Member(id, username, nickname);

        UserDetails userDetails = new SecurityUser(
                member.getId(),
                member.getUsername(),
                "",
                member.getNickname(),
                member.getRoles()
        );

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }
}
