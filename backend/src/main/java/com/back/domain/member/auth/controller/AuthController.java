package com.back.domain.member.auth.controller;

import com.back.domain.member.auth.dto.FindIdReq;
import com.back.domain.member.auth.dto.FindIdRes;
import com.back.domain.member.auth.dto.FindPassWordReq;
import com.back.domain.member.email.service.EmailService;
import com.back.domain.member.member.dto.MemberDto;
import com.back.domain.member.member.dto.MemberLoginRes;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.AuthTokenService;
import com.back.domain.member.member.service.MemberService;
import com.back.global.exception.ServiceException;
import com.back.global.exception.UnauthorizedException;
import com.back.global.rq.Rq;
import com.back.global.rsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.FileNameMap;
import java.time.LocalDateTime;

@RequiredArgsConstructor
@RequestMapping("/auth")
@Tag(name = "AuthController", description = "회원 정보 찾기 컨트롤러")
@RestController
public class AuthController {
    private final MemberService memberService;
    private final AuthTokenService authTokenService;
    private final EmailService emailService;
    private final Rq rq;

    @Transactional
    @Operation(summary = "아이디 찾기")
    @PostMapping("findId")
    public RsData<FindIdRes> findId(@Valid @RequestBody FindIdReq req) {
        String inputEmail = req.getEmail();

        Member member = memberService.findByEmail(inputEmail).orElseThrow(() -> new ServiceException("400-3", "존재하지 않는 회원입니다."));

        String code = emailService.createCode();

        emailService.saveCode(inputEmail, code);

        emailService.send(req.getEmail(), "[FIT] 이메일 인증 코드 안내", code);


        return new RsData<>("200-1", "회원님의 아이디는 %s 입니다.".formatted(member.getUsername()));
    }

    @Transactional
    @Operation(summary = "비밀번호 찾기")
    @PutMapping("updatePassword")
    public RsData<Void> updatePassword(@Valid @RequestBody FindPassWordReq req) {

        Member member = memberService.findByUsername(req.getUsername()).orElseThrow(() -> new ServiceException("400-3", "존재하지 않는 회원입니다."));

        if (!member.getEmail().equals(req.getEmail())) {
            throw new ServiceException("400-3", "존재하지 않는 이메일입니다.");
        }

        memberService.updatePassword(member, req.getNewPassword());

        return new RsData<>("200-1", "%s 님의 비밀번호가 변경되었습니다.".formatted(req.getUsername()));
    }

    @Transactional
    @Operation(summary = "AccessToken 재발급")
    @PostMapping("refresh")
    public RsData<MemberLoginRes> refreshAccessToken() {
        String refreshToken = rq.getCookieValue("refreshToken", "");
        Member member = memberService.findByRefreshToken(refreshToken).orElseThrow(() -> new UnauthorizedException("401-3", "리프레시 토큰이 없습니다."));
        if (member.getRefreshTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("401-3", "리프레시 토큰이 만료되었습니다.");
        }

        String accessToken = authTokenService.genAccessToken(member);
        member.issueRefreshToken();
        memberService.save(member);

        rq.setCookie("accessToken", accessToken);
        rq.setCookie("refreshToken", member.getRefreshToken());

        return new RsData<>("200-6", "AccessToken & RefreshToken 재발급 완료", new MemberLoginRes(new MemberDto(member), member.getRefreshToken(), accessToken));
    }

    @PostMapping("/email")
    public RsData<Void> sendEmail(@Valid @RequestBody FindIdReq req) {
        String code = emailService.createCode();

        emailService.send(req.getEmail(), "[FIT] 이메일 테스트", code);

        return new RsData<>("200-1", "이메일이 발송되었습니다.");
    }
}
