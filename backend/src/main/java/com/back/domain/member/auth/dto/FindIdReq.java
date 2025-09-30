package com.back.domain.member.auth.dto;

import lombok.Data;
import org.hibernate.validator.constraints.NotBlank;

@Data
public class FindIdReq {

    @NotBlank(message = "이메일은 필수 항목입니다.")
    private String email;
}