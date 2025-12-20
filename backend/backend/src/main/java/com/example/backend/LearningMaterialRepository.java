package com.example.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LearningMaterialRepository extends JpaRepository<LearningMaterial, Long> {

    // Existing filter methods
    List<LearningMaterial> findBySubjectCodeAndType(String subjectCode, String type);
    List<LearningMaterial> findBySubjectCodeAndTypeAndModuleId(String subjectCode, String type, Long moduleId);

    // ✅ NEW: Count all materials where the Subject Code is in a specific list
    long countBySubjectCodeIn(List<String> subjectCodes);
}