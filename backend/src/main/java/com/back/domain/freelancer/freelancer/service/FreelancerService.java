package com.back.domain.freelancer.freelancer.service;

import com.back.domain.freelancer.freelancer.dto.FreelancerDetailResponseDto;
import com.back.domain.freelancer.freelancer.dto.FreelancerListResponseDto;
import com.back.domain.freelancer.freelancer.dto.FreelancerSaveRequestDto;
import com.back.domain.freelancer.freelancer.dto.FreelancerUpdateRequestDto;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.repository.MemberRepository;
import com.back.global.fileStorage.FileStorageService;
import com.back.global.fileStorage.FileType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FreelancerService {
    private final FreelancerRepository freelancerRepository;
    private final MemberRepository memberRepository;
    private final FileStorageService fileStorageService;
    private final FreelancerFinder freelancerFinder;

    @Transactional(readOnly = true)
    public List<FreelancerListResponseDto> findAll() {
        List<Freelancer> freelancers = freelancerRepository.findAll();

        return freelancers.stream()
                .map(FreelancerListResponseDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public FreelancerDetailResponseDto findById(Long id) {
        Freelancer freelancer = freelancerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 id 입니다."));

        return new FreelancerDetailResponseDto(freelancer);
    }

    @Transactional(readOnly = true)
    public FreelancerDetailResponseDto findByMemberId(long memberId) {
        Freelancer freelancer = freelancerFinder.findFreelancerByMemberId(memberId);
        return new FreelancerDetailResponseDto(freelancer);
    }

    @Transactional
    public Freelancer create(Long memberId, FreelancerSaveRequestDto dto, MultipartFile imageFile) {
        Member member = memberRepository.findById(memberId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        String imageUrl = null;
        try {
            imageUrl = fileStorageService.saveFile(imageFile, FileType.PROFILE);
        } catch (IOException e) {
            throw new RuntimeException("이미지 저장 실패",e);
        }

        Freelancer freelancer = new Freelancer(member, dto.freelancerTitle(), dto.type(), dto.location(), dto.content(), dto.isOnSite(), dto.minMonthlyRate(), dto.maxMonthlyRate(), imageUrl);

        return freelancerRepository.save(freelancer);
    }

    @Transactional
    public void delete(Long memberId, long id) {
        Freelancer freelancer = freelancerFinder.findFreelancerByMemberId(memberId);

        freelancer.checkCanUpdateOrDelete(id);

        freelancerRepository.delete(freelancer);
    }

    @Transactional
    public void update(Long memberId, Long id, FreelancerUpdateRequestDto dto, MultipartFile newImageFile) {
        Freelancer freelancer = freelancerFinder.findFreelancerByMemberId(memberId);

        freelancer.checkCanUpdateOrDelete(id);

        String updatedImageUrl = null;
        try {
            updatedImageUrl = fileStorageService.updateFile(freelancer.getFreelancerProfileImageUrl(), newImageFile, dto.deleteExistingImage(), FileType.PROFILE);
        } catch (IOException e) {
            throw new RuntimeException("파일 처리 중 오류가 발생했습니다.", e);
        }

        freelancer.update(dto.freelancerTitle(), dto.type(), dto.location(), dto.content(), dto.isOnSite(), dto.minMonthlyRate(), dto.maxMonthlyRate(), updatedImageUrl);
    }

    @Transactional(readOnly = true)
    public Freelancer findByMemberId(Long memberId) {
        return freelancerRepository.findByMemberId(memberId).orElse(null);
    }
}
