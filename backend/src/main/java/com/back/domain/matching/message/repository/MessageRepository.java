package com.back.domain.matching.message.repository;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.matching.message.entity.Message;
import com.back.domain.matching.message.entity.RelatedType;
import com.back.domain.member.member.entity.Member;
import com.back.domain.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 메시지 Repository
 */
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * 특정 PM과 프리랜서 간의 메시지 목록 조회 (최신순)
     *
     * @param pm         PM
     * @param freelancer 프리랜서
     * @return 메시지 목록
     */
    List<Message> findByPmAndFreelancerOrderByCreateDateDesc(Member pm, Freelancer freelancer);

    /**
     * 특정 연관 항목의 메시지 목록 조회 (최신순)
     *
     * @param relatedType 연관 타입
     * @param relatedId   연관 ID
     * @return 메시지 목록
     */
    List<Message> findByRelatedTypeAndRelatedIdOrderByCreateDateDesc(
            RelatedType relatedType,
            Long relatedId
    );

    /**
     * 프로젝트의 모든 메시지 조회 (최신순)
     *
     * @param project 프로젝트
     * @return 메시지 목록
     */
    List<Message> findByProjectOrderByCreateDateDesc(Project project);

    /**
     * PM이 참여한 모든 메시지 조회
     *
     * @param pm PM
     * @return 메시지 목록
     */
    List<Message> findByPmOrderByCreateDateDesc(Member pm);

    /**
     * 프리랜서가 참여한 모든 메시지 조회
     *
     * @param freelancer 프리랜서
     * @return 메시지 목록
     */
    List<Message> findByFreelancerOrderByCreateDateDesc(Freelancer freelancer);

    /**
     * 읽지 않은 메시지 수 조회
     *
     * @param freelancer 프리랜서
     * @param isRead     읽음 여부
     * @return 읽지 않은 메시지 수
     */
    long countByFreelancerAndIsRead(Freelancer freelancer, boolean isRead);

    /**
     * PM과 프리랜서 간 특정 연관 항목의 메시지 조회
     *
     * @param pm          PM
     * @param freelancer  프리랜서
     * @param relatedType 연관 타입
     * @param relatedId   연관 ID
     * @return 메시지 목록
     */
    List<Message> findByPmAndFreelancerAndRelatedTypeAndRelatedIdOrderByCreateDateDesc(
            Member pm,
            Freelancer freelancer,
            RelatedType relatedType,
            Long relatedId
    );

    /**
     * 특정 사용자가 받은 읽지 않은 메시지 조회
     * (sender가 아닌 메시지 중 isRead=false)
     *
     * @param member 사용자
     * @return 읽지 않은 메시지 목록
     */
    @Query("SELECT m FROM Message m WHERE " +
           "((m.pm.id = :memberId AND m.sender.id != :memberId) OR " +
           "(m.freelancer.id = :memberId AND m.sender.id != :memberId)) " +
           "AND m.isRead = false " +
           "ORDER BY m.createDate DESC")
    List<Message> findUnreadMessagesByReceiver(@Param("memberId") Long memberId);
}
