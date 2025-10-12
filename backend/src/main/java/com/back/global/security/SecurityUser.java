package com.back.global.security;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.member.member.entity.Member;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

/**
 * 임시 클래스 - 매칭 시스템 개발/테스트용
 * TODO: [Security 담당자] - 정식 SecurityUser로 교체 필요
 *
 * Spring Security 인증 사용자
 */
@Getter
public class SecurityUser extends User {

    private final Member member;

    public SecurityUser(Member member, Collection<? extends GrantedAuthority> authorities) {
        super(member.getUsername(), member.getPassword(), authorities);
        this.member = member;
    }

    /**
     * 임시 메서드 - 실제로는 FreelancerRepository에서 조회해야 함
     * TODO: Controller에서 FreelancerRepository 주입받아 조회하도록 수정 필요
     *
     * 프리랜서 정보 조회
     * 현재는 null 반환 (실제 구현 필요)
     */
    public Freelancer getFreelancer() {
        // TODO: FreelancerRepository.findByMember(member) 구현 필요
        return null;
    }
}
