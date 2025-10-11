package com.back.domain.freelancer.career.controller;

import com.back.domain.freelancer.career.dto.CareerRequestDto;
import com.back.domain.freelancer.career.dto.CareerResponseDto;
import com.back.domain.freelancer.career.entity.Career;
import com.back.domain.freelancer.career.service.CareerService;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.member.entity.Member;
import com.back.domain.member.repository.MemberRepository;
import com.back.global.rsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/freelancers")
public class CareerController {
    private final CareerService careerService;
    private final FreelancerRepository freelancerRepository;
    private final MemberRepository memberRepository;

    // todo 병합 시 삭제
    public Member setMember() {
        return memberRepository.findById(34L).get();
    }
    // 여기까지 삭제


    @GetMapping("/{freelancerId}/careers")
    public List<CareerResponseDto> getCareers(@PathVariable Long freelancerId) {
        return careerService.getCareers(freelancerId);
    }


    @PostMapping("/me/careers")
    public RsData<Void> addCareer(@RequestBody CareerRequestDto dto) {

        //todo 인증정보로 수정 해야함
        // 여기는 삭제
        Member member = setMember();
        Career career =  careerService.create(member.getId(), dto);
        //

        /* 여기는 추가
        addCareer(@AuthenticationPrincipal SecurityUser securityUser, @RequestBody CareerRequestDto dto)
        Career career = careerService.create(securityUser.getId(), dto);
         */

        return new RsData<>("201-1", "%d번 경력이 생성되었습니다.".formatted(career.getId()));

    }

    @PutMapping("/me/careers/{careerId}")
    public RsData<Void> updateCareer(@PathVariable long careerId, @RequestBody CareerRequestDto dto) {
        //todo 인증정보로 수정 해야함
        // 여기는 삭제
        Member member = setMember();
        careerService.update(careerId, member.getId(), dto);
        //

        /* 여기는 추가
        updateCareer(@PathVariable long careerId, @AuthenticationPrincipal SecurityUser securityUser, @RequestBody CareerRequestDto dto)
        careerService.update(careerId, securityUser.getId(),dto);
         */

        return new RsData<>("200-1", "%d번 경력이 수정되었습니다.".formatted(careerId));
    }

    @DeleteMapping("/me/careers/{careerId}")
    public RsData<Void> deleteCareer(@PathVariable long careerId) {

        //todo 인증정보로 수정 해야함
        // 여기는 삭제
        Member member = setMember();
        careerService.delete(careerId, member.getId());
        //

        /* 여기는 추가
        deleteCareer(@PathVariable long careerId, @AuthenticationPrincipal SecurityUser securityUser)
        careerService.delete(careerId, securityUser.getId());
         */

        return new RsData<>("200-1", "%d번 경력이 삭제되었습니다.".formatted(careerId));
    }
}
