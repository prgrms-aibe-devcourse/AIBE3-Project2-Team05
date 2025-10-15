package com.back;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class PasswordEncoderTest {

    @Test
    public void generatePasswordHash() {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        String rawPassword = "12341234";
        String encodedPassword = passwordEncoder.encode(rawPassword);

        System.out.println("====================================");
        System.out.println("Raw Password: " + rawPassword);
        System.out.println("Encoded Password: " + encodedPassword);
        System.out.println("====================================");

        // 검증
        boolean matches = passwordEncoder.matches(rawPassword, encodedPassword);
        System.out.println("Password matches: " + matches);
    }
}
