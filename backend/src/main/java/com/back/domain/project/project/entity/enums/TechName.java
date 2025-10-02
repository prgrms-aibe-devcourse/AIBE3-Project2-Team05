package com.back.domain.project.project.entity.enums;

public enum TechName {
    // Frontend
    REACT("React"),
    VUE("Vue.js"),
    ANGULAR("Angular"),
    JAVASCRIPT("JavaScript"),
    TYPESCRIPT("TypeScript"),
    HTML("HTML"),
    CSS("CSS"),
    SASS("Sass"),
    TAILWIND_CSS("Tailwind CSS"),
    NEXT_JS("Next.js"),
    NUXT_JS("Nuxt.js"),
    SVELTE("Svelte"),

    // Backend
    SPRING_BOOT("Spring Boot"),
    SPRING("Spring"),
    NODE_JS("Node.js"),
    EXPRESS("Express.js"),
    DJANGO("Django"),
    FLASK("Flask"),
    FAST_API("FastAPI"),
    JAVA("Java"),
    PYTHON("Python"),
    KOTLIN("Kotlin"),
    GO("Go"),
    RUST("Rust"),
    PHP("PHP"),
    LARAVEL("Laravel"),
    NEST_JS("NestJS"),

    // Database
    MYSQL("MySQL"),
    POSTGRESQL("PostgreSQL"),
    MONGODB("MongoDB"),
    REDIS("Redis"),
    ORACLE("Oracle"),
    MSSQL("MS SQL"),
    SQLITE("SQLite"),
    MARIADB("MariaDB"),
    ELASTICSEARCH("Elasticsearch"),
    FIREBASE("Firebase");

    private final String displayName;

    TechName(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}