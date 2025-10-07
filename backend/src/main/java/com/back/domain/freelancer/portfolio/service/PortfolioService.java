package com.back.domain.freelancer.portfolio.service;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.portfolio.dto.PortfolioRequestDto;
import com.back.domain.freelancer.portfolio.dto.PortfolioResponseDto;
import com.back.domain.freelancer.portfolio.dto.PortfolioUpdateRequestDto;
import com.back.domain.freelancer.portfolio.entity.Portfolio;
import com.back.domain.freelancer.portfolio.repository.PortfolioRepository;
import com.back.global.service.FileStorageService;
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

    @Transactional
    public Long saveWithImage(Freelancer freelancer, PortfolioRequestDto dto, MultipartFile imageFile) {
        String imageUrl = null;
        try {
            imageUrl = fileStorageService.saveFile(imageFile);
        } catch (IOException e) {
            throw new RuntimeException("이미지 저장 실패",e);
        }

        Portfolio portfolio = new Portfolio(freelancer, dto.title(), dto.summary(), dto.startDate(), dto.endDate(), dto.contribution(), imageUrl, dto.externalUrl());
        portfolioRepository.save(portfolio);
        return portfolio.getId();
    }

//    @Transactional
//    public Long save(Freelancer freelancer, PortfolioRequestDto dto) {
//        Portfolio portfolio = new Portfolio(freelancer, dto.title(), dto.summary(), dto.startDate(), dto.endDate(), dto.contribution(), dto.imageUrl(), dto.externalUrl());
//        portfolioRepository.save(portfolio);
//        return portfolio.getId();
//    }

    @Transactional(readOnly = true)
    public List<PortfolioResponseDto> getPortfolios(Freelancer freelancer) {
        List<Portfolio> portfolios = portfolioRepository.findAllByFreelancer(freelancer);
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
    public Long update(Long id, PortfolioUpdateRequestDto dto, MultipartFile newImageFile) {
        Portfolio portfolio = portfolioRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 id 입니다."));

        String existingImageUrl = portfolio.getImageUrl();
        String updatedImageUrl = existingImageUrl;

        try {
            if (newImageFile != null && !newImageFile.isEmpty()) {  // 새로운 이미지가 넘어왔는데
                if (existingImageUrl != null) { // 기존 이미지가 있다면
                    fileStorageService.deleteFile(existingImageUrl);  //기존 이미지 삭제 후
                }
                updatedImageUrl = fileStorageService.saveFile(newImageFile);  //새로운 이미지 저장
            } else if (dto.deleteExistingImage() && existingImageUrl != null) { // 새로운 이미지는 없고 기존 이미지 삭제 요청이 true 라면
                fileStorageService.deleteFile(existingImageUrl);    // 기존 이미지 삭제 후
                updatedImageUrl = null; // URL은 null로 지정
            }
        } catch (IOException e) {
            throw new RuntimeException("파일 처리 중 오류가 발생했습니다.", e);
        }

        portfolio.update(dto, updatedImageUrl);
        return portfolio.getId();
    }

    @Transactional
    public Long delete(Long id) {
        Portfolio portfolio = portfolioRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 id 입니다."));
        portfolioRepository.delete(portfolio);
        return portfolio.getId();
    }
}
