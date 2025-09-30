package com.back.domain.member.member.controller;

import com.back.domain.member.member.dto.MemberDto;
import com.back.domain.member.member.dto.MemberJoinReq;
import com.back.domain.member.member.dto.MemberLoginReq;
import com.back.domain.member.member.dto.MemberLoginRes;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.AuthTokenService;
import com.back.domain.member.member.service.MemberService;
import com.back.global.exception.ServiceException;
import com.back.global.rq.Rq;
import com.back.global.rsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;


@RequiredArgsConstructor
@RequestMapping("/member")
@Tag(name = "MemberController", description = "API 멤버 컨트롤러")
@RestController
public class MemberController {

    private final MemberService memberService;
    private final AuthTokenService authTokenService;
    private final Rq rq;

    @Transactional
    @PostMapping
    @Operation(summary = "회원가입")
    public RsData<MemberDto> join(@Valid @RequestBody MemberJoinReq req) {
        Member member = memberService.join(req.getUsername(), req.getNickname(), req.getPassword(), req.getEmail());

        return new RsData<>("200-1", "%s 님 환영합니다. 회원가입이 완료 되었습니다.".formatted(member.getUsername()), new MemberDto(member));

    }

    @Transactional
    @PostMapping("login")
    @Operation(summary = "로그인")
    public RsData<MemberLoginRes> login(@Valid @RequestBody MemberLoginReq req) {
        Member member = memberService.findByUsername(req.getUsername())
                .orElseThrow(() -> new ServiceException("400-3", "존재하지 않는 회원입니다."));

        memberService.checkPassword(member, req.getPassword());

        String accessToken = authTokenService.genAccessToken(member);

        rq.setCookie("refreshToken", member.getRefreshToken());
        rq.setCookie("accessToken", accessToken);

        return new RsData<>("200-1", "%s 님 환영합니다.".formatted(req.getUsername()), new MemberLoginRes(new MemberDto(member), member.getRefreshToken(), accessToken));

    }

    @Transactional
    @DeleteMapping("logout")
    @Operation(summary = "로그아웃")
    public RsData<Void> logout() {

        rq.deleteCookie("refreshToken");
        rq.deleteCookie("accessToken");

        return new RsData<>("200-1", "로그아웃 되었습니다.");
    }

    @Transactional(readOnly = true)
    @GetMapping("/me/{id}")
    @Operation(summary = "내 정보")
    public RsData<MemberDto> me(@PathVariable long id) {
        Member member = memberService.findById(id).orElseThrow(() -> new ServiceException("400-3", "존재하지 않는 회원입니다."));

        return new RsData<>("200-1", "%s 님의 정보입니다.".formatted(member.getUsername()), new MemberDto(member));
    }
}

