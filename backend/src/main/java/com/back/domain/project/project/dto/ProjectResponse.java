package com.back.domain.project.project.dto;

import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.entity.ProjectFile;
import com.back.domain.project.project.entity.ProjectStatusHistory;
import com.back.domain.project.project.entity.ProjectTech;
import com.back.domain.project.project.entity.enums.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 프로젝트 응답 통합 DTO
 * - 생성 응답, 상세 조회, 목록 조회 모두 처리
 */
public record ProjectResponse(
    // 기본 정보
    Long id,
    String title,
    String description,
    ProjectField projectField,
    RecruitmentType recruitmentType,
    BudgetRange budgetType,
    Long budgetAmount,
    LocalDate startDate,
    LocalDate endDate,

    // 추가 정보
    PartnerType partnerType,
    String partnerEtcDescription,
    String progressStatus,
    String companyLocation,

    // 상태 정보
    ProjectStatus status,
    Integer viewCount,
    Long managerId,
    LocalDateTime createDate,
    LocalDateTime modifyDate,

    // 관련 데이터 (상세 조회 시에만)
    List<String> techNames,
    List<ProjectFileInfo> projectFiles,
    List<ProjectStatusHistory> statusHistories
) {

    /**
     * 기본 프로젝트 정보로부터 생성 (목록 조회, 생성 응답용)
     */
    public static ProjectResponse from(Project project, List<String> techNames) {
        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getProjectField(),
                project.getRecruitmentType(),
                project.getBudgetType(),
                project.getBudgetAmount(),
                project.getStartDate(),
                project.getEndDate(),
                project.getPartnerType(),
                project.getPartnerEtcDescription(),
                project.getProgressStatus(),
                project.getCompanyLocation(),
                project.getStatus(),
                project.getViewCount(),
                project.getManagerId(),
                project.getCreateDate(),
                project.getModifyDate(),
                techNames,
                null, // 파일 정보는 상세 조회 시에만
                null  // 이력 정보는 상세 조회 시에만
        );
    }

    /**
     * 프로젝트 상세 정보로부터 생성 (상세 조회용)
     */
    public static ProjectResponse fromDetail(Project project,
                                           List<ProjectTech> techStacks,
                                           List<ProjectFile> projectFiles,
                                           List<ProjectStatusHistory> statusHistories) {

        List<String> techNames = techStacks.stream()
                .map(ProjectTech::getTechName)
                .toList();

        List<ProjectFileInfo> fileInfos = projectFiles.stream()
                .map(file -> new ProjectFileInfo(
                        file.getId(),
                        file.getOriginalName(),
                        file.getFileSize(),
                        file.getFileType(),
                        file.getUploadDate()
                ))
                .toList();

        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getProjectField(),
                project.getRecruitmentType(),
                project.getBudgetType(),
                project.getBudgetAmount(),
                project.getStartDate(),
                project.getEndDate(),
                project.getPartnerType(),
                project.getPartnerEtcDescription(),
                project.getProgressStatus(),
                project.getCompanyLocation(),
                project.getStatus(),
                project.getViewCount(),
                project.getManagerId(),
                project.getCreateDate(),
                project.getModifyDate(),
                techNames,
                fileInfos,
                statusHistories
        );
    }

    /**
     * 프로젝트 파일 정보
     */
    public record ProjectFileInfo(
            Long id,
            String originalName,
            Long fileSize,
            String fileType,
            LocalDateTime uploadDate
    ) {}
}
