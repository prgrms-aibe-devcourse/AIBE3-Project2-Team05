package com.back.global.exception;

public class UnauthorizedException extends RuntimeException {
    private final String resultCode;
    private final String msg;

    public UnauthorizedException(String resultCode, String msg) {
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
