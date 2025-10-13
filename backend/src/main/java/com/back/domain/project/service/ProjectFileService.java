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
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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
     * 파일 다운로드를 위한 Resource 조회
     */
    @Transactional(readOnly = true)
    public Resource getFileAsResource(Long fileId) {
        log.debug("파일 리소스 조회 - fileId: {}", fileId);

        ProjectFile projectFile = getProjectFile(fileId);

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
     * 파일 업로드
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
        fileValidator.validateFile(file, MAX_FILE_SIZE, allowedExtensionsStr);

        try {
            // 파일 저장
            String storedFileName = generateStoredFileName(file.getOriginalFilename());
            Path uploadPath = Paths.get(uploadDir);

            // 업로드 디렉토리 생성
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(storedFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 파일 정보 저장
            ProjectFile projectFile = ProjectFile.builder()
                    .project(project)  // Project 엔티티 설정
                    .originalName(file.getOriginalFilename())
                    .storedName(storedFileName)
                    .filePath(filePath.toString())
                    .fileSize(file.getSize())
                    .fileType(getFileExtension(file.getOriginalFilename()))
                    .uploadDate(LocalDateTime.now())
                    .build();

            ProjectFile savedFile = projectFileRepository.save(projectFile);
            log.info("파일 업로드 완료 - projectId: {}, fileId: {}, fileName: {}",
                    projectId, savedFile.getId(), savedFile.getOriginalName());

            return savedFile;

        } catch (IOException e) {
            log.error("파일 저장 중 오류 발생 - projectId: {}, fileName: {}", projectId, file.getOriginalFilename(), e);
            throw new FileUploadException("파일 저장에 실패했습니다: " + e.getMessage());
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
     * 파일 삭제
     */
    @Transactional
    public void deleteFile(Long fileId) {
        log.info("파일 삭제 - fileId: {}", fileId);

        ProjectFile projectFile = getProjectFile(fileId);

        try {
            // 실제 파일 삭제
            deleteFileFromStorage(projectFile.getFilePath());

            // DB에서 삭제
            projectFileRepository.deleteById(fileId);

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
