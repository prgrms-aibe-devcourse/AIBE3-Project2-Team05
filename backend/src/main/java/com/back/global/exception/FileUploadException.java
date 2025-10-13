package com.back.global.exception;

public class FileUploadException extends RuntimeException {
    private final String errorCode;

    public FileUploadException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public FileUploadException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "FILE_UPLOAD_ERROR";
    }

    public String getErrorCode() {
        return errorCode;
    }
}
