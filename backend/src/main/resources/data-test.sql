-- 테스트 데이터 생성 스크립트
-- 매칭 시스템 테스트용

-- ⚠️ 경고: 기존 테스트 데이터를 삭제하고 새로 생성합니다!
-- 외래 키 제약 조건 해제
SET FOREIGN_KEY_CHECKS = 0;

-- 기존 테스트 데이터 삭제 (id 1~20)
DELETE FROM project_tech WHERE id BETWEEN 1 AND 30;
DELETE FROM career WHERE id BETWEEN 1 AND 10;
DELETE FROM portfolio WHERE id BETWEEN 1 AND 10;
DELETE FROM freelancer_tech WHERE id BETWEEN 1 AND 20;
DELETE FROM freelancer WHERE id BETWEEN 1 AND 5;
DELETE FROM project WHERE id BETWEEN 1 AND 15;
DELETE FROM tech WHERE id BETWEEN 1 AND 15;
DELETE FROM member WHERE id BETWEEN 1 AND 10;

-- 외래 키 제약 조건 활성화
SET FOREIGN_KEY_CHECKS = 1;

-- 1. 회원 데이터 (프리랜서 3명, 클라이언트 2명)
-- 비밀번호: 12341234 (BCrypt 인코딩)
INSERT INTO member (id, create_date, modify_date, email, nickname, password, username) VALUES
(1, NOW(), NOW(), 'freelancer1@test.com', '김개발', '$2a$10$N9qo8uLOickgx2ZMRZoMye1QZUE7/8/HvBZqKM8UjKGkMvVE4NFO2', 'freelancer1'),
(2, NOW(), NOW(), 'freelancer2@test.com', '이디자인', '$2a$10$N9qo8uLOickgx2ZMRZoMye1QZUE7/8/HvBZqKM8UjKGkMvVE4NFO2', 'freelancer2'),
(3, NOW(), NOW(), 'freelancer3@test.com', '박풀스택', '$2a$10$N9qo8uLOickgx2ZMRZoMye1QZUE7/8/HvBZqKM8UjKGkMvVE4NFO2', 'freelancer3'),
(4, NOW(), NOW(), 'client1@test.com', '스타트업대표', '$2a$10$N9qo8uLOickgx2ZMRZoMye1QZUE7/8/HvBZqKM8UjKGkMvVE4NFO2', 'client1'),
(5, NOW(), NOW(), 'client2@test.com', '기업PM', '$2a$10$N9qo8uLOickgx2ZMRZoMye1QZUE7/8/HvBZqKM8UjKGkMvVE4NFO2', 'client2');

-- 2. 기술 마스터 데이터
INSERT INTO tech (id, create_date, modify_date, tech_category, tech_name) VALUES
(1, NOW(), NOW(), 'Frontend', 'React'),
(2, NOW(), NOW(), 'Frontend', 'Vue.js'),
(3, NOW(), NOW(), 'Frontend', 'TypeScript'),
(4, NOW(), NOW(), 'Backend', 'Spring Boot'),
(5, NOW(), NOW(), 'Backend', 'Node.js'),
(6, NOW(), NOW(), 'Backend', 'Java'),
(7, NOW(), NOW(), 'Database', 'MySQL'),
(8, NOW(), NOW(), 'Database', 'PostgreSQL'),
(9, NOW(), NOW(), 'DevOps', 'Docker'),
(10, NOW(), NOW(), 'DevOps', 'AWS');

-- 3. 프리랜서 프로필
INSERT INTO freelancer (id, create_date, modify_date, member_id, name, profile_img_url, content, experience_years, available, min_monthly_rate, max_monthly_rate, rating_avg, reviews_count, freelancer_type) VALUES
(1, NOW(), NOW(), 1, '김개발', 'https://via.placeholder.com/150', '5년차 풀스택 개발자입니다. Spring Boot와 React를 주로 사용합니다.', 5, true, 5000000, 7000000, 4.8, 12, 'FULLSTACK'),
(2, NOW(), NOW(), 2, '이디자인', 'https://via.placeholder.com/150', '프론트엔드 전문 개발자. Vue.js와 React 경험 풍부.', 3, true, 4000000, 5500000, 4.5, 8, 'FRONTEND'),
(3, NOW(), NOW(), 3, '박풀스택', 'https://via.placeholder.com/150', '백엔드부터 인프라까지 전문. Java, Spring, AWS 경험 7년.', 7, true, 6000000, 9000000, 4.9, 20, 'FULLSTACK');

-- 4. 프리랜서 기술 스택
INSERT INTO freelancer_tech (id, create_date, modify_date, freelancer_id, tech_id, tech_name, tech_level, experience_years) VALUES
-- 김개발 (풀스택)
(1, NOW(), NOW(), 1, 1, 'React', 'ADVANCED', 4),
(2, NOW(), NOW(), 1, 3, 'TypeScript', 'ADVANCED', 3),
(3, NOW(), NOW(), 1, 4, 'Spring Boot', 'EXPERT', 5),
(4, NOW(), NOW(), 1, 6, 'Java', 'EXPERT', 5),
(5, NOW(), NOW(), 1, 7, 'MySQL', 'ADVANCED', 4),
(6, NOW(), NOW(), 1, 9, 'Docker', 'INTERMEDIATE', 2),
-- 이디자인 (프론트엔드)
(7, NOW(), NOW(), 2, 1, 'React', 'EXPERT', 3),
(8, NOW(), NOW(), 2, 2, 'Vue.js', 'ADVANCED', 2),
(9, NOW(), NOW(), 2, 3, 'TypeScript', 'ADVANCED', 3),
-- 박풀스택 (풀스택+인프라)
(10, NOW(), NOW(), 3, 4, 'Spring Boot', 'EXPERT', 7),
(11, NOW(), NOW(), 3, 6, 'Java', 'EXPERT', 7),
(12, NOW(), NOW(), 3, 7, 'MySQL', 'EXPERT', 6),
(13, NOW(), NOW(), 3, 8, 'PostgreSQL', 'ADVANCED', 5),
(14, NOW(), NOW(), 3, 9, 'Docker', 'EXPERT', 5),
(15, NOW(), NOW(), 3, 10, 'AWS', 'EXPERT', 6);

-- 5. 프로젝트 데이터 (총 12개 - PM별로 분배)
INSERT INTO project (id, create_date, modify_date, manager_id, title, description, project_field, budget, start_date, end_date, status, view_count, applicant_count) VALUES
-- PM 1 (client1) 프로젝트 7개
(1, NOW(), NOW(), 4, 'E커머스 플랫폼 개발', '쇼핑몰 풀스택 개발 프로젝트입니다. React + Spring Boot 스택 사용. 3개월 예상.', 'WEB', 15000000.00, '2025-11-01', '2026-01-31', 'RECRUITING', 45, 3),
(2, NOW(), NOW(), 4, '사내 인사관리 시스템', 'Spring Boot 기반 사내 인사관리 시스템 개발. 직원 관리, 근태, 급여 등.', 'BACKEND', 20000000.00, '2025-10-20', '2026-03-20', 'RECRUITING', 28, 2),
(3, NOW(), NOW(), 4, '실시간 채팅 앱', 'WebSocket 기반 실시간 채팅 애플리케이션. React Native + Node.js 스택.', 'MOBILE', 10000000.00, '2025-11-05', '2026-01-05', 'IN_PROGRESS', 52, 5),
(4, NOW(), NOW(), 4, '온라인 교육 플랫폼', 'Zoom/WebRTC 통합 온라인 강의 플랫폼. 결제 시스템 포함.', 'WEB', 25000000.00, '2025-10-15', '2026-04-15', 'RECRUITING', 67, 8),
(5, NOW(), NOW(), 4, 'IoT 센서 데이터 수집 시스템', 'AWS IoT Core 활용 센서 데이터 수집 및 시각화. Spring Boot + React.', 'IOT', 18000000.00, '2025-12-01', '2026-05-01', 'RECRUITING', 15, 1),
(6, NOW(), NOW(), 4, 'CRM 시스템 고도화', '기존 CRM 시스템 기능 추가 및 UI/UX 개선. Vue.js 리팩토링.', 'WEB', 8000000.00, '2025-09-01', '2025-12-31', 'COMPLETED', 89, 12),
(7, NOW(), NOW(), 4, '블록체인 기반 NFT 마켓플레이스', 'Ethereum 기반 NFT 거래 플랫폼. Web3.js + React.', 'BLOCKCHAIN', 30000000.00, '2025-11-20', '2026-06-20', 'RECRUITING', 102, 15),
-- PM 2 (client2) 프로젝트 5개
(8, NOW(), NOW(), 5, '모바일 앱 백엔드 API 구축', 'Node.js 또는 Spring Boot로 RESTful API 개발. AWS 인프라 구축 포함.', 'BACKEND', 12000000.00, '2025-11-15', '2026-02-15', 'RECRUITING', 32, 4),
(9, NOW(), NOW(), 5, '금융 데이터 분석 대시보드', 'Python + Django 기반 실시간 금융 데이터 시각화. Grafana 연동.', 'DATA', 22000000.00, '2025-10-25', '2026-03-25', 'IN_PROGRESS', 41, 6),
(10, NOW(), NOW(), 5, 'AI 챗봇 서비스', 'OpenAI API 통합 고객 상담 챗봇. NLP 기반 자동 응답 시스템.', 'AI', 16000000.00, '2025-11-10', '2026-02-10', 'RECRUITING', 58, 7),
(11, NOW(), NOW(), 5, '소셜미디어 통합 관리 도구', 'Instagram, Facebook, Twitter API 통합. 예약 게시 기능.', 'WEB', 14000000.00, '2025-08-01', '2025-11-30', 'SUSPENDED', 23, 3),
(12, NOW(), NOW(), 5, '헬스케어 모바일 앱', 'React Native 기반 건강 관리 앱. 웨어러블 기기 연동.', 'MOBILE', 19000000.00, '2025-12-01', '2026-05-01', 'RECRUITING', 38, 5);

-- 6. 프로젝트 요구 기술
INSERT INTO project_tech (id, create_date, modify_date, project_id, tech_id, tech_name, category, required) VALUES
-- 프로젝트 1: E커머스
(1, NOW(), NOW(), 1, 1, 'React', 'Frontend', true),
(2, NOW(), NOW(), 1, 3, 'TypeScript', 'Frontend', false),
(3, NOW(), NOW(), 1, 4, 'Spring Boot', 'Backend', true),
(4, NOW(), NOW(), 1, 7, 'MySQL', 'Database', true),
(5, NOW(), NOW(), 1, 9, 'Docker', 'DevOps', false),
-- 프로젝트 2: 사내 인사관리
(6, NOW(), NOW(), 2, 4, 'Spring Boot', 'Backend', true),
(7, NOW(), NOW(), 2, 6, 'Java', 'Backend', true),
(8, NOW(), NOW(), 2, 7, 'MySQL', 'Database', true),
-- 프로젝트 3: 실시간 채팅 앱
(9, NOW(), NOW(), 3, 1, 'React', 'Frontend', true),
(10, NOW(), NOW(), 3, 5, 'Node.js', 'Backend', true),
-- 프로젝트 4: 온라인 교육 플랫폼
(11, NOW(), NOW(), 4, 1, 'React', 'Frontend', true),
(12, NOW(), NOW(), 4, 4, 'Spring Boot', 'Backend', true),
(13, NOW(), NOW(), 4, 10, 'AWS', 'DevOps', true),
-- 프로젝트 5: IoT 센서
(14, NOW(), NOW(), 5, 4, 'Spring Boot', 'Backend', true),
(15, NOW(), NOW(), 5, 10, 'AWS', 'DevOps', true),
-- 프로젝트 6: CRM (완료)
(16, NOW(), NOW(), 6, 2, 'Vue.js', 'Frontend', true),
(17, NOW(), NOW(), 6, 6, 'Java', 'Backend', true),
-- 프로젝트 7: NFT 마켓플레이스
(18, NOW(), NOW(), 7, 1, 'React', 'Frontend', true),
(19, NOW(), NOW(), 7, 3, 'TypeScript', 'Frontend', true),
-- 프로젝트 8: 백엔드 API
(20, NOW(), NOW(), 8, 4, 'Spring Boot', 'Backend', true),
(21, NOW(), NOW(), 8, 6, 'Java', 'Backend', true),
(22, NOW(), NOW(), 8, 8, 'PostgreSQL', 'Database', false),
(23, NOW(), NOW(), 8, 10, 'AWS', 'DevOps', true),
-- 프로젝트 9: 금융 데이터 분석
(24, NOW(), NOW(), 9, 8, 'PostgreSQL', 'Database', true),
-- 프로젝트 10: AI 챗봇
(25, NOW(), NOW(), 10, 5, 'Node.js', 'Backend', true),
-- 프로젝트 11: 소셜미디어 통합
(26, NOW(), NOW(), 11, 1, 'React', 'Frontend', true),
(27, NOW(), NOW(), 11, 5, 'Node.js', 'Backend', true),
-- 프로젝트 12: 헬스케어 앱
(28, NOW(), NOW(), 12, 1, 'React', 'Frontend', true),
(29, NOW(), NOW(), 12, 5, 'Node.js', 'Backend', true);

-- 7. 포트폴리오 데이터
INSERT INTO portfolio (id, create_date, modify_date, freelancer_id, title, summary, start_date, end_date, contribution, image_url, external_url) VALUES
(1, NOW(), NOW(), 1, '헬스케어 예약 시스템', 'Spring Boot + React로 구축한 병원 예약 시스템. 실시간 예약 및 결제 기능 구현.', '2024-01-01', '2024-06-30', 80, 'https://via.placeholder.com/300', 'https://github.com/example/healthcare'),
(2, NOW(), NOW(), 2, '여행 플랫폼 프론트엔드', 'Vue.js 기반 여행 상품 검색 및 예약 UI/UX 개발.', '2024-03-01', '2024-08-31', 100, 'https://via.placeholder.com/300', 'https://github.com/example/travel'),
(3, NOW(), NOW(), 3, '금융 데이터 분석 플랫폼', 'Spring Boot + AWS 기반 대용량 금융 데이터 처리 시스템. MSA 아키텍처 적용.', '2023-06-01', '2024-12-31', 60, 'https://via.placeholder.com/300', 'https://github.com/example/fintech');

-- 8. 경력 데이터
INSERT INTO career (id, create_date, modify_date, freelancer_id, company, position, description, start_date, end_date, `current`) VALUES
(1, NOW(), NOW(), 1, '테크스타트업A', '백엔드 개발자', 'Spring Boot 기반 API 서버 개발 및 유지보수', '2020-01-01', '2023-12-31', false),
(2, NOW(), NOW(), 2, '디자인에이전시B', '프론트엔드 개발자', 'Vue.js, React를 활용한 웹 서비스 UI 개발', '2022-03-01', NULL, true),
(3, NOW(), NOW(), 3, '대기업C', '시니어 백엔드 개발자', 'Java/Spring 기반 엔터프라이즈 시스템 설계 및 구축', '2018-01-01', '2024-06-30', false),
(4, NOW(), NOW(), 3, '클라우드스타트업D', 'DevOps 엔지니어', 'AWS 인프라 구축 및 CI/CD 파이프라인 구성', '2024-07-01', NULL, true);
