package com.back.domain.tech.tech.repository;

import com.back.domain.tech.tech.entity.Tech;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 임시 Repository - 매칭 시스템 개발/테스트용
 * TODO: [Tech 담당자] - 정식 Repository로 교체 필요
 */
public interface TechRepository extends JpaRepository<Tech, Long> {

    /**
     * 기술 이름으로 조회
     */
    Optional<Tech> findByName(String name);

    /**
     * 기술 분야로 조회
     */
    List<Tech> findByCategory(String category);
}
