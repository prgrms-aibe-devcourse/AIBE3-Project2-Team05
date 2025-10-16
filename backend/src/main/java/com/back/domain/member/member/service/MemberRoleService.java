package com.back.domain.member.member.service;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.freelancer.portfolio.entity.Portfolio;
import com.back.domain.freelancer.portfolio.repository.PortfolioRepository;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.entity.Role;
import com.back.domain.member.member.repository.MemberRepository;
import com.back.domain.project.entity.Project;
import com.back.domain.project.repository.ProjectRepository;
import com.back.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemberRoleService {
    private final MemberRepository memberRepository;
    private final ProjectRepository projectRepository;
    private final PortfolioRepository portfolioRepository;
    private final FreelancerRepository freelancerRepository;

    @Transactional
    public void updateRoles(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ServiceException("400-3", "존재하지 않는 회원입니다."));

        // 프로젝트 매니저 여부 확인
        List<Project> projects = projectRepository.findByManager_IdOrderByCreateDateDesc(memberId);
        boolean hasProject = !projects.isEmpty();

        // 프리랜서 포트폴리오 여부 확인 (Optional 사용)
        boolean hasPortfolio = false;
        Optional<Freelancer> freelancerOpt = freelancerRepository.findByMemberId(memberId);
        if (freelancerOpt.isPresent()) {
            List<Portfolio> portfolios = portfolioRepository.findAllByFreelancerId(freelancerOpt.get().getId());
            hasPortfolio = !portfolios.isEmpty();
        }

        // 역할 업데이트
        member.getRoles().clear();

        if (hasProject) {
            member.getRoles().add(Role.PM);
        }
        if (hasPortfolio) {
            member.getRoles().add(Role.FREELANCER);
        }
        if (!hasPortfolio && !hasProject) {
            member.getRoles().add(Role.GENERAL);
        }

        memberRepository.save(member);
    }
}
