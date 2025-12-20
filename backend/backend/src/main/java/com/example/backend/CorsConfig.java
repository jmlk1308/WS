package com.example.backend;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Allow ALL URLs
                        .allowedOrigins("*") // Allow ALL frontends (localhost, etc.)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allow ALL actions
                        .allowedHeaders("*"); // Allow ALL headers
            }
        };
    }
}