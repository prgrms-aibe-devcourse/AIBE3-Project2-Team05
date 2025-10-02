package com.back.global.standard.util;

import com.back.global.exception.TokenExpiredException;
import com.back.global.exception.UnauthorizedException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
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

        public static Map<String, Object> payload(String secret, String jwtStr) {
            SecretKey secretKey = Keys.hmacShaKeyFor(secret.getBytes());

            try {
                return (Map<String, Object>) Jwts
                        .parser()
                        .verifyWith(secretKey)
                        .build()
                        .parseClaimsJws(jwtStr)
                        .getBody();
            } catch (ExpiredJwtException e) {
                throw new TokenExpiredException("401-1", "Token 시간이 만료되었습니다.");
            } catch (MalformedJwtException | UnsupportedJwtException |
                     SignatureException e) { //jwt 형식이 아니거나 맞지 않는 알고리즘이거나 시그니처가 다를 때
                throw new UnauthorizedException("401-3", "유효하지 않은 토큰입니다.");
            } catch (IllegalArgumentException e) {
                throw new UnauthorizedException("401-3", "토큰이 존재하지 않거나 잘못되었습니다.");
            } catch (Exception e) {
                throw new UnauthorizedException("401-3", "토큰 처리 중 알 수 없는 오류가 발생했습니다.");
            }
        }
    }
}

