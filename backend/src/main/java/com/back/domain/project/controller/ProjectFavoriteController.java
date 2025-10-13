package com.back.domain.project.controller;

import com.back.domain.project.service.ProjectFavoriteService;
import com.back.global.rsData.RsData;
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
@CrossOrigin(origins = "*")
public class ProjectFavoriteController {

    private final ProjectFavoriteService projectFavoriteService;

    /**
     * 즐겨찾기 추가/제거 토글
     */
    @PostMapping("/{projectId}/toggle")
    public ResponseEntity<RsData<Map<String, Object>>> toggleFavorite(
            @PathVariable Long projectId,
            @RequestParam Long memberId) {
        try {
            boolean isAdded = projectFavoriteService.toggleFavorite(memberId, projectId);
            long favoriteCount = projectFavoriteService.getFavoriteCount(projectId);

            Map<String, Object> result = new HashMap<>();
            result.put("isFavorite", isAdded);
            result.put("favoriteCount", favoriteCount);
            result.put("message", isAdded ? "즐겨찾기에 추가되었습니다." : "즐겨찾기에서 제거되었습니다.");

            return ResponseEntity.ok(new RsData<>("200-1", "성공", result));
        } catch (Exception e) {
            log.error("즐겨찾기 토글 실패: projectId={}, memberId={}", projectId, memberId, e);
            return ResponseEntity.badRequest()
                    .body(new RsData<>("400-1", "즐겨찾기 처리 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 즐겨찾기 상태 확인
     */
    @GetMapping("/{projectId}/status")
    public ResponseEntity<RsData<Map<String, Object>>> getFavoriteStatus(
            @PathVariable Long projectId,
            @RequestParam Long memberId) {
        try {
            boolean isFavorite = projectFavoriteService.isFavorite(memberId, projectId);
            long favoriteCount = projectFavoriteService.getFavoriteCount(projectId);

            Map<String, Object> result = new HashMap<>();
            result.put("isFavorite", isFavorite);
            result.put("favoriteCount", favoriteCount);

            return ResponseEntity.ok(new RsData<>("200-1", "성공", result));
        } catch (Exception e) {
            log.error("즐겨찾기 상태 조회 실패: projectId={}, memberId={}", projectId, memberId, e);
            return ResponseEntity.badRequest()
                    .body(new RsData<>("400-1", "즐겨찾기 상태 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 사용자의 즐겨찾기 프로젝트 ID 목록 조회
     */
    @GetMapping("/member/{memberId}")
    public ResponseEntity<RsData<List<Long>>> getMemberFavoriteProjectIds(
            @PathVariable Long memberId) {
        try {
            List<Long> favoriteProjectIds = projectFavoriteService.getFavoriteProjectIds(memberId);
            return ResponseEntity.ok(new RsData<>("200-1", "성공", favoriteProjectIds));
        } catch (Exception e) {
            log.error("사용자 즐겨찾기 목록 조회 실패: memberId={}", memberId, e);
            return ResponseEntity.badRequest()
                    .body(new RsData<>("400-1", "즐겨찾기 목록 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}
