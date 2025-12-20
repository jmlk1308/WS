package com.example.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// This interface gives you standard database methods like findById() automatically
@Repository
public interface CourseRepository extends JpaRepository<Course, String> {
}