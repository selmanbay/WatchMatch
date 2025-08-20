package com.matchflix.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CORS (WebConfig’te tanımlı kuralları kullan) + CSRF kapalı
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())

                // Tüm endpoint’lere erişim serbest (geliştirme için)
                .authorizeHttpRequests(auth -> auth
                        // Preflight isteklerini serbest bırak
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Statik upload’lar
                        .requestMatchers("/uploads/**").permitAll()
                        // API’ler
                        .requestMatchers("/api/**").permitAll()
                        // (İsterseniz belli endpointleri tek tek de açabilirsiniz)
                        .anyRequest().permitAll()
                )

                // Form login / HTTP Basic kapalı (REST)
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable());

        return http.build();
    }

    // BCrypt şifreleyici
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
