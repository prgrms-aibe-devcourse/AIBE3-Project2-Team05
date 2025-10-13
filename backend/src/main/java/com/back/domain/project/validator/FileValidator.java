package com.back.domain.project.validator;

import com.back.global.exception.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

/**
 * 파일 관련 검증 로직 중앙화 클래스
 */
@Slf4j
@Component
public class FileValidator {

    // 파일당 최대 크기 (50MB)
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024L;

    // 프로젝트당 최대 파일 크기 (500MB)
    private static final long MAX_PROJECT_SIZE = 500 * 1024 * 1024L;

    // 한 번에 업로드 가능한 최대 파일 수
    private static final int MAX_FILES_PER_UPLOAD = 10;

    /**
     * 단일 파일 검증
     */
    public void validateFile(MultipartFile file, String allowedExtensionsStr) {
        log.debug("파일 검증 시작 - fileName: {}", file != null ? file.getOriginalFilename() : "null");

        if (file == null || file.isEmpty()) {
            throw new ValidationException("파일이 비어있습니다.", "EMPTY_FILE");
        }

        if (file.getOriginalFilename() == null || file.getOriginalFilename().trim().isEmpty()) {
            throw new ValidationException("파일명이 없습니다.", "NO_FILENAME");
        }

        // 파일 크기 검증
        validateFileSize(file.getSize());

        // 파일 확장자 검증
        validateFileExtension(file.getOriginalFilename(), allowedExtensionsStr);

        log.debug("파일 검증 완료 - fileName: {}", file.getOriginalFilename());
    }

    /**
     * 여러 파일 검증
     */
    public void validateFiles(List<MultipartFile> files, String allowedExtensionsStr) {
        if (files == null || files.isEmpty()) {
            throw new ValidationException("업로드할 파일이 없습니다.", "NO_FILES_TO_UPLOAD");
        }

        if (files.size() > MAX_FILES_PER_UPLOAD) {
            throw new ValidationException("한 번에 업로드할 수 있는 파일은 최대 " + MAX_FILES_PER_UPLOAD + "개입니다.", "TOO_MANY_FILES");
        }

        // 전체 파일 크기 검증
        long totalSize = files.stream().mapToLong(MultipartFile::getSize).sum();
        if (totalSize > MAX_PROJECT_SIZE) {
            throw new ValidationException("전체 파일 크기가 " + (MAX_PROJECT_SIZE / (1024 * 1024)) + "MB를 초과합니다.", "TOTAL_SIZE_EXCEEDED");
        }

        // 각 파일 개별 검증
        for (MultipartFile file : files) {
            validateFile(file, allowedExtensionsStr);
        }

        log.debug("파일 일괄 검증 완료 - fileCount: {}", files.size());
    }

    /**
     * 파일 크기 검증
     */
    public void validateFileSize(long fileSize) {
        if (fileSize > MAX_FILE_SIZE) {
            throw new ValidationException("파일 크기가 " + (MAX_FILE_SIZE / (1024 * 1024)) + "MB를 초과합니다.", "FILE_SIZE_EXCEEDED");
        }
    }

    /**
     * 파일 확장자 검증
     */
    public void validateFileExtension(String fileName, String allowedExtensionsStr) {
        if (fileName == null || allowedExtensionsStr == null) {
            throw new ValidationException("파일명 또는 허용 확장자 정보가 없습니다.", "MISSING_FILE_INFO");
        }

        String lowerFileName = fileName.toLowerCase();
        String[] allowedExtensions = allowedExtensionsStr.split(",");

        boolean isValidExtension = Arrays.stream(allowedExtensions)
                .anyMatch(ext -> lowerFileName.endsWith("." + ext.trim().toLowerCase()));

        if (!isValidExtension) {
            throw new ValidationException("허용되지 않는 파일 확장자입니다. 허용 확장자: " + allowedExtensionsStr, "INVALID_FILE_EXTENSION");
        }
    }

    /**
     * 프로젝트 파일 크기 제한 검증
     */
    public void validateProjectFileSize(long currentTotalSize, long additionalSize) {
        long newTotalSize = currentTotalSize + additionalSize;

        if (newTotalSize > MAX_PROJECT_SIZE) {
            throw new ValidationException(
                String.format("프로젝트 총 파일 크기가 %dMB를 초과합니다. 현재: %dMB, 추가: %dMB",
                    MAX_PROJECT_SIZE / (1024 * 1024),
                    currentTotalSize / (1024 * 1024),
                    additionalSize / (1024 * 1024)),
                "PROJECT_SIZE_EXCEEDED"
            );
        }
    }

    /**
     * 파일명 검증
     */
    public void validateFileName(String fileName) {
        if (fileName == null || fileName.trim().isEmpty()) {
            throw new ValidationException("파일명이 없습니다.", "NO_FILENAME");
        }

        if (fileName.length() > 255) {
            throw new ValidationException("파일명이 너무 깁니다. 255자 이하로 입력해주세요.", "FILENAME_TOO_LONG");
        }

        // 특수문자 검증 (Windows/Linux에서 금지된 문자들)
        String invalidChars = "<>:\"|?*";
        for (char c : invalidChars.toCharArray()) {
            if (fileName.indexOf(c) != -1) {
                throw new ValidationException("파일명에 허용되지 않는 특수문자가 포함되어 있습니다.", "INVALID_CHARACTERS");
            }
        }
    }

    /**
     * MIME 타입 검증
     */
    public void validateMimeType(MultipartFile file) {
        String contentType = file.getContentType();
        String fileName = file.getOriginalFilename();

        if (contentType == null || contentType.trim().isEmpty()) {
            throw new ValidationException("파일의 MIME 타입을 확인할 수 없습니다.", "UNKNOWN_MIME_TYPE");
        }

        // 확장자별 허용된 MIME 타입 매핑
        String extension = getFileExtension(fileName);
        String[] allowedMimeTypes = getAllowedMimeTypesForExtension(extension);

        if (allowedMimeTypes.length == 0) {
            // 확장자가 허용 목록에 없는 경우는 이미 위에서 검증됨
            return;
        }

        boolean isValidMimeType = Arrays.stream(allowedMimeTypes)
                .anyMatch(mimeType -> contentType.toLowerCase().startsWith(mimeType.toLowerCase()));

        if (!isValidMimeType) {
            throw new ValidationException(
                String.format("파일 확장자(%s)와 MIME 타입(%s)이 일치하지 않습니다.", extension, contentType),
                "MIME_TYPE_MISMATCH"
            );
        }
    }

    /**
     * 파일 확장자 추출
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * 확장자별 허용된 MIME 타입 반환
     */
    private String[] getAllowedMimeTypesForExtension(String extension) {
        return switch (extension.toLowerCase()) {
            case "pdf" -> new String[]{"application/pdf"};
            case "doc" -> new String[]{"application/msword"};
            case "docx" -> new String[]{"application/vnd.openxmlformats-officedocument.wordprocessingml.document"};
            case "xls" -> new String[]{"application/vnd.ms-excel"};
            case "xlsx" -> new String[]{"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"};
            case "ppt" -> new String[]{"application/vnd.ms-powerpoint"};
            case "pptx" -> new String[]{"application/vnd.openxmlformats-officedocument.presentationml.presentation"};
            case "txt" -> new String[]{"text/plain"};
            case "md" -> new String[]{"text/markdown", "text/plain"};
            case "zip" -> new String[]{"application/zip", "application/x-zip-compressed"};
            case "rar" -> new String[]{"application/vnd.rar", "application/x-rar-compressed"};
            case "jpg", "jpeg" -> new String[]{"image/jpeg"};
            case "png" -> new String[]{"image/png"};
            case "gif" -> new String[]{"image/gif"};
            default -> new String[]{};
        };
    }
}
