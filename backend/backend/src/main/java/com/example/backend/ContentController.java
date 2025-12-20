package com.example.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin") // Keep URL same for frontend compatibility
@CrossOrigin(origins = "*")
public class ContentController {

    @Autowired private ModuleRepository moduleRepository;
    @Autowired private LearningMaterialRepository materialRepository;

    @GetMapping("/modules")
    public List<Module> getModules(@RequestParam String subjectCode) {
        return moduleRepository.findBySubjectCodeOrderByModuleNumberAsc(subjectCode);
    }

    @GetMapping("/materials")
    public List<LearningMaterial> getMaterials(@RequestParam String subjectCode, @RequestParam String type, @RequestParam(required = false) Long moduleId) {
        if (moduleId != null) return materialRepository.findBySubjectCodeAndTypeAndModuleId(subjectCode, type, moduleId);
        return materialRepository.findBySubjectCodeAndType(subjectCode, type);
    }
}