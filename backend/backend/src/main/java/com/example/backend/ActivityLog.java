package com.example.backend;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "activity_logs")
public class ActivityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username; // The ID or Name of who/what was affected
    private String action;   // e.g., "User Created", "Subject Deleted"
    private String role;     // e.g., "Student", "System"

    private LocalDateTime timestamp;

    public ActivityLog() {
        this.timestamp = LocalDateTime.now();
    }

    public ActivityLog(String username, String action, String role) {
        this.username = username;
        this.action = action;
        this.role = role;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getTimestamp() {
        // Format the date nicely for the frontend (e.g. "2023-10-25 14:30")
        if (timestamp == null) return "";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        return timestamp.format(formatter);
    }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}