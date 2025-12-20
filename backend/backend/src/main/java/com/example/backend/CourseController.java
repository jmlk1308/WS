package com.example.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List; // Add this import

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*") // Allows your HTML frontend to access this
public class CourseController {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired // Add this for subjects
    private SubjectRepository subjectRepository;

    @GetMapping("/{id}")
    public Course getCourse(@PathVariable String id) {
        // Finds the course or throws an error if missing
        return courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Course not found"));
    }

    // Add this new endpoint for subjects
    @GetMapping("/{id}/subjects")
    public List<Subject> getSubjectsByCourse(@PathVariable String id) {
        return subjectRepository.findByCourseId(id);
    }
}