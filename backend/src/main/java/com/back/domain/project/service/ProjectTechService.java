package com.back.domain.project.service;

import com.back.domain.project.entity.Project;
import com.back.domain.project.entity.ProjectTech;
import com.back.domain.project.entity.enums.TechCategory;
import com.back.domain.project.repository.ProjectRepository;
import com.back.domain.project.repository.ProjectTechRepository;
import com.back.domain.project.util.TechCategoryMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 프로젝트 기술 스택 전용 서비스
 * 단일 책임: 프로젝트 기술 스택 관리
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectTechService {

    private final ProjectTechRepository projectTechRepository;
    private final ProjectRepository projectRepository;

    /**
     * 프로젝트 기술스택 조회
     */
    public List<ProjectTech> getProjectTechs(Long projectId) {
        log.debug("프로젝트 기술스택 조회 - projectId: {}", projectId);
        return projectTechRepository.findByProject_IdOrderByCreateDate(projectId);
    }

    /**
     * 프로젝트 기술스택 이름 목록 조회
     */
    public List<String> getProjectTechNames(Long projectId) {
        log.debug("프로젝트 기술스택 이름 목록 조회 - projectId: {}", projectId);
        return getProjectTechs(projectId).stream()
                .map(ProjectTech::getTechName)
                .collect(Collectors.toList());
    }

    /**
     * 기술 스택 저장
     */
    @Transactional
    public List<String> saveTechStacks(Long projectId, List<String> techNames) {
        log.debug("프로젝트 기술스택 저장 - projectId: {}, count: {}", projectId, techNames.size());

        // Project 엔티티 조회
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프로젝트입니다."));

        List<ProjectTech> projectTechs = techNames.stream()
                .map(techName -> {
                    TechCategory category = TechCategoryMapper.getCategoryByTechName(techName);
                    log.debug("기술스택 매핑 - techName: {}, category: {}", techName, category);

                    return ProjectTech.builder()
                            .project(project)  // Project 엔티티 설정
                            .techName(techName)
                            .techCategory(category) // 카테고리 자동 설정
                            .createDate(LocalDateTime.now())
                            .build();
                })
                .collect(Collectors.toList());

        projectTechRepository.saveAll(projectTechs);
        log.info("프로젝트 기술스택 저장 완료 - projectId: {}, 저장된 기술: {}", projectId, techNames);

        return techNames;
    }

    /**
     * 기술 스택 업데이트 (기존 삭제 후 새로 추가)
     */
    @Transactional
    public List<String> updateTechStacks(Long projectId, List<String> techNames) {
        log.info("프로젝트 기술스택 업데이트 시작 - projectId: {}, 새로운 기술스택: {}", projectId, techNames);

        try {
            // 기존 기술스택 조회 (디버깅용)
            List<String> existingTechs = getProjectTechNames(projectId);
            log.info("기존 기술스택: {}", existingTechs);

            // 기존 기술스택 삭제
            deleteTechStacks(projectId);
            log.info("기존 기술스택 삭제 완료 - projectId: {}", projectId);

            // 새로운 기술스택 추가
            if (!techNames.isEmpty()) {
                List<String> savedTechs = saveTechStacks(projectId, techNames);
                log.info("새로운 기술스택 저장 완료 - projectId: {}, 저장된 기술스택: {}", projectId, savedTechs);
                return savedTechs;
            } else {
                log.info("새로운 기술스택이 비어있음 - projectId: {}", projectId);
                return techNames;
            }
        } catch (Exception e) {
            log.error("기술스택 업데이트 중 오류 발생 - projectId: {}, error: {}", projectId, e.getMessage(), e);
            throw e; // 트랜잭션 롤백을 위해 예외 재발생
        }
    }

    /**
     * 개별 기술 스택 추가
     */
    @Transactional
    public void addTechStack(Long projectId, String techName) {
        log.debug("기술스택 추가 - projectId: {}, techName: {}", projectId, techName);

        // Project 엔티티 조회
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 프로젝트입니다."));

        TechCategory category = TechCategoryMapper.getCategoryByTechName(techName);
        log.debug("기술스택 매핑 - techName: {}, category: {}", techName, category);

        ProjectTech projectTech = ProjectTech.builder()
                .project(project)  // Project 엔티티 설정
                .techName(techName)
                .techCategory(category) // 카테고리 자동 설정
                .createDate(LocalDateTime.now())
                .build();

        projectTechRepository.save(projectTech);
    }

    /**
     * 프로젝트의 모든 기술 스택 삭제
     */
    @Transactional
    public void deleteTechStacks(Long projectId) {
        log.debug("프로젝트 기술스택 삭제 - projectId: {}", projectId);
        projectTechRepository.deleteByProject_Id(projectId);
    }

    /**
     * 특정 기술 스택 삭제
     */
    @Transactional
    public void deleteTechStack(Long projectId, String techName) {
        log.debug("특정 기술스택 삭제 - projectId: {}, techName: {}", projectId, techName);
        projectTechRepository.deleteByProject_IdAndTechName(projectId, techName);
    }

    /**
     * 프로젝트가 특정 기술 스택을 가지고 있는지 확인
     */
    public boolean hasProjectTech(Long projectId, String techName) {
        return projectTechRepository.existsByProject_IdAndTechName(projectId, techName);
    }
}
