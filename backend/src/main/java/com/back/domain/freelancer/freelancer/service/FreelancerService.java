package com.back.domain.freelancer.freelancer.service;

import com.back.domain.freelancer.freelancer.dto.FreelancerRequestDto;
import com.back.domain.freelancer.freelancer.dto.FreelancerDetailResponseDto;
import com.back.domain.freelancer.freelancer.dto.FreelancerDto;
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
    public List<FreelancerDto> findAll() {
        List<Freelancer> freelancers = freelancerRepository.findAll();

        return freelancers.stream()
                .map(FreelancerDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public FreelancerDetailResponseDto findById(Long id) {
        Freelancer freelancer = freelancerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 id 입니다."));

        return new FreelancerDetailResponseDto(freelancer);
    }

    @Transactional
    public Freelancer create(Long memberId, FreelancerRequestDto dto) {
        Member member = memberRepository.findById(memberId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        Freelancer freelancer = new Freelancer(member, dto.freelancerTitle(), dto.type(), dto.location(), dto.content(), dto.isOnSite(), dto.minMonthlyRate(), dto.maxMonthlyRate());

        return freelancerRepository.save(freelancer);
    }

    @Transactional
    public long delete(long id) {
        Freelancer freelancer = freelancerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 id 입니다."));

        freelancerRepository.delete(freelancer);
        return freelancer.getId();
    }

    @Transactional
    public Long update(Long id, FreelancerRequestDto dto) {
        Freelancer freelancer = freelancerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 id 입니다."));
        freelancer.update(dto.freelancerTitle(), dto.type(), dto.location(), dto.content(), dto.isOnSite(), dto.minMonthlyRate(), dto.maxMonthlyRate());
        return freelancer.getId();
    }
}
