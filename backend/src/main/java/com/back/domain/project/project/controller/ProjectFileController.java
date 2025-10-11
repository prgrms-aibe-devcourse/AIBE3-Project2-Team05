package com.back.domain.project.project.controller;

import com.back.domain.project.project.entity.ProjectFile;
import com.back.domain.project.project.service.ProjectFileService;
import com.back.global.RsData.RsData;
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
    public ResponseEntity<List<ProjectFile>> getProjectFiles(@PathVariable Long projectId) {
        log.info("프로젝트 파일 목록 조회 요청 - projectId: {}", projectId);

        try {
            List<ProjectFile> files = fileService.getProjectFiles(projectId);
            return ResponseEntity.ok(files);
        } catch (IllegalArgumentException e) {
            log.error("프로젝트 파일 목록 조회 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest().build();
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

            String contentType = determineContentType(projectFile.getFileType());

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

            String contentType = determineContentType(projectFile.getFileType());

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
            return ResponseEntity.ok(RsData.success("파일이 성공적으로 업로드되었습니다.", uploadedFile));
        } catch (IllegalArgumentException e) {
            log.error("파일 업로드 실패 - 입력값 오류: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(RsData.error("파일 업로드 실패", e.getMessage()));
        } catch (Exception e) {
            log.error("파일 업로드 실패 - {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(RsData.error("파일 업로드 중 오류가 발생했습니다.", "UPLOAD_ERROR"));
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
            return ResponseEntity.ok(RsData.success("파일들이 성공적으로 업로드되었습니다.", uploadedFiles));
        } catch (IllegalArgumentException e) {
            log.error("파일 일괄 업로드 실패 - 입력값 오류: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(RsData.error("파일 업로드 실패", e.getMessage()));
        } catch (Exception e) {
            log.error("파일 일괄 업로드 실패 - {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(RsData.error("파일 업로드 중 오류가 발생했습니다.", "UPLOAD_ERROR"));
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
            return ResponseEntity.ok(RsData.success("파일이 성공적으로 삭제되었습니다.", null));
        } catch (IllegalArgumentException e) {
            log.error("파일 삭제 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(RsData.error("파일 삭제 실패", e.getMessage()));
        } catch (RuntimeException e) {
            log.error("파일 삭제 실패 - {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(RsData.error("파일 삭제 중 오류가 발생했습니다.", "DELETE_ERROR"));
        }
    }

    // ===== Private 유틸리티 메서드들 =====

    /**
     * Content-Type 결정
     */
    private String determineContentType(String fileType) {
        return fileType != null ? fileType : "application/octet-stream";
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