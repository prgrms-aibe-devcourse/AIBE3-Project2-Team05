package com.back.domain.member.member.service;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.service.FreelancerFinder;
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

@Service
@RequiredArgsConstructor
public class MemberRoleService {
    private final MemberRepository memberRepository;
    private final ProjectRepository projectRepository;
    private final PortfolioRepository portfolioRepository;
    private final FreelancerFinder freelancerFinder;

    @Transactional
    public void updateRoles(Long memberId) {
        Member member = memberRepository.findById(memberId).orElseThrow(() -> new ServiceException("400-3", "존재하지 않는 회원입니다."));

        List<Project> projects = projectRepository.findByManager_IdOrderByCreateDateDesc(memberId);
        boolean hasProject = !projects.isEmpty();

        Freelancer freelancer = freelancerFinder.findFreelancerByMemberId(memberId);
        List<Portfolio> portfolios = portfolioRepository.findAllByFreelancerId(freelancer.getId());
        boolean hasPortfolio = !portfolios.isEmpty();

        member.getRoles().clear();

        if(hasProject) member.getRoles().add(Role.PM);
        if(hasPortfolio) member.getRoles().add(Role.FREELANCER);


        if(!hasPortfolio && !hasProject) member.getRoles().add(Role.GENERAL);

        memberRepository.save(member);



    }

}
