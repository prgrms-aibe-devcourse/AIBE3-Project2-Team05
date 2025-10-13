package com.back.domain.member.member.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MemberLoginReq {

    @Size(min = 3, max = 20)
    @NotBlank(message = "아이디는 필수 항목입니다.")
    private String username;

    @Size(min = 8, max = 20)
    @NotBlank(message = "비밀번호는 필수 항목입니다.")
    private String password;
}
