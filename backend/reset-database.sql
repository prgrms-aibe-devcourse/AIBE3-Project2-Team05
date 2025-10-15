-- 데이터베이스 초기화 스크립트
-- 모든 데이터를 삭제하고 BaseInitData가 재실행되도록 함

-- 외래 키 제약 조건 해제
SET FOREIGN_KEY_CHECKS = 0;

-- 모든 테이블 데이터 삭제
TRUNCATE TABLE project_submissions;
TRUNCATE TABLE submission_status_history;
TRUNCATE TABLE proposal;
TRUNCATE TABLE message;
TRUNCATE TABLE match_score;
TRUNCATE TABLE freelancer_tech;
TRUNCATE TABLE freelancer;
TRUNCATE TABLE career;
TRUNCATE TABLE portfolio;
TRUNCATE TABLE project_tech;
TRUNCATE TABLE project_file;
TRUNCATE TABLE project_favorite;
TRUNCATE TABLE project;
TRUNCATE TABLE tech;
TRUNCATE TABLE notification;
TRUNCATE TABLE member;

-- 외래 키 제약 조건 활성화
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Database reset completed. Restart the application to regenerate initial data.' AS Status;
