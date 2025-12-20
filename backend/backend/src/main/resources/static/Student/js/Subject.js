// ==========================================
// 1. GET INFO FROM URL
// ==========================================
const params = new URLSearchParams(window.location.search);
const subjectId = params.get('id');         // e.g. "CC102"
const subjectTitle = params.get('title');   // e.g. "Programming 1"
const moduleId = params.get('moduleId');    // e.g. "17"
const moduleTitle = params.get('moduleTitle'); // e.g. "Introduction"

// ==========================================
// 2. SET HEADER TITLE
// ==========================================
const headerTitle = document.getElementById('subject-title');
if (subjectId && headerTitle) {
    if (moduleTitle && moduleTitle !== 'null') {
        headerTitle.innerText = `${subjectId} : ${moduleTitle}`;
    } else {
        headerTitle.innerText = `${subjectId} : ${subjectTitle}`;
    }
}

// ==========================================
// 3. MAIN FUNCTION: SWITCH TABS & FETCH FILES
// ==========================================
async function switchTab(type) {
    const display = document.getElementById('content-display');
    if (!display) return;

    // --- UI Updates (Tab Styling) ---
    // 1. Reset all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.opacity = '0.6';
        btn.style.borderBottom = 'none';
    });

    // 2. Highlight the active tab
    // ✅ FIX: Check if 'event' actually exists (prevents crash on page load)
    if (typeof event !== 'undefined' && event && event.target) {
        // Case A: User clicked a button
        highlightTab(event.target, type);
    } else {
        // Case B: Called automatically (Page Load)
        // Find the button that matches the 'type' we are trying to load
        const autoBtn = document.querySelector(`.tab-btn[onclick*="'${type}'"]`);
        if (autoBtn) {
            highlightTab(autoBtn, type);
        }
    }

    // --- Show Loading State ---
    display.innerHTML = '<div class="placeholder"><div class="spinner"></div> Loading content...</div>';

    try {
        // --- Prepare API URL ---
        let url = `http://localhost:8080/api/student/materials?subjectCode=${subjectId}`;

        // If filtering by specific module
        if (moduleId) {
            url += `&moduleId=${moduleId}`;
        }

        // --- Fetch Data ---
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");

        let materials = await response.json();

        // --- FILTER BY TAB TYPE ---
        materials = materials.filter(m => m.type.toLowerCase() === type.toLowerCase());

        // --- Handle Empty Results ---
        if (materials.length === 0) {
            display.innerHTML = `<div class="placeholder">No ${type.toUpperCase()} content found for this section.</div>`;
            return;
        }

        // --- RENDER LIST ---
        let html = '<div class="materials-grid">';

        materials.forEach(file => {
            // 1. Handle File URL (Local vs External)
            let fileUrl = file.filePath;
            if (!fileUrl.startsWith('http')) {
                fileUrl = `http://localhost:8080/uploads/${file.filePath}`;
            }

            // 2. Determine Style based on Type
            if (file.type === 'quiz') {
                // === RENDER QUIZ CARD ===
                html += `
                <div class="material-card" style="border-left: 5px solid #3b82f6;">
                    <div class="file-icon" style="color: #3b82f6; background: #eff6ff;">
                        <i class="fa-solid fa-clipboard-question"></i>
                    </div>
                    <div class="file-info">
                        <div class="file-title" title="${file.title}">${file.title}</div>
                        <div class="file-type">QUIZ / EXAM</div>
                    </div>
                    <a href="${fileUrl}" target="_blank" class="open-btn" style="background: #3b82f6; color: white;">
                        <i class="fa-solid fa-pen-to-square"></i> Take Quiz
                    </a>
                </div>`;
            } else {
                // === RENDER STANDARD FILE CARD ===
                let iconClass = "fa-file";
                let iconColor = "#6b7280"; // Gray default
                let bgIcon = "#f3f4f6";

                if (file.type === 'pdf') { iconClass = "fa-file-pdf"; iconColor = "#f59e0b"; bgIcon = "#fef3c7"; }
                if (file.type === 'video') { iconClass = "fa-video"; iconColor = "#ef4444"; bgIcon = "#fee2e2"; }
                if (file.type === 'ppt') { iconClass = "fa-file-powerpoint"; iconColor = "#22c55e"; bgIcon = "#dcfce7"; }

                html += `
                <div class="material-card">
                    <div class="file-icon" style="color: ${iconColor}; background: ${bgIcon};">
                        <i class="fa-solid ${iconClass}"></i>
                    </div>
                    <div class="file-info">
                        <div class="file-title" title="${file.title}">${file.title}</div>
                        <div class="file-type">${file.type.toUpperCase()} FILE</div>
                    </div>
                    <a href="${fileUrl}" target="_blank" class="open-btn">
                        Open <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                </div>`;
            }
        });

        html += '</div>';
        display.innerHTML = html;

    } catch (error) {
        console.error("Error loading materials:", error);
        display.innerHTML = `<div class="placeholder" style="color:#ef4444;">
            Unable to load content.<br>
            <small>Backend error or connection refused.</small>
        </div>`;
    }
}

// Helper: Applies styles to the active tab
function highlightTab(element, type) {
    element.classList.add('active');
    element.style.opacity = '1';

    let color = 'currentColor';
    if(type === 'video') color = '#ef4444';
    if(type === 'pdf') color = '#f59e0b';
    if(type === 'ppt') color = '#22c55e';
    if(type === 'quiz') color = '#3b82f6';

    element.style.borderBottom = `3px solid ${color}`;
}

// ==========================================
// 4. INITIAL LOAD
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Automatically click the first tab (Video) when page loads
    // We pass 'video' directly so it loads the data immediately
    switchTab('video');
});