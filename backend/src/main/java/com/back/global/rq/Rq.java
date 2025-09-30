package com.back.global.rq;

import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class Rq {

    public void setCookie(String name, String value) {
        if (value == null) value = "";

        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setDomain("localhost");
        cookie.setSecure(false); //https 끄기 추후 배포시 true
        cookie.setAttribute("SameSite", "Strict");
    }

    public void deleteCookie(String accessToken) {
        setCookie(accessToken, null);
    }
}
