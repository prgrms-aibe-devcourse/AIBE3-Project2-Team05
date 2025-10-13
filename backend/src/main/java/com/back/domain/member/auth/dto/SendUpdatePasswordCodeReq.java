package com.back.domain.member.auth.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class SendUpdatePasswordCodeReq {
    @NotBlank(message = "아이디는 필수 항목입니다.")
    private String username;

    @NotBlank(message = "이메일은 필수 항목입니다.")
    private String email;
}
