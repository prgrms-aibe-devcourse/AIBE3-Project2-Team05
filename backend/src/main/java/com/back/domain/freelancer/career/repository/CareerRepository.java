package com.back.domain.freelancer.career.repository;

import com.back.domain.freelancer.career.entity.Career;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareerRepository extends JpaRepository<Career, Long> {
    List<Career> findAllByFreelancerId(Long freelancerId);
}
