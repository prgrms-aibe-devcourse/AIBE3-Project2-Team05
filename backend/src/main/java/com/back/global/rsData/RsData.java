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
     <결과 코드 정리>
     성공
    200-1   200	회원 가입 성공
    200-2	200	로그인 성공
    200-3   200 회원 정보 조회 성공

   클라이언트 오류
    400-1	400	잘못된 요청 (Request Body 유효성 오류)
    400-2	400	중복된 이메일 입력
    400-3	400	인증 실패 (아이디,비밀번호 틀림)
    400-4	400	권한 없음 (권한 부족)

 */