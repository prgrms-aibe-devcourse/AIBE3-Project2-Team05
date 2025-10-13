package com.back.domain.project.service;

import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.repository.MemberRepository;
import com.back.domain.project.entity.enums.ProjectStatus;
import com.back.domain.project.dto.ProjectRequest;
import com.back.domain.project.dto.ProjectResponse;
import com.back.domain.project.entity.Project;
import com.back.domain.project.repository.ProjectRepository;
import com.back.domain.project.validator.ProjectValidator;
import com.back.global.exception.ProjectNotFoundException;
import com.back.global.util.EntityDtoMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 프로젝트 핵심 서비스
 * 단일 책임: 프로젝트 CRUD 작업
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final MemberRepository memberRepository;
    private final ProjectTechService projectTechService;
    private final ProjectFileService projectFileService;
    private final ProjectValidator projectValidator;

    /**
     * 프로젝트 완전 생성 (기본 정보 + 추가 정보)
     */
    @Transactional
    public ProjectResponse createCompleteProject(ProjectRequest request) {
        log.info("프로젝트 완전 생성 - title: {}, managerId: {}", request.title(), request.managerId());

        // Member 조회
        Member manager = memberRepository.findById(request.managerId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        Project project = EntityDtoMapper.toEntity(request);
        project.setManager(manager);  // Member 객체 설정
        project.setStatus(ProjectStatus.RECRUITING);
        project.setViewCount(0);

        projectValidator.validateProject(project);

        Project savedProject = projectRepository.save(project);

        // 기술 스택 저장 (있는 경우)
        List<String> techNames = null;
        if (request.techNames() != null && !request.techNames().isEmpty()) {
            techNames = projectTechService.saveTechStacks(savedProject.getId(), request.techNames());
        }

        return ProjectResponse.from(savedProject, techNames);
    }

    /**
     * 기존 프로젝트에 추가 정보 업데이트
     */
    @Transactional
    public ProjectResponse completeProjectWithAdditionalInfo(Long projectId, ProjectRequest request) {
        log.info("프로젝트 추가 정보로 완성 - id: {}", projectId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        EntityDtoMapper.updateEntity(project, request);

        // 기술 스택 업데이트
        if (request.techNames() != null && !request.techNames().isEmpty()) {
            projectTechService.updateTechStacks(projectId, request.techNames());
        }

        // 파일 첨부
        if (request.attachmentFileIds() != null && !request.attachmentFileIds().isEmpty()) {
            projectFileService.attachFilesToProject(projectId, request.attachmentFileIds());
        }

        Project updatedProject = projectRepository.save(project);

        // 업데이트된 기술 스택 조회
        List<String> techNames = projectTechService.getProjectTechNames(projectId);

        return ProjectResponse.from(updatedProject, techNames);
    }

    /**
     * 프로젝트 삭제
     */
    @Transactional
    public void deleteProject(Long id, Long requesterId) {
        log.info("프로젝트 삭제 - id: {}, requesterId: {}", id, requesterId);

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));

        projectValidator.validateProjectOwnership(project, requesterId);

        // 관련 기술스택 먼저 삭제
        projectTechService.deleteTechStacks(id);

        // 프로젝트 삭제
        projectRepository.deleteById(id);
    }
}
