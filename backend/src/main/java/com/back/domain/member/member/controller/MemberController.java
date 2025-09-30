package com.back.domain.member.member.controller;

import com.back.domain.member.member.dto.MemberDto;
import com.back.domain.member.member.dto.MemberJoinReq;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.MemberService;
import com.back.global.rsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RequestMapping("/member")
@Tag(name = "MemberController", description = "API 멤버 컨트롤러")
@RestController
public class MemberController {

    private final MemberService memberService;

    @Transactional
    @PostMapping
    @Operation(summary = "회원가입")
    public RsData<MemberDto> join(@Valid @RequestBody MemberJoinReq req) {
        Member member = memberService.join(req.getUsername(), req.getNickname(), req.getPassword(), req.getEmail());
        return new RsData<>("200-1", "%s 님 환영합니다.".formatted(member.getUsername()), new MemberDto(member));

    }
}
