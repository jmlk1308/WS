package com.example.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, String> {

    // ✅ THIS IS THE MISSING LINE FIXING THE ERROR:
    List<Subject> findByCourseId(String courseId);
}