package com.back.domain.freelancer.career.controller;

import com.back.domain.freelancer.career.dto.CareerRequestDto;
import com.back.domain.freelancer.career.dto.CareerResponseDto;
import com.back.domain.freelancer.career.service.CareerService;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/freelancers/careers")
public class CareerController {
    private final CareerService careerService;
    private final FreelancerRepository freelancerRepository;

    private final Long freelancerId = 27L;

    @GetMapping
    public List<CareerResponseDto> getCareers() {

        Freelancer freelancer = freelancerRepository.findById(freelancerId).get(); // todo 인증정보 수정 해야댐

        return careerService.getCareers(freelancer);
    }

    @GetMapping("/{id}")
    public CareerResponseDto getCareer(@PathVariable long id) {

        //todo 권한 검증 추가해야댐

        return careerService.getCareer(id);
    }

    @PostMapping
    public long addCareer(@RequestBody CareerRequestDto dto) {

        Freelancer freelancer = freelancerRepository.findById(freelancerId).get(); // todo 인증정보 수정 해야댐

        return careerService.create(freelancer, dto);
    }

    @PutMapping("/{id}")
    public long updateCareer(@PathVariable long id, @RequestBody CareerRequestDto dto) {

        //todo 권한 검증 추가해야댐

        return careerService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public long deleteCareer(@PathVariable long id) {

        //todo 권한 검증 추가해야댐

        return careerService.delete(id);
    }
}
