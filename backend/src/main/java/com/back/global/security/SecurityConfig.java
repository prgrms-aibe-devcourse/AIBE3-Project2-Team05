package com.back.global.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

@RequiredArgsConstructor
@Configuration
public class SecurityConfig {
    private final CustomAuthenticationFilter customAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // 이 줄 추가!
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/swagger-resources/**", "/webjars/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/member/login", "/auth/findId/verify", "/member", "/auth/refresh", "/auth/findId/sendCode", "/auth/updatePassword/sendCode", "/").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/member/logout").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/auth/updatePassword/verify").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/projects").permitAll()

                        // ✅ 리뷰: 조회는 공개
                        .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/v1/freelancers").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/freelancers/*").permitAll().requestMatchers(HttpMethod.GET, "/api/v1/freelancers/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/freelancers/*/portfolios").permitAll().requestMatchers(HttpMethod.GET, "/api/v1/freelancers/me/portfolios").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/freelancers/portfolios/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/techs").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/freelancers/*/techs").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/freelancers/*/careers").permitAll()
                        .requestMatchers("/images/**").permitAll()
                        .anyRequest().authenticated()
                )
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(STATELESS))
                .addFilterBefore(customAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Set-Cookie"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
