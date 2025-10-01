package com.back.global.rsData;

public record RsData<T>(
        String resultCode,
        int StatusCode,
        String msg,
        T Data
) {
    public RsData(String resultCode, String msg, T data) {
        this(resultCode, Integer.parseInt(resultCode.split("-", 2)[0]), msg, data);
    }

    public RsData(String resultCode, String msg) {
        this(resultCode, msg, null);
    }

}
/*
     성공
200-1  200  회원 가입 성공
200-2  200  로그인 성공
200-3  200  회원 정보 조회 성공
200-4  200  회원 정보 수정 성공
200-5  200  로그아웃 성공

클라이언트 오류
400-1  400  잘못된 요청 (Request Body 유효성 오류)
400-2  400  중복된 이메일 입력
400-3  400  인증 실패 (회원 정보를 불러올 수 없을 때)
400-4  400  권한 없음 (권한 부족)

토큰/인증
401-1  401  Access Token 만료 (Refresh Token 필요)
401-2  401  Refresh Token 만료 (재로그인 필요)
401-3  401  유효하지 않은 토큰 (변조, 구조 오류)
403-1  403  권한 부족 (로그인은 되었으나 접근 금지)


 */