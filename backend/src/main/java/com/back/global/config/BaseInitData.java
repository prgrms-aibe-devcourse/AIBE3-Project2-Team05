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
    private final ProjectFavoriteRepository projectFavoriteRepository;
    private final ProjectStatusHistoryRepository projectStatusHistoryRepository;
    private final ProjectFileRepository projectFileRepository;

    // 지역 목록
    private final List<String> regions = Arrays.asList(
        "서울", "경기", "인천", "강원", "충남", "대전", "충북", "세종",
        "부산", "울산", "대구", "경북", "경남", "전남", "광주", "전북", "제주", "국외"
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

        // 프로젝트 즐겨찾기 데이터 생성
        createProjectFavorites();

        // 프로젝트 상태 변경 이력 데이터 생성
        createProjectStatusHistories();

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

        log.info("프로젝트 데이터 {} 건이 생성되었습니다.", 10);
    }

    // 랜덤 지역 선택 메서드 추가
    private String getRandomRegion() {
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

        log.info("프로젝트 기술스택 데이터가 생성되었습니다.");
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

    private void createProjectFavorites() {
        // 사용자들 조회
        User parkSeungg = userRepository.findByUsername("Park-seungg").orElseThrow();
        User developer1 = userRepository.findByUsername("developer1").orElseThrow();
        User designer1 = userRepository.findByUsername("designer1").orElseThrow();
        User iotExpert = userRepository.findByUsername("iot_expert").orElseThrow();
        User marketer1 = userRepository.findByUsername("marketer1").orElseThrow();
        User opensourceDev = userRepository.findByUsername("opensource_dev").orElseThrow();
        User pluginDev = userRepository.findByUsername("plugin_dev").orElseThrow();

        // 프로젝트들 조회
        Project project1 = projectRepository.findAll().get(0);
        Project project2 = projectRepository.findAll().get(1);
        Project project3 = projectRepository.findAll().get(2);
        Project project4 = projectRepository.findAll().get(3);
        Project project5 = projectRepository.findAll().get(4);
        Project project7 = projectRepository.findAll().get(6);
        Project project9 = projectRepository.findAll().get(8);

        // Park-seungg이 다른 프로젝트들을 즐겨찾기
        createProjectFavorite(parkSeungg.getId(), project5.getId(), LocalDateTime.of(2025, 9, 28, 15, 30, 0));
        createProjectFavorite(parkSeungg.getId(), project7.getId(), LocalDateTime.of(2025, 9, 26, 20, 15, 0));
        createProjectFavorite(parkSeungg.getId(), project9.getId(), LocalDateTime.of(2025, 9, 27, 18, 30, 0));

        // 다른 사용자들이 Park-seungg의 프로젝트를 즐겨찾기
        createProjectFavorite(developer1.getId(), project1.getId(), LocalDateTime.of(2025, 9, 16, 10, 20, 0));
        createProjectFavorite(designer1.getId(), project1.getId(), LocalDateTime.of(2025, 9, 18, 14, 45, 0));
        createProjectFavorite(iotExpert.getId(), project1.getId(), LocalDateTime.of(2025, 9, 20, 9, 30, 0));
        createProjectFavorite(marketer1.getId(), project2.getId(), LocalDateTime.of(2025, 9, 21, 11, 15, 0));
        createProjectFavorite(opensourceDev.getId(), project3.getId(), LocalDateTime.of(2025, 9, 26, 16, 20, 0));
        createProjectFavorite(pluginDev.getId(), project4.getId(), LocalDateTime.of(2025, 9, 30, 13, 40, 0));

        log.info("프로젝트 즐겨찾기 데이터가 생성되었습니다.");
    }

    private void createProjectFavorite(Long userId, Long projectId, LocalDateTime createDate) {
        ProjectFavorite favorite = ProjectFavorite.builder()
                .userId(userId)
                .projectId(projectId)
                .createDate(createDate)
                .build();
        projectFavoriteRepository.save(favorite);
    }

    private void createProjectStatusHistories() {
        // 사용자들 조회
        User parkSeungg = userRepository.findByUsername("Park-seungg").orElseThrow();
        User developer1 = userRepository.findByUsername("developer1").orElseThrow();
        User designer1 = userRepository.findByUsername("designer1").orElseThrow();
        User iotExpert = userRepository.findByUsername("iot_expert").orElseThrow();
        User marketer1 = userRepository.findByUsername("marketer1").orElseThrow();
        User opensourceDev = userRepository.findByUsername("opensource_dev").orElseThrow();
        User pluginDev = userRepository.findByUsername("plugin_dev").orElseThrow();

        // 프로젝트들 조회
        Project project1 = projectRepository.findAll().get(0);
        Project project2 = projectRepository.findAll().get(1);
        Project project3 = projectRepository.findAll().get(2);
        Project project4 = projectRepository.findAll().get(3);
        Project project5 = projectRepository.findAll().get(4);
        Project project6 = projectRepository.findAll().get(5);
        Project project7 = projectRepository.findAll().get(6);
        Project project8 = projectRepository.findAll().get(7);
        Project project9 = projectRepository.findAll().get(8);
        Project project10 = projectRepository.findAll().get(9);

        // Park-seungg의 프로젝트 상태 변경 이력
        createStatusHistory(project1.getId(), null, ProjectStatus.RECRUITING, parkSeungg.getId(), LocalDateTime.of(2025, 9, 15, 9, 30, 0));
        createStatusHistory(project2.getId(), null, ProjectStatus.RECRUITING, parkSeungg.getId(), LocalDateTime.of(2025, 9, 20, 11, 15, 0));
        createStatusHistory(project3.getId(), null, ProjectStatus.RECRUITING, parkSeungg.getId(), LocalDateTime.of(2025, 9, 25, 13, 45, 0));

        // 프로젝트 4 이력 (완료된 프로젝트)
        createStatusHistory(project4.getId(), null, ProjectStatus.RECRUITING, parkSeungg.getId(), LocalDateTime.of(2025, 5, 15, 8, 0, 0));
        createStatusHistory(project4.getId(), ProjectStatus.RECRUITING, ProjectStatus.IN_PROGRESS, parkSeungg.getId(), LocalDateTime.of(2025, 6, 1, 9, 0, 0));
        createStatusHistory(project4.getId(), ProjectStatus.IN_PROGRESS, ProjectStatus.COMPLETED, parkSeungg.getId(), LocalDateTime.of(2025, 9, 30, 18, 0, 0));

        // 다른 프로젝트들 초기 상태
        createStatusHistory(project5.getId(), null, ProjectStatus.RECRUITING, developer1.getId(), LocalDateTime.of(2025, 9, 28, 10, 20, 0));
        createStatusHistory(project6.getId(), null, ProjectStatus.RECRUITING, designer1.getId(), LocalDateTime.of(2025, 9, 22, 14, 30, 0));
        createStatusHistory(project7.getId(), null, ProjectStatus.RECRUITING, iotExpert.getId(), LocalDateTime.of(2025, 9, 26, 16, 0, 0));
        createStatusHistory(project8.getId(), null, ProjectStatus.RECRUITING, marketer1.getId(), LocalDateTime.of(2025, 9, 24, 12, 10, 0));
        createStatusHistory(project9.getId(), null, ProjectStatus.RECRUITING, opensourceDev.getId(), LocalDateTime.of(2025, 9, 18, 9, 45, 0));
        createStatusHistory(project10.getId(), null, ProjectStatus.RECRUITING, pluginDev.getId(), LocalDateTime.of(2025, 9, 30, 11, 30, 0));

        log.info("프로젝트 상태 변경 이력 데이터가 생성되었습니다.");
    }

    // 수정된 메서드: ProjectStatus enum 타입으로 직접 저장
    private void createStatusHistory(Long projectId, ProjectStatus previousStatus, ProjectStatus currentStatus, Long changedById, LocalDateTime changeDate) {
        ProjectStatusHistory history = ProjectStatusHistory.builder()
                .projectId(projectId)
                .previousStatus(previousStatus) // enum 직접 저장
                .currentStatus(currentStatus)   // enum 직접 저장
                .changedById(changedById)
                .changeDate(changeDate)
                .build();
        projectStatusHistoryRepository.save(history);
    }

    private void createProjectFiles() {
        // Park-seungg의 프로젝트들만 파일 추가
        Project project1 = projectRepository.findAll().get(0); // React + Spring Boot
        Project project2 = projectRepository.findAll().get(1); // 모바일 앱 UI/UX
        Project project3 = projectRepository.findAll().get(2); // AI 기반 데이터 분석

        // 프로젝트 1 파일들
        createProjectFile(project1.getId(), "프로젝트_요구사항_정의서.pdf", "proj1_requirements_20250915.pdf",
                "/uploads/projects/1/", "application/pdf", 2048576L, LocalDateTime.of(2025, 9, 15, 10, 0, 0));
        createProjectFile(project1.getId(), "화면설계서.figma", "proj1_wireframe_20250916.figma",
                "/uploads/projects/1/", "application/figma", 5242880L, LocalDateTime.of(2025, 9, 16, 14, 30, 0));
        createProjectFile(project1.getId(), "API_문서.md", "proj1_api_docs_20250918.md",
                "/uploads/projects/1/", "text/markdown", 81920L, LocalDateTime.of(2025, 9, 18, 11, 15, 0));

        // 프로젝트 2 파일들
        createProjectFile(project2.getId(), "디자인_가이드라인.pdf", "proj2_design_guide_20250920.pdf",
                "/uploads/projects/2/", "application/pdf", 3145728L, LocalDateTime.of(2025, 9, 20, 15, 20, 0));
        createProjectFile(project2.getId(), "컬러팔레트.png", "proj2_colors_20250921.png",
                "/uploads/projects/2/", "image/png", 204800L, LocalDateTime.of(2025, 9, 21, 9, 45, 0));

        // 프로젝트 3 파일들
        createProjectFile(project3.getId(), "데이터셋_샘플.csv", "proj3_dataset_sample_20250925.csv",
                "/uploads/projects/3/", "text/csv", 10485760L, LocalDateTime.of(2025, 9, 25, 16, 30, 0));
        createProjectFile(project3.getId(), "분석_계획서.docx", "proj3_analysis_plan_20250926.docx",
                "/uploads/projects/3/", "application/docx", 1572864L, LocalDateTime.of(2025, 9, 26, 10, 0, 0));

        log.info("프로젝트 파일 데이터가 생성되었습니다.");
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
