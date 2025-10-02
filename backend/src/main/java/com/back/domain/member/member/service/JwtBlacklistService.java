package com.back.domain.member.member.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class JwtBlacklistService {

    private final RedisTemplate<String, Object> stringRedisTemplate;
    private final AuthTokenService authTokenService;

    //블랙리스트 등록
    public void addBlackList(String accessToken) {
        if (accessToken == null || accessToken.isBlank()) {
            return;
        }

        Map<String, Object> payload = authTokenService.payload(accessToken);
        long exp = (long) payload.get("exp");
        long now = System.currentTimeMillis() / 1000L;
        long remainExpiration = exp - now;

        if (remainExpiration > 0) {
            stringRedisTemplate.opsForValue().set(accessToken, "logout 후 들어온 토큰", Duration.ofSeconds(remainExpiration));
        }

    }

    public boolean isBlacklisted(String accessToken) {
        return stringRedisTemplate.hasKey(accessToken);
    }
}
