package com.back.domain.tech.dto;

import com.back.domain.tech.entity.Tech;

public record TechDto (
    long id,
    String techCategory,
    String techName
) {
    public TechDto(Tech tech) {
        this(
                tech.getId(),
                tech.getTechCategory(),
                tech.getTechName()
        );
    }
}
