package com.back.domain.freelancer.career.service;

import com.back.domain.freelancer.career.dto.CareerRequestDto;
import com.back.domain.freelancer.career.dto.CareerResponseDto;
import com.back.domain.freelancer.career.entity.Career;
import com.back.domain.freelancer.career.repository.CareerRepository;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.freelancer.freelancer.service.FreelancerFinder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CareerService {
    private final CareerRepository careerRepository;
    private final FreelancerRepository freelancerRepository;
    private final FreelancerFinder freelancerFinder;

    @Transactional(readOnly = true)
    public List<CareerResponseDto> getCareers(Long freelancerId) {
        freelancerRepository.findById(freelancerId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프리랜서 id 입니다."));

        List<Career> careers = careerRepository.findAllByFreelancerId(freelancerId);

        return careers.stream()
                .map(CareerResponseDto::new)
                .toList();
    }

    @Transactional
    public Career create(Long memberId, CareerRequestDto dto) {
        Freelancer freelancer = freelancerFinder.findFreelancerByMemberId(memberId);
        Career career = new Career(freelancer, dto.title(), dto.company(), dto.position(), dto.startDate(), dto.endDate(), dto.current(), dto.description());
        return careerRepository.save(career);
    }

    @Transactional
    public void update(Long id, Long memberId, CareerRequestDto dto) {
        // 1. career 조회
        Career career = careerRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 id 입니다."));

        // 2. 권한 체크 (memberId로 freelancer 조회 후 career의 freelancer와 같은지 확인)
        Freelancer freelancer = freelancerFinder.findFreelancerByMemberId(memberId);
        freelancer.checkCanUpdateOrDelete(career.getFreelancer().getId());

        // 3. career 수정
        career.update(dto);
    }

    @Transactional
    public void delete(long id, Long memberId) {
        Career career = careerRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 id 입니다."));

        Freelancer freelancer = freelancerFinder.findFreelancerByMemberId(memberId);
        freelancer.checkCanUpdateOrDelete(career.getFreelancer().getId());

        careerRepository.delete(career);
    }
}
