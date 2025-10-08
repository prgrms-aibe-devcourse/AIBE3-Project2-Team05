package com.back.domain.freelancer.freelancer.controller;

import com.back.domain.freelancer.freelancer.dto.FreelancerRequestDto;
import com.back.domain.freelancer.freelancer.dto.FreelancerDetailResponseDto;
import com.back.domain.freelancer.freelancer.dto.FreelancerListResponseDto;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.service.FreelancerService;
import com.back.domain.member.entity.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping
    public long create(@RequestBody FreelancerRequestDto dto) {

        //todo 인증정보로 수정
        Member member = new Member("user1", "1234", "유저1", "user1@user");

        Freelancer freelancer = freelancerService.create(member, dto);
        return freelancer.getId();
    }

    @DeleteMapping("/{id}")
    public Long delete(@PathVariable long id) {
        return freelancerService.delete(id);
    }

    @PutMapping("/{id}")
    public Long update(@PathVariable Long id, @RequestBody FreelancerRequestDto dto) {
        return freelancerService.update(id, dto);
    }
}
