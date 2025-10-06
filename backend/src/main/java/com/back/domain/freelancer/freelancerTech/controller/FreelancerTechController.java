package com.back.domain.freelancer.freelancerTech.controller;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.freelancer.freelancer.service.FreelancerService;
import com.back.domain.freelancer.freelancerTech.dto.FreelancerTechAddDto;
import com.back.domain.freelancer.freelancerTech.dto.FreelancerTechListResponseDto;
import com.back.domain.freelancer.freelancerTech.service.FreelancerTechService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/freelancers/techs")
public class FreelancerTechController {
    private final FreelancerTechService freelancerTechService;
    private final FreelancerService freelancerService;
    private final FreelancerRepository freelancerRepository;

    @GetMapping("/search")
    public List<FreelancerTechListResponseDto> searchAvailableTechs(@RequestParam String keyword) {
        return freelancerTechService.searchAvailableTechs(keyword);
    }

    @PostMapping
    public long addMyTech(@RequestBody FreelancerTechAddDto dto) {
        Optional<Freelancer> freelancer = freelancerRepository.findById(27L);
        return freelancerTechService.addMyTech(freelancer, dto);
    }

    @GetMapping
    public void getMyTechs() {

    }

    @DeleteMapping("/{id}")
    public void deleteTech(@PathVariable long id) {

    }

}
