package com.back.domain.user.service;

import com.back.domain.user.entity.User;
import com.back.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    /**
     * 모든 사용자 조회
     */
    public List<User> getAllUsers() {
        log.debug("모든 사용자 조회");
        return userRepository.findAll();
    }

    /**
     * ID로 사용자 조회
     */
    public Optional<User> getUserById(Long id) {
        log.debug("사용자 조회 - id: {}", id);
        return userRepository.findById(id);
    }

    /**
     * 사용자명으로 조회
     */
    public Optional<User> getUserByUsername(String username) {
        log.debug("사용자 조회 - username: {}", username);
        return userRepository.findByUsername(username);
    }


    /**
     * 사용자 생성
     */
    @Transactional
    public User createUser(User user) {
        log.info("사용자 생성 - username: {}", user.getUsername());

        // 중복 체크
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("이미 존재하는 사용자명입니다: " + user.getUsername());
        }

        // BaseEntity에서 자동으로 createDate, modifyDate 설정됨
        User savedUser = userRepository.save(user);
        log.info("사용자 생성 완료 - id: {}, username: {}", savedUser.getId(), savedUser.getUsername());

        return savedUser;
    }

    /**
     * 사용자 정보 수정
     */
    @Transactional
    public User updateUser(Long id, User updateUser) {
        log.info("사용자 수정 - id: {}", id);

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + id));

        // 수정 가능한 필드만 업데이트
        if (updateUser.getPassword() != null) {
            existingUser.setPassword(updateUser.getPassword());
        }

        // BaseEntity에서 자동으로 modifyDate 업데이트됨
        User savedUser = userRepository.save(existingUser);
        log.info("사용자 수정 완료 - id: {}", savedUser.getId());

        return savedUser;
    }

    /**
     * 사용자 삭제
     */
    @Transactional
    public void deleteUser(Long id) {
        log.info("사용자 삭제 - id: {}", id);

        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다: " + id);
        }

        userRepository.deleteById(id);
        log.info("사용자 삭제 완료 - id: {}", id);
    }

    /**
     * 사용자명 존재 여부 확인
     */
    public boolean existsByUsername(String username) {
        log.debug("사용자명 존재 확인 - username: {}", username);
        return userRepository.existsByUsername(username);
    }
}