package com.back.domain.freelancer.freelancerTech.repository;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancerTech.entity.FreelancerTech;
import com.back.domain.tech.entity.Tech;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FreelancerTechRepository extends JpaRepository<FreelancerTech, Long> {
    boolean existsByFreelancerAndTech(Freelancer freelancer, Tech tech);
    List<FreelancerTech> findByFreelancerId(Long freelancerId);
}
