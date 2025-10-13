package com.back.global.config;

import com.back.domain.user.entity.User;
import com.back.domain.user.repository.UserRepository;
import com.back.domain.project.project.entity.*;
import com.back.domain.project.project.entity.enums.*;
import com.back.domain.project.project.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
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

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectTechRepository projectTechRepository;
    private final ProjectFileRepository projectFileRepository;

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
        if (userRepository.count() > 0) {
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


        log.info("초기 데이터 삽입이 완료되었습니다.");
    }

    private void createUsers() {
        User user1 = User.builder()
                .username("Park-seungg")
                .email("park.seungg@example.com")
                .password("password123")
                .build();

        User user2 = User.builder()
                .username("developer1")
                .email("dev1@example.com")
                .password("password123")
                .build();

        User user3 = User.builder()
                .username("designer1")
                .email("designer1@example.com")
                .password("password123")
                .build();

        User user4 = User.builder()
                .username("iot_expert")
                .email("iot@example.com")
                .password("password123")
                .build();

        User user5 = User.builder()
                .username("marketer1")
                .email("marketing@example.com")
                .password("password123")
                .build();

        User user6 = User.builder()
                .username("opensource_dev")
                .email("opensource@example.com")
                .password("password123")
                .build();

        User user7 = User.builder()
                .username("plugin_dev")
                .email("plugin@example.com")
                .password("password123")
                .build();

        userRepository.save(user1);
        userRepository.save(user2);
        userRepository.save(user3);
        userRepository.save(user4);
        userRepository.save(user5);
        userRepository.save(user6);
        userRepository.save(user7);

        log.info("사용자 데이터 {} 건이 생성되었습니다.", 7);
    }

    private void createProjects() {
        // 사용자 조회 (ID는 Auto Increment로 자동 생성됨)
        User parkSeungg = userRepository.findByUsername("Park-seungg").orElseThrow();
        User developer1 = userRepository.findByUsername("developer1").orElseThrow();
        User designer1 = userRepository.findByUsername("designer1").orElseThrow();
        User iotExpert = userRepository.findByUsername("iot_expert").orElseThrow();
        User marketer1 = userRepository.findByUsername("marketer1").orElseThrow();
        User opensourceDev = userRepository.findByUsername("opensource_dev").orElseThrow();
        User pluginDev = userRepository.findByUsername("plugin_dev").orElseThrow();

        // Park-seungg의 프로젝트들
        Project project1 = Project.builder()
                .managerId(parkSeungg.getId())
                .title("React + Spring Boot 풀스택 웹사이트 개발")
                .description("모던 웹 기술을 활용한 반응형 웹사이트를 개발합니다. 사용자 친화적인 UI/UX와 안정적인 백엔드 API를 구축하여 완성도 높은 서비스를 만들어보세요.")
                .projectField(ProjectField.DEVELOPMENT)
                .recruitmentType(RecruitmentType.PROJECT_CONTRACT)
                .partnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER)
                .budgetType(BudgetRange.RANGE_300_500)
                .budgetAmount(4000000L)
                .progressStatus(ProgressStatus.DETAILED_PLAN)
                .companyLocation(getRandomRegion())
                .startDate(LocalDate.of(2025, 11, 1))
                .endDate(LocalDate.of(2025, 12, 31))
                .status(ProjectStatus.RECRUITING)
                .viewCount(1245)
                .applicantCount(15)
                .createDate(LocalDateTime.of(2025, 9, 15, 9, 30, 0))
                .modifyDate(LocalDateTime.of(2025, 9, 28, 14, 20, 0))
                .build();

        Project project2 = Project.builder()
                .managerId(parkSeungg.getId())
                .title("모바일 앱 UI/UX 디자인 프로젝트")
                .description("사용자 중심의 모바일 앱 디자인을 함께 만들어갈 디자이너를 찾습니다. 피그마를 활용한 프로토타이핑부터 최종 디자인 시스템까지 완성해보세요.")
                .projectField(ProjectField.DESIGN)
                .recruitmentType(RecruitmentType.PERSONAL_CONTRACT)
                .partnerType(PartnerType.INDIVIDUAL_FREELANCER)
                .budgetType(BudgetRange.RANGE_200_300)
                .budgetAmount(2500000L)
                .progressStatus(ProgressStatus.CONTENT_ORGANIZED)
                .companyLocation(getRandomRegion())
                .startDate(LocalDate.of(2025, 10, 15))
                .endDate(LocalDate.of(2025, 11, 30))
                .status(ProjectStatus.RECRUITING)
                .viewCount(892)
                .applicantCount(8)
                .createDate(LocalDateTime.of(2025, 9, 20, 11, 15, 0))
                .modifyDate(LocalDateTime.of(2025, 9, 30, 16, 45, 0))
                .build();

        Project project3 = Project.builder()
                .managerId(parkSeungg.getId())
                .title("AI 기반 데이터 분석 플랫폼")
                .description("머신러닝과 데이터 분석을 활용한 인사이트 도출 플랫폼을 개발합니다. Python, TensorFlow 등을 활용하여 혁신적인 솔루션을 만들어보세요.")
                .projectField(ProjectField.DEVELOPMENT)
                .recruitmentType(RecruitmentType.PROJECT_CONTRACT)
                .partnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER)
                .budgetType(BudgetRange.RANGE_500_1000)
                .budgetAmount(8000000L)
                .progressStatus(ProgressStatus.DETAILED_PLAN)
                .companyLocation(getRandomRegion())
                .startDate(LocalDate.of(2025, 10, 20))
                .endDate(LocalDate.of(2026, 1, 31))
                .status(ProjectStatus.CONTRACTING)
                .viewCount(654)
                .applicantCount(23)
                .createDate(LocalDateTime.of(2025, 9, 25, 13, 45, 0))
                .modifyDate(LocalDateTime.of(2025, 10, 1, 10, 30, 0))
                .build();

        Project project4 = Project.builder()
                .managerId(parkSeungg.getId())
                .title("블록체인 기반 NFT 마켓플레이스")
                .description("완료된 프로젝트입니다. Solidity와 Web3 기술을 활용하여 NFT 거래 플랫폼을 성공적으로 구축했습니다.")
                .projectField(ProjectField.DEVELOPMENT)
                .recruitmentType(RecruitmentType.PROJECT_CONTRACT)
                .partnerType(PartnerType.BUSINESS_TEAM_OR_COMPANY)
                .budgetType(BudgetRange.RANGE_1000_2000)
                .budgetAmount(15000000L)
                .progressStatus(ProgressStatus.DETAILED_PLAN)
                .companyLocation(getRandomRegion())
                .startDate(LocalDate.of(2025, 6, 1))
                .endDate(LocalDate.of(2025, 9, 30))
                .status(ProjectStatus.COMPLETED)
                .viewCount(2341)
                .applicantCount(47)
                .createDate(LocalDateTime.of(2025, 5, 15, 8, 0, 0))
                .modifyDate(LocalDateTime.of(2025, 9, 30, 18, 0, 0))
                .build();

        // 다른 사용자들의 프로젝트들
        Project project5 = Project.builder()
                .managerId(developer1.getId())
                .title("Vue.js로 만드는 전자상거래 플랫폼")
                .description("최신 Vue.js 3 기술을 활용하여 완전한 전자상거래 솔루션을 개발합니다. 결제 시스템부터 관리자 페이지까지 모든 기능을 포함합니다.")
                .projectField(ProjectField.DEVELOPMENT)
                .recruitmentType(RecruitmentType.PROJECT_CONTRACT)
                .partnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER)
                .budgetType(BudgetRange.RANGE_500_1000)
                .budgetAmount(7500000L)
                .progressStatus(ProgressStatus.DETAILED_PLAN)
                .companyLocation(getRandomRegion())
                .startDate(LocalDate.of(2025, 11, 15))
                .endDate(LocalDate.of(2026, 2, 28))
                .status(ProjectStatus.CONTRACTING)
                .viewCount(1876)
                .applicantCount(31)
                .createDate(LocalDateTime.of(2025, 9, 28, 10, 20, 0))
                .modifyDate(LocalDateTime.of(2025, 9, 30, 9, 15, 0))
                .build();

        Project project6 = Project.builder()
                .managerId(designer1.getId())
                .title("게임 캐릭터 일러스트 디자인")
                .description("모바일 RPG 게임의 캐릭터 일러스트와 UI 요소들을 디자인할 아티스트를 모집합니다. 판타지 스타일의 아트워크 경험이 있으면 좋습니다.")
                .projectField(ProjectField.DESIGN)
                .recruitmentType(RecruitmentType.PERSONAL_CONTRACT)
                .partnerType(PartnerType.INDIVIDUAL_FREELANCER)
                .budgetType(BudgetRange.RANGE_100_200)
                .budgetAmount(1500000L)
                .progressStatus(ProgressStatus.CONTENT_ORGANIZED)
                .companyLocation(getRandomRegion())
                .startDate(LocalDate.of(2025, 10, 10))
                .endDate(LocalDate.of(2025, 11, 20))
                .status(ProjectStatus.IN_PROGRESS)
                .viewCount(567)
                .applicantCount(12)
                .createDate(LocalDateTime.of(2025, 9, 22, 14, 30, 0))
                .modifyDate(LocalDateTime.of(2025, 9, 29, 11, 45, 0))
                .build();

        Project project7 = Project.builder()
                .managerId(iotExpert.getId())
                .title("IoT 스마트홈 시스템 개발")
                .description("Arduino와 Raspberry Pi를 활용한 스마트홈 자동화 시스템을 개발합니다. 모바일 앱과 연동하여 원격 제어가 가능한 시스템을 구축합니다.")
                .projectField(ProjectField.DEVELOPMENT)
                .recruitmentType(RecruitmentType.PROJECT_CONTRACT)
                .partnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER)
                .budgetType(BudgetRange.RANGE_300_500)
                .budgetAmount(4500000L)
                .progressStatus(ProgressStatus.DETAILED_PLAN)
                .companyLocation(getRandomRegion())
                .startDate(LocalDate.of(2025, 11, 1))
                .endDate(LocalDate.of(2025, 12, 15))
                .status(ProjectStatus.IN_PROGRESS)
                .viewCount(789)
                .applicantCount(19)
                .createDate(LocalDateTime.of(2025, 9, 26, 16, 0, 0))
                .modifyDate(LocalDateTime.of(2025, 9, 30, 13, 20, 0))
                .build();

        Project project8 = Project.builder()
                .managerId(marketer1.getId())
                .title("마케팅 자동화 도구 개발")
                .description("이메일 마케팅과 소셜미디어 관리를 자동화하는 SaaS 플랫폼을 개발합니다. API 연동과 스케줄링 시스템이 핵심 기능입니다.")
                .projectField(ProjectField.PLANNING)
                .recruitmentType(RecruitmentType.PROJECT_CONTRACT)
                .partnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER)
                .budgetType(BudgetRange.RANGE_200_300)
                .budgetAmount(2800000L)
                .progressStatus(ProgressStatus.IDEA_STAGE)
                .companyLocation(getRandomRegion())
                .startDate(LocalDate.of(2025, 10, 25))
                .endDate(LocalDate.of(2025, 12, 20))
                .status(ProjectStatus.SUSPENDED)
                .viewCount(432)
                .applicantCount(5)
                .createDate(LocalDateTime.of(2025, 9, 24, 12, 10, 0))
                .modifyDate(LocalDateTime.of(2025, 9, 28, 15, 30, 0))
                .build();

        Project project9 = Project.builder()
                .managerId(opensourceDev.getId())
                .title("무료 오픈소스 프로젝트 - 학습 관리 시스템")
                .description("교육기관을 위한 오픈소스 LMS를 함께 개발할 개발자들을 모집합니다. 사회적 가치 창출과 포트폴리오 구축을 동시에!")
                .projectField(ProjectField.DEVELOPMENT)
                .recruitmentType(RecruitmentType.PROJECT_CONTRACT)
                .partnerType(PartnerType.ANY_TYPE)
                .budgetType(BudgetRange.NEGOTIABLE)
                .budgetAmount(null)
                .progressStatus(ProgressStatus.CONTENT_ORGANIZED)
                .companyLocation(getRandomRegion())
                .startDate(LocalDate.of(2025, 10, 20))
                .endDate(LocalDate.of(2026, 3, 31))
                .status(ProjectStatus.SUSPENDED)
                .viewCount(1123)
                .applicantCount(3)
                .createDate(LocalDateTime.of(2025, 9, 18, 9, 45, 0))
                .modifyDate(LocalDateTime.of(2025, 9, 27, 17, 0, 0))
                .build();

        Project project10 = Project.builder()
                .managerId(pluginDev.getId())
                .title("Figma 플러그인 개발 프로젝트")
                .description("디자이너들의 작업 효율성을 높이는 Figma 플러그인을 개발합니다. TypeScript와 Figma API에 대한 이해가 필요합니다.")
                .projectField(ProjectField.DEVELOPMENT)
                .recruitmentType(RecruitmentType.PERSONAL_CONTRACT)
                .partnerType(PartnerType.INDIVIDUAL_FREELANCER)
                .budgetType(BudgetRange.RANGE_100_200)
                .budgetAmount(1200000L)
                .progressStatus(ProgressStatus.IDEA_STAGE)
                .companyLocation(getRandomRegion())
                .startDate(LocalDate.of(2025, 11, 5))
                .endDate(LocalDate.of(2025, 12, 10))
                .status(ProjectStatus.CANCELLED)
                .viewCount(345)
                .applicantCount(2)
                .createDate(LocalDateTime.of(2025, 9, 30, 11, 30, 0))
                .modifyDate(LocalDateTime.of(2025, 9, 30, 11, 30, 0))
                .build();

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
        Project project11 = Project.builder()
                .managerId(parkSeungg.getId())
                .title("Flutter 기반 모바일 헬스케어 앱")
                .description("개인 건강 관리를 위한 모바일 애플리케이션을 개발합니다. 운동 기록, 식단 관리, 건강 지표 추적 기능을 포함한 종합적인 헬스케어 솔루션입니다.")
                .projectField(ProjectField.DEVELOPMENT)
                .recruitmentType(RecruitmentType.PROJECT_CONTRACT)
                .partnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER)
                .budgetType(BudgetRange.RANGE_500_1000)
                .budgetAmount(6000000L)
                .progressStatus(ProgressStatus.DETAILED_PLAN)
                .companyLocation(Region.SEOUL)
                .startDate(LocalDate.of(2025, 11, 10))
                .endDate(LocalDate.of(2026, 2, 28))
                .status(ProjectStatus.CONTRACTING)
                .viewCount(423)
                .applicantCount(12)
                .createDate(LocalDateTime.of(2025, 10, 1, 9, 15, 0))
                .modifyDate(LocalDateTime.of(2025, 10, 5, 14, 30, 0))
                .build();

        Project project12 = Project.builder()
                .managerId(parkSeungg.getId())
                .title("웹 기반 온라인 교육 플랫폼")
                .description("실시간 화상 강의와 과제 관리 시스템이 통합된 교육 플랫폼을 개발합니다. 학생과 강사 모두 만족하는 사용자 경험을 제공합니다.")
                .projectField(ProjectField.DEVELOPMENT)
                .recruitmentType(RecruitmentType.PROJECT_CONTRACT)
                .partnerType(PartnerType.BUSINESS_TEAM_OR_COMPANY)
                .budgetType(BudgetRange.RANGE_1000_2000)
                .budgetAmount(12000000L)
                .progressStatus(ProgressStatus.CONTENT_ORGANIZED)
                .companyLocation(Region.GYEONGGI)
                .startDate(LocalDate.of(2025, 9, 1))
                .endDate(LocalDate.of(2025, 12, 31))
                .status(ProjectStatus.IN_PROGRESS)
                .viewCount(1876)
                .applicantCount(28)
                .createDate(LocalDateTime.of(2025, 8, 15, 11, 30, 0))
                .modifyDate(LocalDateTime.of(2025, 9, 20, 16, 45, 0))
                .build();

        Project project13 = Project.builder()
                .managerId(parkSeungg.getId())
                .title("브랜드 아이덴티티 디자인 프로젝트")
                .description("스타트업을 위한 전체적인 브랜드 아이덴티티를 디자인합니다. 로고, 명함, 웹사이트 디자인까지 일관성 있는 브랜드 경험을 만들어보세요.")
                .projectField(ProjectField.DESIGN)
                .recruitmentType(RecruitmentType.PERSONAL_CONTRACT)
                .partnerType(PartnerType.INDIVIDUAL_FREELANCER)
                .budgetType(BudgetRange.RANGE_200_300)
                .budgetAmount(2200000L)
                .progressStatus(ProgressStatus.IDEA_STAGE)
                .companyLocation(Region.INCHEON)
                .startDate(LocalDate.of(2025, 12, 1))
                .endDate(LocalDate.of(2026, 1, 15))
                .status(ProjectStatus.SUSPENDED)
                .viewCount(234)
                .applicantCount(3)
                .createDate(LocalDateTime.of(2025, 10, 8, 13, 20, 0))
                .modifyDate(LocalDateTime.of(2025, 10, 10, 10, 0, 0))
                .build();

        Project project14 = Project.builder()
                .managerId(parkSeungg.getId())
                .title("마이크로서비스 아키텍처 구축")
                .description("기존 모놀리식 시스템을 마이크로서비스로 전환하는 프로젝트입니다. Docker, Kubernetes를 활용한 현대적인 시스템 구축을 목표로 합니다.")
                .projectField(ProjectField.DEVELOPMENT)
                .recruitmentType(RecruitmentType.PROJECT_CONTRACT)
                .partnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER)
                .budgetType(BudgetRange.RANGE_2000_3000)
                .budgetAmount(25000000L)
                .progressStatus(ProgressStatus.DETAILED_PLAN)
                .companyLocation(Region.BUSAN)
                .startDate(LocalDate.of(2025, 7, 1))
                .endDate(LocalDate.of(2025, 10, 31))
                .status(ProjectStatus.COMPLETED)
                .viewCount(3421)
                .applicantCount(45)
                .createDate(LocalDateTime.of(2025, 6, 10, 8, 0, 0))
                .modifyDate(LocalDateTime.of(2025, 10, 31, 18, 0, 0))
                .build();

        Project project15 = Project.builder()
                .managerId(parkSeungg.getId())
                .title("게임 개발 프로젝트 - 2D 어드벤처")
                .description("Unity를 사용한 2D 어드벤처 게임을 개발합니다. 독창적인 스토리와 아름다운 픽셀 아트로 플레이어들에게 감동을 선사하는 게임을 만들어보세요.")
                .projectField(ProjectField.DEVELOPMENT)
                .recruitmentType(RecruitmentType.PROJECT_CONTRACT)
                .partnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER)
                .budgetType(BudgetRange.RANGE_300_500)
                .budgetAmount(4500000L)
                .progressStatus(ProgressStatus.CONTENT_ORGANIZED)
                .companyLocation(Region.DAEGU)
                .startDate(LocalDate.of(2025, 8, 15))
                .endDate(LocalDate.of(2025, 11, 30))
                .status(ProjectStatus.COMPLETED)
                .viewCount(2145)
                .applicantCount(32)
                .createDate(LocalDateTime.of(2025, 7, 20, 15, 30, 0))
                .modifyDate(LocalDateTime.of(2025, 11, 30, 17, 0, 0))
                .build();

        Project project16 = Project.builder()
                .managerId(parkSeungg.getId())
                .title("클라우드 마이그레이션 컨설팅")
                .description("온프레미스 인프라를 AWS 클라우드로 마이그레이션하는 컨설팅 프로젝트입니다. 비용 최적화와 성능 향상을 동시에 달성할 수 있도록 도와드립니다.")
                .projectField(ProjectField.PLANNING)
                .recruitmentType(RecruitmentType.PROJECT_CONTRACT)
                .partnerType(PartnerType.BUSINESS_TEAM_OR_COMPANY)
                .budgetType(BudgetRange.RANGE_1000_2000)
                .budgetAmount(15000000L)
                .progressStatus(ProgressStatus.IDEA_STAGE)
                .companyLocation(Region.GWANGJU)
                .startDate(LocalDate.of(2025, 11, 15))
                .endDate(LocalDate.of(2026, 2, 15))
                .status(ProjectStatus.CANCELLED)
                .viewCount(567)
                .applicantCount(8)
                .createDate(LocalDateTime.of(2025, 10, 5, 10, 45, 0))
                .modifyDate(LocalDateTime.of(2025, 10, 12, 9, 30, 0))
                .build();

        Project project17 = Project.builder()
                .managerId(parkSeungg.getId())
                .title("Next.js 기반 포트폴리오 사이트")
                .description("개발자와 디자이너를 위한 반응형 포트폴리오 웹사이트를 제작합니다. SEO 최적화와 성능을 고려한 모던 웹사이트를 구축합니다.")
                .projectField(ProjectField.DEVELOPMENT)
                .recruitmentType(RecruitmentType.PERSONAL_CONTRACT)
                .partnerType(PartnerType.INDIVIDUAL_FREELANCER)
                .budgetType(BudgetRange.RANGE_100_200)
                .budgetAmount(1800000L)
                .progressStatus(ProgressStatus.DETAILED_PLAN)
                .companyLocation(Region.DAEJEON)
                .startDate(LocalDate.of(2025, 10, 20))
                .endDate(LocalDate.of(2025, 11, 30))
                .status(ProjectStatus.RECRUITING)
                .viewCount(789)
                .applicantCount(14)
                .createDate(LocalDateTime.of(2025, 10, 1, 14, 0, 0))
                .modifyDate(LocalDateTime.of(2025, 10, 8, 11, 20, 0))
                .build();

        Project project18 = Project.builder()
                .managerId(parkSeungg.getId())
                .title("데이터 시각화 대시보드")
                .description("비즈니스 데이터를 한눈에 볼 수 있는 인터랙티브 대시보드를 개발합니다. D3.js와 Chart.js를 활용한 아름다운 데이터 시각화를 구현합니다.")
                .projectField(ProjectField.DEVELOPMENT)
                .recruitmentType(RecruitmentType.PROJECT_CONTRACT)
                .partnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER)
                .budgetType(BudgetRange.RANGE_300_500)
                .budgetAmount(3500000L)
                .progressStatus(ProgressStatus.CONTENT_ORGANIZED)
                .companyLocation(Region.ULSAN)
                .startDate(LocalDate.of(2025, 11, 1))
                .endDate(LocalDate.of(2025, 12, 20))
                .status(ProjectStatus.RECRUITING)
                .viewCount(1234)
                .applicantCount(19)
                .createDate(LocalDateTime.of(2025, 10, 3, 16, 15, 0))
                .modifyDate(LocalDateTime.of(2025, 10, 9, 13, 45, 0))
                .build();

        Project project19 = Project.builder()
                .managerId(parkSeungg.getId())
                .title("소셜 미디어 관리 도구")
                .description("여러 소셜 미디어 플랫폼을 한번에 관리할 수 있는 통합 관리 도구를 개발합니다. 예약 포스팅, 분석 기능 등을 포함합니다.")
                .projectField(ProjectField.DEVELOPMENT)
                .recruitmentType(RecruitmentType.PROJECT_CONTRACT)
                .partnerType(PartnerType.BUSINESS_TEAM_OR_COMPANY)
                .budgetType(BudgetRange.RANGE_500_1000)
                .budgetAmount(7500000L)
                .progressStatus(ProgressStatus.DETAILED_PLAN)
                .companyLocation(Region.GANGWON)
                .startDate(LocalDate.of(2025, 12, 1))
                .endDate(LocalDate.of(2026, 3, 31))
                .status(ProjectStatus.RECRUITING)
                .viewCount(945)
                .applicantCount(22)
                .createDate(LocalDateTime.of(2025, 10, 6, 12, 30, 0))
                .modifyDate(LocalDateTime.of(2025, 10, 11, 15, 0, 0))
                .build();

        Project project20 = Project.builder()
                .managerId(parkSeungg.getId())
                .title("디지털 마케팅 캠페인 기획")
                .description("브랜드 인지도 향상을 위한 종합적인 디지털 마케팅 전략을 수립합니다. SNS, 콘텐츠 마케팅, 인플루언서 마케팅을 통합한 캠페인을 기획합니다.")
                .projectField(ProjectField.DEVELOPMENT)
                .recruitmentType(RecruitmentType.PERSONAL_CONTRACT)
                .partnerType(PartnerType.INDIVIDUAL_FREELANCER)
                .budgetType(BudgetRange.RANGE_200_300)
                .budgetAmount(2800000L)
                .progressStatus(ProgressStatus.IDEA_STAGE)
                .companyLocation(Region.CHUNGNAM)
                .startDate(LocalDate.of(2025, 11, 20))
                .endDate(LocalDate.of(2026, 1, 20))
                .status(ProjectStatus.CANCELLED)
                .viewCount(432)
                .applicantCount(6)
                .createDate(LocalDateTime.of(2025, 10, 8, 9, 0, 0))
                .modifyDate(LocalDateTime.of(2025, 10, 13, 14, 15, 0))
                .build();

        Project project21 = Project.builder()
                .managerId(parkSeungg.getId())
                .title("크로스 플랫폼 모바일 앱")
                .description("React Native를 활용한 iOS/Android 동시 지원 앱을 개발합니다. 네이티브 성능을 유지하면서도 개발 효율성을 극대화한 앱을 만들어보세요.")
                .projectField(ProjectField.DEVELOPMENT)
                .recruitmentType(RecruitmentType.PROJECT_CONTRACT)
                .partnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER)
                .budgetType(BudgetRange.RANGE_500_1000)
                .budgetAmount(8500000L)
                .progressStatus(ProgressStatus.DETAILED_PLAN)
                .companyLocation(Region.CHUNGBUK)
                .startDate(LocalDate.of(2025, 10, 25))
                .endDate(LocalDate.of(2026, 1, 25))
                .status(ProjectStatus.RECRUITING)
                .viewCount(1567)
                .applicantCount(25)
                .createDate(LocalDateTime.of(2025, 10, 2, 11, 45, 0))
                .modifyDate(LocalDateTime.of(2025, 10, 10, 16, 30, 0))
                .build();

        Project project22 = Project.builder()
                .managerId(parkSeungg.getId())
                .title("API 문서 자동화 시스템")
                .description("OpenAPI 스펙을 활용한 API 문서 자동 생성 및 관리 시스템을 개발합니다. 개발자 생산성 향상에 기여하는 도구를 만들어보세요.")
                .projectField(ProjectField.DEVELOPMENT)
                .recruitmentType(RecruitmentType.PROJECT_CONTRACT)
                .partnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER)
                .budgetType(BudgetRange.RANGE_300_500)
                .budgetAmount(4200000L)
                .progressStatus(ProgressStatus.CONTENT_ORGANIZED)
                .companyLocation(Region.SEJONG)
                .startDate(LocalDate.of(2025, 11, 5))
                .endDate(LocalDate.of(2025, 12, 31))
                .status(ProjectStatus.RECRUITING)
                .viewCount(678)
                .applicantCount(11)
                .createDate(LocalDateTime.of(2025, 10, 4, 15, 30, 0))
                .modifyDate(LocalDateTime.of(2025, 10, 12, 10, 20, 0))
                .build();

        Project project23 = Project.builder()
                .managerId(parkSeungg.getId())
                .title("웹 애니메이션 라이브러리")
                .description("CSS3와 JavaScript를 활용한 고성능 웹 애니메이션 라이브러리를 개발합니다. 사용하기 쉽고 확장 가능한 애니메이션 솔루션을 만들어보세요.")
                .projectField(ProjectField.DEVELOPMENT)
                .recruitmentType(RecruitmentType.PERSONAL_CONTRACT)
                .partnerType(PartnerType.INDIVIDUAL_FREELANCER)
                .budgetType(BudgetRange.RANGE_200_300)
                .budgetAmount(2500000L)
                .progressStatus(ProgressStatus.DETAILED_PLAN)
                .companyLocation(getRandomRegion())
                .startDate(LocalDate.of(2025, 10, 30))
                .endDate(LocalDate.of(2025, 12, 15))
                .status(ProjectStatus.RECRUITING)
                .viewCount(456)
                .applicantCount(9)
                .createDate(LocalDateTime.of(2025, 10, 7, 13, 15, 0))
                .modifyDate(LocalDateTime.of(2025, 10, 14, 12, 0, 0))
                .build();

        Project project24 = Project.builder()
                .managerId(parkSeungg.getId())
                .title("AI 챗봇 개발 프로젝트")
                .description("자연어 처리 기술을 활용한 고도화된 챗봇을 개발합니다. 고객 서비스 자동화와 사용자 만족도 향상을 목표로 하는 프로젝트입니다.")
                .projectField(ProjectField.DEVELOPMENT)
                .recruitmentType(RecruitmentType.PROJECT_CONTRACT)
                .partnerType(PartnerType.BUSINESS_TEAM_OR_COMPANY)
                .budgetType(BudgetRange.RANGE_1000_2000)
                .budgetAmount(18000000L)
                .progressStatus(ProgressStatus.CONTENT_ORGANIZED)
                .companyLocation(Region.GYEONGNAM)
                .startDate(LocalDate.of(2025, 11, 10))
                .endDate(LocalDate.of(2026, 2, 10))
                .status(ProjectStatus.RECRUITING)
                .viewCount(2134)
                .applicantCount(38)
                .createDate(LocalDateTime.of(2025, 10, 5, 10, 0, 0))
                .modifyDate(LocalDateTime.of(2025, 10, 15, 14, 45, 0))
                .build();

        Project project25 = Project.builder()
                .managerId(parkSeungg.getId())
                .title("블록체인 투표 시스템")
                .description("투명하고 안전한 온라인 투표 시스템을 블록체인 기술로 구현합니다. 탈중앙화된 투표 프로세스로 신뢰성 있는 결과를 보장합니다.")
                .projectField(ProjectField.DEVELOPMENT)
                .recruitmentType(RecruitmentType.PROJECT_CONTRACT)
                .partnerType(PartnerType.INDIVIDUAL_OR_TEAM_FREELANCER)
                .budgetType(BudgetRange.RANGE_500_1000)
                .budgetAmount(9500000L)
                .progressStatus(ProgressStatus.DETAILED_PLAN)
                .companyLocation(Region.JEONNAM)
                .startDate(LocalDate.of(2025, 12, 5))
                .endDate(LocalDate.of(2026, 3, 15))
                .status(ProjectStatus.RECRUITING)
                .viewCount(834)
                .applicantCount(16)
                .createDate(LocalDateTime.of(2025, 10, 9, 16, 20, 0))
                .modifyDate(LocalDateTime.of(2025, 10, 16, 11, 30, 0))
                .build();

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

        log.info("프로젝트 데이터 {} 건이 생성되었습니다.", 25);
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
        ProjectTech projectTech = ProjectTech.builder()
                .projectId(projectId)
                .techCategory(techCategory)
                .techName(techName)
                .createDate(LocalDateTime.now())
                .build();
        projectTechRepository.save(projectTech);
    }

    private void createProjectFile(Long projectId, String originalName, String storedName, String filePath,
                                   String fileType, Long fileSize, LocalDateTime uploadDate) {
        ProjectFile projectFile = ProjectFile.builder()
                .projectId(projectId)
                .originalName(originalName)
                .storedName(storedName)
                .filePath(filePath)
                .fileType(fileType)
                .fileSize(fileSize)
                .uploadDate(uploadDate)
                .build();
        projectFileRepository.save(projectFile);
    }
}
