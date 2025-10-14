package com.back.domain.project.util;

import com.back.domain.project.entity.enums.TechCategory;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

/**
 * 기술스택 이름을 카테고리로 매핑하는 유틸리티 클래스
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class TechCategoryMapper {

    private static final Map<String, TechCategory> TECH_CATEGORY_MAP = new HashMap<>();

    static {
        // Frontend 기술스택
        TECH_CATEGORY_MAP.put("REACT", TechCategory.FRONTEND);
        TECH_CATEGORY_MAP.put("VUE", TechCategory.FRONTEND);
        TECH_CATEGORY_MAP.put("ANGULAR", TechCategory.FRONTEND);
        TECH_CATEGORY_MAP.put("JAVASCRIPT", TechCategory.FRONTEND);
        TECH_CATEGORY_MAP.put("TYPESCRIPT", TechCategory.FRONTEND);
        TECH_CATEGORY_MAP.put("HTML", TechCategory.FRONTEND);
        TECH_CATEGORY_MAP.put("CSS", TechCategory.FRONTEND);
        TECH_CATEGORY_MAP.put("SASS", TechCategory.FRONTEND);
        TECH_CATEGORY_MAP.put("TAILWIND_CSS", TechCategory.FRONTEND);
        TECH_CATEGORY_MAP.put("NEXT_JS", TechCategory.FRONTEND);
        TECH_CATEGORY_MAP.put("NUXT_JS", TechCategory.FRONTEND);
        TECH_CATEGORY_MAP.put("SVELTE", TechCategory.FRONTEND);

        // Backend 기술스택
        TECH_CATEGORY_MAP.put("SPRING_BOOT", TechCategory.BACKEND);
        TECH_CATEGORY_MAP.put("SPRING", TechCategory.BACKEND);
        TECH_CATEGORY_MAP.put("NODE_JS", TechCategory.BACKEND);
        TECH_CATEGORY_MAP.put("EXPRESS", TechCategory.BACKEND);
        TECH_CATEGORY_MAP.put("DJANGO", TechCategory.BACKEND);
        TECH_CATEGORY_MAP.put("FLASK", TechCategory.BACKEND);
        TECH_CATEGORY_MAP.put("FAST_API", TechCategory.BACKEND);
        TECH_CATEGORY_MAP.put("JAVA", TechCategory.BACKEND);
        TECH_CATEGORY_MAP.put("PYTHON", TechCategory.BACKEND);
        TECH_CATEGORY_MAP.put("KOTLIN", TechCategory.BACKEND);
        TECH_CATEGORY_MAP.put("GO", TechCategory.BACKEND);
        TECH_CATEGORY_MAP.put("RUST", TechCategory.BACKEND);
        TECH_CATEGORY_MAP.put("PHP", TechCategory.BACKEND);
        TECH_CATEGORY_MAP.put("LARAVEL", TechCategory.BACKEND);
        TECH_CATEGORY_MAP.put("NEST_JS", TechCategory.BACKEND);

        // Database 기술스택
        TECH_CATEGORY_MAP.put("MYSQL", TechCategory.DATABASE);
        TECH_CATEGORY_MAP.put("POSTGRESQL", TechCategory.DATABASE);
        TECH_CATEGORY_MAP.put("MONGODB", TechCategory.DATABASE);
        TECH_CATEGORY_MAP.put("REDIS", TechCategory.DATABASE);
        TECH_CATEGORY_MAP.put("ORACLE", TechCategory.DATABASE);
        TECH_CATEGORY_MAP.put("MSSQL", TechCategory.DATABASE);
        TECH_CATEGORY_MAP.put("SQLITE", TechCategory.DATABASE);
        TECH_CATEGORY_MAP.put("MARIADB", TechCategory.DATABASE);
        TECH_CATEGORY_MAP.put("ELASTICSEARCH", TechCategory.DATABASE);
        TECH_CATEGORY_MAP.put("FIREBASE", TechCategory.DATABASE);
    }

    /**
     * 기술스택 이름으로 카테고리를 조회
     * @param techName 기술스택 이름
     * @return 매핑된 카테고리, 없으면 BACKEND를 기본값으로 반환
     */
    public static TechCategory getCategoryByTechName(String techName) {
        if (techName == null || techName.trim().isEmpty()) {
            return TechCategory.BACKEND; // 기본값
        }

        // 대소문자 구분 없이 매핑
        return TECH_CATEGORY_MAP.getOrDefault(techName.toUpperCase(), TechCategory.BACKEND);
    }

    /**
     * 기술스택 이름이 매핑되어 있는지 확인
     * @param techName 기술스택 이름
     * @return 매핑 존재 여부
     */
    public static boolean isMappedTech(String techName) {
        if (techName == null || techName.trim().isEmpty()) {
            return false;
        }
        return TECH_CATEGORY_MAP.containsKey(techName.toUpperCase());
    }
}
