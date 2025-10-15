package com.back.domain.project.service;

import com.back.domain.project.entity.Project;
import com.back.domain.project.entity.ProjectFile;
import com.back.domain.project.repository.ProjectFileRepository;
import com.back.domain.project.repository.ProjectRepository;
import com.back.domain.project.validator.FileValidator;
import com.back.global.exception.FileUploadException;
import com.back.global.exception.ProjectNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectFileService {

    private final ProjectFileRepository projectFileRepository;
    private final ProjectRepository projectRepository;
    private final FileValidator fileValidator;

    @Value("${project.file.upload-dir:uploads/projects}")
    private String uploadDir;

    @Value("${project.file.allowed-extensions:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,md,zip,rar,jpg,jpeg,png,gif}")
    private String allowedExtensionsStr;

    @Value("${project.file.storage-type:DATABASE}")
    private String storageType;

    // 파일당 최대 크기 (50MB)
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024L;

    /**
     * 프로젝트의 파일 목록 조회
     */
    public List<ProjectFile> getProjectFiles(Long projectId) {
        log.debug("프로젝트 파일 목록 조회 - projectId: {}", projectId);
        return projectFileRepository.findByProject_IdOrderByUploadDateDesc(projectId);
    }

    /**
     * 프로젝트 파일 정보 저장 (이미 업로드된 파일 정보를 DB에 저장)
     */
    @Transactional
    public ProjectFile saveProjectFile(ProjectFile projectFile) {
        log.debug("프로젝트 파일 정보 저장 - projectId: {}, fileName: {}",
                projectFile.getProject().getId(), projectFile.getOriginalName());

        return projectFileRepository.save(projectFile);
    }

    /**
     * 파일 상세 정보 조회
     */
    @Transactional(readOnly = true)
    public ProjectFile getProjectFile(Long fileId) {
        log.debug("파일 상세 조회 - fileId: {}", fileId);
        return projectFileRepository.findById(fileId)
                .orElseThrow(() -> new FileUploadException("파일을 찾을 수 없습니다: " + fileId, "FILE_NOT_FOUND"));
    }

    /**
     * 파일 다운로드를 위한 Resource 조회 (데이터베이스 및 파일 시스템 지원)
     */
    @Transactional(readOnly = true)
    public Resource getFileAsResource(Long fileId) {
        log.debug("파일 리소스 조회 - fileId: {}", fileId);

        ProjectFile projectFile = getProjectFile(fileId);

        // 데이터베이스에 저장된 파일인 경우
        if (projectFile.getStorageType() == ProjectFile.StorageType.DATABASE) {
            if (projectFile.getFileData() != null) {
                return new ByteArrayResource(projectFile.getFileData());
            } else {
                throw new FileUploadException("데이터베이스에서 파일 데이터를 찾을 수 없습니다: " + projectFile.getOriginalName(), "FILE_DATA_NOT_FOUND");
            }
        }

        // 파일 시스템에 저장된 파일인 경우 (기존 호환성)
        try {
            Path filePath = Paths.get(projectFile.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new FileUploadException("파일을 읽을 수 없습니다: " + projectFile.getOriginalName(), "FILE_READ_ERROR");
            }
        } catch (MalformedURLException e) {
            log.error("파일 리소스 조회 실패 - fileId: {}", fileId, e);
            throw new FileUploadException("파일 경로가 올바르지 않습니다: " + e.getMessage(), "INVALID_FILE_PATH");
        }
    }

    /**
     * 파일 업로드 (데이터베이스 저장)
     */
    @Transactional
    public ProjectFile uploadFile(Long projectId, MultipartFile file) {
        log.info("파일 업로드 시작 - projectId: {}, fileName: {}", projectId, file.getOriginalFilename());

        // 프로젝트 존재 여부 확인 및 Project 엔티티 조회
        if (!projectRepository.existsById(projectId)) {
            throw new ProjectNotFoundException(projectId);
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        // 파일 검증
        fileValidator.validateFile(file, allowedExtensionsStr);

        try {
            // 파일 바이너리 데이터 읽기
            byte[] fileData = file.getBytes();

            // 파일 저장명 생성
            String storedFileName = generateStoredFileName(file.getOriginalFilename());

            // MIME 타입 결정
            String contentType = determineContentType(file);

            // 데이터베이스에 파일 정보 및 바이너리 데이터 저장
            ProjectFile projectFile = new ProjectFile(
                    project,
                    file.getOriginalFilename(),
                    storedFileName,
                    file.getSize(),
                    getFileExtension(file.getOriginalFilename()),
                    contentType,
                    fileData
            );

            ProjectFile savedFile = projectFileRepository.save(projectFile);
            log.info("파일 업로드 완료 (데이터베이스) - projectId: {}, fileId: {}, fileName: {}, size: {}bytes",
                    projectId, savedFile.getId(), savedFile.getOriginalName(), savedFile.getFileSize());

            return savedFile;

        } catch (IOException e) {
            log.error("파일 데이터 읽기 중 오류 발생 - projectId: {}, fileName: {}", projectId, file.getOriginalFilename(), e);
            throw new FileUploadException("파일 데이터 읽기에 실패했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * 여러 파일 업로드
     */
    @Transactional
    public List<ProjectFile> uploadFiles(Long projectId, List<MultipartFile> files) {
        log.info("파일 일괄 업로드 - projectId: {}, fileCount: {}", projectId, files.size());

        // 여러 파일 검증 (FileValidator 사용)
        fileValidator.validateFiles(files, allowedExtensionsStr);

        // 전체 파일 크기 검증
        long totalSize = files.stream().mapToLong(MultipartFile::getSize).sum();
        long currentTotalSize = getProjectFilesTotalSize(projectId);
        fileValidator.validateProjectFileSize(currentTotalSize, totalSize);

        return files.stream()
                .map(file -> uploadFile(projectId, file))
                .toList();
    }

    /**
     * 파일 삭제 (데이터베이스 및 파일 시스템 지원)
     */
    @Transactional
    public void deleteFile(Long fileId) {
        log.info("파일 삭제 - fileId: {}", fileId);

        ProjectFile projectFile = getProjectFile(fileId);

        try {
            // 파일 시스템에 저장된 파일인 경우 실제 파일도 삭제
            if (projectFile.getStorageType() == ProjectFile.StorageType.FILE_SYSTEM
                && projectFile.getFilePath() != null) {
                deleteFileFromStorage(projectFile.getFilePath());
            }

            // DB에서 삭제 (데이터베이스 저장 파일의 경우 바이너리 데이터도 함께 삭제됨)
            projectFileRepository.deleteById(fileId);

            log.info("파일 삭제 완료 - fileId: {}, storageType: {}", fileId, projectFile.getStorageType());

        } catch (IOException e) {
            log.error("파일 삭제 실패 - fileId: {}", fileId, e);
            throw new FileUploadException("파일 삭제에 실패했습니다: " + e.getMessage(), "FILE_DELETE_ERROR");
        }
    }

    /**
     * 여러 파일 삭제 (ID 목록으로)
     */
    @Transactional
    public void deleteFiles(List<Long> fileIds) {
        log.info("파일 일괄 삭제 - fileIds: {}", fileIds);

        if (fileIds == null || fileIds.isEmpty()) {
            return;
        }

        for (Long fileId : fileIds) {
            try {
                deleteFile(fileId);
            } catch (Exception e) {
                log.warn("파일 삭제 실패 - fileId: {}, 계속 진행", fileId, e);
            }
        }
    }

    /**
     * 파일을 프로젝트에 연결 (이미 업로드된 파일들을 특정 프로젝트와 연결)
     */
    @Transactional
    public void attachFilesToProject(Long projectId, List<Long> fileIds) {
        log.info("파일을 프로젝트에 연결 - projectId: {}, fileIds: {}", projectId, fileIds);

        if (fileIds == null || fileIds.isEmpty()) {
            return;
        }

        // 프로젝트 존재 확인 및 Project 엔티티 조회
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        for (Long fileId : fileIds) {
            ProjectFile file = projectFileRepository.findById(fileId)
                    .orElseThrow(() -> new FileUploadException("파일을 찾을 수 없습니다: " + fileId, "FILE_NOT_FOUND"));

            file.setProject(project);  // Project 엔티티 설정
            projectFileRepository.save(file);
        }
    }

    /**
     * 프로젝트의 총 파일 크기 조회
     */
    @Transactional(readOnly = true)
    public long getProjectFilesTotalSize(Long projectId) {
        log.debug("프로젝트 총 파일 크기 조회 - projectId: {}", projectId);

        Long totalSize = projectFileRepository.getTotalFileSizeByProjectId(projectId);
        return totalSize != null ? totalSize : 0L;
    }

    /**
     * MIME 타입 결정
     */
    private String determineContentType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType != null && !contentType.isEmpty()) {
            return contentType;
        }

        // 파일 확장자로부터 MIME 타입 추론
        String extension = getFileExtension(file.getOriginalFilename()).toLowerCase();
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
            case "zip" -> "application/zip";
            case "rar" -> "application/x-rar-compressed";
            default -> "application/octet-stream";
        };
    }

    private String generateStoredFileName(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        return timestamp + "_" + uuid + "." + extension;
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    private String saveFileToStorage(MultipartFile file, Long projectId, String storedFileName) throws IOException {
        // 프로젝트별 디렉토리 생성
        Path projectDir = Paths.get(uploadDir, "project_" + projectId);
        if (!Files.exists(projectDir)) {
            Files.createDirectories(projectDir);
        }

        // 파일 저장
        Path targetPath = projectDir.resolve(storedFileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return targetPath.toString();
    }

    private void deleteFileFromStorage(String filePath) throws IOException {
        Path path = Paths.get(filePath);
        if (Files.exists(path)) {
            Files.delete(path);
        }
    }
}
