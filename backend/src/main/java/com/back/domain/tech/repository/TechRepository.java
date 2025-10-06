package com.back.domain.tech.repository;

import com.back.domain.tech.entity.Tech;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TechRepository extends JpaRepository<Tech, Long> {
    List<Tech> findByTechNameContainingIgnoreCase(String keyword);
}
