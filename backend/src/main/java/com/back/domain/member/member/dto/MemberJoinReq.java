package com.back.domain.member.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MemberJoinReq {

    @Size(min = 3, max = 20)
    @NotBlank(message = "아이디는 필수 항목입니다.")
    private String username;

    @NotBlank(message = "이메일은 필수 항목입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    @Size(min = 2, max = 20)
    @NotBlank(message = "닉네임은 필수 항목입니다.")
    private String nickname;

    @Size(min = 8, max = 20)
    @NotBlank(message = "비밀번호는 필수 항목입니다.")
    private String password;

    @Size(min = 8, max = 20)
    @NotBlank(message = "비밀번호 확인은 필수 항목입니다.")
    private String passwordCheck;

    public boolean isPasswordMatch() {
        return password != null && password.equals(passwordCheck);
    }

}
