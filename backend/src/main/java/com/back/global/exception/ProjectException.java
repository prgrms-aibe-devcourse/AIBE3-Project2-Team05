package com.back.global.exception;

import lombok.Getter;

@Getter
public class ProjectException extends RuntimeException {
    private final String errorCode;

    public ProjectException(String message) {
        super(message);
        this.errorCode = "PROJECT_ERROR";
    }

    public ProjectException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
}
