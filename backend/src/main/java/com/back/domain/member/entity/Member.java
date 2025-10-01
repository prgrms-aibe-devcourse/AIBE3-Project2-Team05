package com.back.domain.member.entity;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.global.jpa.entity.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor
public class Member extends BaseEntity {
    private String username;
    private String password;
    private String nickname;
    private String email;
    @OneToOne(mappedBy = "member", cascade = CascadeType.ALL)
    private Freelancer freelancer;

    public Member(String username, String password, String nickname, String email) {
        this.username = username;
        this.password = password;
        this.nickname = nickname;
        this.email = email;
    }
}
