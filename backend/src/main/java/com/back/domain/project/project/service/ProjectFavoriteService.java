package com.back.domain.project.project.service;

import com.back.domain.project.project.entity.ProjectFavorite;
import com.back.domain.project.project.repository.ProjectFavoriteRepository;
import com.back.domain.project.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectFavoriteService {

    private final ProjectFavoriteRepository favoriteRepository;
    private final ProjectRepository projectRepository;

    /**
     * 사용자의 즐겨찾기 목록 조회 (페이징)
     */
    @Transactional(readOnly = true)
    public Page<ProjectFavorite> getUserFavorites(Long userId, Pageable pageable) {
        log.debug("사용자 즐겨찾기 페이징 조회 - userId: {}", userId);

        return favoriteRepository.findByUserIdOrderByCreateDateDesc(userId, pageable);
    }

    /**
     * 사용자의 즐겨찾기 목록 조회 (전체)
     */
    @Transactional(readOnly = true)
    public List<ProjectFavorite> getUserFavorites(Long userId) {
        log.debug("사용자 즐겨찾기 전체 조회 - userId: {}", userId);

        // 원래 메서드로 복원: 페이징 없는 조회 메서드 사용
        return favoriteRepository.findByUserIdOrderByCreateDateDesc(userId);
    }

    /**
     * 즐겨찾기 상세 조회
     */
    @Transactional(readOnly = true)
    public Optional<ProjectFavorite> getFavorite(Long userId, Long projectId) {
        log.debug("즐겨찾기 상세 조회 - userId: {}, projectId: {}", userId, projectId);

        return favoriteRepository.findByUserIdAndProjectId(userId, projectId);
    }

    /**
     * 즐겨찾기 여부 확인
     */
    @Transactional(readOnly = true)
    public boolean isFavorite(Long userId, Long projectId) {
        log.debug("즐겨찾기 여부 확인 - userId: {}, projectId: {}", userId, projectId);

        return favoriteRepository.existsByUserIdAndProjectId(userId, projectId);
    }

    /**
     * 즐겨찾기 추가
     */
    @Transactional
    public ProjectFavorite addFavorite(Long userId, Long projectId) {
        log.info("즐겨찾기 추가 - userId: {}, projectId: {}", userId, projectId);

        // 입력값 검증
        validateFavoriteInput(userId, projectId);

        // 프로젝트 존재 확인
        if (!projectRepository.existsById(projectId)) {
            throw new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + projectId);
        }

        // 이미 즐겨찾기에 있는지 확인
        if (isFavorite(userId, projectId)) {
            throw new IllegalStateException("이미 즐겨찾기에 추가된 프로젝트입니다.");
        }

        ProjectFavorite favorite = ProjectFavorite.builder()
                .userId(userId)
                .projectId(projectId)
                .createDate(LocalDateTime.now())
                .build();

        return favoriteRepository.save(favorite);
    }

    /**
     * 즐겨찾기 제거
     */
    @Transactional
    public void removeFavorite(Long userId, Long projectId) {
        log.info("즐겨찾기 제거 - userId: {}, projectId: {}", userId, projectId);

        if (!isFavorite(userId, projectId)) {
            throw new IllegalArgumentException("즐겨찾기에 없는 프로젝트입니다.");
        }

        favoriteRepository.deleteByUserIdAndProjectId(userId, projectId);
    }

    /**
     * 즐겨찾기 토글 (있으면 제거, 없으면 추가)
     */
    @Transactional
    public FavoriteToggleResult toggleFavorite(Long userId, Long projectId) {
        log.info("즐겨찾기 토글 - userId: {}, projectId: {}", userId, projectId);

        if (isFavorite(userId, projectId)) {
            removeFavorite(userId, projectId);
            return new FavoriteToggleResult(false, null);
        } else {
            ProjectFavorite favorite = addFavorite(userId, projectId);
            return new FavoriteToggleResult(true, favorite);
        }
    }

    /**
     * 프로젝트의 즐겨찾기 수 조회
     */
    @Transactional(readOnly = true)
    public long getFavoriteCount(Long projectId) {
        log.debug("프로젝트 즐겨찾기 수 조회 - projectId: {}", projectId);

        return favoriteRepository.countByProjectId(projectId);
    }

    /**
     * 사용자의 즐겨찾기 수 조회
     */
    @Transactional(readOnly = true)
    public long getUserFavoriteCount(Long userId) {
        log.debug("사용자 즐겨찾기 수 조회 - userId: {}", userId);

        // 원래 메서드로 복원: 직접 카운트 메서드 사용
        return favoriteRepository.countByUserId(userId);
    }

    /**
     * 사용자별 즐겨찾기 삭제 (회원 탈퇴시)
     */
    @Transactional
    public void removeAllUserFavorites(Long userId) {
        log.info("사용자 즐겨찾기 전체 삭제 - userId: {}", userId);

        // 원래 메서드로 복원: 단일 쿼리로 일괄 삭제
        favoriteRepository.deleteByUserId(userId);
    }

    /**
     * 프로젝트별 즐겨찾기 삭제 (프로젝트 삭제시)
     */
    @Transactional
    public void removeAllProjectFavorites(Long projectId) {
        log.info("프로젝트 즐겨찾기 전체 삭제 - projectId: {}", projectId);

        favoriteRepository.deleteByProjectId(projectId);
    }


    /**
     * 즐겨찾기 입력값 검증
     */
    private void validateFavoriteInput(Long userId, Long projectId) {
        if (userId == null) {
            throw new IllegalArgumentException("사용자 ID는 필수입니다.");
        }

        if (projectId == null) {
            throw new IllegalArgumentException("프로젝트 ID는 필수입니다.");
        }
    }

    // ===== Inner Classes =====

    @lombok.AllArgsConstructor
    @lombok.Data
    public static class FavoriteToggleResult {
        private boolean isAdded;
        private ProjectFavorite favorite;
    }
}