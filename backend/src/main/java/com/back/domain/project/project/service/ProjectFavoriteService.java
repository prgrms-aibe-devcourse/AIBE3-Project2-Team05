package com.back.domain.project.project.service;

import com.back.domain.project.project.entity.ProjectFavorite;
import com.back.domain.project.project.repository.ProjectFavoriteRepository;
import com.back.domain.project.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProjectFavoriteService {

    private final ProjectFavoriteRepository projectFavoriteRepository;
    private final ProjectRepository projectRepository;

    /**
     * 즐겨찾기 추가/제거 토글
     */
    @Transactional
    public boolean toggleFavorite(Long userId, Long projectId) {
        // 프로젝트 존재 확인
        if (!projectRepository.existsById(projectId)) {
            throw new IllegalArgumentException("존재하지 않는 프로젝트입니다.");
        }

        Optional<ProjectFavorite> existingFavorite =
            projectFavoriteRepository.findByUserIdAndProjectId(userId, projectId);

        if (existingFavorite.isPresent()) {
            // 이미 즐겨찾기가 되어있으면 제거
            projectFavoriteRepository.delete(existingFavorite.get());
            log.info("즐겨찾기 제거: userId={}, projectId={}", userId, projectId);
            return false; // 제거됨
        } else {
            // 즐겨찾기 추가
            ProjectFavorite favorite = ProjectFavorite.builder()
                    .userId(userId)
                    .projectId(projectId)
                    .createDate(LocalDateTime.now())
                    .build();
            projectFavoriteRepository.save(favorite);
            log.info("즐겨찾기 추가: userId={}, projectId={}", userId, projectId);
            return true; // 추가됨
        }
    }

    /**
     * 즐겨찾기 상태 확인
     */
    public boolean isFavorite(Long userId, Long projectId) {
        return projectFavoriteRepository.findByUserIdAndProjectId(userId, projectId).isPresent();
    }

    /**
     * 사용자의 즐겨찾기 프로젝트 ID 목록 조회
     */
    public List<Long> getFavoriteProjectIds(Long userId) {
        return projectFavoriteRepository.findProjectIdsByUserId(userId);
    }

    /**
     * 프로젝트의 즐겨찾기 수 조회
     */
    public long getFavoriteCount(Long projectId) {
        return projectFavoriteRepository.countByProjectId(projectId);
    }

    /**
     * 사용자의 즐겨찾기 목록 조회
     */
    public List<ProjectFavorite> getUserFavorites(Long userId) {
        return projectFavoriteRepository.findByUserIdOrderByCreateDateDesc(userId);
    }
}
