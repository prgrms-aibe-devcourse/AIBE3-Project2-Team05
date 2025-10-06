package com.back.domain.freelancer.freelancerTech.repository;

import com.back.domain.freelancer.freelancerTech.entity.FreelancerTech;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FreelancerTechRepository extends JpaRepository<FreelancerTech, Long> {
}
