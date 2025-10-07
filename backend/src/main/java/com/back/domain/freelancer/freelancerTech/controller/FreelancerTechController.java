package com.back.domain.freelancer.freelancerTech.controller;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.freelancer.freelancerTech.dto.FreelancerTechAddDto;
import com.back.domain.freelancer.freelancerTech.dto.FreelancerTechListResponseDto;
import com.back.domain.freelancer.freelancerTech.dto.MyTechListResponseDto;
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
    private final FreelancerRepository freelancerRepository;

    @GetMapping("/search")
    public List<FreelancerTechListResponseDto> searchAvailableTechs(@RequestParam String keyword) {
        return freelancerTechService.searchAvailableTechs(keyword);
    }

    @PostMapping
    public long addMyTech(@RequestBody FreelancerTechAddDto dto) {

        //todo 인증정보로 수정
        Optional<Freelancer> freelancer = freelancerRepository.findById(27L);

        return freelancerTechService.addMyTech(freelancer, dto);
    }

    @GetMapping
    public List<MyTechListResponseDto> getMyTechs() {

        //todo 인증정보로 수정
        Optional<Freelancer> freelancer = freelancerRepository.findById(27L);

        return freelancerTechService.findTechsByFreelancer(freelancer);
    }

    @DeleteMapping("/{id}")
    public long deleteTech(@PathVariable long id) {

        //todo 인증 검증 추가


        return freelancerTechService.deleteTechById(id);
    }

}
