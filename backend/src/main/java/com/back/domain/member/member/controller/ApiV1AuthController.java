package com.back.domain.member.member.controller;

import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.member.member.dto.LoginRequest;
import com.back.domain.member.member.dto.MemberDto;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.repository.MemberRepository;
import com.back.domain.project.project.repository.ProjectRepository;
import com.back.global.exception.ServiceException;
import com.back.global.rsData.RsData;
import com.back.global.security.SecurityUser;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * 인증 API Controller
 * username/password 기반 로그인
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class ApiV1AuthController {

    private final MemberRepository memberRepository;
    private final FreelancerRepository freelancerRepository;
    private final ProjectRepository projectRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 로그인 (username/password 검증 후 쿠키 설정)
     */
    @PostMapping("/login")
    public RsData<MemberDto> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        // username으로 회원 찾기
        Member member = memberRepository.findByUsername(request.username())
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 사용자입니다."));

        // 비밀번호 검증 (BCrypt 또는 평문)
        boolean passwordMatches;
        if (member.getPassword().startsWith("$2a$") || member.getPassword().startsWith("$2b$")) {
            // BCrypt 해시인 경우
            passwordMatches = passwordEncoder.matches(request.password(), member.getPassword());
        } else {
            // 평문인 경우 (개발 환경)
            passwordMatches = member.getPassword().equals(request.password());
        }

        if (!passwordMatches) {
            throw new ServiceException("401-1", "비밀번호가 일치하지 않습니다.");
        }

        // 역할 판별 (프리랜서 테이블에 있으면 FREELANCER, 프로젝트가 있으면 PM)
        boolean isFreelancer = freelancerRepository.existsByMember(member);
        boolean isPM = projectRepository.existsByPm(member);

        String role = isFreelancer ? "FREELANCER" : (isPM ? "PM" : "MEMBER");

        // 쿠키에 memberId 저장
        Cookie cookie = new Cookie("X-Test-Member-Id", member.getId().toString());
        cookie.setPath("/");
        cookie.setMaxAge(60 * 60 * 24); // 1일
        cookie.setHttpOnly(true);
        response.addCookie(cookie);

        return new RsData<>(
                "200-1",
                "로그인 성공",
                new MemberDto(member, role)
        );
    }

    /**
     * 로그아웃
     */
    @PostMapping("/logout")
    public RsData<Void> logout(HttpServletResponse response) {
        // 쿠키 삭제
        Cookie cookie = new Cookie("X-Test-Member-Id", "");
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setHttpOnly(true);
        response.addCookie(cookie);

        return new RsData<>(
                "200-1",
                "로그아웃 성공"
        );
    }

    /**
     * 현재 로그인한 사용자 정보 조회
     */
    @GetMapping("/me")
    public RsData<MemberDto> me(@AuthenticationPrincipal SecurityUser user) {
        if (user == null) {
            throw new ServiceException("401-1", "로그인이 필요합니다.");
        }

        Member member = user.getMember();

        // 역할 판별
        boolean isFreelancer = freelancerRepository.existsByMember(member);
        boolean isPM = projectRepository.existsByPm(member);

        String role = isFreelancer ? "FREELANCER" : (isPM ? "PM" : "MEMBER");

        return new RsData<>(
                "200-1",
                "사용자 정보 조회 성공",
                new MemberDto(member, role)
        );
    }
}
