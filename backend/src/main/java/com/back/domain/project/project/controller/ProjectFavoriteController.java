package com.back.domain.project.project.controller;

import com.back.domain.project.project.service.ProjectFavoriteService;
import com.back.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects/favorites")
@RequiredArgsConstructor
@Slf4j
public class ProjectFavoriteController {

    private final ProjectFavoriteService projectFavoriteService;

    /**
     * 즐겨찾기 추가/제거 토글
     */
    @PostMapping("/{projectId}/toggle")
    public ResponseEntity<RsData<Map<String, Object>>> toggleFavorite(
            @PathVariable Long projectId,
            @RequestParam Long userId) {
        try {
            boolean isAdded = projectFavoriteService.toggleFavorite(userId, projectId);
            long favoriteCount = projectFavoriteService.getFavoriteCount(projectId);

            Map<String, Object> result = new HashMap<>();
            result.put("isFavorite", isAdded);
            result.put("favoriteCount", favoriteCount);
            result.put("message", isAdded ? "즐겨찾기에 추가되었습니다." : "즐겨찾기에서 제거되었습니다.");

            return ResponseEntity.ok(RsData.success(result));
        } catch (Exception e) {
            log.error("즐겨찾기 토글 실패: projectId={}, userId={}", projectId, userId, e);
            return ResponseEntity.badRequest()
                    .body(RsData.error("즐겨찾기 처리 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 즐겨찾기 상태 확인
     */
    @GetMapping("/{projectId}/status")
    public ResponseEntity<RsData<Map<String, Object>>> getFavoriteStatus(
            @PathVariable Long projectId,
            @RequestParam Long userId) {
        try {
            boolean isFavorite = projectFavoriteService.isFavorite(userId, projectId);
            long favoriteCount = projectFavoriteService.getFavoriteCount(projectId);

            Map<String, Object> result = new HashMap<>();
            result.put("isFavorite", isFavorite);
            result.put("favoriteCount", favoriteCount);

            return ResponseEntity.ok(RsData.success(result));
        } catch (Exception e) {
            log.error("즐겨찾기 상태 조회 실패: projectId={}, userId={}", projectId, userId, e);
            return ResponseEntity.badRequest()
                    .body(RsData.error("즐겨찾기 상태 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 사용자의 즐겨찾기 프로젝트 ID 목록 조회
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<RsData<List<Long>>> getUserFavoriteProjectIds(
            @PathVariable Long userId) {
        try {
            List<Long> favoriteProjectIds = projectFavoriteService.getFavoriteProjectIds(userId);
            return ResponseEntity.ok(RsData.success(favoriteProjectIds));
        } catch (Exception e) {
            log.error("사용자 즐겨찾기 목록 조회 실패: userId={}", userId, e);
            return ResponseEntity.badRequest()
                    .body(RsData.error("즐겨찾기 목록 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}
