package com.back.domain.user.repository;

import com.back.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // 사용자명으로 조회
    Optional<User> findByUsername(String username);

    // 사용자명 존재 여부 확인
    boolean existsByUsername(String username);
}