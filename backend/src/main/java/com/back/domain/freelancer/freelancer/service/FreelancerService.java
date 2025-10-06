package com.back.domain.freelancer.freelancer.service;

import com.back.domain.freelancer.freelancer.dto.FreelancerCreateDto;
import com.back.domain.freelancer.freelancer.dto.FreelancerDetailResponseDto;
import com.back.domain.freelancer.freelancer.dto.FreelancerListResponseDto;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.member.entity.Member;
import com.back.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FreelancerService {
    private final FreelancerRepository freelancerRepository;
    private final MemberRepository memberRepository;

    @Transactional(readOnly = true)
    public List<FreelancerListResponseDto> findAll() {
        List<Freelancer> freelancers = freelancerRepository.findAll();

        return freelancers.stream()
                .map(freelancer -> {
                    Member member = freelancer.getMember();
                    return new FreelancerListResponseDto(member.getNickname(), freelancer);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public FreelancerDetailResponseDto findById(Long id) {
        Freelancer freelancer = freelancerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 id 입니다."));
        Member member = freelancer.getMember();
        return new FreelancerDetailResponseDto(member.getNickname(), freelancer);
    }

    @Transactional
    public Freelancer create(Member member, FreelancerCreateDto dto) {
        memberRepository.save(member);
        Freelancer freelancer = new Freelancer(
                member, dto.type(), dto.content(), dto.isOnSite(), dto.location(),
                dto.minMonthlyRate(), dto.maxMonthlyRate());
        freelancerRepository.save(freelancer);
        return freelancer;
    }

    @Transactional
    public long delete(long id) {
        Freelancer freelancer = freelancerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 id 입니다."));

        freelancerRepository.delete(freelancer);
        return freelancer.getId();
    }
}
