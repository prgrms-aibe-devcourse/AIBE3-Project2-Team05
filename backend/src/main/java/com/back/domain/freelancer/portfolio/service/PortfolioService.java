package com.back.domain.freelancer.portfolio.service;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.service.FreelancerFinder;
import com.back.domain.freelancer.portfolio.dto.PortfolioResponseDto;
import com.back.domain.freelancer.portfolio.dto.PortfolioSaveRequestDto;
import com.back.domain.freelancer.portfolio.dto.PortfolioUpdateRequestDto;
import com.back.domain.freelancer.portfolio.entity.Portfolio;
import com.back.domain.freelancer.portfolio.repository.PortfolioRepository;
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
public class PortfolioService {
    private final PortfolioRepository portfolioRepository;
    private final FileStorageService fileStorageService;
    private final FreelancerFinder freelancerFinder;


    @Transactional(readOnly = true)
    public List<PortfolioResponseDto> getPortfolios(Long freelancerId) {

        freelancerFinder.findFreelancerById(freelancerId); // 프리랜서 존재 여부 확인

        List<Portfolio> portfolios = portfolioRepository.findAllByFreelancerId(freelancerId);
        return portfolios.stream()
                .map(PortfolioResponseDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public PortfolioResponseDto getPortfolio(Long id) {
        Portfolio portfolio = portfolioRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 id 입니다."));
        return new PortfolioResponseDto(portfolio);
    }

    @Transactional
    public Portfolio save(Long memberId, PortfolioSaveRequestDto dto, MultipartFile imageFile) {
        Freelancer freelancer = freelancerFinder.findFreelancerByMemberId(memberId);

        String imageUrl = null;
        try {
            imageUrl = fileStorageService.saveFile(imageFile, FileType.PORTFOLIO);
        } catch (IOException e) {
            throw new RuntimeException("이미지 저장 실패",e);
        }

        Portfolio portfolio = new Portfolio(freelancer, dto.title(), dto.description(), dto.startDate(), dto.endDate(), dto.contribution(), imageUrl, dto.externalUrl());
        return portfolioRepository.save(portfolio);
    }

    @Transactional
    public void update(Long portfolioId, PortfolioUpdateRequestDto dto, MultipartFile newImageFile, Long memberId) {
        // 1. portfolio 조회
        Portfolio portfolio = portfolioRepository.findById(portfolioId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 id 입니다."));

        // 2. 권한 체크 (memberId로 freelancer 조회 후 portfolio의 freelancer와 같은지 확인)
        Freelancer freelancer = freelancerFinder.findFreelancerByMemberId(memberId);
        freelancer.checkCanUpdateOrDelete(portfolio.getFreelancer().getId());

        String updatedImageUrl = null;
        try {
            updatedImageUrl = fileStorageService.updateFile(portfolio.getImageUrl(), newImageFile, dto.deleteExistingImage(), FileType.PORTFOLIO);
        } catch (IOException e) {
            throw new RuntimeException("파일 처리 중 오류가 발생했습니다.", e);
        }

        portfolio.update(dto, updatedImageUrl);
    }

    @Transactional
    public void delete(Long portfolioId, Long memberId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 id 입니다."));

        Freelancer freelancer = freelancerFinder.findFreelancerByMemberId(memberId);
        freelancer.checkCanUpdateOrDelete(portfolio.getFreelancer().getId());

        portfolioRepository.delete(portfolio);
    }
}
