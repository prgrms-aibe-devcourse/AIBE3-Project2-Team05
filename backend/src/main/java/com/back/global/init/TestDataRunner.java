package com.back.global.init;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.freelancer.freelancerTech.entity.FreelancerTech;
import com.back.domain.freelancer.freelancerTech.repository.FreelancerTechRepository;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.repository.MemberRepository;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.repository.ProjectRepository;
import com.back.domain.project.projectTech.entity.ProjectTech;
import com.back.domain.project.projectTech.repository.ProjectTechRepository;
import com.back.domain.tech.tech.entity.Tech;
import com.back.domain.tech.tech.repository.TechRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * 테스트 데이터 생성 Runner
 * 애플리케이션 시작 시 자동으로 실행되어 테스트 데이터를 생성합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TestDataRunner implements ApplicationRunner {

    private final MemberRepository memberRepository;
    private final TechRepository techRepository;
    private final ProjectRepository projectRepository;
    private final FreelancerRepository freelancerRepository;
    private final ProjectTechRepository projectTechRepository;
    private final FreelancerTechRepository freelancerTechRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("=== 테스트 데이터 생성 시작 ===");

        // 이미 데이터가 있으면 건너뛰기
        if (memberRepository.count() > 0) {
            log.info("테스트 데이터가 이미 존재합니다. 건너뜁니다.");
            return;
        }

        try {
            // 1. 기술 스택 마스터 데이터 생성
            List<Tech> techs = createTechs();
            log.info("기술 스택 {}개 생성 완료", techs.size());

            // 2. 회원 생성 (PM 2명 + 프리랜서 회원 5명)
            List<Member> pms = createPMs();
            List<Member> freelancerMembers = createFreelancerMembers();
            log.info("PM {} 명, 프리랜서 회원 {}명 생성 완료", pms.size(), freelancerMembers.size());

            // 3. 프리랜서 프로필 생성
            List<Freelancer> freelancers = createFreelancers(freelancerMembers);
            log.info("프리랜서 {}명 생성 완료", freelancers.size());

            // 4. 프리랜서 보유 기술 생성
            createFreelancerTechs(freelancers, techs);
            log.info("프리랜서 보유 기술 생성 완료");

            // 5. 프로젝트 생성
            List<Project> projects = createProjects(pms);
            log.info("프로젝트 {}개 생성 완료", projects.size());

            // 6. 프로젝트 요구 기술 생성
            createProjectTechs(projects, techs);
            log.info("프로젝트 요구 기술 생성 완료");

            log.info("=== 테스트 데이터 생성 완료 ===");
        } catch (Exception e) {
            log.error("테스트 데이터 생성 중 오류 발생", e);
            throw e;
        }
    }

    /**
     * 기술 스택 마스터 데이터 생성
     */
    private List<Tech> createTechs() {
        List<Tech> techs = new ArrayList<>();

        // Frontend
        techs.add(new Tech("Frontend", "React"));
        techs.add(new Tech("Frontend", "Vue.js"));
        techs.add(new Tech("Frontend", "Angular"));
        techs.add(new Tech("Frontend", "Next.js"));
        techs.add(new Tech("Frontend", "TypeScript"));

        // Backend
        techs.add(new Tech("Backend", "Spring Boot"));
        techs.add(new Tech("Backend", "Node.js"));
        techs.add(new Tech("Backend", "Express"));
        techs.add(new Tech("Backend", "Django"));
        techs.add(new Tech("Backend", "FastAPI"));
        techs.add(new Tech("Backend", "Java"));
        techs.add(new Tech("Backend", "Python"));

        // Database
        techs.add(new Tech("Database", "MySQL"));
        techs.add(new Tech("Database", "PostgreSQL"));
        techs.add(new Tech("Database", "MongoDB"));
        techs.add(new Tech("Database", "Redis"));

        // DevOps
        techs.add(new Tech("DevOps", "AWS"));
        techs.add(new Tech("DevOps", "Docker"));
        techs.add(new Tech("DevOps", "Kubernetes"));
        techs.add(new Tech("DevOps", "Jenkins"));

        return techs.stream().map(techRepository::save).toList();
    }

    /**
     * PM 회원 생성
     */
    private List<Member> createPMs() {
        List<Member> pms = new ArrayList<>();

        pms.add(new Member("pm1", "password", "김프로", "pm1@fit.com"));
        pms.add(new Member("pm2", "password", "이매니저", "pm2@fit.com"));

        return pms.stream().map(memberRepository::save).toList();
    }

    /**
     * 프리랜서 회원 생성
     */
    private List<Member> createFreelancerMembers() {
        List<Member> members = new ArrayList<>();

        members.add(new Member("freelancer1", "password", "홍개발", "freelancer1@fit.com"));
        members.add(new Member("freelancer2", "password", "김풀스택", "freelancer2@fit.com"));
        members.add(new Member("freelancer3", "password", "박프론트", "freelancer3@fit.com"));
        members.add(new Member("freelancer4", "password", "이백엔드", "freelancer4@fit.com"));
        members.add(new Member("freelancer5", "password", "최데브옵스", "freelancer5@fit.com"));

        return members.stream().map(memberRepository::save).toList();
    }

    /**
     * 프리랜서 프로필 생성
     */
    private List<Freelancer> createFreelancers(List<Member> members) {
        List<Freelancer> freelancers = new ArrayList<>();

        // 1. 홍개발 - 풀스택 10년 경력, 고급
        Freelancer freelancer1 = new Freelancer(
                members.get(0),
                "홍개발",
                "개인",
                "10년 경력의 풀스택 개발자입니다. React, Spring Boot 전문가입니다.",
                10,
                150000,
                200000
        );
        freelancer1.updateRating(new BigDecimal("4.8"), 15);
        freelancers.add(freelancer1);

        // 2. 김풀스택 - 풀스택 7년 경력
        Freelancer freelancer2 = new Freelancer(
                members.get(1),
                "김풀스택",
                "개인",
                "7년 경력의 풀스택 개발자입니다. Vue.js, Node.js에 능숙합니다.",
                7,
                120000,
                180000
        );
        freelancer2.updateRating(new BigDecimal("4.5"), 10);
        freelancers.add(freelancer2);

        // 3. 박프론트 - 프론트엔드 5년 경력
        Freelancer freelancer3 = new Freelancer(
                members.get(2),
                "박프론트",
                "개인",
                "5년 경력의 프론트엔드 전문 개발자입니다. React, TypeScript 전문입니다.",
                5,
                100000,
                150000
        );
        freelancer3.updateRating(new BigDecimal("4.7"), 8);
        freelancers.add(freelancer3);

        // 4. 이백엔드 - 백엔드 8년 경력
        Freelancer freelancer4 = new Freelancer(
                members.get(3),
                "이백엔드",
                "개인",
                "8년 경력의 백엔드 전문 개발자입니다. Spring Boot, Python 전문입니다.",
                8,
                130000,
                190000
        );
        freelancer4.updateRating(new BigDecimal("4.6"), 12);
        freelancers.add(freelancer4);

        // 5. 최데브옵스 - DevOps 6년 경력
        Freelancer freelancer5 = new Freelancer(
                members.get(4),
                "최데브옵스",
                "개인",
                "6년 경력의 DevOps 엔지니어입니다. AWS, Docker, Kubernetes 전문입니다.",
                6,
                140000,
                200000
        );
        freelancer5.updateRating(new BigDecimal("4.9"), 9);
        freelancers.add(freelancer5);

        return freelancers.stream().map(freelancerRepository::save).toList();
    }

    /**
     * 프리랜서 보유 기술 생성
     */
    private void createFreelancerTechs(List<Freelancer> freelancers, List<Tech> techs) {
        Tech react = findTech(techs, "React");
        Tech springBoot = findTech(techs, "Spring Boot");
        Tech vue = findTech(techs, "Vue.js");
        Tech nodejs = findTech(techs, "Node.js");
        Tech typescript = findTech(techs, "TypeScript");
        Tech python = findTech(techs, "Python");
        Tech mysql = findTech(techs, "MySQL");
        Tech aws = findTech(techs, "AWS");
        Tech docker = findTech(techs, "Docker");
        Tech kubernetes = findTech(techs, "Kubernetes");

        // 홍개발 - 풀스택
        freelancerTechRepository.save(new FreelancerTech(freelancers.get(0), react, "EXPERT", 8));
        freelancerTechRepository.save(new FreelancerTech(freelancers.get(0), springBoot, "EXPERT", 10));
        freelancerTechRepository.save(new FreelancerTech(freelancers.get(0), typescript, "ADVANCED", 6));
        freelancerTechRepository.save(new FreelancerTech(freelancers.get(0), mysql, "ADVANCED", 8));

        // 김풀스택
        freelancerTechRepository.save(new FreelancerTech(freelancers.get(1), vue, "EXPERT", 7));
        freelancerTechRepository.save(new FreelancerTech(freelancers.get(1), nodejs, "EXPERT", 7));
        freelancerTechRepository.save(new FreelancerTech(freelancers.get(1), typescript, "ADVANCED", 5));
        freelancerTechRepository.save(new FreelancerTech(freelancers.get(1), mysql, "INTERMEDIATE", 4));

        // 박프론트
        freelancerTechRepository.save(new FreelancerTech(freelancers.get(2), react, "EXPERT", 5));
        freelancerTechRepository.save(new FreelancerTech(freelancers.get(2), typescript, "EXPERT", 5));
        freelancerTechRepository.save(new FreelancerTech(freelancers.get(2), vue, "INTERMEDIATE", 3));

        // 이백엔드
        freelancerTechRepository.save(new FreelancerTech(freelancers.get(3), springBoot, "EXPERT", 8));
        freelancerTechRepository.save(new FreelancerTech(freelancers.get(3), python, "ADVANCED", 6));
        freelancerTechRepository.save(new FreelancerTech(freelancers.get(3), mysql, "EXPERT", 7));
        freelancerTechRepository.save(new FreelancerTech(freelancers.get(3), aws, "INTERMEDIATE", 4));

        // 최데브옵스
        freelancerTechRepository.save(new FreelancerTech(freelancers.get(4), aws, "EXPERT", 6));
        freelancerTechRepository.save(new FreelancerTech(freelancers.get(4), docker, "EXPERT", 6));
        freelancerTechRepository.save(new FreelancerTech(freelancers.get(4), kubernetes, "ADVANCED", 5));
        freelancerTechRepository.save(new FreelancerTech(freelancers.get(4), nodejs, "INTERMEDIATE", 3));
    }

    /**
     * 프로젝트 생성
     */
    private List<Project> createProjects(List<Member> pms) {
        List<Project> projects = new ArrayList<>();

        // 프로젝트 1: React + Spring Boot 웹 서비스
        projects.add(new Project(
                pms.get(0),
                "전자상거래 플랫폼 개발",
                "React와 Spring Boot를 활용한 전자상거래 플랫폼 개발 프로젝트입니다. " +
                        "사용자 관리, 상품 관리, 주문 및 결제 시스템이 필요합니다.",
                "전자상거래",
                new BigDecimal("150000"),
                LocalDate.now().plusDays(7),
                LocalDate.now().plusMonths(3)
        ));

        // 프로젝트 2: Vue.js + Node.js SaaS 서비스
        projects.add(new Project(
                pms.get(0),
                "SaaS 대시보드 개발",
                "Vue.js와 Node.js를 활용한 실시간 모니터링 대시보드 개발입니다. " +
                        "데이터 시각화와 알림 기능이 필요합니다.",
                "SaaS",
                new BigDecimal("120000"),
                LocalDate.now().plusDays(14),
                LocalDate.now().plusMonths(2)
        ));

        // 프로젝트 3: DevOps 인프라 구축
        projects.add(new Project(
                pms.get(1),
                "클라우드 인프라 구축 프로젝트",
                "AWS 기반 Kubernetes 클러스터 구축 및 CI/CD 파이프라인 구성입니다. " +
                        "Docker 컨테이너화와 자동화가 필요합니다.",
                "DevOps",
                new BigDecimal("180000"),
                LocalDate.now().plusDays(10),
                LocalDate.now().plusMonths(2)
        ));

        return projects.stream().map(projectRepository::save).toList();
    }

    /**
     * 프로젝트 요구 기술 생성
     */
    private void createProjectTechs(List<Project> projects, List<Tech> techs) {
        Tech react = findTech(techs, "React");
        Tech springBoot = findTech(techs, "Spring Boot");
        Tech typescript = findTech(techs, "TypeScript");
        Tech vue = findTech(techs, "Vue.js");
        Tech nodejs = findTech(techs, "Node.js");
        Tech mysql = findTech(techs, "MySQL");
        Tech aws = findTech(techs, "AWS");
        Tech docker = findTech(techs, "Docker");
        Tech kubernetes = findTech(techs, "Kubernetes");

        // 프로젝트 1: React + Spring Boot
        projectTechRepository.save(new ProjectTech(projects.get(0), react, true));
        projectTechRepository.save(new ProjectTech(projects.get(0), springBoot, true));
        projectTechRepository.save(new ProjectTech(projects.get(0), typescript, false));
        projectTechRepository.save(new ProjectTech(projects.get(0), mysql, true));

        // 프로젝트 2: Vue.js + Node.js
        projectTechRepository.save(new ProjectTech(projects.get(1), vue, true));
        projectTechRepository.save(new ProjectTech(projects.get(1), nodejs, true));
        projectTechRepository.save(new ProjectTech(projects.get(1), typescript, true));
        projectTechRepository.save(new ProjectTech(projects.get(1), mysql, false));

        // 프로젝트 3: DevOps
        projectTechRepository.save(new ProjectTech(projects.get(2), aws, true));
        projectTechRepository.save(new ProjectTech(projects.get(2), docker, true));
        projectTechRepository.save(new ProjectTech(projects.get(2), kubernetes, true));
    }

    /**
     * 기술 이름으로 Tech 찾기
     */
    private Tech findTech(List<Tech> techs, String name) {
        return techs.stream()
                .filter(tech -> tech.getName().equals(name))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("기술을 찾을 수 없습니다: " + name));
    }
}
