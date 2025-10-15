package com.back.global.rsData;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 임시 클래스 - 매칭 시스템 개발/테스트용
 * TODO: [Global 담당자] - 정식 RsData로 교체 필요
 *
 * 표준 API 응답 형식
 */
@Getter
@AllArgsConstructor
public class RsData<T> {

    /**
     * 결과 코드 (예: 200-1, 404-1)
     */
    private String resultCode;

    /**
     * 메시지
     */
    private String msg;

    /**
     * 응답 데이터
     */
    private T data;

    /**
     * 데이터 없는 응답 생성자
     */
    public RsData(String resultCode, String msg) {
        this.resultCode = resultCode;
        this.msg = msg;
        this.data = null;
    }
}
