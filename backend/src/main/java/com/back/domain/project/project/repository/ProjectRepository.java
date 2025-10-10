package com.back.domain.project.project.repository;

import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.entity.enums.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    // 사용자별 프로젝트 조회
    List<Project> findByManagerIdOrderByCreateDateDesc(Long managerId);

    // 통합 검색/필터링 쿼리 (Service의 searchProjects에서 사용)
    @Query("SELECT DISTINCT p FROM Project p " +
            "LEFT JOIN p.projectTechs pt " +
            "WHERE (:status IS NULL OR p.status = :status) " +
            "AND (:projectField IS NULL OR p.projectField = :projectField) " +
            "AND (:recruitmentType IS NULL OR p.recruitmentType = :recruitmentType) " +
            "AND (:partnerType IS NULL OR p.partnerType = :partnerType) " +
            "AND (:budgetType IS NULL OR p.budgetType = :budgetType) " +
            "AND (:minBudget IS NULL OR :maxBudget IS NULL OR p.budgetAmount BETWEEN :minBudget AND :maxBudget) " +
            "AND (:location IS NULL OR LOWER(p.companyLocation) LIKE LOWER(CONCAT('%', :location, '%'))) " +
            "AND (:keyword IS NULL OR " +
            "     LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "     LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:techNames IS NULL OR pt.techName IN :techNames)")
    Page<Project> findProjectsWithFilters(@Param("status") ProjectStatus status,
                                          @Param("projectField") ProjectField projectField,
                                          @Param("recruitmentType") RecruitmentType recruitmentType,
                                          @Param("partnerType") PartnerType partnerType,
                                          @Param("budgetType") BudgetRange budgetType,
                                          @Param("minBudget") Long minBudget,
                                          @Param("maxBudget") Long maxBudget,
                                          @Param("location") String location,
                                          @Param("keyword") String keyword,
                                          @Param("techNames") List<String> techNames,
                                          Pageable pageable);

    // 사용자별 프로젝트 조회 (페이징과 필터링 지원)
    @Query("SELECT DISTINCT p FROM Project p " +
            "LEFT JOIN p.projectTechs pt " +
            "WHERE p.managerId = :managerId " +
            "AND (:status IS NULL OR p.status = :status) " +
            "AND (:projectField IS NULL OR p.projectField = :projectField) " +
            "AND (:recruitmentType IS NULL OR p.recruitmentType = :recruitmentType) " +
            "AND (:partnerType IS NULL OR p.partnerType = :partnerType) " +
            "AND (:budgetType IS NULL OR p.budgetType = :budgetType) " +
            "AND (:minBudget IS NULL OR :maxBudget IS NULL OR p.budgetAmount BETWEEN :minBudget AND :maxBudget) " +
            "AND (:location IS NULL OR LOWER(p.companyLocation) LIKE LOWER(CONCAT('%', :location, '%'))) " +
            "AND (:keyword IS NULL OR " +
            "     LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "     LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:techNames IS NULL OR pt.techName IN :techNames)")
    Page<Project> findProjectsByManagerIdWithFilters(@Param("managerId") Long managerId,
                                                     @Param("status") ProjectStatus status,
                                                     @Param("projectField") ProjectField projectField,
                                                     @Param("recruitmentType") RecruitmentType recruitmentType,
                                                     @Param("partnerType") PartnerType partnerType,
                                                     @Param("budgetType") BudgetRange budgetType,
                                                     @Param("minBudget") Long minBudget,
                                                     @Param("maxBudget") Long maxBudget,
                                                     @Param("location") String location,
                                                     @Param("keyword") String keyword,
                                                     @Param("techNames") List<String> techNames,
                                                     Pageable pageable);
}