package com.back.domain.member.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateMemberReq {

    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    @Size(min = 2, max = 20)
    private String nickname;
}
