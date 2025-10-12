-- 테스트 데이터 생성 스크립트
-- 매칭 시스템 테스트용

-- 1. 회원 데이터 (프리랜서 3명, 클라이언트 2명)
INSERT INTO member (id, create_date, modify_date, email, nickname, password, username) VALUES
(1, NOW(), NOW(), 'freelancer1@test.com', '김개발', '$2a$10$abcdefghijklmnopqrstuvwxyz12345', 'freelancer1'),
(2, NOW(), NOW(), 'freelancer2@test.com', '이디자인', '$2a$10$abcdefghijklmnopqrstuvwxyz12345', 'freelancer2'),
(3, NOW(), NOW(), 'freelancer3@test.com', '박풀스택', '$2a$10$abcdefghijklmnopqrstuvwxyz12345', 'freelancer3'),
(4, NOW(), NOW(), 'client1@test.com', '스타트업대표', '$2a$10$abcdefghijklmnopqrstuvwxyz12345', 'client1'),
(5, NOW(), NOW(), 'client2@test.com', '기업PM', '$2a$10$abcdefghijklmnopqrstuvwxyz12345', 'client2');

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

-- 5. 프로젝트 데이터
INSERT INTO project (id, create_date, modify_date, manager_id, title, description, project_field, budget, start_date, end_date, status, view_count, applicant_count) VALUES
(1, NOW(), NOW(), 4, 'E커머스 플랫폼 개발', '쇼핑몰 풀스택 개발 프로젝트입니다. React + Spring Boot 스택 사용. 3개월 예상.', 'WEB', 15000000.00, '2025-11-01', '2026-01-31', 'RECRUITING', 45, 0),
(2, NOW(), NOW(), 5, '모바일 앱 백엔드 API 구축', 'Node.js 또는 Spring Boot로 RESTful API 개발. AWS 인프라 구축 포함.', 'BACKEND', 12000000.00, '2025-11-15', '2026-02-15', 'RECRUITING', 32, 0);

-- 6. 프로젝트 요구 기술
INSERT INTO project_tech (id, create_date, modify_date, project_id, tech_id, tech_name, category, required) VALUES
-- 프로젝트 1: E커머스
(1, NOW(), NOW(), 1, 1, 'React', 'Frontend', true),
(2, NOW(), NOW(), 1, 3, 'TypeScript', 'Frontend', false),
(3, NOW(), NOW(), 1, 4, 'Spring Boot', 'Backend', true),
(4, NOW(), NOW(), 1, 7, 'MySQL', 'Database', true),
(5, NOW(), NOW(), 1, 9, 'Docker', 'DevOps', false),
-- 프로젝트 2: 백엔드 API
(6, NOW(), NOW(), 2, 4, 'Spring Boot', 'Backend', true),
(7, NOW(), NOW(), 2, 6, 'Java', 'Backend', true),
(8, NOW(), NOW(), 2, 8, 'PostgreSQL', 'Database', false),
(9, NOW(), NOW(), 2, 10, 'AWS', 'DevOps', true);

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
