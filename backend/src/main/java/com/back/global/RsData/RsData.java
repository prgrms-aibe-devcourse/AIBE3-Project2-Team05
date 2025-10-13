package com.back.global.RsData;

import lombok.Getter;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RsData<T> {
    private boolean success;
    private String message;
    private T data;
    private String errorCode;
    private LocalDateTime timestamp;

    private RsData(boolean success, String message, T data, String errorCode) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.errorCode = errorCode;
        this.timestamp = LocalDateTime.now();
    }

    // 성공 응답
    public static <T> RsData<T> success(T data) {
        return new RsData<>(true, "성공", data, null);
    }

    public static <T> RsData<T> success(String message, T data) {
        return new RsData<>(true, message, data, null);
    }

    public static RsData<Void> success() {
        return new RsData<>(true, "성공", null, null);
    }

    // 실패 응답
    public static <T> RsData<T> error(String message) {
        return new RsData<>(false, message, null, null);
    }

    public static <T> RsData<T> error(String message, String errorCode) {
        return new RsData<>(false, message, null, errorCode);
    }
}
