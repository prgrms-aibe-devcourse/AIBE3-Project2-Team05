package com.back.domain.project.service;

import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.repository.MemberRepository;
import com.back.domain.project.entity.ProjectFavorite;
import com.back.domain.project.repository.ProjectFavoriteRepository;
import com.back.domain.project.repository.ProjectRepository;
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
    private final MemberRepository memberRepository;

    /**
     * 즐겨찾기 추가/제거 토글
     */
    @Transactional
    public boolean toggleFavorite(Long userId, Long projectId) {
        // Member 및 프로젝트 존재 확인
        Member user = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        if (!projectRepository.existsById(projectId)) {
            throw new IllegalArgumentException("존재하지 않는 프로젝트입니다.");
        }

        Optional<ProjectFavorite> existingFavorite =
            projectFavoriteRepository.findByUser_IdAndProject_Id(userId, projectId);

        if (existingFavorite.isPresent()) {
            // 이미 즐겨찾기가 되어있으면 제거
            projectFavoriteRepository.delete(existingFavorite.get());
            log.info("즐겨찾기 제거: userId={}, projectId={}", userId, projectId);
            return false; // 제거됨
        } else {
            // 즐겨찾기 추가 - Member와 Project 엔티티 관계 설정
            ProjectFavorite favorite = ProjectFavorite.builder()
                    .user(user)
                    .project(projectRepository.findById(projectId).orElseThrow())
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
        return projectFavoriteRepository.findByUser_IdAndProject_Id(userId, projectId).isPresent();
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
        return projectFavoriteRepository.findByUser_IdOrderByCreateDateDesc(userId);
    }
}
