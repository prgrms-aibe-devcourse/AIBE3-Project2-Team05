package com.back.global.config;

import com.back.domain.project.entity.Project;
import com.back.domain.project.entity.ProjectFile;
import com.back.domain.project.entity.ProjectTech;
import com.back.domain.project.entity.enums.*;
import com.back.domain.project.repository.ProjectFileRepository;
import com.back.domain.project.repository.ProjectRepository;
import com.back.domain.project.repository.ProjectTechRepository;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.repository.MemberRepository;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.freelancer.freelancerTech.entity.FreelancerTech;
import com.back.domain.freelancer.freelancerTech.repository.FreelancerTechRepository;
import com.back.domain.matching.projectSubmission.entity.ProjectSubmission;
import com.back.domain.matching.projectSubmission.entity.SubmissionStatus;
import com.back.domain.matching.projectSubmission.repository.ProjectSubmissionRepository;
import com.back.domain.tech.entity.Tech;
import com.back.domain.tech.repository.TechRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
@Profile("dev") // 개발 환경에서만 실행
@RequiredArgsConstructor
@Slf4j
public class BaseInitData implements CommandLineRunner {

    private final MemberRepository memberRepository;
    private final ProjectRepository projectRepository;
    private final ProjectTechRepository projectTechRepository;
    private final ProjectFileRepository projectFileRepository;
    private final FreelancerRepository freelancerRepository;
    private final FreelancerTechRepository freelancerTechRepository;
    private final ProjectSubmissionRepository projectSubmissionRepository;
    private final TechRepository techRepository;
    private final PasswordEncoder passwordEncoder;

    // 지역 목록 - Region enum으로 변경
    private final List<Region> regions = Arrays.asList(
        Region.SEOUL, Region.GYEONGGI, Region.INCHEON, Region.GANGWON,
        Region.CHUNGNAM, Region.DAEJEON, Region.CHUNGBUK, Region.SEJONG,
        Region.BUSAN, Region.ULSAN, Region.DAEGU, Region.GYEONGBUK,
        Region.GYEONGNAM, Region.JEONNAM, Region.GWANGJU, Region.JEONBUK,
        Region.JEJU, Region.OVERSEAS
    );

    private final Random random = new Random();

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 이미 데이터가 있으면 스킵
        if (memberRepository.count() > 0) {
            log.info("초기 데이터가 이미 존재합니다. 데이터 삽입을 건너뜁니다.");
            return;
        }

        log.info("초기 데이터 삽입을 시작합니다...");

        // 사용자 데이터 생성
        createUsers();

        // 프로젝트 데이터 생성
        createProjects();

        // 프로젝트 기술스택 데이터 생성
        createProjectTechs();

        // 프로젝트 파일 데이터 생성
        createProjectFiles();

        // 프리랜서 데이터 생성
        createFreelancers();

        // 프리랜서 기술스택 데이터 생성
        createFreelancerTechs();

        // 프로젝트 지원 데이터 생성
        createProjectSubmissions();

        log.info("초기 데이터 삽입이 완료되었습니다.");
    }

    private void createUsers() {
        // PM 계정 2개 추가 (매칭 시스템 테스트용)
        Member client1 = new Member("client1", "PM 홍길동", passwordEncoder.encode("12341234"), "client1@test.com");
        Member client2 = new Member("client2", "PM 김철수", passwordEncoder.encode("12341234"), "client2@test.com");

        Member user1 = new Member("Park-seungg", "park", passwordEncoder.encode("password123"), "park.seungg@example.com");
        Member user2 = new Member("developer1", "dev1", passwordEncoder.encode("password123"), "dev1@example.com");
        Member user3 = new Member("designer1", "designer", passwordEncoder.encode("password123"), "designer1@example.com");
        Member user4 = new Member("iot_expert", "iot", passwordEncoder.encode("password123"), "iot@example.com");
        Member user5 = new Member("marketer1", "marketer", passwordEncoder.encode("password123"), "marketing@example.com");
        Member user6 = new Member("opensource_dev", "opensource", passwordEncoder.encode("password123"), "opensource@example.com");
        Member user7 = new Member("plugin_dev", "plugin", passwordEncoder.encode("password123"), "plugin@example.com");

        memberRepository.save(client1);
        memberRepository.save(client2);
        memberRepository.save(user1);
        memberRepository.save(user2);
        memberRepository.save(user3);
        memberRepository.save(user4);
        memberRepository.save(user5);
        memberRepository.save(user6);
        memberRepository.save(user7);

        log.info("사용자 데이터 {} 건이 생성되었습니다 (PM 2명 포함).", 9);
    }

    private void createProjects() {
        // 사용자 조회 (ID는 Auto Increment로 자동 생성됨)
        Member client1 = memberRepository.findByUsername("client1").orElseThrow();
        Member client2 = memberRepository.findByUsername("client2").orElseThrow();
        Member parkSeungg = memberRepository.findByUsername("Park-seungg").orElseThrow();
        Member developer1 = memberRepository.findByUsername("developer1").orElseThrow();
        Member designer1 = memberRepository.findByUsername("designer1").orElseThrow();
        Member iotExpert = memberRepository.findByUsername("iot_expert").orElseThrow();
        Member marketer1 = memberRepository.findByUsername("marketer1").orElseThrow();
        Member opensourceDev = memberRepository.findByUsername("opensource_dev").orElseThrow();
        Member pluginDev = memberRepository.findByUsername("plugin_dev").orElseThrow();

        // ============================================
        // client1 (PM 홍길동) 프로젝트 7개
        // ============================================
        Project pmProject1 = new Project(
                "E커머스 플랫폼 개발",
                "쇼핑몰 풀스택 개발 프로젝트입니다. React + Spring Boot 스택 사용. 3개월 예상.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_1000_2000,
                LocalDate.of(2025, 11, 1),
                LocalDate.of(2026, 1, 31),
                client1
        );
        pmProject1.setPartnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER);
        pmProject1.setBudgetAmount(15000000L);
        pmProject1.setProgressStatus(ProgressStatus.DETAILED_PLAN);
        pmProject1.setCompanyLocation(Region.SEOUL);
        pmProject1.setViewCount(45);
        pmProject1.setApplicantCount(3);
        pmProject1.setCreateDate(LocalDateTime.now().minusDays(10));
        pmProject1.setModifyDate(LocalDateTime.now().minusDays(2));

        Project pmProject2 = new Project(
                "사내 인사관리 시스템",
                "Spring Boot 기반 사내 인사관리 시스템 개발. 직원 관리, 근태, 급여 등.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_1000_2000,
                LocalDate.of(2025, 10, 20),
                LocalDate.of(2026, 3, 20),
                client1
        );
        pmProject2.setPartnerType(PartnerType.BUSINESS_TEAM_OR_COMPANY);
        pmProject2.setBudgetAmount(20000000L);
        pmProject2.setProgressStatus(ProgressStatus.CONTENT_ORGANIZED);
        pmProject2.setCompanyLocation(Region.GYEONGGI);
        pmProject2.setViewCount(28);
        pmProject2.setApplicantCount(2);
        pmProject2.setCreateDate(LocalDateTime.now().minusDays(15));
        pmProject2.setModifyDate(LocalDateTime.now().minusDays(5));

        Project pmProject3 = new Project(
                "실시간 채팅 앱",
                "WebSocket 기반 실시간 채팅 애플리케이션. React Native + Node.js 스택.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_500_1000,
                LocalDate.of(2025, 11, 5),
                LocalDate.of(2026, 1, 5),
                client1
        );
        pmProject3.setPartnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER);
        pmProject3.setBudgetAmount(10000000L);
        pmProject3.setProgressStatus(ProgressStatus.DETAILED_PLAN);
        pmProject3.setCompanyLocation(Region.SEOUL);
        pmProject3.setViewCount(52);
        pmProject3.setApplicantCount(5);
        pmProject3.setCreateDate(LocalDateTime.now().minusDays(20));
        pmProject3.setModifyDate(LocalDateTime.now().minusDays(1));

        Project pmProject4 = new Project(
                "온라인 교육 플랫폼",
                "Zoom/WebRTC 통합 온라인 강의 플랫폼. 결제 시스템 포함.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_2000_3000,
                LocalDate.of(2025, 10, 15),
                LocalDate.of(2026, 4, 15),
                client1
        );
        pmProject4.setPartnerType(PartnerType.BUSINESS_TEAM_OR_COMPANY);
        pmProject4.setBudgetAmount(25000000L);
        pmProject4.setProgressStatus(ProgressStatus.DETAILED_PLAN);
        pmProject4.setCompanyLocation(Region.BUSAN);
        pmProject4.setViewCount(67);
        pmProject4.setApplicantCount(8);
        pmProject4.setCreateDate(LocalDateTime.now().minusDays(25));
        pmProject4.setModifyDate(LocalDateTime.now().minusDays(3));

        Project pmProject5 = new Project(
                "IoT 센서 데이터 수집 시스템",
                "AWS IoT Core 활용 센서 데이터 수집 및 시각화. Spring Boot + React.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_1000_2000,
                LocalDate.of(2025, 12, 1),
                LocalDate.of(2026, 5, 1),
                client1
        );
        pmProject5.setPartnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER);
        pmProject5.setBudgetAmount(18000000L);
        pmProject5.setProgressStatus(ProgressStatus.CONTENT_ORGANIZED);
        pmProject5.setCompanyLocation(Region.DAEJEON);
        pmProject5.setViewCount(15);
        pmProject5.setApplicantCount(1);
        pmProject5.setCreateDate(LocalDateTime.now().minusDays(5));
        pmProject5.setModifyDate(LocalDateTime.now().minusDays(1));

        Project pmProject6 = new Project(
                "CRM 시스템 고도화",
                "기존 CRM 시스템 기능 추가 및 UI/UX 개선. Vue.js 리팩토링.",
                ProjectField.DESIGN,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_500_1000,
                LocalDate.of(2025, 9, 1),
                LocalDate.of(2025, 12, 31),
                client1
        );
        pmProject6.setPartnerType(PartnerType.INDIVIDUAL_FREELANCER);
        pmProject6.setBudgetAmount(8000000L);
        pmProject6.setProgressStatus(ProgressStatus.CONTENT_ORGANIZED);
        pmProject6.setCompanyLocation(Region.SEOUL);
        pmProject6.setViewCount(89);
        pmProject6.setApplicantCount(12);
        pmProject6.setCreateDate(LocalDateTime.now().minusDays(90));
        pmProject6.setModifyDate(LocalDateTime.now().minusDays(30));

        Project pmProject7 = new Project(
                "블록체인 기반 NFT 마켓플레이스",
                "Ethereum 기반 NFT 거래 플랫폼. Web3.js + React.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_3000_5000,
                LocalDate.of(2025, 11, 20),
                LocalDate.of(2026, 6, 20),
                client1
        );
        pmProject7.setPartnerType(PartnerType.BUSINESS_TEAM_OR_COMPANY);
        pmProject7.setBudgetAmount(30000000L);
        pmProject7.setProgressStatus(ProgressStatus.DETAILED_PLAN);
        pmProject7.setCompanyLocation(Region.SEOUL);
        pmProject7.setViewCount(102);
        pmProject7.setApplicantCount(15);
        pmProject7.setCreateDate(LocalDateTime.now().minusDays(12));
        pmProject7.setModifyDate(LocalDateTime.now());

        // ============================================
        // client2 (PM 김철수) 프로젝트 5개
        // ============================================
        Project pmProject8 = new Project(
                "모바일 앱 백엔드 API 구축",
                "Node.js 또는 Spring Boot로 RESTful API 개발. AWS 인프라 구축 포함.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_1000_2000,
                LocalDate.of(2025, 11, 15),
                LocalDate.of(2026, 2, 15),
                client2
        );
        pmProject8.setPartnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER);
        pmProject8.setBudgetAmount(12000000L);
        pmProject8.setProgressStatus(ProgressStatus.DETAILED_PLAN);
        pmProject8.setCompanyLocation(Region.INCHEON);
        pmProject8.setViewCount(32);
        pmProject8.setApplicantCount(4);
        pmProject8.setCreateDate(LocalDateTime.now().minusDays(18));
        pmProject8.setModifyDate(LocalDateTime.now().minusDays(4));

        Project pmProject9 = new Project(
                "금융 데이터 분석 대시보드",
                "Python + Django 기반 실시간 금융 데이터 시각화. Grafana 연동.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_2000_3000,
                LocalDate.of(2025, 10, 25),
                LocalDate.of(2026, 3, 25),
                client2
        );
        pmProject9.setPartnerType(PartnerType.BUSINESS_TEAM_OR_COMPANY);
        pmProject9.setBudgetAmount(22000000L);
        pmProject9.setProgressStatus(ProgressStatus.CONTENT_ORGANIZED);
        pmProject9.setCompanyLocation(Region.SEOUL);
        pmProject9.setViewCount(41);
        pmProject9.setApplicantCount(6);
        pmProject9.setCreateDate(LocalDateTime.now().minusDays(22));
        pmProject9.setModifyDate(LocalDateTime.now().minusDays(6));

        Project pmProject10 = new Project(
                "AI 챗봇 서비스",
                "OpenAI API 통합 고객 상담 챗봇. NLP 기반 자동 응답 시스템.",
                ProjectField.PLANNING,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_1000_2000,
                LocalDate.of(2025, 11, 10),
                LocalDate.of(2026, 2, 10),
                client2
        );
        pmProject10.setPartnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER);
        pmProject10.setBudgetAmount(16000000L);
        pmProject10.setProgressStatus(ProgressStatus.IDEA_STAGE);
        pmProject10.setCompanyLocation(Region.GYEONGGI);
        pmProject10.setViewCount(58);
        pmProject10.setApplicantCount(7);
        pmProject10.setCreateDate(LocalDateTime.now().minusDays(14));
        pmProject10.setModifyDate(LocalDateTime.now().minusDays(2));

        Project pmProject11 = new Project(
                "소셜미디어 통합 관리 도구",
                "Instagram, Facebook, Twitter API 통합. 예약 게시 기능.",
                ProjectField.PLANNING,
                RecruitmentType.PERSONAL_CONTRACT,
                BudgetRange.RANGE_1000_2000,
                LocalDate.of(2025, 8, 1),
                LocalDate.of(2025, 11, 30),
                client2
        );
        pmProject11.setPartnerType(PartnerType.INDIVIDUAL_FREELANCER);
        pmProject11.setBudgetAmount(14000000L);
        pmProject11.setProgressStatus(ProgressStatus.IDEA_STAGE);
        pmProject11.setCompanyLocation(Region.BUSAN);
        pmProject11.setViewCount(23);
        pmProject11.setApplicantCount(3);
        pmProject11.setCreateDate(LocalDateTime.now().minusDays(60));
        pmProject11.setModifyDate(LocalDateTime.now().minusDays(20));

        Project pmProject12 = new Project(
                "헬스케어 모바일 앱",
                "React Native 기반 건강 관리 앱. 웨어러블 기기 연동.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_1000_2000,
                LocalDate.of(2025, 12, 1),
                LocalDate.of(2026, 5, 1),
                client2
        );
        pmProject12.setPartnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER);
        pmProject12.setBudgetAmount(19000000L);
        pmProject12.setProgressStatus(ProgressStatus.DETAILED_PLAN);
        pmProject12.setCompanyLocation(Region.DAEGU);
        pmProject12.setViewCount(38);
        pmProject12.setApplicantCount(5);
        pmProject12.setCreateDate(LocalDateTime.now().minusDays(8));
        pmProject12.setModifyDate(LocalDateTime.now().minusDays(1));

        // ============================================
        // Park-seungg의 프로젝트들
        // ============================================
        Project project1 = new Project(
                "React + Spring Boot 풀스택 웹사이트 개발",
                "모던 웹 기술을 활용한 반응형 웹사이트를 개발합니다. 사용자 친화적인 UI/UX와 안정적인 백엔드 API를 구축하여 완성도 높은 서비스를 만들어보세요.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_300_500,
                LocalDate.of(2025, 11, 1),
                LocalDate.of(2025, 12, 31),
                parkSeungg
        );
        project1.setPartnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER);
        project1.setBudgetAmount(4000000L);
        project1.setProgressStatus(ProgressStatus.DETAILED_PLAN);
        project1.setCompanyLocation(getRandomRegion());
        project1.setViewCount(1245);
        project1.setApplicantCount(15);
        project1.setCreateDate(LocalDateTime.of(2025, 9, 15, 9, 30, 0));
        project1.setModifyDate(LocalDateTime.of(2025, 9, 28, 14, 20, 0));

        Project project2 = new Project(
                "모바일 앱 UI/UX 디자인 프로젝트",
                "사용자 중심의 모바일 앱 디자인을 함께 만들어갈 디자이너를 찾습니다. 피그마를 활용한 프로토타이핑부터 최종 디자인 시스템까지 완성해보세요.",
                ProjectField.DESIGN,
                RecruitmentType.PERSONAL_CONTRACT,
                BudgetRange.RANGE_200_300,
                LocalDate.of(2025, 10, 15),
                LocalDate.of(2025, 11, 30),
                parkSeungg
        );
        project2.setPartnerType(PartnerType.INDIVIDUAL_FREELANCER);
        project2.setBudgetAmount(2500000L);
        project2.setProgressStatus(ProgressStatus.CONTENT_ORGANIZED);
        project2.setCompanyLocation(getRandomRegion());
        project2.setViewCount(892);
        project2.setApplicantCount(8);
        project2.setCreateDate(LocalDateTime.of(2025, 9, 20, 11, 15, 0));
        project2.setModifyDate(LocalDateTime.of(2025, 9, 30, 16, 45, 0));

        Project project3 = new Project(
                "AI 기반 데이터 분석 플랫폼",
                "머신러닝과 데이터 분석을 활용한 인사이트 도출 플랫폼을 개발합니다. Python, TensorFlow 등을 활용하여 혁신적인 솔루션을 만들어보세요.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_500_1000,
                LocalDate.of(2025, 10, 20),
                LocalDate.of(2026, 1, 31),
                parkSeungg
        );
        project3.setPartnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER);
        project3.setBudgetAmount(8000000L);
        project3.setProgressStatus(ProgressStatus.DETAILED_PLAN);
        project3.setCompanyLocation(getRandomRegion());
        project3.setViewCount(654);
        project3.setApplicantCount(23);
        project3.setCreateDate(LocalDateTime.of(2025, 9, 25, 13, 45, 0));
        project3.setModifyDate(LocalDateTime.of(2025, 10, 1, 10, 30, 0));

        Project project4 = new Project(
                "블록체인 기반 NFT 마켓플레이스",
                "완료된 프로젝트입니다. Solidity와 Web3 기술을 활용하여 NFT 거래 플랫폼을 성공적으로 구축했습니다.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_1000_2000,
                LocalDate.of(2025, 6, 1),
                LocalDate.of(2025, 9, 30),
                parkSeungg
        );
        project4.setPartnerType(PartnerType.BUSINESS_TEAM_OR_COMPANY);
        project4.setBudgetAmount(15000000L);
        project4.setProgressStatus(ProgressStatus.DETAILED_PLAN);
        project4.setCompanyLocation(getRandomRegion());
        project4.setViewCount(2341);
        project4.setApplicantCount(47);
        project4.setCreateDate(LocalDateTime.of(2025, 5, 15, 8, 0, 0));
        project4.setModifyDate(LocalDateTime.of(2025, 9, 30, 18, 0, 0));

        // 다른 사용자들의 프로젝트들
        Project project5 = new Project(
                "Vue.js로 만드는 전자상거래 플랫폼",
                "최신 Vue.js 3 기술을 활용하여 완전한 전자상거래 솔루션을 개발합니다. 결제 시스템부터 관리자 페이지까지 모든 기능을 포함합니다.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_500_1000,
                LocalDate.of(2025, 11, 15),
                LocalDate.of(2026, 2, 28),
                developer1
        );
        project5.setPartnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER);
        project5.setBudgetAmount(7500000L);
        project5.setProgressStatus(ProgressStatus.DETAILED_PLAN);
        project5.setCompanyLocation(getRandomRegion());
        project5.setViewCount(1876);
        project5.setApplicantCount(31);
        project5.setCreateDate(LocalDateTime.of(2025, 9, 28, 10, 20, 0));
        project5.setModifyDate(LocalDateTime.of(2025, 9, 30, 9, 15, 0));

        Project project6 = new Project(
                "게임 캐릭터 일러스트 디자인",
                "모바일 RPG 게임의 캐릭터 일러스트와 UI 요소들을 디자인할 아티스트를 모집합니다. 판타지 스타일의 아트워크 경험이 있으면 좋습니다.",
                ProjectField.DESIGN,
                RecruitmentType.PERSONAL_CONTRACT,
                BudgetRange.RANGE_100_200,
                LocalDate.of(2025, 10, 10),
                LocalDate.of(2025, 11, 20),
                designer1
        );
        project6.setPartnerType(PartnerType.INDIVIDUAL_FREELANCER);
        project6.setBudgetAmount(1500000L);
        project6.setProgressStatus(ProgressStatus.CONTENT_ORGANIZED);
        project6.setCompanyLocation(getRandomRegion());
        project6.setViewCount(567);
        project6.setApplicantCount(12);
        project6.setCreateDate(LocalDateTime.of(2025, 9, 22, 14, 30, 0));
        project6.setModifyDate(LocalDateTime.of(2025, 9, 29, 11, 45, 0));

        Project project7 = new Project(
                "IoT 스마트홈 시스템 개발",
                "Arduino와 Raspberry Pi를 활용한 스마트홈 자동화 시스템을 개발합니다. 모바일 앱과 연동하여 원격 제어가 가능한 시스템을 구축합니다.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_300_500,
                LocalDate.of(2025, 11, 1),
                LocalDate.of(2025, 12, 15),
                iotExpert
        );
        project7.setPartnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER);
        project7.setBudgetAmount(4500000L);
        project7.setProgressStatus(ProgressStatus.DETAILED_PLAN);
        project7.setCompanyLocation(getRandomRegion());
        project7.setViewCount(789);
        project7.setApplicantCount(19);
        project7.setCreateDate(LocalDateTime.of(2025, 9, 26, 16, 0, 0));
        project7.setModifyDate(LocalDateTime.of(2025, 9, 30, 13, 20, 0));

        Project project8 = new Project(
                "마케팅 자동화 도구 개발",
                "이메일 마케팅과 소셜미디어 관리를 자동화하는 SaaS 플랫폼을 개발합니다. API 연동과 스케줄링 시스템이 핵심 기능입니다.",
                ProjectField.PLANNING,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_200_300,
                LocalDate.of(2025, 10, 25),
                LocalDate.of(2025, 12, 20),
                marketer1
        );
        project8.setPartnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER);
        project8.setBudgetAmount(2800000L);
        project8.setProgressStatus(ProgressStatus.IDEA_STAGE);
        project8.setCompanyLocation(getRandomRegion());
        project8.setViewCount(432);
        project8.setApplicantCount(5);
        project8.setCreateDate(LocalDateTime.of(2025, 9, 24, 12, 10, 0));
        project8.setModifyDate(LocalDateTime.of(2025, 9, 28, 15, 30, 0));

        Project project9 = new Project(
                "무료 오픈소스 프로젝트 - 학습 관리 시스템",
                "교육기관을 위한 오픈소스 LMS를 함께 개발할 개발자들을 모집합니다. 사회적 가치 창출과 포트폴리오 구축을 동시에!",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.NEGOTIABLE,
                LocalDate.of(2025, 10, 20),
                LocalDate.of(2026, 3, 31),
                opensourceDev
        );
        project9.setPartnerType(PartnerType.ANY_TYPE);
        project9.setBudgetAmount(null);
        project9.setProgressStatus(ProgressStatus.CONTENT_ORGANIZED);
        project9.setCompanyLocation(getRandomRegion());
        project9.setViewCount(1123);
        project9.setApplicantCount(3);
        project9.setCreateDate(LocalDateTime.of(2025, 9, 18, 9, 45, 0));
        project9.setModifyDate(LocalDateTime.of(2025, 9, 27, 17, 0, 0));

        Project project10 = new Project(
                "Figma 플러그인 개발 프로젝트",
                "디자이너들의 작업 효율성을 높이는 Figma 플러그인을 개발합니다. TypeScript와 Figma API에 대한 이해가 필요합니다.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PERSONAL_CONTRACT,
                BudgetRange.RANGE_100_200,
                LocalDate.of(2025, 11, 5),
                LocalDate.of(2025, 12, 10),
                pluginDev
        );
        project10.setPartnerType(PartnerType.INDIVIDUAL_FREELANCER);
        project10.setBudgetAmount(1200000L);
        project10.setProgressStatus(ProgressStatus.IDEA_STAGE);
        project10.setCompanyLocation(getRandomRegion());
        project10.setViewCount(345);
        project10.setApplicantCount(2);
        project10.setCreateDate(LocalDateTime.of(2025, 9, 30, 11, 30, 0));
        project10.setModifyDate(LocalDateTime.of(2025, 9, 30, 11, 30, 0));

        // PM 프로젝트 저장
        projectRepository.save(pmProject1);
        projectRepository.save(pmProject2);
        projectRepository.save(pmProject3);
        projectRepository.save(pmProject4);
        projectRepository.save(pmProject5);
        projectRepository.save(pmProject6);
        projectRepository.save(pmProject7);
        projectRepository.save(pmProject8);
        projectRepository.save(pmProject9);
        projectRepository.save(pmProject10);
        projectRepository.save(pmProject11);
        projectRepository.save(pmProject12);

        // 기타 사용자 프로젝트 저장
        projectRepository.save(project1);
        projectRepository.save(project2);
        projectRepository.save(project3);
        projectRepository.save(project4);
        projectRepository.save(project5);
        projectRepository.save(project6);
        projectRepository.save(project7);
        projectRepository.save(project8);
        projectRepository.save(project9);
        projectRepository.save(project10);

        // Park-seungg의 추가 프로젝트 15개
        Project project11 = new Project(
                "Flutter 기반 모바일 헬스케어 앱",
                "개인 건강 관리를 위한 모바일 애플리케이션을 개발합니다. 운동 기록, 식단 관리, 건강 지표 추적 기능을 포함한 종합적인 헬스케어 솔루션입니다.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_500_1000,
                LocalDate.of(2025, 11, 10),
                LocalDate.of(2026, 2, 28),
                parkSeungg
        );
        project11.setPartnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER);
        project11.setBudgetAmount(6000000L);
        project11.setProgressStatus(ProgressStatus.DETAILED_PLAN);
        project11.setCompanyLocation(Region.SEOUL);
        project11.setViewCount(423);
        project11.setApplicantCount(12);
        project11.setCreateDate(LocalDateTime.of(2025, 10, 1, 9, 15, 0));
        project11.setModifyDate(LocalDateTime.of(2025, 10, 5, 14, 30, 0));

        Project project12 = new Project(
                "웹 기반 온라인 교육 플랫폼",
                "실시간 화상 강의와 과제 관리 시스템이 통합된 교육 플랫폼을 개발합니다. 학생과 강사 모두 만족하는 사용자 경험을 제공합니다.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_1000_2000,
                LocalDate.of(2025, 9, 1),
                LocalDate.of(2025, 12, 31),
                parkSeungg
        );
        project12.setPartnerType(PartnerType.BUSINESS_TEAM_OR_COMPANY);
        project12.setBudgetAmount(12000000L);
        project12.setProgressStatus(ProgressStatus.CONTENT_ORGANIZED);
        project12.setCompanyLocation(Region.GYEONGGI);
        project12.setViewCount(1876);
        project12.setApplicantCount(28);
        project12.setCreateDate(LocalDateTime.of(2025, 8, 15, 11, 30, 0));
        project12.setModifyDate(LocalDateTime.of(2025, 9, 20, 16, 45, 0));

        Project project13 = new Project(
                "브랜드 아이덴티티 디자인 프로젝트",
                "스타트업을 위한 전체적인 브랜드 아이덴티티를 디자인합니다. 로고, 명함, 웹사이트 디자인까지 일관성 있는 브랜드 경험을 만들어보세요.",
                ProjectField.DESIGN,
                RecruitmentType.PERSONAL_CONTRACT,
                BudgetRange.RANGE_200_300,
                LocalDate.of(2025, 12, 1),
                LocalDate.of(2026, 1, 15),
                parkSeungg
        );
        project13.setPartnerType(PartnerType.INDIVIDUAL_FREELANCER);
        project13.setBudgetAmount(2200000L);
        project13.setProgressStatus(ProgressStatus.IDEA_STAGE);
        project13.setCompanyLocation(Region.INCHEON);
        project13.setViewCount(234);
        project13.setApplicantCount(3);
        project13.setCreateDate(LocalDateTime.of(2025, 10, 8, 13, 20, 0));
        project13.setModifyDate(LocalDateTime.of(2025, 10, 10, 10, 0, 0));

        Project project14 = new Project(
                "마이크로서비스 아키텍처 구축",
                "기존 모놀리식 시스템을 마이크로서비스로 전환하는 프로젝트입니다. Docker, Kubernetes를 활용한 현대적인 시스템 구축을 목표로 합니다.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_2000_3000,
                LocalDate.of(2025, 7, 1),
                LocalDate.of(2025, 10, 31),
                parkSeungg
        );
        project14.setPartnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER);
        project14.setBudgetAmount(25000000L);
        project14.setProgressStatus(ProgressStatus.DETAILED_PLAN);
        project14.setCompanyLocation(Region.BUSAN);
        project14.setViewCount(3421);
        project14.setApplicantCount(45);
        project14.setCreateDate(LocalDateTime.of(2025, 6, 10, 8, 0, 0));
        project14.setModifyDate(LocalDateTime.of(2025, 10, 31, 18, 0, 0));

        Project project15 = new Project(
                "게임 개발 프로젝트 - 2D 어드벤처",
                "Unity를 사용한 2D 어드벤처 게임을 개발합니다. 독창적인 스토리와 아름다운 픽셀 아트로 플레이어들에게 감동을 선사하는 게임을 만들어보세요.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_300_500,
                LocalDate.of(2025, 8, 15),
                LocalDate.of(2025, 11, 30),
                parkSeungg
        );
        project15.setPartnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER);
        project15.setBudgetAmount(4500000L);
        project15.setProgressStatus(ProgressStatus.CONTENT_ORGANIZED);
        project15.setCompanyLocation(Region.DAEGU);
        project15.setViewCount(2145);
        project15.setApplicantCount(32);
        project15.setCreateDate(LocalDateTime.of(2025, 7, 20, 15, 30, 0));
        project15.setModifyDate(LocalDateTime.of(2025, 11, 30, 17, 0, 0));

        Project project16 = new Project(
                "클라우드 마이그레이션 컨설팅",
                "온프레미스 인프라를 AWS 클라우드로 마이그레이션하는 컨설팅 프로젝트입니다. 비용 최적화와 성능 향상을 동시에 달성할 수 있도록 도와드립니다.",
                ProjectField.PLANNING,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_1000_2000,
                LocalDate.of(2025, 11, 15),
                LocalDate.of(2026, 2, 15),
                parkSeungg
        );
        project16.setPartnerType(PartnerType.BUSINESS_TEAM_OR_COMPANY);
        project16.setBudgetAmount(15000000L);
        project16.setProgressStatus(ProgressStatus.IDEA_STAGE);
        project16.setCompanyLocation(Region.GWANGJU);
        project16.setViewCount(567);
        project16.setApplicantCount(8);
        project16.setCreateDate(LocalDateTime.of(2025, 10, 5, 10, 45, 0));
        project16.setModifyDate(LocalDateTime.of(2025, 10, 12, 9, 30, 0));

        Project project17 = new Project(
                "Next.js 기반 포트폴리오 사이트",
                "개발자와 디자이너를 위한 반응형 포트폴리오 웹사이트를 제작합니다. SEO 최적화와 성능을 고려한 모던 웹사이트를 구축합니다.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PERSONAL_CONTRACT,
                BudgetRange.RANGE_100_200,
                LocalDate.of(2025, 10, 20),
                LocalDate.of(2025, 11, 30),
                parkSeungg
        );
        project17.setPartnerType(PartnerType.INDIVIDUAL_FREELANCER);
        project17.setBudgetAmount(1800000L);
        project17.setProgressStatus(ProgressStatus.DETAILED_PLAN);
        project17.setCompanyLocation(Region.DAEJEON);
        project17.setViewCount(789);
        project17.setApplicantCount(14);
        project17.setCreateDate(LocalDateTime.of(2025, 10, 1, 14, 0, 0));
        project17.setModifyDate(LocalDateTime.of(2025, 10, 8, 11, 20, 0));

        Project project18 = new Project(
                "데이터 시각화 대시보드",
                "비즈니스 데이터를 한눈에 볼 수 있는 인터랙티브 대시보드를 개발합니다. D3.js와 Chart.js를 활용한 아름다운 데이터 시각화를 구현합니다.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_300_500,
                LocalDate.of(2025, 11, 1),
                LocalDate.of(2025, 12, 20),
                parkSeungg
        );
        project18.setPartnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER);
        project18.setBudgetAmount(3500000L);
        project18.setProgressStatus(ProgressStatus.CONTENT_ORGANIZED);
        project18.setCompanyLocation(Region.ULSAN);
        project18.setViewCount(1234);
        project18.setApplicantCount(19);
        project18.setCreateDate(LocalDateTime.of(2025, 10, 3, 16, 15, 0));
        project18.setModifyDate(LocalDateTime.of(2025, 10, 9, 13, 45, 0));

        Project project19 = new Project(
                "소셜 미디어 관리 도구",
                "여러 소셜 미디어 플랫폼을 한번에 관리할 수 있는 통합 관리 도구를 개발합니다. 예약 포스팅, 분석 기능 등을 포함합니다.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_500_1000,
                LocalDate.of(2025, 12, 1),
                LocalDate.of(2026, 3, 31),
                parkSeungg
        );
        project19.setPartnerType(PartnerType.BUSINESS_TEAM_OR_COMPANY);
        project19.setBudgetAmount(7500000L);
        project19.setProgressStatus(ProgressStatus.DETAILED_PLAN);
        project19.setCompanyLocation(Region.GANGWON);
        project19.setViewCount(945);
        project19.setApplicantCount(22);
        project19.setCreateDate(LocalDateTime.of(2025, 10, 6, 12, 30, 0));
        project19.setModifyDate(LocalDateTime.of(2025, 10, 11, 15, 0, 0));

        Project project20 = new Project(
                "디지털 마케팅 캠페인 기획",
                "브랜드 인지도 향상을 위한 종합적인 디지털 마케팅 전략을 수립합니다. SNS, 콘텐츠 마케팅, 인플루언서 마케팅을 통합한 캠페인을 기획합니다.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PERSONAL_CONTRACT,
                BudgetRange.RANGE_200_300,
                LocalDate.of(2025, 11, 20),
                LocalDate.of(2026, 1, 20),
                parkSeungg
        );
        project20.setPartnerType(PartnerType.INDIVIDUAL_FREELANCER);
        project20.setBudgetAmount(2800000L);
        project20.setProgressStatus(ProgressStatus.IDEA_STAGE);
        project20.setCompanyLocation(Region.CHUNGNAM);
        project20.setViewCount(432);
        project20.setApplicantCount(6);
        project20.setCreateDate(LocalDateTime.of(2025, 10, 8, 9, 0, 0));
        project20.setModifyDate(LocalDateTime.of(2025, 10, 13, 14, 15, 0));

        Project project21 = new Project(
                "크로스 플랫폼 모바일 앱",
                "React Native를 활용한 iOS/Android 동시 지원 앱을 개발합니다. 네이티브 성능을 유지하면서도 개발 효율성을 극대화한 앱을 만들어보세요.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_500_1000,
                LocalDate.of(2025, 10, 25),
                LocalDate.of(2026, 1, 25),
                parkSeungg
        );
        project21.setPartnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER);
        project21.setBudgetAmount(8500000L);
        project21.setProgressStatus(ProgressStatus.DETAILED_PLAN);
        project21.setCompanyLocation(Region.CHUNGBUK);
        project21.setViewCount(1567);
        project21.setApplicantCount(25);
        project21.setCreateDate(LocalDateTime.of(2025, 10, 2, 11, 45, 0));
        project21.setModifyDate(LocalDateTime.of(2025, 10, 10, 16, 30, 0));

        Project project22 = new Project(
                "API 문서 자동화 시스템",
                "OpenAPI 스펙을 활용한 API 문서 자동 생성 및 관리 시스템을 개발합니다. 개발자 생산성 향상에 기여하는 도구를 만들어보세요.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_300_500,
                LocalDate.of(2025, 11, 5),
                LocalDate.of(2025, 12, 31),
                parkSeungg
        );
        project22.setPartnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER);
        project22.setBudgetAmount(4200000L);
        project22.setProgressStatus(ProgressStatus.CONTENT_ORGANIZED);
        project22.setCompanyLocation(Region.SEJONG);
        project22.setViewCount(678);
        project22.setApplicantCount(11);
        project22.setCreateDate(LocalDateTime.of(2025, 10, 4, 15, 30, 0));
        project22.setModifyDate(LocalDateTime.of(2025, 10, 12, 10, 20, 0));

        Project project23 = new Project(
                "웹 애니메이션 라이브러리",
                "CSS3와 JavaScript를 활용한 고성능 웹 애니메이션 라이브러리를 개발합니다. 사용하기 쉽고 확장 가능한 애니메이션 솔루션을 만들어보세요.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PERSONAL_CONTRACT,
                BudgetRange.RANGE_200_300,
                LocalDate.of(2025, 10, 30),
                LocalDate.of(2025, 12, 15),
                parkSeungg
        );
        project23.setPartnerType(PartnerType.INDIVIDUAL_FREELANCER);
        project23.setBudgetAmount(2500000L);
        project23.setProgressStatus(ProgressStatus.DETAILED_PLAN);
        project23.setCompanyLocation(getRandomRegion());
        project23.setViewCount(456);
        project23.setApplicantCount(9);
        project23.setCreateDate(LocalDateTime.of(2025, 10, 7, 13, 15, 0));
        project23.setModifyDate(LocalDateTime.of(2025, 10, 14, 12, 0, 0));

        Project project24 = new Project(
                "AI 챗봇 개발 프로젝트",
                "자연어 처리 기술을 활용한 고도화된 챗봇을 개발합니다. 고객 서비스 자동화와 사용자 만족도 향상을 목표로 하는 프로젝트입니다.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_1000_2000,
                LocalDate.of(2025, 11, 10),
                LocalDate.of(2026, 2, 10),
                parkSeungg
        );
        project24.setPartnerType(PartnerType.BUSINESS_TEAM_OR_COMPANY);
        project24.setBudgetAmount(18000000L);
        project24.setProgressStatus(ProgressStatus.CONTENT_ORGANIZED);
        project24.setCompanyLocation(Region.GYEONGNAM);
        project24.setViewCount(2134);
        project24.setApplicantCount(38);
        project24.setCreateDate(LocalDateTime.of(2025, 10, 5, 10, 0, 0));
        project24.setModifyDate(LocalDateTime.of(2025, 10, 15, 14, 45, 0));

        Project project25 = new Project(
                "블록체인 투표 시스템",
                "투명하고 안전한 온라인 투표 시스템을 블록체인 기술로 구현합니다. 탈중앙화된 투표 프로세스로 신뢰성 있는 결과를 보장합니다.",
                ProjectField.DEVELOPMENT,
                RecruitmentType.PROJECT_CONTRACT,
                BudgetRange.RANGE_500_1000,
                LocalDate.of(2025, 12, 5),
                LocalDate.of(2026, 3, 15),
                parkSeungg
        );
        project25.setPartnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER);
        project25.setBudgetAmount(9500000L);
        project25.setProgressStatus(ProgressStatus.DETAILED_PLAN);
        project25.setCompanyLocation(Region.JEONNAM);
        project25.setViewCount(834);
        project25.setApplicantCount(16);
        project25.setCreateDate(LocalDateTime.of(2025, 10, 9, 16, 20, 0));
        project25.setModifyDate(LocalDateTime.of(2025, 10, 16, 11, 30, 0));

        // 새로 추가된 프로젝트들 저장
        projectRepository.save(project11);
        projectRepository.save(project12);
        projectRepository.save(project13);
        projectRepository.save(project14);
        projectRepository.save(project15);
        projectRepository.save(project16);
        projectRepository.save(project17);
        projectRepository.save(project18);
        projectRepository.save(project19);
        projectRepository.save(project20);
        projectRepository.save(project21);
        projectRepository.save(project22);
        projectRepository.save(project23);
        projectRepository.save(project24);
        projectRepository.save(project25);

        log.info("프로젝트 데이터 {} 건이 생성되었습니다. (PM 프로젝트 12건 포함)", 37);
    }

    // 랜덤 지역 선택 메서드 추가
    private Region getRandomRegion() {
        return regions.get(random.nextInt(regions.size()));
    }

    private void createProjectTechs() {
        log.info("프로젝트 기술스택 데이터를 생성합니다.");

        // 프로젝트들을 조회
        Project project1 = projectRepository.findAll().get(0); // React + Spring Boot
        Project project2 = projectRepository.findAll().get(1); // 모바일 앱 UI/UX
        Project project3 = projectRepository.findAll().get(2); // AI 기반 데이터 분석
        Project project4 = projectRepository.findAll().get(3); // 블록체인 NFT
        Project project5 = projectRepository.findAll().get(4); // Vue.js 전자상거래

        // 프로젝트 1: React + Spring Boot 풀스택
        createProjectTech(project1.getId(), TechCategory.FRONTEND, "REACT");
        createProjectTech(project1.getId(), TechCategory.FRONTEND, "TYPESCRIPT");
        createProjectTech(project1.getId(), TechCategory.FRONTEND, "TAILWIND_CSS");
        createProjectTech(project1.getId(), TechCategory.BACKEND, "SPRING_BOOT");
        createProjectTech(project1.getId(), TechCategory.BACKEND, "JAVA");
        createProjectTech(project1.getId(), TechCategory.DATABASE, "MYSQL");

        // 프로젝트 2: 모바일 앱 UI/UX 디자인 (웹 기반 디자인 도구로 변경)
        createProjectTech(project2.getId(), TechCategory.FRONTEND, "HTML");
        createProjectTech(project2.getId(), TechCategory.FRONTEND, "CSS");
        createProjectTech(project2.getId(), TechCategory.FRONTEND, "JAVASCRIPT");

        // 프로젝트 3: AI 기반 데이터 분석
        createProjectTech(project3.getId(), TechCategory.BACKEND, "PYTHON");
        createProjectTech(project3.getId(), TechCategory.BACKEND, "DJANGO");
        createProjectTech(project3.getId(), TechCategory.BACKEND, "FAST_API");
        createProjectTech(project3.getId(), TechCategory.DATABASE, "POSTGRESQL");

        // 프로젝트 4: 블록체인 NFT 마켓플레이스 (웹 기반으로 변경)
        createProjectTech(project4.getId(), TechCategory.FRONTEND, "REACT");
        createProjectTech(project4.getId(), TechCategory.FRONTEND, "JAVASCRIPT");
        createProjectTech(project4.getId(), TechCategory.BACKEND, "NODE_JS");
        createProjectTech(project4.getId(), TechCategory.DATABASE, "MONGODB");

        // 프로젝트 5: Vue.js 전자상거래
        createProjectTech(project5.getId(), TechCategory.FRONTEND, "VUE");
        createProjectTech(project5.getId(), TechCategory.FRONTEND, "JAVASCRIPT");
        createProjectTech(project5.getId(), TechCategory.BACKEND, "NODE_JS");
        createProjectTech(project5.getId(), TechCategory.DATABASE, "MONGODB");

        // 나머지 프로젝트들도 기술스택 추가
        Project project6 = projectRepository.findAll().get(5); // 게임 캐릭터 일러스트
        Project project7 = projectRepository.findAll().get(6); // IoT 스마트홈
        Project project8 = projectRepository.findAll().get(7); // 마케팅 자동화
        Project project9 = projectRepository.findAll().get(8); // 오픈소스 LMS
        Project project10 = projectRepository.findAll().get(9); // Figma 플러그인

        // 프로젝트 6: 게임 캐릭터 일러스트 디자인
        createProjectTech(project6.getId(), TechCategory.FRONTEND, "HTML");
        createProjectTech(project6.getId(), TechCategory.FRONTEND, "CSS");
        createProjectTech(project6.getId(), TechCategory.FRONTEND, "JAVASCRIPT");

        // 프로젝트 7: IoT 스마트홈 시스템
        createProjectTech(project7.getId(), TechCategory.BACKEND, "PYTHON");
        createProjectTech(project7.getId(), TechCategory.BACKEND, "NODE_JS");
        createProjectTech(project7.getId(), TechCategory.DATABASE, "MYSQL");

        // 프로젝트 8: 마케팅 자동화 도구
        createProjectTech(project8.getId(), TechCategory.BACKEND, "NODE_JS");
        createProjectTech(project8.getId(), TechCategory.BACKEND, "EXPRESS");
        createProjectTech(project8.getId(), TechCategory.DATABASE, "POSTGRESQL");

        // 프로젝트 9: 오픈소스 LMS
        createProjectTech(project9.getId(), TechCategory.FRONTEND, "REACT");
        createProjectTech(project9.getId(), TechCategory.BACKEND, "SPRING_BOOT");
        createProjectTech(project9.getId(), TechCategory.BACKEND, "JAVA");
        createProjectTech(project9.getId(), TechCategory.DATABASE, "MYSQL");

        // 프로젝트 10: Figma 플러그인
        createProjectTech(project10.getId(), TechCategory.FRONTEND, "TYPESCRIPT");
        createProjectTech(project10.getId(), TechCategory.FRONTEND, "JAVASCRIPT");

        // Park-seungg의 추가 프로젝트들 기술스택 추가
        List<Project> allProjects = projectRepository.findAll();

        // 프로젝트 11: Flutter 헬스케어 앱
        createProjectTech(allProjects.get(10).getId(), TechCategory.FRONTEND, "HTML");
        createProjectTech(allProjects.get(10).getId(), TechCategory.FRONTEND, "CSS");
        createProjectTech(allProjects.get(10).getId(), TechCategory.FRONTEND, "JAVASCRIPT");
        createProjectTech(allProjects.get(10).getId(), TechCategory.DATABASE, "MYSQL");

        // 프로젝트 12: 온라인 교육 플랫폼
        createProjectTech(allProjects.get(11).getId(), TechCategory.FRONTEND, "REACT");
        createProjectTech(allProjects.get(11).getId(), TechCategory.FRONTEND, "TYPESCRIPT");
        createProjectTech(allProjects.get(11).getId(), TechCategory.BACKEND, "NODE_JS");
        createProjectTech(allProjects.get(11).getId(), TechCategory.DATABASE, "POSTGRESQL");

        // 프로젝트 13: 브랜드 아이덴티티 디자인
        createProjectTech(allProjects.get(12).getId(), TechCategory.FRONTEND, "HTML");
        createProjectTech(allProjects.get(12).getId(), TechCategory.FRONTEND, "CSS");
        createProjectTech(allProjects.get(12).getId(), TechCategory.FRONTEND, "JAVASCRIPT");

        // 프로젝트 14: 마이크로서비스 아키텍처
        createProjectTech(allProjects.get(13).getId(), TechCategory.BACKEND, "SPRING_BOOT");
        createProjectTech(allProjects.get(13).getId(), TechCategory.BACKEND, "JAVA");
        createProjectTech(allProjects.get(13).getId(), TechCategory.BACKEND, "PYTHON");
        createProjectTech(allProjects.get(13).getId(), TechCategory.DATABASE, "MYSQL");
        createProjectTech(allProjects.get(13).getId(), TechCategory.DATABASE, "POSTGRESQL");

        // 프로젝트 15: 2D 어드벤처 게임
        createProjectTech(allProjects.get(14).getId(), TechCategory.FRONTEND, "JAVASCRIPT");
        createProjectTech(allProjects.get(14).getId(), TechCategory.FRONTEND, "HTML");
        createProjectTech(allProjects.get(14).getId(), TechCategory.FRONTEND, "CSS");

        // 프로젝트 16: 클라우드 마이그레이션
        createProjectTech(allProjects.get(15).getId(), TechCategory.BACKEND, "PYTHON");
        createProjectTech(allProjects.get(15).getId(), TechCategory.BACKEND, "NODE_JS");
        createProjectTech(allProjects.get(15).getId(), TechCategory.DATABASE, "MYSQL");

        // 프로젝트 17: Next.js 포트폴리오
        createProjectTech(allProjects.get(16).getId(), TechCategory.FRONTEND, "REACT");
        createProjectTech(allProjects.get(16).getId(), TechCategory.FRONTEND, "TYPESCRIPT");
        createProjectTech(allProjects.get(16).getId(), TechCategory.FRONTEND, "TAILWIND_CSS");
        createProjectTech(allProjects.get(16).getId(), TechCategory.BACKEND, "NODE_JS");

        // 프로젝트 18: 데이터 시각화 대시보드
        createProjectTech(allProjects.get(17).getId(), TechCategory.FRONTEND, "REACT");
        createProjectTech(allProjects.get(17).getId(), TechCategory.FRONTEND, "JAVASCRIPT");
        createProjectTech(allProjects.get(17).getId(), TechCategory.BACKEND, "NODE_JS");
        createProjectTech(allProjects.get(17).getId(), TechCategory.DATABASE, "MONGODB");

        // 프로젝트 19: 소셜 미디어 관리 도구
        createProjectTech(allProjects.get(18).getId(), TechCategory.FRONTEND, "VUE");
        createProjectTech(allProjects.get(18).getId(), TechCategory.FRONTEND, "JAVASCRIPT");
        createProjectTech(allProjects.get(18).getId(), TechCategory.BACKEND, "EXPRESS");
        createProjectTech(allProjects.get(18).getId(), TechCategory.DATABASE, "POSTGRESQL");

        // 프로젝트 20: 디지털 마케팅 캠페인
        createProjectTech(allProjects.get(19).getId(), TechCategory.FRONTEND, "HTML");
        createProjectTech(allProjects.get(19).getId(), TechCategory.FRONTEND, "CSS");
        createProjectTech(allProjects.get(19).getId(), TechCategory.FRONTEND, "JAVASCRIPT");

        // 프로젝트 21: 크로스 플랫폼 모바일 앱
        createProjectTech(allProjects.get(20).getId(), TechCategory.FRONTEND, "REACT");
        createProjectTech(allProjects.get(20).getId(), TechCategory.FRONTEND, "JAVASCRIPT");
        createProjectTech(allProjects.get(20).getId(), TechCategory.BACKEND, "NODE_JS");
        createProjectTech(allProjects.get(20).getId(), TechCategory.DATABASE, "MONGODB");

        // 프로젝트 22: API 문서 자동화
        createProjectTech(allProjects.get(21).getId(), TechCategory.FRONTEND, "REACT");
        createProjectTech(allProjects.get(21).getId(), TechCategory.FRONTEND, "TYPESCRIPT");
        createProjectTech(allProjects.get(21).getId(), TechCategory.BACKEND, "SPRING_BOOT");
        createProjectTech(allProjects.get(21).getId(), TechCategory.DATABASE, "MYSQL");

        // 프로젝트 23: 웹 애니메이션 라이브러리
        createProjectTech(allProjects.get(22).getId(), TechCategory.FRONTEND, "JAVASCRIPT");
        createProjectTech(allProjects.get(22).getId(), TechCategory.FRONTEND, "CSS");
        createProjectTech(allProjects.get(22).getId(), TechCategory.FRONTEND, "HTML");

        // 프로젝트 24: AI 챗봇
        createProjectTech(allProjects.get(23).getId(), TechCategory.BACKEND, "PYTHON");
        createProjectTech(allProjects.get(23).getId(), TechCategory.BACKEND, "DJANGO");
        createProjectTech(allProjects.get(23).getId(), TechCategory.BACKEND, "FAST_API");
        createProjectTech(allProjects.get(23).getId(), TechCategory.DATABASE, "POSTGRESQL");

        // 프로젝트 25: 블록체인 투표 시스템
        createProjectTech(allProjects.get(24).getId(), TechCategory.FRONTEND, "REACT");
        createProjectTech(allProjects.get(24).getId(), TechCategory.FRONTEND, "JAVASCRIPT");
        createProjectTech(allProjects.get(24).getId(), TechCategory.BACKEND, "NODE_JS");
        createProjectTech(allProjects.get(24).getId(), TechCategory.DATABASE, "MONGODB");

        log.info("프로젝트 기술스택 데이터가 생성되었습니다.");
    }

    private void createProjectFiles() {
        // Park-seungg의 프로젝트들만 파일 추가
        Project project1 = projectRepository.findAll().get(0); // React + Spring Boot
        Project project2 = projectRepository.findAll().get(1); // 모바일 앱 UI/UX
        Project project3 = projectRepository.findAll().get(2); // AI 기반 데이터 분석
        Project project4 = projectRepository.findAll().get(3); // 블록체인 NFT
        Project project5 = projectRepository.findAll().get(4); // Vue.js 전자상거래

        // 프로젝트 1 파일들
        createProjectFile(project1.getId(), "프로젝트_제안서.docx", "proj1_proposal_20250915.docx",
                "/uploads/projects/1/", "application/docx", 2048000L, LocalDateTime.of(2025, 9, 15, 10, 0, 0));
        createProjectFile(project1.getId(), "계약서_샘플.docx", "proj1_contract_sample_20250916.docx",
                "/uploads/projects/1/", "application/docx", 1024000L, LocalDateTime.of(2025, 9, 16, 14, 0, 0));

        // 프로젝트 2 파일들
        createProjectFile(project2.getId(), "디자인_시안.pdf", "proj2_design_mockup_20250920.pdf",
                "/uploads/projects/2/", "application/pdf", 5242880L, LocalDateTime.of(2025, 9, 20, 11, 0, 0));
        createProjectFile(project2.getId(), "UI_스펙_문서.pdf", "proj2_ui_spec_20250921.pdf",
                "/uploads/projects/2/", "application/pdf", 3145728L, LocalDateTime.of(2025, 9, 21, 15, 30, 0));

        // 프로젝트 3 파일들
        createProjectFile(project3.getId(), "데이터셋_샘플.csv", "proj3_dataset_sample_20250925.csv",
                "/uploads/projects/3/", "text/csv", 10485760L, LocalDateTime.of(2025, 9, 25, 16, 30, 0));
        createProjectFile(project3.getId(), "분석_계획서.docx", "proj3_analysis_plan_20250926.docx",
                "/uploads/projects/3/", "application/docx", 1572864L, LocalDateTime.of(2025, 9, 26, 10, 0, 0));

        // 새로 추가된 Park-seungg 프로젝트들에 파일 추가
        List<Project> allProjects = projectRepository.findAll();

        // 프로젝트 11: Flutter 헬스케어 앱 파일
        createProjectFile(allProjects.get(10).getId(), "헬스케어_앱_기획서.pdf", "proj11_health_plan_20251001.pdf",
                "/uploads/projects/11/", "application/pdf", 3145728L, LocalDateTime.of(2025, 10, 1, 10, 0, 0));
        createProjectFile(allProjects.get(10).getId(), "UI_디자인_가이드.figma", "proj11_ui_guide_20251002.figma",
                "/uploads/projects/11/", "application/figma", 8388608L, LocalDateTime.of(2025, 10, 2, 14, 15, 0));

        // 프로젝트 12: 온라인 교육 플랫폼 파일
        createProjectFile(allProjects.get(11).getId(), "교육플랫폼_요구사항.docx", "proj12_requirements_20250815.docx",
                "/uploads/projects/12/", "application/docx", 2097152L, LocalDateTime.of(2025, 8, 15, 12, 0, 0));
        createProjectFile(allProjects.get(11).getId(), "시스템_아키텍처.png", "proj12_architecture_20250820.png",
                "/uploads/projects/12/", "image/png", 1048576L, LocalDateTime.of(2025, 8, 20, 16, 30, 0));

        // 프로젝트 13: 브랜드 아이덴티티 파일
        createProjectFile(allProjects.get(12).getId(), "브랜드_컨셉서.pdf", "proj13_brand_concept_20251008.pdf",
                "/uploads/projects/13/", "application/pdf", 4194304L, LocalDateTime.of(2025, 10, 8, 14, 0, 0));

        // 프로젝트 14: 마이크로서비스 아키텍처 파일
        createProjectFile(allProjects.get(13).getId(), "마이그레이션_계획서.pdf", "proj14_migration_plan_20250610.pdf",
                "/uploads/projects/14/", "application/pdf", 5242880L, LocalDateTime.of(2025, 6, 10, 9, 0, 0));
        createProjectFile(allProjects.get(13).getId(), "Docker_설정파일.yml", "proj14_docker_config_20250615.yml",
                "/uploads/projects/14/", "text/yaml", 51200L, LocalDateTime.of(2025, 6, 15, 11, 30, 0));

        // 프로젝트 15: 2D 어드벤처 게임 파일
        createProjectFile(allProjects.get(14).getId(), "게임_디자인_문서.pdf", "proj15_game_design_20250720.pdf",
                "/uploads/projects/15/", "application/pdf", 6291456L, LocalDateTime.of(2025, 7, 20, 16, 0, 0));
        createProjectFile(allProjects.get(14).getId(), "캐릭터_스프라이트.png", "proj15_character_sprite_20250725.png",
                "/uploads/projects/15/", "image/png", 2097152L, LocalDateTime.of(2025, 7, 25, 10, 45, 0));

        // 프로젝트 17: Next.js 포트폴리오 파일
        createProjectFile(allProjects.get(16).getId(), "포트폴리오_레이아웃.figma", "proj17_layout_20251001.figma",
                "/uploads/projects/17/", "application/figma", 3145728L, LocalDateTime.of(2025, 10, 1, 15, 20, 0));

        // 프로젝트 18: 데이터 시각화 대시보드 파일
        createProjectFile(allProjects.get(17).getId(), "대시보드_목업.png", "proj18_dashboard_mockup_20251003.png",
                "/uploads/projects/18/", "image/png", 4194304L, LocalDateTime.of(2025, 10, 3, 17, 0, 0));
        createProjectFile(allProjects.get(17).getId(), "데이터_스키마.sql", "proj18_data_schema_20251004.sql",
                "/uploads/projects/18/", "text/sql", 102400L, LocalDateTime.of(2025, 10, 4, 9, 30, 0));

        // 프로젝트 19: 소셜 미디어 관리 도구 파일
        createProjectFile(allProjects.get(18).getId(), "기능명세서.docx", "proj19_specification_20251006.docx",
                "/uploads/projects/19/", "application/docx", 1572864L, LocalDateTime.of(2025, 10, 6, 13, 15, 0));

        // 프로젝트 21: 크로스 플랫폼 모바일 앱 파일
        createProjectFile(allProjects.get(20).getId(), "앱_와이어프레임.pdf", "proj21_wireframe_20251002.pdf",
                "/uploads/projects/21/", "application/pdf", 2621440L, LocalDateTime.of(2025, 10, 2, 12, 30, 0));

        // 프로젝트 22: API 문서 자동화 파일
        createProjectFile(allProjects.get(21).getId(), "API_스펙_예시.json", "proj22_api_spec_example_20251004.json",
                "/uploads/projects/22/", "application/json", 204800L, LocalDateTime.of(2025, 10, 4, 16, 0, 0));

        // 프로젝트 24: AI 챗봇 파일
        createProjectFile(allProjects.get(23).getId(), "챗봇_학습데이터.csv", "proj24_training_data_20251005.csv",
                "/uploads/projects/24/", "text/csv", 15728640L, LocalDateTime.of(2025, 10, 5, 11, 0, 0));
        createProjectFile(allProjects.get(23).getId(), "NLP_모델_설계서.pdf", "proj24_nlp_model_20251006.pdf",
                "/uploads/projects/24/", "application/pdf", 3670016L, LocalDateTime.of(2025, 10, 6, 14, 20, 0));

        // 프로젝트 25: 블록체인 투표 시스템 파일
        createProjectFile(allProjects.get(24).getId(), "블록체인_아키텍처.pdf", "proj25_blockchain_arch_20251009.pdf",
                "/uploads/projects/25/", "application/pdf", 4718592L, LocalDateTime.of(2025, 10, 9, 17, 0, 0));
        createProjectFile(allProjects.get(24).getId(), "스마트컨트랙트_설계.sol", "proj25_smart_contract_20251010.sol",
                "/uploads/projects/25/", "text/solidity", 81920L, LocalDateTime.of(2025, 10, 10, 11, 15, 0));

        log.info("프로젝트 파일 데이터가 생성되었습니다.");
    }

    private void createProjectTech(Long projectId, TechCategory techCategory, String techName) {
        // Project 엔티티 조회
        Project project = projectRepository.findById(projectId).orElseThrow();

        ProjectTech projectTech = new ProjectTech(project, techCategory, techName);
        projectTechRepository.save(projectTech);
    }

    private void createProjectFile(Long projectId, String originalName, String storedName, String filePath,
                                   String fileType, Long fileSize, LocalDateTime uploadDate) {
        // Project 엔티티 조회
        Project project = projectRepository.findById(projectId).orElseThrow();

        ProjectFile projectFile = new ProjectFile(project, originalName, storedName, filePath, fileSize, fileType);
        projectFile.setUploadDate(uploadDate);
        projectFileRepository.save(projectFile);
    }

    private void createFreelancers() {
        log.info("프리랜서 데이터를 생성합니다.");

        // 기존 Member 조회
        Member user1 = memberRepository.findByUsername("Park-seungg").orElseThrow();
        Member user2 = memberRepository.findByUsername("developer1").orElseThrow();
        Member user3 = memberRepository.findByUsername("designer1").orElseThrow();
        Member user4 = memberRepository.findByUsername("iot_expert").orElseThrow();
        Member user5 = memberRepository.findByUsername("marketer1").orElseThrow();

        // 프리랜서 1: 풀스택 개발자 (React, Spring Boot, Java, MySQL - EXPERT)
        Freelancer freelancer1 = new Freelancer(
                user1,
                "풀스택 시니어 개발자",
                "개발",
                "서울",
                "10년 경력의 풀스택 개발자입니다. React, Spring Boot 전문입니다.",
                true,
                5000000,
                7000000,
                null
        );
        freelancer1.setRatingAvg(4.8);
        freelancer1.setCompletedProjectsCount(15);
        freelancer1.setReviewsCount(12);
        freelancerRepository.save(freelancer1);

        // 프리랜서 2: 프론트엔드 개발자 (React, TypeScript, Vue - ADVANCED)
        Freelancer freelancer2 = new Freelancer(
                user2,
                "프론트엔드 전문가",
                "개발",
                "경기",
                "5년 경력의 프론트엔드 개발자입니다. React, Vue 전문입니다.",
                false,
                3500000,
                5000000,
                null
        );
        freelancer2.setRatingAvg(4.5);
        freelancer2.setCompletedProjectsCount(8);
        freelancer2.setReviewsCount(7);
        freelancerRepository.save(freelancer2);

        // 프리랜서 3: 백엔드 개발자 (Spring Boot, Node.js, Python - EXPERT)
        Freelancer freelancer3 = new Freelancer(
                user3,
                "백엔드 아키텍트",
                "개발",
                "서울",
                "8년 경력의 백엔드 개발자입니다. Spring Boot, Node.js 전문입니다.",
                true,
                4500000,
                6500000,
                null
        );
        freelancer3.setRatingAvg(4.9);
        freelancer3.setCompletedProjectsCount(12);
        freelancer3.setReviewsCount(10);
        freelancerRepository.save(freelancer3);

        // 프리랜서 4: 웹 디자이너/개발자 (HTML, CSS, JavaScript - INTERMEDIATE)
        Freelancer freelancer4 = new Freelancer(
                user4,
                "웹 디자이너 겸 개발자",
                "디자인",
                "부산",
                "3년 경력의 웹 디자이너입니다. HTML, CSS, JavaScript를 다룹니다.",
                false,
                2500000,
                3500000,
                null
        );
        freelancer4.setRatingAvg(4.2);
        freelancer4.setCompletedProjectsCount(5);
        freelancer4.setReviewsCount(4);
        freelancerRepository.save(freelancer4);

        // 프리랜서 5: 데이터 엔지니어 (Python, Django, PostgreSQL - ADVANCED)
        Freelancer freelancer5 = new Freelancer(
                user5,
                "데이터 엔지니어",
                "개발",
                "대전",
                "6년 경력의 데이터 엔지니어입니다. Python, Django, PostgreSQL 전문입니다.",
                true,
                4000000,
                6000000,
                null
        );
        freelancer5.setRatingAvg(4.6);
        freelancer5.setCompletedProjectsCount(10);
        freelancer5.setReviewsCount(8);
        freelancerRepository.save(freelancer5);

        log.info("프리랜서 데이터 5건이 생성되었습니다.");
    }

    private void createFreelancerTechs() {
        log.info("프리랜서 기술스택 데이터를 생성합니다.");

        List<Freelancer> freelancers = freelancerRepository.findAll();
        Freelancer freelancer1 = freelancers.get(0);
        Freelancer freelancer2 = freelancers.get(1);
        Freelancer freelancer3 = freelancers.get(2);
        Freelancer freelancer4 = freelancers.get(3);
        Freelancer freelancer5 = freelancers.get(4);

        // 프리랜서 1: 풀스택 (React, Spring Boot, Java, MySQL)
        createFreelancerTech(freelancer1, "FRONTEND", "REACT", "EXPERT");
        createFreelancerTech(freelancer1, "FRONTEND", "TYPESCRIPT", "EXPERT");
        createFreelancerTech(freelancer1, "BACKEND", "SPRING_BOOT", "EXPERT");
        createFreelancerTech(freelancer1, "BACKEND", "JAVA", "EXPERT");
        createFreelancerTech(freelancer1, "DATABASE", "MYSQL", "ADVANCED");

        // 프리랜서 2: 프론트엔드 (React, TypeScript, Vue)
        createFreelancerTech(freelancer2, "FRONTEND", "REACT", "ADVANCED");
        createFreelancerTech(freelancer2, "FRONTEND", "TYPESCRIPT", "ADVANCED");
        createFreelancerTech(freelancer2, "FRONTEND", "VUE", "EXPERT");
        createFreelancerTech(freelancer2, "FRONTEND", "JAVASCRIPT", "ADVANCED");

        // 프리랜서 3: 백엔드 (Spring Boot, Node.js, Python)
        createFreelancerTech(freelancer3, "BACKEND", "SPRING_BOOT", "EXPERT");
        createFreelancerTech(freelancer3, "BACKEND", "JAVA", "EXPERT");
        createFreelancerTech(freelancer3, "BACKEND", "NODE_JS", "ADVANCED");
        createFreelancerTech(freelancer3, "BACKEND", "PYTHON", "ADVANCED");
        createFreelancerTech(freelancer3, "DATABASE", "MYSQL", "EXPERT");
        createFreelancerTech(freelancer3, "DATABASE", "POSTGRESQL", "ADVANCED");

        // 프리랜서 4: 웹 디자인 (HTML, CSS, JavaScript)
        createFreelancerTech(freelancer4, "FRONTEND", "HTML", "INTERMEDIATE");
        createFreelancerTech(freelancer4, "FRONTEND", "CSS", "INTERMEDIATE");
        createFreelancerTech(freelancer4, "FRONTEND", "JAVASCRIPT", "INTERMEDIATE");

        // 프리랜서 5: 데이터 엔지니어 (Python, Django, PostgreSQL)
        createFreelancerTech(freelancer5, "BACKEND", "PYTHON", "EXPERT");
        createFreelancerTech(freelancer5, "BACKEND", "DJANGO", "EXPERT");
        createFreelancerTech(freelancer5, "DATABASE", "POSTGRESQL", "EXPERT");
        createFreelancerTech(freelancer5, "BACKEND", "NODE_JS", "INTERMEDIATE");

        log.info("프리랜서 기술스택 데이터 생성이 완료되었습니다.");
    }

    private void createFreelancerTech(Freelancer freelancer, String techCategory, String techName, String techLevel) {
        // Tech 엔티티 조회 또는 생성
        Tech tech = techRepository.findByTechCategoryAndTechName(techCategory, techName)
                .orElseGet(() -> {
                    Tech newTech = new Tech();
                    newTech.setTechCategory(techCategory);
                    newTech.setTechName(techName);
                    return techRepository.save(newTech);
                });

        FreelancerTech freelancerTech = new FreelancerTech(freelancer, tech, techLevel);
        freelancerTechRepository.save(freelancerTech);
    }

    private void createProjectSubmissions() {
        log.info("프로젝트 지원 데이터를 생성합니다.");

        // 프리랜서와 RECRUITING 프로젝트 조회
        List<Freelancer> freelancers = freelancerRepository.findAll();
        List<Project> recruitingProjects = projectRepository.findAll().stream()
                .filter(p -> p.getStatus() == ProjectStatus.RECRUITING)
                .toList();

        if (freelancers.isEmpty() || recruitingProjects.isEmpty()) {
            log.warn("프리랜서 또는 모집중인 프로젝트가 없어 지원 데이터를 생성하지 않습니다.");
            return;
        }

        // 프리랜서 1 (Park-seungg): E커머스, 온라인 교육, IoT 프로젝트에 지원
        if (recruitingProjects.size() >= 3 && freelancers.size() >= 1) {
            createSubmission(recruitingProjects.get(0), freelancers.get(0),
                "10년 경력의 풀스택 개발자로 React와 Spring Boot에 전문성이 있습니다. E커머스 플랫폼 구축 경험이 풍부하며, MSA 아키텍처 설계 능력을 보유하고 있습니다.",
                5000000, 90, SubmissionStatus.ACCEPTED);

            createSubmission(recruitingProjects.get(3), freelancers.get(0),
                "온라인 교육 플랫폼 개발 경험이 있으며, WebRTC 통합 및 결제 시스템 구축에 능숙합니다.",
                5500000, 120, SubmissionStatus.PENDING);

            createSubmission(recruitingProjects.get(4), freelancers.get(0),
                "AWS IoT Core 및 Spring Boot를 활용한 센서 데이터 수집 시스템 구축 경험이 있습니다.",
                5200000, 150, SubmissionStatus.PENDING);
        }

        // 프리랜서 2 (developer1): 사내 인사관리, E커머스 프로젝트에 지원
        if (recruitingProjects.size() >= 2 && freelancers.size() >= 2) {
            createSubmission(recruitingProjects.get(1), freelancers.get(1),
                "React 및 TypeScript를 활용한 프론트엔드 개발 전문가입니다. 사용자 친화적인 UI/UX 구현에 강점이 있습니다.",
                4000000, 80, SubmissionStatus.PENDING);

            createSubmission(recruitingProjects.get(0), freelancers.get(1),
                "E커머스 플랫폼 프론트엔드 개발 경험이 풍부하며, React와 TypeScript를 능숙하게 다룹니다.",
                4200000, 90, SubmissionStatus.PENDING);
        }

        // 프리랜서 3 (designer1): 온라인 교육, 블록체인 NFT 프로젝트에 지원
        if (recruitingProjects.size() >= 5 && freelancers.size() >= 3) {
            createSubmission(recruitingProjects.get(3), freelancers.get(2),
                "Spring Boot와 Node.js를 활용한 백엔드 개발 전문가입니다. 대규모 트래픽 처리 경험이 있습니다.",
                6000000, 110, SubmissionStatus.ACCEPTED);

            createSubmission(recruitingProjects.get(6), freelancers.get(2),
                "블록체인 및 Web3.js 기술에 대한 이해도가 높으며, NFT 마켓플레이스 구축 경험이 있습니다.",
                6500000, 180, SubmissionStatus.PENDING);
        }

        // 프리랜서 4 (iot_expert): 모바일 앱 백엔드 API 구축 프로젝트에 지원
        if (recruitingProjects.size() >= 8 && freelancers.size() >= 4) {
            createSubmission(recruitingProjects.get(7), freelancers.get(3),
                "Node.js와 AWS 인프라 구축에 전문성이 있으며, RESTful API 설계 경험이 풍부합니다.",
                4500000, 90, SubmissionStatus.PENDING);
        }

        // 프리랜서 5 (marketer1): AI 챗봇 서비스, 헬스케어 모바일 앱 프로젝트에 지원
        if (recruitingProjects.size() >= 10 && freelancers.size() >= 5) {
            createSubmission(recruitingProjects.get(9), freelancers.get(4),
                "Python과 Django를 활용한 AI 서비스 개발 경험이 있으며, OpenAI API 통합에 능숙합니다.",
                5000000, 75, SubmissionStatus.PENDING);

            createSubmission(recruitingProjects.get(11), freelancers.get(4),
                "React Native 및 웨어러블 기기 연동 경험이 있으며, 헬스케어 도메인에 대한 이해도가 높습니다.",
                5200000, 130, SubmissionStatus.REJECTED);
        }

        log.info("프로젝트 지원 데이터 생성이 완료되었습니다.");
    }

    private void createSubmission(Project project, Freelancer freelancer, String coverLetter,
                                   Integer proposedRate, Integer estimatedDuration, SubmissionStatus status) {
        ProjectSubmission submission = new ProjectSubmission(
                project,
                freelancer,
                coverLetter,
                proposedRate,
                estimatedDuration,
                null  // portfolioData는 null로 설정
        );

        if (status != SubmissionStatus.PENDING) {
            submission.updateStatus(status);
        }

        projectSubmissionRepository.save(submission);
    }
}
