package com.back.global.exception;

import com.back.global.RsData.RsData;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 프로젝트를 찾을 수 없는 경우
     */
    @ExceptionHandler(ProjectNotFoundException.class)
    public ResponseEntity<RsData<Object>> handleProjectNotFoundException(ProjectNotFoundException e) {
        log.error("프로젝트 찾기 실패: {}", e.getMessage());

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(RsData.error(e.getMessage(), e.getErrorCode()));
    }

    /**
     * 프로젝트 접근 권한 없음
     */
    @ExceptionHandler(ProjectAccessDeniedException.class)
    public ResponseEntity<RsData<Object>> handleProjectAccessDeniedException(ProjectAccessDeniedException e) {
        log.error("프로젝트 접근 권한 없음: {}", e.getMessage());

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(RsData.error(e.getMessage(), e.getErrorCode()));
    }

    /**
     * Bean Validation 실패 (@Valid 어노테이션)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<RsData<Object>> handleValidationException(MethodArgumentNotValidException e) {
        log.error("입력값 검증 실패: {}", e.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(RsData.error("입력값 검증에 실패했습니다.", "VALIDATION_FAILED"));
    }

    /**
     * 제약조건 위반 (@PathVariable, @RequestParam 등의 validation)
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<RsData<Object>> handleConstraintViolationException(ConstraintViolationException e) {
        log.error("제약조건 위반: {}", e.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(RsData.error("입력값이 제약조건을 위반했습니다.", "CONSTRAINT_VIOLATION"));
    }

    /**
     * 파일 업로드 크기 초과
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<RsData<Object>> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException e) {
        log.error("파일 업로드 크기 초과: {}", e.getMessage());

        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(RsData.error("업로드 파일 크기가 제한을 초과했습니다.", "FILE_SIZE_EXCEEDED"));
    }

    /**
     * 파일 업로드 관련 예외 처리
     */
    @ExceptionHandler(FileUploadException.class)
    public ResponseEntity<RsData<Object>> handleFileUploadException(FileUploadException e) {
        log.error("파일 업로드 예외: {}", e.getMessage(), e);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(RsData.error(e.getMessage(), e.getErrorCode()));
    }

    /**
     * 커스텀 검증 예외 처리
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<RsData<Object>> handleValidationException(ValidationException e) {
        log.error("검증 예외: {}", e.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(RsData.error(e.getMessage(), e.getErrorCode()));
    }

    /**
     * 일반적인 비즈니스 로직 예외
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<RsData<Object>> handleIllegalArgumentException(IllegalArgumentException e) {
        log.error("잘못된 매개변수: {}", e.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(RsData.error(e.getMessage(), "INVALID_ARGUMENT"));
    }

    /**
     * 예상하지 못한 모든 예외
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<RsData<Object>> handleException(Exception e) {
        log.error("예상하지 못한 예외 발생: {}", e.getMessage(), e);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(RsData.error("내부 서버 오류가 발생했습니다.", "INTERNAL_ERROR"));
    }
}
