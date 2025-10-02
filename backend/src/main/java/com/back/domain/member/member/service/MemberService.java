package com.back.domain.member.member.service;

import com.back.domain.member.member.dto.MemberDto;
import com.back.domain.member.member.dto.MemberLoginReq;
import com.back.domain.member.member.dto.MemberLoginRes;
import com.back.domain.member.member.dto.UpdateMemberReq;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.entity.Role;
import com.back.domain.member.member.repository.MemberRepository;
import com.back.global.exception.ServiceException;
import com.back.global.rq.Rq;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;


@RequiredArgsConstructor
@Service
public class MemberService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthTokenService authTokenService;
    private final Rq rq;

    public Member join(String username, String nickname, String password, String email) {

        password = passwordEncoder.encode(password);

        Member member = new Member(username, nickname, password, email);

        member.getRoles().add(Role.GENERAL);
        return memberRepository.save(member);

    }
    @Transactional
    public MemberLoginRes login(MemberLoginReq req) {
        Member member = memberRepository.findByUsername(req.getUsername())
                .orElseThrow(() -> new ServiceException("400-3", "존재하지 않는 회원입니다."));

        checkPassword(member, req.getPassword());

        member.issueRefreshToken();
        memberRepository.save(member);

        String accessToken = authTokenService.genAccessToken(member);

        rq.setCookie("refreshToken", member.getRefreshToken());
        rq.setCookie("accessToken", accessToken);


        System.out.println("refreshToken = " + member.getRefreshToken());
        System.out.println("accessToken = " + accessToken);

        return new MemberLoginRes(new MemberDto(member), member.getRefreshToken(), accessToken);

    }


    public Optional<Member> findByUsername(String username) {
        return memberRepository.findByUsername(username);
    }

    public void checkPassword(Member member, String password) {
        if (!passwordEncoder.matches(password, member.getPassword())) {
            throw new ServiceException("400-3", "비밀번호가 일치하지 않습니다.");
        }
    }

    public Optional<Member> findById(long id) {
        return memberRepository.findById(id);
    }

    public Optional<Member> findByEmail(String email) {
        return memberRepository.findByEmail(email);
    }

    public void updatePassword(Member member, String newPassword) {
        member.changePassword(newPassword, passwordEncoder);
        memberRepository.save(member);
    }

    public Member updateMember(long id, UpdateMemberReq req) {
        Member member = memberRepository.findById(id).orElseThrow(() -> new ServiceException("400-3", "회원을 찾을 수 없습니다."));

        if (req.getEmail() != null && !req.getEmail().equals(member.getEmail())) {
            member.updateEmail(req.getEmail());
        }

        if (req.getNickname() != null && !req.getNickname().equals(member.getNickname())) {
            member.updateNickName(req.getNickname());
        }

        return memberRepository.save(member);
    }

    public Optional<Member> findByRefreshToken(String refreshToken) {
        return memberRepository.findByRefreshToken(refreshToken);
    }

    public void save(Member member) {
        memberRepository.save(member);
    }

    public void logout(Member member) {
        member.logout();
        memberRepository.save(member);
    }
}
