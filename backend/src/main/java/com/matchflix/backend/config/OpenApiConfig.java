package com.matchflix.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("WatchMatch API")
                        .version("1.0")
                        .description("WatchMatch kullanıcı ve film yönetimi için Swagger dökümantasyonu"));
    }
}