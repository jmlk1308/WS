package com.example.backend;

import jakarta.persistence.*;

@Entity
@Table(name = "modules")
public class Module {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;       // e.g., "Introduction to Java"
    private String description; // e.g., "Basic syntax and variables"
    private int moduleNumber;   // e.g., 1, 2, 3
    private String status;      // e.g., "active", "locked" (default: locked)

    @Column(name = "subject_code", length = 50)
    private String subjectCode; // Links to Subject (e.g., CC102)

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public int getModuleNumber() { return moduleNumber; }
    public void setModuleNumber(int moduleNumber) { this.moduleNumber = moduleNumber; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }
}