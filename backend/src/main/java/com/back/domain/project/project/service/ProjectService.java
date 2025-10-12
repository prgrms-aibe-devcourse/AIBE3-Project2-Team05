package com.back.domain.project.project.service;

import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.repository.ProjectRepository;
import com.back.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 임시 Service - 매칭 시스템 개발/테스트용
 * TODO: [Project 담당자] - 정식 Service로 교체 필요
 *
 * 프로젝트 Service (최소 기능만 구현)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;

    /**
     * 프로젝트 ID로 조회
     */
    public Project findById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ServiceException("404-1", "존재하지 않는 프로젝트입니다."));
    }
}
