package com.back.domain.freelancer.freelancerTech.controller;

import com.back.domain.freelancer.freelancerTech.dto.FreelancerTechAddDto;
import com.back.domain.freelancer.freelancerTech.dto.FreelancerTechDto;
import com.back.domain.freelancer.freelancerTech.entity.FreelancerTech;
import com.back.domain.freelancer.freelancerTech.service.FreelancerTechService;
import com.back.global.rsData.RsData;
import com.back.global.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/freelancers")
public class FreelancerTechController {
    private final FreelancerTechService freelancerTechService;

    @GetMapping("/{freelancerId}/techs")
    public List<FreelancerTechDto> getFreelancersTechs(@PathVariable Long freelancerId) {
        return freelancerTechService.findTechsByFreelancerId(freelancerId);
    }

    @PostMapping("/me/techs")
    public RsData<FreelancerTechDto> addMyTech(@AuthenticationPrincipal SecurityUser securityUser, @RequestBody FreelancerTechAddDto dto) {
        FreelancerTech freelancerTech = freelancerTechService.addMyTech(securityUser.getId(), dto);
        return new RsData<>("201-1", "기술 스택이 추가되었습니다.", new FreelancerTechDto(freelancerTech));
    }

    @PatchMapping("/me/techs/{id}")
    public RsData<Void> updateMyTech(@AuthenticationPrincipal SecurityUser securityUser, @PathVariable long id, @RequestBody String techLevel) {
        freelancerTechService.update(id, techLevel, securityUser.getId());
        return new RsData<>("200-1", "기술 스택이 수정되었습니다.");
    }

    @DeleteMapping("/me/techs/{id}")
    public RsData<Void> deleteMyTech(@AuthenticationPrincipal SecurityUser securityUser, @PathVariable long id) {
        freelancerTechService.delete(id, securityUser.getId());
        return new RsData<>("200-1", "기술 스택이 삭제되었습니다.");
    }

}
