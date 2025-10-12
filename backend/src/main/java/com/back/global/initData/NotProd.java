package com.back.global.initData;

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
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 개발 환경 초기 데이터 생성
 */
@Configuration
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class NotProd {
    private final MemberRepository memberRepository;
    private final FreelancerRepository freelancerRepository;
    private final TechRepository techRepository;
    private final FreelancerTechRepository freelancerTechRepository;
    private final ProjectRepository projectRepository;
    private final ProjectTechRepository projectTechRepository;

    @Bean
    public ApplicationRunner initNotProd() {
        return args -> {
            if (memberRepository.count() > 0) {
                log.info("Already have data. Skipping initialization.");
                return;
            }

            initData();
        };
    }

    @Transactional
    public void initData() {
        log.info("Starting test data initialization...");

        // 1. 회원 데이터
        Member freelancer1Member = memberRepository.save(
                new Member("freelancer1", "$2a$10$abcdefghijklmnopqrstuvwxyz12345", "김개발", "freelancer1@test.com")
        );

        Member freelancer2Member = memberRepository.save(
                new Member("freelancer2", "$2a$10$abcdefghijklmnopqrstuvwxyz12345", "이디자인", "freelancer2@test.com")
        );

        Member freelancer3Member = memberRepository.save(
                new Member("freelancer3", "$2a$10$abcdefghijklmnopqrstuvwxyz12345", "박풀스택", "freelancer3@test.com")
        );

        Member clientMember1 = memberRepository.save(
                new Member("client1", "$2a$10$abcdefghijklmnopqrstuvwxyz12345", "스타트업대표", "client1@test.com")
        );

        Member clientMember2 = memberRepository.save(
                new Member("client2", "$2a$10$abcdefghijklmnopqrstuvwxyz12345", "기업PM", "client2@test.com")
        );

        log.info("Created {} members", memberRepository.count());

        // 2. 기술 마스터 데이터
        Tech react = techRepository.save(new Tech("Frontend", "React"));
        Tech vue = techRepository.save(new Tech("Frontend", "Vue.js"));
        Tech typescript = techRepository.save(new Tech("Frontend", "TypeScript"));
        Tech springBoot = techRepository.save(new Tech("Backend", "Spring Boot"));
        Tech nodejs = techRepository.save(new Tech("Backend", "Node.js"));
        Tech java = techRepository.save(new Tech("Backend", "Java"));
        Tech mysql = techRepository.save(new Tech("Database", "MySQL"));
        Tech postgresql = techRepository.save(new Tech("Database", "PostgreSQL"));
        Tech docker = techRepository.save(new Tech("DevOps", "Docker"));
        Tech aws = techRepository.save(new Tech("DevOps", "AWS"));

        log.info("Created {} technologies", techRepository.count());

        // 3. 프리랜서 프로필
        Freelancer freelancer1 = freelancerRepository.save(
                new Freelancer(
                        freelancer1Member,
                        "김개발",
                        "FULLSTACK",
                        "5년차 풀스택 개발자입니다. Spring Boot와 React를 주로 사용합니다.",
                        5,
                        5000000,
                        7000000
                )
        );
        freelancer1.updateRating(new BigDecimal("4.80"), 12);

        Freelancer freelancer2 = freelancerRepository.save(
                new Freelancer(
                        freelancer2Member,
                        "이디자인",
                        "FRONTEND",
                        "프론트엔드 전문 개발자. Vue.js와 React 경험 풍부.",
                        3,
                        4000000,
                        5500000
                )
        );
        freelancer2.updateRating(new BigDecimal("4.50"), 8);

        Freelancer freelancer3 = freelancerRepository.save(
                new Freelancer(
                        freelancer3Member,
                        "박풀스택",
                        "FULLSTACK",
                        "백엔드부터 인프라까지 전문. Java, Spring, AWS 경험 7년.",
                        7,
                        6000000,
                        9000000
                )
        );
        freelancer3.updateRating(new BigDecimal("4.90"), 20);

        log.info("Created {} freelancers", freelancerRepository.count());

        // 4. 프리랜서 기술 스택
        // 김개발
        freelancerTechRepository.save(new FreelancerTech(freelancer1, react, "ADVANCED", 4));
        freelancerTechRepository.save(new FreelancerTech(freelancer1, typescript, "ADVANCED", 3));
        freelancerTechRepository.save(new FreelancerTech(freelancer1, springBoot, "EXPERT", 5));
        freelancerTechRepository.save(new FreelancerTech(freelancer1, java, "EXPERT", 5));
        freelancerTechRepository.save(new FreelancerTech(freelancer1, mysql, "ADVANCED", 4));
        freelancerTechRepository.save(new FreelancerTech(freelancer1, docker, "INTERMEDIATE", 2));

        // 이디자인
        freelancerTechRepository.save(new FreelancerTech(freelancer2, react, "EXPERT", 3));
        freelancerTechRepository.save(new FreelancerTech(freelancer2, vue, "ADVANCED", 2));
        freelancerTechRepository.save(new FreelancerTech(freelancer2, typescript, "ADVANCED", 3));

        // 박풀스택
        freelancerTechRepository.save(new FreelancerTech(freelancer3, springBoot, "EXPERT", 7));
        freelancerTechRepository.save(new FreelancerTech(freelancer3, java, "EXPERT", 7));
        freelancerTechRepository.save(new FreelancerTech(freelancer3, mysql, "EXPERT", 6));
        freelancerTechRepository.save(new FreelancerTech(freelancer3, postgresql, "ADVANCED", 5));
        freelancerTechRepository.save(new FreelancerTech(freelancer3, docker, "EXPERT", 5));
        freelancerTechRepository.save(new FreelancerTech(freelancer3, aws, "EXPERT", 6));

        log.info("Created {} freelancer technologies", freelancerTechRepository.count());

        // 5. 프로젝트 데이터
        Project project1 = projectRepository.save(
                new Project(
                        clientMember1,
                        "E커머스 플랫폼 개발",
                        "쇼핑몰 풀스택 개발 프로젝트입니다. React + Spring Boot 스택 사용. 3개월 예상.",
                        "WEB",
                        new BigDecimal("15000000"),
                        LocalDate.of(2025, 11, 1),
                        LocalDate.of(2026, 1, 31)
                )
        );

        Project project2 = projectRepository.save(
                new Project(
                        clientMember2,
                        "모바일 앱 백엔드 API 구축",
                        "Node.js 또는 Spring Boot로 RESTful API 개발. AWS 인프라 구축 포함.",
                        "BACKEND",
                        new BigDecimal("12000000"),
                        LocalDate.of(2025, 11, 15),
                        LocalDate.of(2026, 2, 15)
                )
        );

        log.info("Created {} projects", projectRepository.count());

        // 6. 프로젝트 요구 기술
        // 프로젝트 1: E커머스
        projectTechRepository.save(new ProjectTech(project1, react, true));
        projectTechRepository.save(new ProjectTech(project1, typescript, false));
        projectTechRepository.save(new ProjectTech(project1, springBoot, true));
        projectTechRepository.save(new ProjectTech(project1, mysql, true));
        projectTechRepository.save(new ProjectTech(project1, docker, false));

        // 프로젝트 2: 백엔드 API
        projectTechRepository.save(new ProjectTech(project2, springBoot, true));
        projectTechRepository.save(new ProjectTech(project2, java, true));
        projectTechRepository.save(new ProjectTech(project2, postgresql, false));
        projectTechRepository.save(new ProjectTech(project2, aws, true));

        log.info("Created {} project technologies", projectTechRepository.count());

        log.info("Test data initialization completed!");
        log.info("=".repeat(50));
        log.info("Test Accounts:");
        log.info("Freelancers: freelancer1, freelancer2, freelancer3 (password: test)");
        log.info("Clients: client1, client2 (password: test)");
        log.info("=".repeat(50));
    }
}
