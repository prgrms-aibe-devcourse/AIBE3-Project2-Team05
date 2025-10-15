-- 빠른 테스트용 데이터 삽입
-- MySQL에 직접 복사/붙여넣기 하세요

USE project_management;

-- 외래 키 제약 조건 해제
SET FOREIGN_KEY_CHECKS = 0;

-- 기존 테스트 데이터 삭제
DELETE FROM project WHERE id BETWEEN 1 AND 15;
DELETE FROM member WHERE id BETWEEN 1 AND 10;

-- 외래 키 제약 조건 활성화
SET FOREIGN_KEY_CHECKS = 1;

-- PM 계정 2개 (비밀번호: 12341234)
INSERT INTO member (id, create_date, modify_date, email, nickname, password, username, role) VALUES
(4, NOW(), NOW(), 'client1@test.com', 'PM 홍길동', '$2a$10$N9qo8uLOickgx2ZMRZoMye1QZUE7/8/HvBZqKM8UjKGkMvVE4NFO2', 'client1', 'PM'),
(5, NOW(), NOW(), 'client2@test.com', 'PM 김철수', '$2a$10$N9qo8uLOickgx2ZMRZoMye1QZUE7/8/HvBZqKM8UjKGkMvVE4NFO2', 'client2', 'PM');

-- 프로젝트 12개
INSERT INTO project (id, create_date, modify_date, manager_id, title, description, project_field, budget, start_date, end_date, status, view_count, applicant_count) VALUES
-- client1의 프로젝트 7개
(1, NOW(), NOW(), 4, 'E커머스 플랫폼 개발', '쇼핑몰 풀스택 개발 프로젝트입니다. React + Spring Boot 스택 사용.', 'WEB', 15000000.00, '2025-11-01', '2026-01-31', 'RECRUITING', 45, 3),
(2, NOW(), NOW(), 4, '사내 인사관리 시스템', 'Spring Boot 기반 사내 인사관리 시스템 개발.', 'BACKEND', 20000000.00, '2025-10-20', '2026-03-20', 'RECRUITING', 28, 2),
(3, NOW(), NOW(), 4, '실시간 채팅 앱', 'WebSocket 기반 실시간 채팅 애플리케이션.', 'MOBILE', 10000000.00, '2025-11-05', '2026-01-05', 'IN_PROGRESS', 52, 5),
(4, NOW(), NOW(), 4, '온라인 교육 플랫폼', 'Zoom/WebRTC 통합 온라인 강의 플랫폼.', 'WEB', 25000000.00, '2025-10-15', '2026-04-15', 'RECRUITING', 67, 8),
(5, NOW(), NOW(), 4, 'IoT 센서 데이터 수집 시스템', 'AWS IoT Core 활용 센서 데이터 수집 및 시각화.', 'IOT', 18000000.00, '2025-12-01', '2026-05-01', 'RECRUITING', 15, 1),
(6, NOW(), NOW(), 4, 'CRM 시스템 고도화', '기존 CRM 시스템 기능 추가 및 UI/UX 개선.', 'WEB', 8000000.00, '2025-09-01', '2025-12-31', 'COMPLETED', 89, 12),
(7, NOW(), NOW(), 4, '블록체인 기반 NFT 마켓플레이스', 'Ethereum 기반 NFT 거래 플랫폼.', 'BLOCKCHAIN', 30000000.00, '2025-11-20', '2026-06-20', 'RECRUITING', 102, 15),
-- client2의 프로젝트 5개
(8, NOW(), NOW(), 5, '모바일 앱 백엔드 API 구축', 'Spring Boot로 RESTful API 개발.', 'BACKEND', 12000000.00, '2025-11-15', '2026-02-15', 'RECRUITING', 32, 4),
(9, NOW(), NOW(), 5, '금융 데이터 분석 대시보드', 'Python + Django 기반 실시간 금융 데이터 시각화.', 'DATA', 22000000.00, '2025-10-25', '2026-03-25', 'IN_PROGRESS', 41, 6),
(10, NOW(), NOW(), 5, 'AI 챗봇 서비스', 'OpenAI API 통합 고객 상담 챗봇.', 'AI', 16000000.00, '2025-11-10', '2026-02-10', 'RECRUITING', 58, 7),
(11, NOW(), NOW(), 5, '소셜미디어 통합 관리 도구', 'Instagram, Facebook, Twitter API 통합.', 'WEB', 14000000.00, '2025-08-01', '2025-11-30', 'SUSPENDED', 23, 3),
(12, NOW(), NOW(), 5, '헬스케어 모바일 앱', 'React Native 기반 건강 관리 앱.', 'MOBILE', 19000000.00, '2025-12-01', '2026-05-01', 'RECRUITING', 38, 5);

-- 확인
SELECT COUNT(*) as member_count FROM member WHERE id IN (4, 5);
SELECT COUNT(*) as project_count FROM project WHERE id BETWEEN 1 AND 12;
SELECT m.username, m.nickname, COUNT(p.id) as project_count
FROM member m
LEFT JOIN project p ON m.id = p.manager_id
WHERE m.id IN (4, 5)
GROUP BY m.id, m.username, m.nickname;
