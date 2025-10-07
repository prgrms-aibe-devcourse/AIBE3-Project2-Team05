package com.back.domain.freelancer.portfolio.service;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.portfolio.dto.PortfolioRequestDto;
import com.back.domain.freelancer.portfolio.dto.PortfolioResponseDto;
import com.back.domain.freelancer.portfolio.entity.Portfolio;
import com.back.domain.freelancer.portfolio.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PortfolioService {
    private final PortfolioRepository portfolioRepository;

    @Transactional
    public long save(Freelancer freelancer, PortfolioRequestDto dto) {
        Portfolio portfolio = new Portfolio(freelancer, dto.title(), dto.summary(), dto.startDate(), dto.endDate(), dto.contribution(), dto.imageUrl(), dto.externalUrl());
        portfolioRepository.save(portfolio);
        return portfolio.getId();
    }

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
    public Long update(Long id, PortfolioRequestDto dto) {
        Portfolio portfolio = portfolioRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 id 입니다."));
        portfolio.update(dto);
        return portfolio.getId();
    }

    @Transactional
    public Long delete(Long id) {
        Portfolio portfolio = portfolioRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 id 입니다."));
        portfolioRepository.delete(portfolio);
        return portfolio.getId();
    }
}
