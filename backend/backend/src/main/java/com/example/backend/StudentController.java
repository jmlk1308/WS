package com.example.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "*") // Allows your HTML to talk to this Java file
public class StudentController {

    @Autowired private SubjectRepository subjectRepository;
    @Autowired private QuizRepository quizRepository;

    // ✅ 1. ADD THIS REPOSITORY LINK
    @Autowired private LearningMaterialRepository materialRepository;

    @Autowired private ActivityLogRepository logRepository;

    // Existing Quiz Method (Keep this)
    @GetMapping("/quizzes")
    public List<Quiz> getStudentQuizzes(@RequestParam String courseId) {
        List<String> subjectCodes = subjectRepository.findByCourseId(courseId)
                .stream()
                .map(Subject::getCode)
                .collect(Collectors.toList());

        if (subjectCodes.isEmpty()) return List.of();

        return quizRepository.findAll().stream()
                .filter(q -> subjectCodes.contains(q.getSubjectCode()))
                .collect(Collectors.toList());
    }

    // ==========================================
    // ✅ 2. ADD THIS NEW METHOD (THE FIX)
    // ==========================================
    @GetMapping("/materials")
    public List<LearningMaterial> getMaterials(
            @RequestParam String subjectCode,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long moduleId
    ) {
        // Logic to filter by Module ID if present
        if (moduleId != null) {
            if (type != null) {
                return materialRepository.findBySubjectCodeAndTypeAndModuleId(subjectCode, type, moduleId);
            }
            // If no type specified, return everything for that module
            return materialRepository.findAll().stream()
                    .filter(m -> m.getSubjectCode().equals(subjectCode) &&
                            m.getModuleId() != null &&
                            m.getModuleId().equals(moduleId))
                    .collect(Collectors.toList());
        }

        // Logic to filter just by Subject and Type (e.g., all PDFs for a subject)
        if (type != null) {
            return materialRepository.findBySubjectCodeAndType(subjectCode, type);
        }

        return List.of();
    }

}