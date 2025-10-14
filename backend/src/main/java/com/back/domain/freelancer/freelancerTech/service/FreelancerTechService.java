package com.back.domain.freelancer.freelancerTech.service;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.service.FreelancerFinder;
import com.back.domain.freelancer.freelancerTech.dto.FreelancerTechAddDto;
import com.back.domain.freelancer.freelancerTech.dto.FreelancerTechDto;
import com.back.domain.freelancer.freelancerTech.entity.FreelancerTech;
import com.back.domain.freelancer.freelancerTech.repository.FreelancerTechRepository;
import com.back.domain.tech.entity.Tech;
import com.back.domain.tech.repository.TechRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FreelancerTechService {
    private final FreelancerTechRepository freelancerTechRepository;
    private final TechRepository techRepository;
    private final FreelancerFinder freelancerFinder;

    @Transactional(readOnly = true)
    public List<FreelancerTechDto> findTechsByFreelancerId(Long freelancerId) {
        freelancerFinder.findFreelancerById(freelancerId); // 프리랜서 존재 여부 확인

        List<FreelancerTech> freelancerTechs = freelancerTechRepository.findByFreelancerId(freelancerId);
        return freelancerTechs.stream()
                .map(FreelancerTechDto::new)
                .toList();
    }

    @Transactional
    public FreelancerTech addMyTech(Long memberId, FreelancerTechAddDto dto) {
        Freelancer freelancer = freelancerFinder.findFreelancerByMemberId(memberId);
        Tech tech = techRepository.findById(dto.techId()).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 기술입니다"));

        if(freelancerTechRepository.existsByFreelancerAndTech(freelancer, tech)) {
            throw new IllegalArgumentException("이미 추가된 기술입니다");
        }

        FreelancerTech freelancerTech = new FreelancerTech(freelancer, tech, dto.techLevel());

        return freelancerTechRepository.save(freelancerTech);
    }

    @Transactional
    public void update(Long id, String techLevel, Long memberId) {
        FreelancerTech freelancerTech = freelancerTechRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 기술입니다"));

        Freelancer freelancer = freelancerFinder.findFreelancerByMemberId(memberId);
        freelancer.checkCanUpdateOrDelete(freelancerTech.getFreelancer().getId());

        freelancerTech.update(techLevel);
    }

    @Transactional
    public void delete(long id, Long memberId) {
        FreelancerTech freelancerTech = freelancerTechRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 기술입니다"));

        Freelancer freelancer = freelancerFinder.findFreelancerByMemberId(memberId);
        freelancer.checkCanUpdateOrDelete(freelancerTech.getFreelancer().getId());

        freelancerTechRepository.deleteById(id);
    }
}
