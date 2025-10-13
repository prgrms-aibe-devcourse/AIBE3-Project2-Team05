package com.back.global.exception;

public class TokenExpiredException extends RuntimeException { // 토큰이 만료 시간이 다 됐을 때
    private final String resultCode;
    private final String msg;

    public TokenExpiredException(String resultCode, String msg) {
        super(resultCode + " : " + msg);
        this.resultCode = resultCode;
        this.msg = msg;
    }

    public String getResultCode() {
        return resultCode;
    }

    public String getMsg() {
        return msg;
    }

}
