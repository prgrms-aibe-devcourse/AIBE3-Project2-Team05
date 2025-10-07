package com.back.domain.freelancer.portfolio.controller;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.freelancer.portfolio.dto.PortfolioRequestDto;
import com.back.domain.freelancer.portfolio.dto.PortfolioResponseDto;
import com.back.domain.freelancer.portfolio.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/freelancers/portfolios")
public class PortfolioController {
    private final PortfolioService portfolioService;
    private final FreelancerRepository freelancerRepository;

    private final Long freelancerId = 27L;

    @PostMapping
    public Long savePortfolio(@RequestBody PortfolioRequestDto dto) {
        Freelancer freelancer = freelancerRepository.findById(freelancerId).get();

        return portfolioService.save(freelancer, dto);
    }

    @GetMapping
    public List<PortfolioResponseDto> getPortfolios() {
        Freelancer freelancer = freelancerRepository.findById(freelancerId).get();
        return portfolioService.getPortfolios(freelancer);
    }

    @GetMapping("/{id}")
    public PortfolioResponseDto getPortfolio(@PathVariable Long id) {
        return portfolioService.getPortfolio(id);
    }

    @PutMapping("/{id}")
    public Long update(@PathVariable Long id, @RequestBody PortfolioRequestDto dto) {
        return portfolioService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public Long delete(@PathVariable Long id) {
        return portfolioService.delete(id);
    }
}
