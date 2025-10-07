package com.back.domain.freelancer.portfolio.controller;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.freelancer.portfolio.dto.PortfolioRequestDto;
import com.back.domain.freelancer.portfolio.dto.PortfolioResponseDto;
import com.back.domain.freelancer.portfolio.dto.PortfolioUpdateRequestDto;
import com.back.domain.freelancer.portfolio.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/freelancers/portfolios")
public class PortfolioController {
    private final PortfolioService portfolioService;
    private final FreelancerRepository freelancerRepository;

    private final Long freelancerId = 27L;

    @PostMapping
    public Long savePortfolioWithImage(@RequestPart PortfolioRequestDto dto, @RequestPart MultipartFile imageFile) {
        Freelancer freelancer = freelancerRepository.findById(freelancerId).get();

        return portfolioService.saveWithImage(freelancer, dto, imageFile);
    }

//    @PostMapping
//    public Long savePortfolio(@RequestPart PortfolioRequestDto dto) {
//        Freelancer freelancer = freelancerRepository.findById(freelancerId).get();
//
//        return portfolioService.save(freelancer, dto);
//    }

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
    public Long update(@PathVariable Long id, @RequestPart PortfolioUpdateRequestDto dto, @RequestPart MultipartFile imageFile) {
        return portfolioService.update(id, dto, imageFile);
    }

    @DeleteMapping("/{id}")
    public Long delete(@PathVariable Long id) {
        return portfolioService.delete(id);
    }
}
