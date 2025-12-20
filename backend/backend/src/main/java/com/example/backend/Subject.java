package com.example.backend;

import jakarta.persistence.*;

@Entity
@Table(name = "subjects")
public class Subject {
    @Id
    @Column(length = 50)
    private String code; // e.g., CC101

    private String title;
    private String color;

    @Column(name = "course_id", length = 50)
    private String courseId;

    @Column(name = "year_level")
    private int yearLevel; // 1, 2, 3, 4

    private int semester; // 1 or 2

    // ✅ NEW FIELD
    private String status; // "active" or "inactive"

    // Getters and Setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public int getYearLevel() { return yearLevel; }
    public void setYearLevel(int yearLevel) { this.yearLevel = yearLevel; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}