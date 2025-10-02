package com.back.domain.member.email.service;

import com.back.global.exception.ServiceException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Random;

@RequiredArgsConstructor
@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final RedisTemplate redisTemplate;

    public void send(String to, String subject, String code) {
        MimeMessage mimeMessage = mailSender.createMimeMessage();

        String content = String.format("안녕하세요, [FIT]입니다.\n" +
                "\n" +
                "요청하신 이메일 인증을 위해 아래 인증번호를 입력해주세요." +
                "\n" +
                "인증번호: %s", code);

        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content);

            mailSender.send(mimeMessage);

        } catch (MessagingException e) {
            throw new ServiceException("500-1", "메일 메시지 생성 실패");
        }
    }

    public String createCode() {
        Random random = new Random();
        int code = random.nextInt(1_000_000);
        return String.format("%06d", code);
    }

    public void saveCode(String email, String code) {

        redisTemplate.opsForValue().set(email, code, Duration.ofMinutes(5));
    }

    public boolean verifyCode(String email, String inputCode) {
        String savedCode = (String) redisTemplate.opsForValue().get(email);

        if (savedCode == null) {
            throw new ServiceException("400-3", "인증 코드가 만료되었거나 존재하지 않습니다.");
        }

        if (!savedCode.equals(inputCode)) {
            throw new ServiceException("400-3", "인증 코드가 일치하지 않습니다.");
        }

        redisTemplate.delete(email);

        return true;
    }

}


