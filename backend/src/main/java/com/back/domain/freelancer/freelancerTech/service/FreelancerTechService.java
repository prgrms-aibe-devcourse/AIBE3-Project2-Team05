package com.back.domain.freelancer.freelancerTech.service;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancerTech.dto.FreelancerTechAddDto;
import com.back.domain.freelancer.freelancerTech.dto.MyTechListResponseDto;
import com.back.domain.freelancer.freelancerTech.entity.FreelancerTech;
import com.back.domain.freelancer.freelancerTech.repository.FreelancerTechRepository;
import com.back.domain.tech.entity.Tech;
import com.back.domain.tech.repository.TechRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FreelancerTechService {
    private final FreelancerTechRepository freelancerTechRepository;
    private final TechRepository techRepository;

    @Transactional
    public long addMyTech(Optional<Freelancer> freelancer, FreelancerTechAddDto dto) {
        Tech tech = techRepository.findById(dto.id()).get();
        FreelancerTech freelancerTech = new FreelancerTech(freelancer.get(), tech, dto.techLevel());
        freelancerTechRepository.save(freelancerTech);
        return freelancerTech.getId();
    }

    @Transactional(readOnly = true)
    public List<MyTechListResponseDto> findTechsByFreelancer(Optional<Freelancer> freelancer) {
        List<FreelancerTech> freelancerTechs = freelancerTechRepository.findFreelancerTechByFreelancer(freelancer);
        return freelancerTechs.stream()
                .map(MyTechListResponseDto::new)
                .toList();
    }

    @Transactional
    public long deleteTechById(long id) {
        FreelancerTech tech = freelancerTechRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 기술입니다"));

        freelancerTechRepository.deleteById(id);
        return tech.getId();
    }
}
