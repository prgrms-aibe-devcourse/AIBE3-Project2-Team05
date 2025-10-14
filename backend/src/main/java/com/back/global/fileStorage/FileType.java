package com.back.global.fileStorage;

public enum FileType {
    PROFILE("profile_images"),
    PORTFOLIO("portfolio_images");

    private final String subDir;

    FileType(String subDir) {
        this.subDir = subDir;
    }

    public String getSubDir() {
        return subDir;
    }
}
