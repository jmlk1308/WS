package com.example.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // ✅ THIS IS REQUIRED for the login and create checks
    User findByUsername(String username);

    // Keep your other stats methods here
    long countByRole(String role);
    long countByRoleAndCourseId(String role, String courseId);
}