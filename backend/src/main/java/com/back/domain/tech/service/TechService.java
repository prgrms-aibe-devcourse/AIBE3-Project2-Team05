package com.back.domain.tech.service;

import com.back.domain.freelancer.freelancerTech.dto.FreelancerTechListResponseDto;
import com.back.domain.tech.entity.Tech;
import com.back.domain.tech.repository.TechRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TechService {
    private final TechRepository techRepository;

    public List<FreelancerTechListResponseDto> searchAvailableTechs(String keyword) {
        List<Tech> teches = techRepository.findByTechNameContainingIgnoreCase(keyword);
        return teches.stream()
                .map(FreelancerTechListResponseDto::new)
                .toList();
    }
}
