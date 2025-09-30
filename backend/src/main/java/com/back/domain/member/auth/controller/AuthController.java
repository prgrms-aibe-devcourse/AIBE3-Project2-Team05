package com.back.domain.member.auth.controller;

import com.back.domain.member.auth.dto.FindIdReq;
import com.back.domain.member.auth.dto.FindIdRes;
import com.back.domain.member.auth.dto.FindPassWordReq;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.MemberService;
import com.back.global.exception.ServiceException;
import com.back.global.rsData.RsData;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RequestMapping("/auth")
@Tag(name = "AuthController", description = "회원 정보 찾기 컨트롤러")
@RestController
public class AuthController {
    private final MemberService memberService;

    @Transactional
    @PostMapping("findId")
    public RsData<FindIdRes> findId(@Valid @RequestBody FindIdReq req) {
        String inputEmail = req.getEmail();

        Member member = memberService.findByEmail(inputEmail).orElseThrow(() -> new ServiceException("400-3", "존재하지 않는 회원입니다."));

        return new RsData<>("200-1", "회원님의 아이디는 %s 입니다.".formatted(member.getUsername()));
    }

    @Transactional
    @PutMapping("updatePassword")
    public RsData<Void> updatePassword(@Valid @RequestBody FindPassWordReq req) {

        Member member = memberService.findByUsername(req.getUsername()).orElseThrow(() -> new ServiceException("400-3", "존재하지 않는 회원입니다."));

        if (!member.getEmail().equals(req.getEmail())) {
            throw new ServiceException("400-3", "존재하지 않는 이메일입니다.");
        }

        memberService.updatePassword(member, req.getNewPassword());

        return new RsData<>("200-1", "%s 님의 비밀번호가 변경되었습니다.".formatted(req.getUsername()));
    }

}
