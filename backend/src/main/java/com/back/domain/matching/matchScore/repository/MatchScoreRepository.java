package com.back.domain.matching.matchScore.repository;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.matching.matchScore.entity.MatchScore;
import com.back.domain.matching.matchScore.entity.MatchScoreId;
import com.back.domain.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * 매칭 점수 Repository
 */
public interface MatchScoreRepository extends JpaRepository<MatchScore, MatchScoreId> {

    /**
     * 프로젝트의 Top N 추천 프리랜서 조회
     * 순위순 정렬
     *
     * @param project 프로젝트
     * @param limit   조회 개수 (rank가 limit 이하인 것만 조회)
     * @return 추천 프리랜서 목록
     */
    @Query("SELECT ms FROM MatchScore ms " +
           "WHERE ms.project = :project " +
           "AND ms.rank <= :limit " +
           "ORDER BY ms.rank ASC")
    List<MatchScore> findTopRecommendations(@Param("project") Project project,
                                           @Param("limit") int limit);

    /**
     * 프로젝트의 최소 점수 이상인 프리랜서 조회
     *
     * @param project  프로젝트
     * @param minScore 최소 점수
     * @return 매칭 점수 목록
     */
    @Query("SELECT ms FROM MatchScore ms " +
           "WHERE ms.project = :project " +
           "AND ms.scoreTotal >= :minScore " +
           "ORDER BY ms.scoreTotal DESC")
    List<MatchScore> findByProjectAndMinScore(@Param("project") Project project,
                                              @Param("minScore") double minScore);

    /**
     * 프로젝트의 Top N 추천 프리랜서 조회 (최소 점수 필터 포함)
     * rank와 minScore를 모두 적용
     *
     * @param project  프로젝트
     * @param limit    조회 개수 (rank가 limit 이하)
     * @param minScore 최소 점수
     * @return 추천 프리랜서 목록
     */
    @Query("SELECT ms FROM MatchScore ms " +
           "WHERE ms.project = :project " +
           "AND ms.rank <= :limit " +
           "AND ms.scoreTotal >= :minScore " +
           "ORDER BY ms.rank ASC")
    List<MatchScore> findTopRecommendationsWithMinScore(@Param("project") Project project,
                                                        @Param("limit") int limit,
                                                        @Param("minScore") double minScore);

    /**
     * 특정 프로젝트-프리랜서 매칭 점수 조회
     *
     * @param project    프로젝트
     * @param freelancer 프리랜서
     * @return 매칭 점수
     */
    Optional<MatchScore> findByProjectAndFreelancer(Project project, Freelancer freelancer);

    /**
     * 프로젝트의 모든 매칭 점수 조회 (점수 높은 순)
     *
     * @param project 프로젝트
     * @return 매칭 점수 목록
     */
    List<MatchScore> findByProjectOrderByScoreTotalDesc(Project project);

    /**
     * 프리랜서의 모든 매칭 점수 조회 (점수 높은 순)
     *
     * @param freelancer 프리랜서
     * @return 매칭 점수 목록
     */
    List<MatchScore> findByFreelancerOrderByScoreTotalDesc(Freelancer freelancer);

    /**
     * 프로젝트의 매칭 점수 전체 삭제
     *
     * @param project 프로젝트
     */
    void deleteByProject(Project project);

    /**
     * 특정 프로젝트-프리랜서 매칭 점수 삭제
     *
     * @param project    프로젝트
     * @param freelancer 프리랜서
     */
    void deleteByProjectAndFreelancer(Project project, Freelancer freelancer);

    /**
     * 프로젝트의 매칭 점수 개수 조회
     *
     * @param project 프로젝트
     * @return 매칭 점수 개수
     */
    long countByProject(Project project);
}
