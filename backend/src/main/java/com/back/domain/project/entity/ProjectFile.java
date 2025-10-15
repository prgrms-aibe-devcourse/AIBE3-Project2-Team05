package com.back.domain.project.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_files")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnore
    private Project project;

    @Column(name = "original_name", nullable = false, length = 255)
    private String originalName;

    @Column(name = "stored_name", nullable = false, length = 255)
    private String storedName;

    // 기존 파일 경로는 호환성을 위해 유지하되, 선택적으로 만듦
    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "file_type", nullable = false, length = 100)
    private String fileType;

    @Column(name = "upload_date", nullable = false)
    private LocalDateTime uploadDate;

    // 파일 바이너리 데이터를 데이터베이스에 저장
    @JsonIgnore
    @Lob
    @Column(name = "file_data", columnDefinition = "LONGBLOB")
    private byte[] fileData;

    // MIME 타입 저장
    @Column(name = "content_type", length = 100)
    private String contentType;

    // 파일 저장 방식 (FILE_SYSTEM, DATABASE)
    @Enumerated(EnumType.STRING)
    @Column(name = "storage_type", nullable = true, length = 20)
    private StorageType storageType;

    // 기본 생성자 (파일 시스템 저장용 - 기존 호환성)
    public ProjectFile(Project project, String originalName, String storedName,
                      String filePath, Long fileSize, String fileType) {
        this.project = project;
        this.originalName = originalName;
        this.storedName = storedName;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.fileType = fileType;
        this.uploadDate = LocalDateTime.now();
        this.storageType = StorageType.FILE_SYSTEM;
    }

    // 데이터베이스 저장용 생성자
    public ProjectFile(Project project, String originalName, String storedName,
                      Long fileSize, String fileType, String contentType, byte[] fileData) {
        this.project = project;
        this.originalName = originalName;
        this.storedName = storedName;
        this.filePath = "DATABASE_STORED"; // 데이터베이스 저장을 나타내는 더미 값
        this.fileSize = fileSize;
        this.fileType = fileType;
        this.contentType = contentType;
        this.fileData = fileData;
        this.uploadDate = LocalDateTime.now();
        this.storageType = StorageType.DATABASE;
    }

    @PrePersist
    protected void onCreate() {
        if (uploadDate == null) {
            uploadDate = LocalDateTime.now();
        }
        if (storageType == null) {
            storageType = StorageType.DATABASE;
        }
    }

    // 저장 방식 열거형
    public enum StorageType {
        FILE_SYSTEM,    // 파일 시스템 저장
        DATABASE        // 데이터베이스 저장
    }
}