package com.example.backend;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 1. Get the absolute (full) path to the "uploads" folder
        Path uploadDir = Paths.get("./uploads");
        String uploadPath = uploadDir.toFile().getAbsolutePath();

        // 2. Print it to the console so you can check where it is looking
        System.out.println("Serving files from: " + uploadPath);

        // 3. Register the resource handler
        // "file:///" is needed for Windows, "file:" is usually enough for Mac/Linux
        // This helper handles the formatting automatically
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:///" + uploadPath + "/");
    }
}