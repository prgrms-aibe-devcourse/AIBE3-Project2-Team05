package com.back.domain.user.controller;

import com.back.domain.user.entity.User;
import com.back.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    /**
     * 모든 사용자 조회
     */
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        log.info("모든 사용자 조회 요청");

        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * 사용자 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        log.info("사용자 상세 조회 요청 - id: {}", id);

        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 사용자명으로 조회
     */
    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        log.info("사용자명으로 조회 요청 - username: {}", username);

        Optional<User> user = userService.getUserByUsername(username);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 사용자 생성
     */
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        log.info("사용자 생성 요청 - username: {}", user.getUsername());

        try {
            User createdUser = userService.createUser(user);
            return ResponseEntity.ok(createdUser);
        } catch (Exception e) {
            log.error("사용자 생성 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 사용자 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        log.info("사용자 수정 요청 - id: {}", id);

        try {
            User updatedUser = userService.updateUser(id, user);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            log.error("사용자 수정 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 사용자 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.info("사용자 삭제 요청 - id: {}", id);

        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("사용자 삭제 실패 - {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 사용자 존재 여부 확인 (username)
     */
    @GetMapping("/exists/username/{username}")
    public ResponseEntity<Boolean> existsByUsername(@PathVariable String username) {
        log.info("사용자명 존재 확인 요청 - username: {}", username);

        boolean exists = userService.existsByUsername(username);
        return ResponseEntity.ok(exists);
    }
}