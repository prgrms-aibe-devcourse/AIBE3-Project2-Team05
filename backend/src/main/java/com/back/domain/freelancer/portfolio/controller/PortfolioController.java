package com.back.domain.freelancer.portfolio.controller;

import com.back.domain.freelancer.portfolio.dto.PortfolioResponseDto;
import com.back.domain.freelancer.portfolio.dto.PortfolioSaveRequestDto;
import com.back.domain.freelancer.portfolio.dto.PortfolioUpdateRequestDto;
import com.back.domain.freelancer.portfolio.entity.Portfolio;
import com.back.domain.freelancer.portfolio.service.PortfolioService;
import com.back.global.rsData.RsData;
import com.back.global.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/freelancers")
public class PortfolioController {
    private final PortfolioService portfolioService;

    @GetMapping("/{freelancerId}/portfolios")
    public List<PortfolioResponseDto> getPortfolios(@PathVariable Long freelancerId) {
        return portfolioService.getPortfolios(freelancerId);
    }

    @GetMapping("/portfolios/{id}")
    public PortfolioResponseDto getPortfolio(@PathVariable Long id) {
        return portfolioService.getPortfolio(id);
    }

    @GetMapping("/me/portfolios")
    public List<PortfolioResponseDto> getMyPortfolios(@AuthenticationPrincipal SecurityUser securityUser) {
        return portfolioService.getPortfoliosByMemberId(securityUser.getId());
    }

    @PostMapping("/me/portfolios")
    public RsData<PortfolioResponseDto> savePortfolio(@AuthenticationPrincipal SecurityUser securityUser, @RequestPart PortfolioSaveRequestDto dto, @RequestPart MultipartFile imageFile) {
        Portfolio portfolio = portfolioService.save(securityUser.getId(), dto, imageFile);
        return new RsData<>("201-1", "%d번 포트폴리오가 생성되었습니다.".formatted(portfolio.getId()), new PortfolioResponseDto(portfolio));
    }

    @PutMapping("/me/portfolios/{portfolioId}")
    public RsData<Void> update(@PathVariable Long portfolioId, @AuthenticationPrincipal SecurityUser securityUser, @RequestPart PortfolioUpdateRequestDto dto, @RequestPart MultipartFile imageFile) {
        portfolioService.update(portfolioId, dto, imageFile, securityUser.getId());
        return new RsData<>("200-1", "포트폴리오가 수정되었습니다.");
    }

    @DeleteMapping("/me/portfolios/{portfolioId}")
    public RsData<Void> delete(@PathVariable Long portfolioId, @AuthenticationPrincipal SecurityUser securityUser) {
        portfolioService.delete(portfolioId, securityUser.getId());
        return new RsData<>("200-1", "포트폴리오가 삭제되었습니다.");
    }
}
