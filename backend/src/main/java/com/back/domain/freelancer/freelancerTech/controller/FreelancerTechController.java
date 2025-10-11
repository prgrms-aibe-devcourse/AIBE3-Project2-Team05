package com.back.domain.freelancer.freelancerTech.controller;

import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.freelancer.freelancerTech.dto.FreelancerTechAddDto;
import com.back.domain.freelancer.freelancerTech.dto.FreelancerTechDto;
import com.back.domain.freelancer.freelancerTech.dto.FreelancerTechUpdateDto;
import com.back.domain.freelancer.freelancerTech.entity.FreelancerTech;
import com.back.domain.freelancer.freelancerTech.service.FreelancerTechService;
import com.back.domain.member.entity.Member;
import com.back.domain.member.repository.MemberRepository;
import com.back.global.rsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/freelancers")
public class FreelancerTechController {
    private final FreelancerTechService freelancerTechService;
    private final FreelancerRepository freelancerRepository;
    private final MemberRepository memberRepository;

    // todo 병합 시 삭제
    public Member setMember() {
        return memberRepository.findById(34L).get();
    }
    // 여기까지 삭제

    @GetMapping("/{freelancerId}/techs")
    public List<FreelancerTechDto> getFreelancersTechs(@PathVariable Long freelancerId) {
        return freelancerTechService.findTechsByFreelancerId(freelancerId);
    }

    @PostMapping("/me/techs")
    public RsData<FreelancerTechDto> addMyTech(@RequestBody FreelancerTechAddDto dto) {
        //todo 인증정보로 수정 해야함
        // 여기는 삭제
        Member member = setMember();
        FreelancerTech freelancerTech = freelancerTechService.addMyTech(member.getId(), dto);
        //

        /* 여기는 추가
        addMyTech(@AuthenticationPrincipal SecurityUser securityUser, @RequestBody FreelancerTechAddDto dto)
        FreelancerTech freelancerTech = freelancerTechService.addMyTech(securityUser.getId(), dto);
         */

        return new RsData<>("201-1", "기술 스택이 추가되었습니다.", new FreelancerTechDto(freelancerTech));
    }

    @PatchMapping("/me/techs/{id}")
    public RsData<Void> updateMyTech(@PathVariable long id, @RequestBody FreelancerTechUpdateDto dto) {

        //todo 인증정보로 수정 해야함
        // 여기는 삭제
        Member member = setMember();
        freelancerTechService.update(id, dto.techLevel(), member.getId());
        //

        /* 여기는 추가
        updateMyTech(@AuthenticationPrincipal SecurityUser securityUser, @PathVariable long id, @RequestBody String techLevel)
        freelancerTechService.update(id, techLevel, securityUser.getId());
         */

        return new RsData<>("200-1", "기술 스택이 수정되었습니다.");
    }

    @DeleteMapping("/me/techs/{id}")
    public RsData<Void> deleteMyTech(@PathVariable long id) {

        //todo 인증정보로 수정 해야함
        // 여기는 삭제
        Member member = setMember();
        freelancerTechService.delete(id, member.getId());
        //

        /* 여기는 추가
        deleteMyTech(@AuthenticationPrincipal SecurityUser securityUser, @PathVariable long id)
        freelancerTechService.delete(id, securityUser.getId());
         */

        return new RsData<>("200-1", "기술 스택이 삭제되었습니다.");
    }

}
