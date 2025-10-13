package com.back.global.exception;

public class ProjectNotFoundException extends ProjectException {
    public ProjectNotFoundException(Long projectId) {
        super("프로젝트를 찾을 수 없습니다. ID: " + projectId, "PROJECT_NOT_FOUND");
    }
}