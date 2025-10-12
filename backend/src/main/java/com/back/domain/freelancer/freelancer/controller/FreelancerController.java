package com.back.domain.freelancer.freelancer.controller;

import com.back.domain.freelancer.freelancer.dto.FreelancerDetailResponseDto;
import com.back.domain.freelancer.freelancer.dto.FreelancerDto;
import com.back.domain.freelancer.freelancer.dto.FreelancerListResponseDto;
import com.back.domain.freelancer.freelancer.dto.FreelancerRequestDto;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.service.FreelancerService;
import com.back.domain.member.entity.Member;
import com.back.domain.member.repository.MemberRepository;
import com.back.global.rsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/freelancers")
@RequiredArgsConstructor
public class FreelancerController {
    private final FreelancerService freelancerService;
    private final MemberRepository memberRepository;

    // todo 병합 시 삭제
    public Member setMember() {
        Member member = new Member("testUser", "1234", "테스트 유저", "user1@user");
        return memberRepository.save(member);
    }
    // 여기까지 삭제

    @GetMapping
    public List<FreelancerListResponseDto> getItems() {
        return freelancerService.findAll();
    }

    @GetMapping("/{id}")
    public FreelancerDetailResponseDto getItem(@PathVariable Long id) {
        return freelancerService.findById(id);
    }

    @PostMapping
    public RsData<FreelancerDto> create(@RequestBody FreelancerRequestDto dto) {

        //todo 인증정보로 수정 해야함
        //삭제
        Member member = setMember();
        Freelancer freelancer = freelancerService.create(member.getId(), dto);
        return new RsData<>("201-1", "%d번 프리랜서가 생성되었습니다.".formatted(freelancer.getId()), new FreelancerDto(freelancer));

        /*
        create(@AuthenticationPrincipal SecurityUser securityUser, @RequestBody FreelancerRequestDto dto)
        Freelancer freelancer = freelancerService.create(securityUser.getId(), dto);
        return new RsData<>("201-1", "%d번 프리랜서가 생성되었습니다.".formatted(freelancer.getId()), new FreelancerDto(freelancer));
         */
    }

    @DeleteMapping("/{id}")
    public RsData<Void> delete(@PathVariable long id) {
        freelancerService.delete(id);
        return new RsData<>("200-1", "%d번 프리랜서가 삭제되었습니다.".formatted(id));
    }

    @PutMapping("/{id}")
    public RsData<Void> update(@PathVariable Long id, @RequestBody FreelancerRequestDto dto) {
        freelancerService.update(id, dto);
        return new RsData<>("200-1", "%d번 프리랜서가 수정되었습니다.".formatted(id));
    }
}
