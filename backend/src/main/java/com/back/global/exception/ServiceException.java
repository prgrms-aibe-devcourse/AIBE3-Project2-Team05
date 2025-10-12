package com.back.global.exception;

import lombok.Getter;

/**
 * 임시 클래스 - 매칭 시스템 개발/테스트용
 * TODO: [Global 담당자] - 정식 ServiceException으로 교체 필요
 *
 * 비즈니스 로직 예외
 */
@Getter
public class ServiceException extends RuntimeException {

    /**
     * 에러 코드 (예: 404-1, 403-1)
     */
    private final String errorCode;

    /**
     * 에러 메시지
     */
    private final String errorMessage;

    public ServiceException(String errorCode, String errorMessage) {
        super(errorMessage);
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
    }
}
