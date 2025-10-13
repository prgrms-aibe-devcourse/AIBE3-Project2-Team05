package com.back.domain.member.auth.dto;

import lombok.Data;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.NotBlank;

@Data
public class UpdatePasswordReq {
    @Size(min = 3, max = 20)
    @NotBlank(message = "아이디는 필수 항목입니다.")
    private String username;

    @NotBlank(message = "이메일은 필수 항목입니다.")
    private String email;

    @Size(min = 8, max = 20)
    @NotBlank(message = "비밀번호는 필수 항목입니다.")
    private String newPassword;

    @NotBlank(message = "비밀번호 확인은 필수 항목입니다.")
    private String newPasswordCheck;

    private String verifyCode;

    public boolean isNewPasswordCheck() {
       return newPassword != null && newPassword.equals(newPasswordCheck);
    }
}