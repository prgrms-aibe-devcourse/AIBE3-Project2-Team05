package com.back.domain.member.member.service;

import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.entity.Role;
import com.back.domain.member.member.repository.MemberRepository;
import com.back.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;


@RequiredArgsConstructor
@Service
public class MemberService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public Member join(String username, String nickname, String password, String email) {

        password = passwordEncoder.encode(password);

        Member member = new Member(username, nickname, password, email);

        member.getRoles().add(Role.GENERAL);
        return memberRepository.save(member);

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

}
