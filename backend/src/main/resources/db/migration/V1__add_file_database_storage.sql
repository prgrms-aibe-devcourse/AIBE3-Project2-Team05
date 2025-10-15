-- 프로젝트 파일 테이블에 데이터베이스 저장 기능 추가
ALTER TABLE project_files
ADD COLUMN file_data LONGBLOB COMMENT '파일 바이너리 데이터',
ADD COLUMN content_type VARCHAR(100) COMMENT 'MIME 타입',
ADD COLUMN storage_type VARCHAR(20) NOT NULL DEFAULT 'DATABASE' COMMENT '저장 방식 (FILE_SYSTEM, DATABASE)';

-- 기존 데이터의 storage_type을 FILE_SYSTEM으로 설정
UPDATE project_files
SET storage_type = 'FILE_SYSTEM'
WHERE file_path IS NOT NULL AND file_path != '';

-- file_path 컬럼을 nullable로 변경 (데이터베이스 저장시에는 불필요)
ALTER TABLE project_files
MODIFY COLUMN file_path VARCHAR(500) NULL COMMENT '파일 경로 (파일시스템 저장시에만 사용)';

-- 인덱스 추가 (성능 최적화)
CREATE INDEX idx_project_files_storage_type ON project_files (storage_type);
CREATE INDEX idx_project_files_content_type ON project_files (content_type);
