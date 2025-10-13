package com.back.domain.project.project.controller;

import com.back.domain.project.project.dto.ProjectListDto;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.repository.ProjectRepository;
import com.back.global.rsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 프로젝트 API Controller
 */
@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ApiV1ProjectController {

    private final ProjectRepository projectRepository;

    /**
     * 프로젝트 목록 조회
     */
    @GetMapping
    public RsData<List<ProjectListDto>> getProjects() {
        List<Project> projects = projectRepository.findAllByOrderByCreateDateDesc();

        List<ProjectListDto> projectDtos = projects.stream()
                .map(ProjectListDto::new)
                .collect(Collectors.toList());

        return new RsData<>(
                "200-1",
                "프로젝트 목록 조회 성공",
                projectDtos
        );
    }
}
