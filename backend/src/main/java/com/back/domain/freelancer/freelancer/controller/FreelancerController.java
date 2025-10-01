package com.back.domain.freelancer.freelancer.controller;

import com.back.domain.freelancer.freelancer.dto.FreelancerCreateDto;
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
    public long create(@RequestBody FreelancerCreateDto dto) {
        //===================임시 Member 생성===================
        Member member = new Member("user1", "1234", "유저1", "user1@user");
        //======================================================
        Freelancer freelancer = freelancerService.create(member, dto);
        return freelancer.getId();
    }

    @DeleteMapping("/{id}")
    public long delete(@PathVariable long id) {
        return freelancerService.delete(id);
    }
}
