package com.back.domain.freelancer.freelancer.controller;

import com.back.domain.freelancer.freelancer.dto.*;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.service.FreelancerService;
import com.back.global.rsData.RsData;
import com.back.global.security.SecurityUser;
import jakarta.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/freelancers")
@RequiredArgsConstructor
public class FreelancerController {
    private final FreelancerService freelancerService;

    @GetMapping
    public List<FreelancerListResponseDto> getItems() {
        return freelancerService.findAll();
    }

    @GetMapping("/{id}")
    public FreelancerDetailResponseDto getItem(@PathVariable Long id) {
        return freelancerService.findById(id);
    }

    @GetMapping("/me")
    public FreelancerDetailResponseDto getMyFreelancer(@AuthenticationPrincipal SecurityUser securityUser) {
        return freelancerService.findByMemberId(securityUser.getId());
    }

    @PostMapping
    public RsData<FreelancerDto> create(@AuthenticationPrincipal SecurityUser securityUser, @RequestPart FreelancerSaveRequestDto dto, @Nullable @RequestPart MultipartFile imageFile) {
        Freelancer freelancer = freelancerService.create(securityUser.getId(), dto, imageFile);
        return new RsData<>("201-1", "%d번 프리랜서가 생성되었습니다.".formatted(freelancer.getId()), new FreelancerDto(freelancer));
    }

    @DeleteMapping("/{id}")
    public RsData<Void> delete(@AuthenticationPrincipal SecurityUser securityUser, @PathVariable long id) {
        freelancerService.delete(securityUser.getId(), id);
        return new RsData<>("200-1", "%d번 프리랜서가 삭제되었습니다.".formatted(id));
    }

    @PutMapping("/{id}")
    public RsData<Void> update(@AuthenticationPrincipal SecurityUser securityUser, @PathVariable Long id, @RequestPart FreelancerUpdateRequestDto dto, @RequestPart MultipartFile imageFile) {
        freelancerService.update(securityUser.getId(), id, dto, imageFile);
        return new RsData<>("200-1", "%d번 프리랜서가 수정되었습니다.".formatted(id));
    }
}
