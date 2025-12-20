package com.example.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/professor")
@CrossOrigin(origins = "*")
public class ProfessorController {

    private static final String UPLOAD_DIR = "uploads/";

    @Autowired private SubjectRepository subjectRepository;
    @Autowired private LearningMaterialRepository materialRepository;
    @Autowired private QuizRepository quizRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private ModuleRepository moduleRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ActivityLogRepository logRepository;

    // ==========================================
    // 1. DASHBOARD STATS
    // ==========================================
    @GetMapping("/stats")
    public Map<String, Long> getStats(@RequestParam(required = false) String courseId) {
        Map<String, Long> stats = new HashMap<>();

        if (courseId != null && !courseId.isEmpty() && !courseId.equals("null")) {
            stats.put("students", userRepository.countByRoleAndCourseId("student", courseId));
            List<String> subjects = subjectRepository.findByCourseId(courseId)
                    .stream().map(Subject::getCode).collect(Collectors.toList());

            if (!subjects.isEmpty()) {
                stats.put("subjects", (long) subjects.size());
                stats.put("lessons", materialRepository.countBySubjectCodeIn(subjects));
            } else {
                stats.put("subjects", 0L);
                stats.put("lessons", 0L);
            }
        } else {
            stats.put("students", 0L);
            stats.put("subjects", 0L);
            stats.put("lessons", 0L);
        }
        return stats;
    }

    // ==========================================
    // 2. SUBJECTS
    // ==========================================
    @GetMapping("/subjects")
    public List<Subject> getSubjects(@RequestParam(required = false) String courseId) {
        if (courseId != null && !courseId.isEmpty()) {
            return subjectRepository.findByCourseId(courseId);
        }
        return new ArrayList<>();
    }

    // ==========================================
    // 3. QUIZ MANAGEMENT
    // ==========================================
    @GetMapping("/quizzes")
    public List<Quiz> getQuizzes(@RequestParam(required = false) String subjectCode) {
        if (subjectCode != null && !subjectCode.isEmpty()) {
            return quizRepository.findAll().stream()
                    .filter(q -> q.getSubjectCode().equals(subjectCode))
                    .collect(Collectors.toList());
        }
        return quizRepository.findAll();
    }

    @PostMapping("/quizzes")
    public ResponseEntity<?> createQuiz(@RequestBody Map<String, Object> quizData) {
        try {
            String title = (String) quizData.get("title");
            String subjectCode = (String) quizData.get("subjectCode");
            String link = (String) quizData.get("link");

            Object modIdObj = quizData.get("moduleId");
            Long moduleId = null;
            if (modIdObj != null) moduleId = Long.valueOf(modIdObj.toString());

            // 1. Save Quiz
            Quiz quiz = new Quiz();
            quiz.setTitle(title);
            quiz.setSubjectCode(subjectCode);
            quiz.setDateCreated(LocalDate.now());
            quizRepository.save(quiz);

            // 2. Save as Learning Material
            LearningMaterial mat = new LearningMaterial();
            mat.setTitle(title);
            mat.setSubjectCode(subjectCode);
            mat.setType("quiz");
            mat.setFilePath(link);
            if (moduleId != null) mat.setModuleId(moduleId);

            materialRepository.save(mat);

            logRepository.save(new ActivityLog("Professor", "Created Quiz: " + title, "professor"));

            return ResponseEntity.ok("Quiz Created");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    // ✅ NEW: DELETE QUIZ
    @DeleteMapping("/quizzes/{id}")
    public ResponseEntity<?> deleteQuiz(@PathVariable Long id) {
        if (!quizRepository.existsById(id)) return ResponseEntity.notFound().build();

        Quiz q = quizRepository.findById(id).get();
        quizRepository.deleteById(id);

        logRepository.save(new ActivityLog("Professor", "Deleted Quiz: " + q.getTitle(), "professor"));
        return ResponseEntity.ok("Quiz deleted successfully");
    }

    // ==========================================
    // 4. LESSON MANAGEMENT
    // ==========================================

    // ✅ NEW: GET LESSONS (For View Lesson Page)
    @GetMapping("/materials")
    public List<LearningMaterial> getAllMaterials(@RequestParam(required = false) String subjectCode) {
        if (subjectCode != null && !subjectCode.isEmpty()) {
            return materialRepository.findAll().stream()
                    .filter(m -> m.getSubjectCode().equals(subjectCode))
                    .collect(Collectors.toList());
        }
        return materialRepository.findAll();
    }

    // ✅ NEW: DELETE LESSON
    @DeleteMapping("/materials/{id}")
    public ResponseEntity<?> deleteMaterial(@PathVariable Long id) {
        if (!materialRepository.existsById(id)) return ResponseEntity.notFound().build();

        LearningMaterial m = materialRepository.findById(id).get();
        materialRepository.deleteById(id);

        logRepository.save(new ActivityLog("Professor", "Deleted Lesson: " + m.getTitle(), "professor"));
        return ResponseEntity.ok("Lesson deleted successfully");
    }

    @PostMapping("/modules")
    public ResponseEntity<?> createModule(@RequestBody Module module) {
        if (module.getSubjectCode() == null || module.getSubjectCode().isEmpty()) {
            return ResponseEntity.badRequest().body("Subject Code is required");
        }
        Module saved = moduleRepository.save(module);
        logRepository.save(new ActivityLog("Professor", "Created Module " + module.getModuleNumber(), "professor"));
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadLesson(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("subjectCode") String subjectCode,
            @RequestParam(value = "moduleId", required = false) Long moduleId
    ) {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Files.copy(file.getInputStream(), uploadPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);

            LearningMaterial material = new LearningMaterial();
            material.setTitle(title);
            material.setSubjectCode(subjectCode);
            material.setFilePath(fileName);
            material.setType(determineType(fileName));
            if (moduleId != null) material.setModuleId(moduleId);

            materialRepository.save(material);
            logRepository.save(new ActivityLog("Professor", "Uploaded Lesson: " + title, "professor"));

            return ResponseEntity.ok("File uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    private String determineType(String fileName) {
        String name = fileName.toLowerCase();
        if (name.endsWith(".pdf")) return "pdf";
        if (name.endsWith(".mp4") || name.endsWith(".avi") || name.endsWith(".mov")) return "video";
        if (name.endsWith(".ppt") || name.endsWith(".pptx")) return "ppt";
        if (name.endsWith(".doc") || name.endsWith(".docx")) return "doc";
        return "file";
    }
}