package com.back.domain.project.project.controller;

import com.back.domain.project.project.dto.ApiResponse;
import com.back.domain.project.project.entity.ProjectFavorite;
import com.back.domain.project.project.service.ProjectFavoriteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProjectFavoriteController {

    private final ProjectFavoriteService favoriteService;

    /**
     * 사용자의 즐겨찾기 목록 조회 (페이징)
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<Page<ProjectFavorite>> getUserFavorites(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("사용자 즐겨찾기 목록 조회 요청 - userId: {}, page: {}, size: {}", userId, page, size);

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ProjectFavorite> favorites = favoriteService.getUserFavorites(userId, pageable);
            return ResponseEntity.ok(favorites);
        } catch (IllegalArgumentException e) {
            log.error("사용자 즐겨찾기 목록 조회 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 특정 즐겨찾기 조회
     */
    @GetMapping("/users/{userId}/projects/{projectId}")
    public ResponseEntity<ProjectFavorite> getFavorite(
            @PathVariable Long userId,
            @PathVariable Long projectId) {

        log.info("특정 즐겨찾기 조회 요청 - userId: {}, projectId: {}", userId, projectId);

        try {
            Optional<ProjectFavorite> favorite = favoriteService.getFavorite(userId, projectId);
            return favorite.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            log.error("즐겨찾기 조회 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 즐겨찾기 여부 확인
     */
    @GetMapping("/users/{userId}/projects/{projectId}/check")
    public ResponseEntity<Boolean> isFavorite(
            @PathVariable Long userId,
            @PathVariable Long projectId) {

        log.info("즐겨찾기 여부 확인 요청 - userId: {}, projectId: {}", userId, projectId);

        try {
            boolean isFavorite = favoriteService.isFavorite(userId, projectId);
            return ResponseEntity.ok(isFavorite);
        } catch (IllegalArgumentException e) {
            log.error("즐겨찾기 여부 확인 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 즐겨찾기 추가
     */
    @PostMapping("/users/{userId}/projects/{projectId}")
    public ResponseEntity<ApiResponse<ProjectFavorite>> addFavorite(
            @PathVariable Long userId,
            @PathVariable Long projectId) {

        log.info("즐겨찾기 추가 요청 - userId: {}, projectId: {}", userId, projectId);

        try {
            ProjectFavorite favorite = favoriteService.addFavorite(userId, projectId);
            return ResponseEntity.ok(ApiResponse.success("즐겨찾기가 추가되었습니다.", favorite));
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("즐겨찾기 추가 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("즐겨찾기 추가 실패", e.getMessage()));
        }
    }

    /**
     * 즐겨찾기 제거
     */
    @DeleteMapping("/users/{userId}/projects/{projectId}")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(
            @PathVariable Long userId,
            @PathVariable Long projectId) {

        log.info("즐겨찾기 제거 요청 - userId: {}, projectId: {}", userId, projectId);

        try {
            favoriteService.removeFavorite(userId, projectId);
            return ResponseEntity.ok(ApiResponse.success("즐겨찾기가 제거되었습니다.", null));
        } catch (IllegalArgumentException e) {
            log.error("즐겨찾기 제거 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("즐겨찾기 제거 실패", e.getMessage()));
        }
    }

    /**
     * 즐겨찾기 토글 (있으면 제거, 없으면 추가)
     */
    @PostMapping("/users/{userId}/projects/{projectId}/toggle")
    public ResponseEntity<ApiResponse<ProjectFavoriteService.FavoriteToggleResult>> toggleFavorite(
            @PathVariable Long userId,
            @PathVariable Long projectId) {

        log.info("즐겨찾기 토글 요청 - userId: {}, projectId: {}", userId, projectId);

        try {
            ProjectFavoriteService.FavoriteToggleResult result =
                    favoriteService.toggleFavorite(userId, projectId);
            String message = result.isAdded() ? "즐겨찾기가 추가되었습니다." : "즐겨찾기가 제거되었습니다.";
            return ResponseEntity.ok(ApiResponse.success(message, result));
        } catch (IllegalArgumentException e) {
            log.error("즐겨찾기 토글 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("즐겨찾기 토글 실패", e.getMessage()));
        }
    }

    /**
     * 프로젝트의 즐겨찾기 수 조회
     */
    @GetMapping("/projects/{projectId}/count")
    public ResponseEntity<Long> getFavoriteCount(@PathVariable Long projectId) {
        log.info("프로젝트 즐겨찾기 수 조회 요청 - projectId: {}", projectId);

        try {
            long count = favoriteService.getFavoriteCount(projectId);
            return ResponseEntity.ok(count);
        } catch (IllegalArgumentException e) {
            log.error("즐겨찾기 수 조회 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 사용자의 즐겨찾기 수 조회
     */
    @GetMapping("/users/{userId}/count")
    public ResponseEntity<Long> getUserFavoriteCount(@PathVariable Long userId) {
        log.info("사용자 즐겨찾기 수 조회 요청 - userId: {}", userId);

        try {
            long count = favoriteService.getUserFavoriteCount(userId);
            return ResponseEntity.ok(count);
        } catch (IllegalArgumentException e) {
            log.error("사용자 즐겨찾기 수 조회 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 사용자의 모든 즐겨찾기 삭제 (회원 탈퇴시)
     */
    @DeleteMapping("/users/{userId}/all")
    public ResponseEntity<ApiResponse<Void>> removeAllUserFavorites(@PathVariable Long userId) {
        log.info("사용자 즐겨찾기 전체 삭제 요청 - userId: {}", userId);

        try {
            favoriteService.removeAllUserFavorites(userId);
            return ResponseEntity.ok(ApiResponse.success("사용자의 모든 즐겨찾기가 삭제되었습니다.", null));
        } catch (IllegalArgumentException e) {
            log.error("사용자 즐겨찾기 전체 삭제 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("즐겨찾기 전체 삭제 실패", e.getMessage()));
        }
    }

    /**
     * 프로젝트의 모든 즐겨찾기 삭제 (프로젝트 삭제시)
     */
    @DeleteMapping("/projects/{projectId}/all")
    public ResponseEntity<ApiResponse<Void>> removeAllProjectFavorites(@PathVariable Long projectId) {
        log.info("프로젝트 즐겨찾기 전체 삭제 요청 - projectId: {}", projectId);

        try {
            favoriteService.removeAllProjectFavorites(projectId);
            return ResponseEntity.ok(ApiResponse.success("프로젝트의 모든 즐겨찾기가 삭제되었습니다.", null));
        } catch (IllegalArgumentException e) {
            log.error("프로젝트 즐겨찾기 전체 삭제 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("즐겨찾기 전체 삭제 실패", e.getMessage()));
        }
    }
}