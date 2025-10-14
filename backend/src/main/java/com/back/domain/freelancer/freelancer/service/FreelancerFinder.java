package com.back.domain.freelancer.freelancer.service;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FreelancerFinder {
    private final FreelancerRepository freelancerRepository;

    public Freelancer findFreelancerByMemberId(Long memberId) {
        return freelancerRepository.findByMemberId(memberId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
    }

    public Freelancer findFreelancerById(Long freelancerId) {
        return freelancerRepository.findById(freelancerId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프리랜서입니다."));
    }
}
