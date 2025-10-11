package com.back.domain.freelancer.portfolio.repository;

import com.back.domain.freelancer.portfolio.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    List<Portfolio> findAllByFreelancerId(Long freelancerId);
}
