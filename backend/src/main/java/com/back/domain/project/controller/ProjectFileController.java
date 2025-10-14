package com.back.domain.project.controller;

import com.back.domain.project.entity.ProjectFile;
import com.back.domain.project.service.ProjectFileService;
import com.back.global.rsData.RsData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/projects/{projectId}/files")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProjectFileController {

    private final ProjectFileService fileService;

    /**
     * 프로젝트 파일 목록 조회
     */
    @GetMapping
    public ResponseEntity<RsData<List<ProjectFile>>> getProjectFiles(@PathVariable Long projectId) {
        log.info("프로젝트 파일 목록 조회 요청 - projectId: {}", projectId);

        try {
            List<ProjectFile> files = fileService.getProjectFiles(projectId);
            return ResponseEntity.ok(
                new RsData<>("200-1", "파일 목록 조회 성공", files)
            );
        } catch (IllegalArgumentException e) {
            log.error("프로젝트 파일 목록 조회 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new RsData<>("400-1", "파일 목록 조회 실패: " + e.getMessage(), null));
        } catch (Exception e) {
            log.error("프로젝트 파일 목록 조회 실패 - 서버 오류: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new RsData<>("500-1", "파일 목록 조회 중 오류가 발생했습니다.", null));
        }
    }

    /**
     * 파일 상세 정보 조회
     */
    @GetMapping("/{fileId}")
    public ResponseEntity<ProjectFile> getProjectFile(
            @PathVariable Long projectId,
            @PathVariable Long fileId) {

        log.info("파일 상세 조회 요청 - projectId: {}, fileId: {}", projectId, fileId);

        try {
            ProjectFile file = fileService.getProjectFile(fileId);
            return ResponseEntity.ok(file);
        } catch (IllegalArgumentException e) {
            log.error("파일 조회 실패 - {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 파일 다운로드
     */
    @GetMapping("/{fileId}/download")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long projectId,
            @PathVariable Long fileId) {

        log.info("파일 다운로드 요청 - projectId: {}, fileId: {}", projectId, fileId);

        try {
            ProjectFile projectFile = fileService.getProjectFile(fileId);
            Resource resource = fileService.getFileAsResource(fileId);

            // 데이터베이스에 저장된 파일의 경우 저장된 contentType 사용
            String contentType = (projectFile.getStorageType() == ProjectFile.StorageType.DATABASE &&
                    projectFile.getContentType() != null)
                    ? projectFile.getContentType()
                    : determineContentType(projectFile.getFileType());

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + projectFile.getOriginalName() + "\"")
                    .body(resource);

        } catch (RuntimeException e) {
            log.error("파일 다운로드 실패 - {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 파일 브라우저에서 보기 (인라인 표시)
     */
    @GetMapping("/{fileId}/view")
    public ResponseEntity<Resource> viewFile(
            @PathVariable Long projectId,
            @PathVariable Long fileId) {

        log.info("파일 브라우저 뷰 요청 - projectId: {}, fileId: {}", projectId, fileId);

        try {
            ProjectFile projectFile = fileService.getProjectFile(fileId);
            Resource resource = fileService.getFileAsResource(fileId);

            // 데이터베이스에 저장된 파일의 경우 저장된 contentType 사용
            String contentType = (projectFile.getStorageType() == ProjectFile.StorageType.DATABASE &&
                    projectFile.getContentType() != null)
                    ? projectFile.getContentType()
                    : determineContentType(projectFile.getFileType());

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + projectFile.getOriginalName() + "\"")
                    .body(resource);

        } catch (RuntimeException e) {
            log.error("파일 브라우저 뷰 실패 - {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 파일 업로드 (단일)
     */
    @PostMapping("/upload")
    public ResponseEntity<RsData<ProjectFile>> uploadFile(
            @PathVariable Long projectId,
            @RequestParam("file") MultipartFile file) {

        log.info("파일 업로드 요청 - projectId: {}, fileName: {}, size: {}bytes",
                projectId, file.getOriginalFilename(), file.getSize());

        try {
            validateFile(file);
            ProjectFile uploadedFile = fileService.uploadFile(projectId, file);
            return ResponseEntity.ok(new RsData<>("200-1", "파일이 성공적으로 업로드되었습니다.", uploadedFile));
        } catch (IllegalArgumentException e) {
            log.error("파일 업로드 실패 - 입력값 오류: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new RsData<>("400-1", "파일 업로드 실패: " + e.getMessage()));
        } catch (Exception e) {
            log.error("파일 업로드 실패 - {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(new RsData<>("500-1", "파일 업로드 중 오류가 발생했습니다."));
        }
    }

    /**
     * 파일 업로드 (다중)
     */
    @PostMapping("/upload/batch")
    public ResponseEntity<RsData<List<ProjectFile>>> uploadFiles(
            @PathVariable Long projectId,
            @RequestParam("files") List<MultipartFile> files) {

        log.info("파일 일괄 업로드 요청 - projectId: {}, fileCount: {}", projectId, files.size());

        try {
            validateFiles(files);
            List<ProjectFile> uploadedFiles = fileService.uploadFiles(projectId, files);
            return ResponseEntity.ok(new RsData<>("200-1", "파일들이 성공적으로 업로드되었습니다.", uploadedFiles));
        } catch (IllegalArgumentException e) {
            log.error("파일 일괄 업로드 실패 - 입력값 오류: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new RsData<>("400-1", "파일 업로드 실패: " + e.getMessage()));
        } catch (Exception e) {
            log.error("파일 일괄 업로드 실패 - {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(new RsData<>("500-1", "파일 업로드 중 오류가 발생했습니다."));
        }
    }

    /**
     * 파일 삭제
     */
    @DeleteMapping("/{fileId}")
    public ResponseEntity<RsData<Void>> deleteFile(
            @PathVariable Long projectId,
            @PathVariable Long fileId) {

        log.info("파일 삭제 요청 - projectId: {}, fileId: {}", projectId, fileId);

        try {
            fileService.deleteFile(fileId);
            return ResponseEntity.ok(new RsData<>("200-1", "파일이 성공적으로 삭제되었습니다."));
        } catch (IllegalArgumentException e) {
            log.error("파일 삭제 실패 - 입력값 오류: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new RsData<>("400-1", "파일 삭제 실패: " + e.getMessage()));
        } catch (Exception e) {
            log.error("파일 삭제 실패 - {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(new RsData<>("500-1", "파일 삭제 중 오류가 발생했습니다."));
        }
    }

    // ===== Private 유틸리티 메서드들 =====

    /**
     * 파일 확장자로부터 올바른 MIME 타입 결정
     */
    private String determineContentType(String fileType) {
        if (fileType == null || fileType.trim().isEmpty()) {
            return "application/octet-stream";
        }

        // 파일 확장자를 소문자로 변환
        String extension = fileType.toLowerCase().trim();

        // 확장자별 MIME 타입 매핑
        return switch (extension) {
            case "pdf" -> "application/pdf";
            case "doc" -> "application/msword";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "xls" -> "application/vnd.ms-excel";
            case "xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "ppt" -> "application/vnd.ms-powerpoint";
            case "pptx" -> "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case "txt" -> "text/plain";
            case "md" -> "text/markdown";
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            case "bmp" -> "image/bmp";
            case "svg" -> "image/svg+xml";
            case "zip" -> "application/zip";
            case "rar" -> "application/x-rar-compressed";
            case "7z" -> "application/x-7z-compressed";
            case "mp4" -> "video/mp4";
            case "avi" -> "video/x-msvideo";
            case "mov" -> "video/quicktime";
            case "mp3" -> "audio/mpeg";
            case "wav" -> "audio/wav";
            case "flac" -> "audio/flac";
            case "html", "htm" -> "text/html";
            case "css" -> "text/css";
            case "js" -> "application/javascript";
            case "json" -> "application/json";
            case "xml" -> "application/xml";
            case "csv" -> "text/csv";
            default -> "application/octet-stream";
        };
    }

    /**
     * 단일 파일 검증
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }
        if (file.getOriginalFilename() == null || file.getOriginalFilename().trim().isEmpty()) {
            throw new IllegalArgumentException("파일명이 유효하지 않습니다.");
        }
    }

    /**
     * 다중 파일 검증
     */
    private void validateFiles(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }
        for (MultipartFile file : files) {
            validateFile(file);
        }
    }
}