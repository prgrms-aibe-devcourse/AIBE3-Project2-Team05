package com.back.domain.project.project.controller;

import com.back.domain.project.project.entity.ProjectFile;
import com.back.domain.project.project.service.ProjectFileService;
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

        List<ProjectFile> files = fileService.getProjectFiles(projectId);
        return ResponseEntity.ok(files);
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
        } catch (Exception e) {
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

            String contentType = projectFile.getFileType();
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

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
     * 파일 업로드 (단일)
     */
    @PostMapping("/upload")
    public ResponseEntity<ProjectFile> uploadFile(
            @PathVariable Long projectId,
            @RequestParam("file") MultipartFile file) {

        log.info("파일 업로드 요청 - projectId: {}, fileName: {}, size: {}bytes",
                projectId, file.getOriginalFilename(), file.getSize());

        try {
            ProjectFile uploadedFile = fileService.uploadFile(projectId, file);
            return ResponseEntity.ok(uploadedFile);
        } catch (Exception e) {
            log.error("파일 업로드 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 파일 업로드 (다중)
     */
    @PostMapping("/upload/batch")
    public ResponseEntity<List<ProjectFile>> uploadFiles(
            @PathVariable Long projectId,
            @RequestParam("files") List<MultipartFile> files) {

        log.info("파일 일괄 업로드 요청 - projectId: {}, fileCount: {}", projectId, files.size());

        try {
            List<ProjectFile> uploadedFiles = fileService.uploadFiles(projectId, files);
            return ResponseEntity.ok(uploadedFiles);
        } catch (Exception e) {
            log.error("파일 일괄 업로드 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 파일명 변경
     */
    @PatchMapping("/{fileId}/name")
    public ResponseEntity<ProjectFile> updateFileName(
            @PathVariable Long projectId,
            @PathVariable Long fileId,
            @RequestParam String newOriginalName) {

        log.info("파일명 변경 요청 - projectId: {}, fileId: {}, newName: {}",
                projectId, fileId, newOriginalName);

        try {
            ProjectFile updatedFile = fileService.updateFileName(fileId, newOriginalName);
            return ResponseEntity.ok(updatedFile);
        } catch (Exception e) {
            log.error("파일명 변경 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 파일 삭제
     */
    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> deleteFile(
            @PathVariable Long projectId,
            @PathVariable Long fileId) {

        log.info("파일 삭제 요청 - projectId: {}, fileId: {}", projectId, fileId);

        try {
            fileService.deleteFile(fileId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("파일 삭제 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 프로젝트의 모든 파일 삭제
     */
    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAllProjectFiles(@PathVariable Long projectId) {
        log.info("프로젝트 파일 전체 삭제 요청 - projectId: {}", projectId);

        fileService.deleteAllProjectFiles(projectId);
        return ResponseEntity.ok().build();
    }

    /**
     * 프로젝트 파일 총 크기 조회
     */
    @GetMapping("/size")
    public ResponseEntity<Long> getProjectFilesTotalSize(@PathVariable Long projectId) {
        log.info("프로젝트 파일 총 크기 조회 요청 - projectId: {}", projectId);

        long totalSize = fileService.getProjectFilesTotalSize(projectId);
        return ResponseEntity.ok(totalSize);
    }

    /**
     * 파일 중복 검사
     */
    @GetMapping("/check-duplicate")
    public ResponseEntity<Boolean> checkDuplicate(
            @PathVariable Long projectId,
            @RequestParam String originalName) {

        log.info("파일 중복 검사 요청 - projectId: {}, originalName: {}", projectId, originalName);

        boolean isDuplicate = fileService.isDuplicateFile(projectId, originalName);
        return ResponseEntity.ok(isDuplicate);
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

            String contentType = projectFile.getFileType();
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            // Content-Disposition을 inline으로 설정하여 브라우저에서 직접 표시
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
}