package com.back.global.standard.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ClaimsBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.util.Date;
import java.util.Map;

public class JWTUt {
    public static class jwt {
        public static String toString(String secret, int expireSeconds, Map<String, Object> body) {
            ClaimsBuilder claimsBuilder = Jwts.claims();

            for (Map.Entry<String, Object> entry : body.entrySet()) {
                claimsBuilder.add(entry.getKey(), entry.getValue());
            }
            Claims claims = claimsBuilder.build(); //Payload 생성

            Date issueAt = new Date();
            Date expiration = new Date(issueAt.getTime() + expireSeconds * 1000L);

            Key secretKey = Keys.hmacShaKeyFor(secret.getBytes()); // 서명 알고리즘에 맞게 시크릿 키를 변환

            String jwt = Jwts.builder()
                    .claims(claims)
                    .issuedAt(issueAt)
                    .expiration(expiration)
                    .signWith(secretKey)
                    .compact();
            return jwt;

        }
    }
}
