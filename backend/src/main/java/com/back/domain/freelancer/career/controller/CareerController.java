package com.back.domain.freelancer.career.controller;

import com.back.domain.freelancer.career.dto.CareerRequestDto;
import com.back.domain.freelancer.career.dto.CareerResponseDto;
import com.back.domain.freelancer.career.entity.Career;
import com.back.domain.freelancer.career.service.CareerService;
import com.back.global.rsData.RsData;
import com.back.global.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/freelancers")
public class CareerController {
    private final CareerService careerService;

    @GetMapping("/{freelancerId}/careers")
    public List<CareerResponseDto> getCareers(@PathVariable Long freelancerId) {
        return careerService.getCareers(freelancerId);
    }

    @PostMapping("/me/careers")
    public RsData<Void> addCareer(@AuthenticationPrincipal SecurityUser securityUser, @RequestBody CareerRequestDto dto) {
        Career career = careerService.create(securityUser.getId(), dto);
        return new RsData<>("201-1", "%d번 경력이 생성되었습니다.".formatted(career.getId()));
    }

    @PutMapping("/me/careers/{careerId}")
    public RsData<Void> updateCareer(@PathVariable long careerId, @AuthenticationPrincipal SecurityUser securityUser, @RequestBody CareerRequestDto dto) {
        careerService.update(careerId, securityUser.getId(),dto);
        return new RsData<>("200-1", "%d번 경력이 수정되었습니다.".formatted(careerId));
    }

    @DeleteMapping("/me/careers/{careerId}")
    public RsData<Void> deleteCareer(@PathVariable long careerId, @AuthenticationPrincipal SecurityUser securityUser) {
        careerService.delete(careerId, securityUser.getId());
        return new RsData<>("200-1", "%d번 경력이 삭제되었습니다.".formatted(careerId));
    }
}
