package com.back.domain.tech.entity;

import com.back.global.jpa.entity.BaseEntity;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor
public class Tech extends BaseEntity {
    private String techCategory;
    private String techName;
}
