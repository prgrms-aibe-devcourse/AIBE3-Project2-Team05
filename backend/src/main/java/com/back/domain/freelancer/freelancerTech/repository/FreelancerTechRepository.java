package com.back.domain.freelancer.freelancerTech.repository;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancerTech.entity.FreelancerTech;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FreelancerTechRepository extends JpaRepository<FreelancerTech, Long> {
    List<FreelancerTech> findFreelancerTechByFreelancer(Optional<Freelancer> freelancer);
}
