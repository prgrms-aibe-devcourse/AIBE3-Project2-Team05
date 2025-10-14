package com.back.domain.project.entity.enums;

public enum Region {
    SEOUL("서울"),
    GYEONGGI("경기"),
    INCHEON("인천"),
    GANGWON("강원"),
    CHUNGNAM("충남"),
    DAEJEON("대전"),
    CHUNGBUK("충북"),
    SEJONG("세종"),
    BUSAN("부산"),
    ULSAN("울산"),
    DAEGU("대구"),
    GYEONGBUK("경북"),
    GYEONGNAM("경남"),
    JEONNAM("전남"),
    GWANGJU("광주"),
    JEONBUK("전북"),
    JEJU("제주"),
    OVERSEAS("국외");

    private final String description;

    Region(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
