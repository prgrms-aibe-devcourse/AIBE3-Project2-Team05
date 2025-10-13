package com.back.global.exception;

public class ProjectAccessDeniedException extends ProjectException {
    public ProjectAccessDeniedException() {
        super("프로젝트에 대한 권한이 없습니다.", "PROJECT_ACCESS_DENIED");
    }
}