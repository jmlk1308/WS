const API_URL = "http://localhost:8080/api/admin";

// State Variables
let isEditCourseMode = false;
let isEditSubjectMode = false;
let selectedCourseId = null; // For Subject Management
let allLogs = []; // For Activity Logs filtering

// ==========================================
// 1. INITIALIZATION & NAVIGATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    loadUsers();
    loadCourses();
    loadCoursesForDropdown();

    // Initial state for user form
    if(document.getElementById('role')) {
        toggleCourseInput();
    }
});

function switchView(viewId) {
    // Hide all views and remove active class
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    // Show selected view
    const view = document.getElementById(viewId);
    if(view) view.classList.add('active');

    // Highlight sidebar
    const navItem = document.querySelector(`.nav-item[onclick="switchView('${viewId}')"]`);
    if(navItem) navItem.classList.add('active');

    // Reload data to ensure freshness
    if (viewId === 'user-management') loadUsers();
    if (viewId === 'courses-management') loadCourses();
    if (viewId === 'subjects-management') loadSubjectsView();
    if (viewId === 'activity-logs') loadActivityLogs(); // ✅ NEW
}

// ==========================================
// 2. USER MANAGEMENT
// ==========================================

function toggleCourseInput() {
    const roleSelect = document.getElementById('role');
    const courseGroup = document.getElementById('course-group');
    if (roleSelect && courseGroup) {
        courseGroup.style.display = (roleSelect.value === 'professor') ? 'block' : 'none';
        const courseInput = document.getElementById('user-course');
        if (roleSelect.value === 'professor') {
            courseInput.setAttribute('required', 'required');
        } else {
            courseInput.removeAttribute('required');
            courseInput.value = "";
        }
    }
}

async function loadCoursesForDropdown() {
    try {
        const res = await fetch(`${API_URL}/courses`);
        const courses = await res.json();
        const selects = document.querySelectorAll('#user-course, #sub-course-id'); // Reusable

        // Populate User Modal Dropdown
        const userSelect = document.getElementById('user-course');
        if(userSelect) {
            userSelect.innerHTML = '<option value="">Select Course</option>';
            courses.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.innerText = `${c.id} - ${c.title}`;
                userSelect.appendChild(opt);
            });
        }
    } catch (err) { console.error(err); }
}

async function loadUsers() {
    try {
        const res = await fetch(`${API_URL}/users`);
        const users = await res.json();
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';

        if(document.getElementById('count-users')) {
            document.getElementById('count-users').innerText = users.length;
        }

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No users found.</td></tr>';
            return;
        }

        users.forEach(user => {
            const courseDisplay = user.courseId ? user.courseId : '-';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.username}</td>
                <td><span class="role-badge role-${user.role}">${user.role.toUpperCase()}</span></td>
                <td>${courseDisplay}</td>
                <td>
                    <button class="action-btn-icon delete-btn" onclick="deleteUser(${user.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) { console.error(err); }
}

function showAddUserModal() {
    document.getElementById('user-form').reset();
    toggleCourseInput();
    document.getElementById('user-modal').classList.add('active');
}

function closeUserModal() {
    document.getElementById('user-modal').classList.remove('active');
}

document.getElementById('user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const role = document.getElementById('role').value;
    const data = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        role: role,
        courseId: role === 'professor' ? document.getElementById('user-course').value : null
    };

    try {
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert("User created successfully!");
            closeUserModal();
            loadUsers();
        } else {
            const msg = await res.text();
            alert("Error: " + msg);
        }
    } catch (err) { console.error(err); }
});

async function deleteUser(id) {
    if(!confirm("Are you sure you want to delete this user?")) return;
    try {
        await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
        loadUsers();
    } catch (err) { console.error(err); }
}

// ==========================================
// 3. COURSE MANAGEMENT (With Image Upload)
// ==========================================

async function loadCourses() {
    try {
        const res = await fetch(`${API_URL}/courses`);
        const courses = await res.json();
        const grid = document.getElementById('courses-grid');
        grid.innerHTML = '';

        if(document.getElementById('count-courses')) {
            document.getElementById('count-courses').innerText = courses.length;
        }

        if (courses.length === 0) {
            grid.innerHTML = '<p style="text-align:center; width:100%; grid-column:1/-1;">No courses found.</p>';
            return;
        }

        courses.forEach(course => {
            const theme = course.themeColor || '#3182ce';
            let backgroundStyle = `background: ${theme};`;

            // If course has image, use it
            if (course.image) {
                let cleanImage = course.image.replace('uploads/', '');
                const imageUrl = `http://localhost:8080/uploads/${cleanImage}`;
                backgroundStyle = `background-image: url('${imageUrl}'); background-size: cover; background-position: center;`;
            }

            const card = document.createElement('div');
            card.className = 'course-card';
            card.innerHTML = `
                <div class="course-header-banner" style="${backgroundStyle}">
                    <div class="course-code-badge">${course.id}</div>
                </div>
                <div class="course-body">
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-description" title="${course.description || ''}">
                        ${course.description || 'No description.'}
                    </p>
                    <div class="course-footer">
                        <button class="action-btn-icon edit-btn" onclick="openEditCourseModal('${course.id}')"><i class="fas fa-edit"></i></button>
                        <button class="action-btn-icon delete-btn" onclick="deleteCourse('${course.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        loadCoursesForDropdown(); // Refresh dropdowns
    } catch (err) { console.error(err); }
}

function openAddCourseModal() {
    isEditCourseMode = false;
    document.getElementById('course-modal-title').innerText = "Add New Course";
    document.getElementById('course-form').reset();
    document.getElementById('course-code').disabled = false;
    document.getElementById('course-modal').classList.add('active');
}

async function openEditCourseModal(id) {
    isEditCourseMode = true;
    document.getElementById('course-modal-title').innerText = "Edit Course";

    try {
        const res = await fetch(`${API_URL}/courses`);
        const courses = await res.json();
        const course = courses.find(c => c.id === id);

        if(course) {
            document.getElementById('course-code').value = course.id;
            document.getElementById('course-code').disabled = true; // ID cannot change
            document.getElementById('course-name').value = course.title;
            document.getElementById('course-description').value = course.description;
            document.getElementById('course-color').value = course.themeColor || '#3182ce';
            document.getElementById('course-modal').classList.add('active');
        }
    } catch(err) { console.error(err); }
}

function closeCourseModal() {
    document.getElementById('course-modal').classList.remove('active');
}

// Course Form Submit (Using FormData for Images)
document.getElementById('course-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const courseCode = document.getElementById('course-code').value;

    formData.append('id', courseCode);
    formData.append('title', document.getElementById('course-name').value);
    formData.append('description', document.getElementById('course-description').value);
    formData.append('themeColor', document.getElementById('course-color').value);

    const fileInput = document.getElementById('course-image');
    if (fileInput && fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    }

    try {
        let url = `${API_URL}/courses`;
        let method = 'POST';

        if (isEditCourseMode) {
            url = `${API_URL}/courses/${courseCode}`;
            method = 'PUT';
        }

        const res = await fetch(url, {
            method: method,
            body: formData
        });

        if (res.ok) {
            alert(isEditCourseMode ? "Course updated!" : "Course created!");
            closeCourseModal();
            loadCourses();
        } else {
            const msg = await res.text();
            alert("Error: " + msg);
        }
    } catch (err) { console.error(err); }
});

async function deleteCourse(id) {
    if(!confirm("Delete this course? WARNING: This deletes all subjects and users linked to it.")) return;
    try {
        await fetch(`${API_URL}/courses/${id}`, { method: 'DELETE' });
        loadCourses();
    } catch (err) { console.error(err); }
}

// ==========================================
// 4. SUBJECT MANAGEMENT
// ==========================================

async function loadSubjectsView() {
    const tabsContainer = document.getElementById('subject-course-tabs');
    tabsContainer.innerHTML = 'Loading...';

    try {
        const res = await fetch(`${API_URL}/courses`);
        const courses = await res.json();
        tabsContainer.innerHTML = '';

        if (courses.length === 0) {
            tabsContainer.innerHTML = 'Please create a course first.';
            return;
        }

        courses.forEach((course, index) => {
            const tab = document.createElement('div');
            tab.className = `course-tab ${index === 0 ? 'active' : ''}`;
            tab.innerHTML = `<div class="course-dot" style="background:${course.themeColor || '#48bb78'}"></div> ${course.id}`;
            tab.onclick = () => selectSubjectCourse(course.id, course.title, tab);
            tabsContainer.appendChild(tab);

            if (index === 0) selectSubjectCourse(course.id, course.title, tab);
        });
    } catch (err) { console.error(err); }
}

async function selectSubjectCourse(courseId, courseTitle, tabElement) {
    selectedCourseId = courseId;
    document.querySelectorAll('.course-tab').forEach(t => t.classList.remove('active'));
    if(tabElement) tabElement.classList.add('active');

    document.getElementById('subject-banner').style.display = 'flex';
    document.getElementById('subjects-grid').style.display = 'flex';
    document.getElementById('selected-course-title').innerText = `${courseTitle} (${courseId})`;
    document.getElementById('selected-course-desc').innerText = "Manage subjects for this course.";

    loadSubjectsForGrid(courseId);
}

async function loadSubjectsForGrid(courseId) {
    // Clear Columns
    for(let i=1; i<=4; i++) {
        const col = document.getElementById(`year-${i}-content`);
        if(col) col.innerHTML = '';
    }

    try {
        const res = await fetch(`${API_URL}/subjects?courseId=${courseId}`);
        const subjects = await res.json();

        subjects.forEach(sub => {
            const year = sub.yearLevel || 1;
            const container = document.getElementById(`year-${year}-content`);

            // Status Styling
            const isInactive = sub.status === 'inactive';
            const statusBadge = isInactive
                ? '<span style="background:#e2e8f0; color:#718096; padding:2px 6px; border-radius:4px; font-size:0.7rem; margin-left:5px;">INACTIVE</span>'
                : '<span style="color:#48bb78; font-size:0.7rem; margin-left:5px;">● Active</span>';
            const cardOpacity = isInactive ? 'opacity: 0.6;' : '';

            if (container) {
                const div = document.createElement('div');
                div.className = 'subject-item-card';
                div.style = cardOpacity;
                div.innerHTML = `
                    <div class="sub-actions">
                        <i class="fas fa-edit sub-icon-btn edit" onclick="openEditSubjectModal('${sub.code}')" title="Edit"></i>
                        <i class="fas fa-trash sub-icon-btn del" onclick="deleteSubject('${sub.code}')" title="Delete"></i>
                    </div>
                    <span class="sub-sem-badge">
                        <i class="far fa-calendar"></i> ${sub.semester === 1 ? '1st Sem' : '2nd Sem'}
                        ${statusBadge}
                    </span>
                    <div class="sub-title">${sub.title}</div>
                    <div class="sub-code">${sub.code}</div>
                `;
                container.appendChild(div);
            }
        });
    } catch (err) { console.error(err); }
}

function openAddSubjectModal() {
    if (!selectedCourseId) return alert("Select a course first.");
    isEditSubjectMode = false;
    document.getElementById('subject-modal-title').innerText = "Add New Subject";
    document.getElementById('subject-form').reset();

    // Reset defaults
    document.getElementById('sub-code').disabled = false;
    document.getElementById('sub-course-id').value = selectedCourseId;
    document.getElementById('sub-status').value = "active";

    document.getElementById('subject-modal').classList.add('active');
}

async function openEditSubjectModal(code) {
    isEditSubjectMode = true;
    document.getElementById('subject-modal-title').innerText = "Edit Subject";

    try {
        const res = await fetch(`${API_URL}/subjects/${code}`);
        if (!res.ok) throw new Error("Subject not found");
        const sub = await res.json();

        // Populate Form
        document.getElementById('sub-course-id').value = sub.courseId;
        document.getElementById('sub-code').value = sub.code;
        document.getElementById('sub-code').disabled = true; // Cannot edit ID
        document.getElementById('sub-title').value = sub.title;
        document.getElementById('sub-year').value = sub.yearLevel;
        document.getElementById('sub-sem').value = sub.semester;
        document.getElementById('sub-status').value = sub.status || 'active';

        document.getElementById('subject-modal').classList.add('active');
    } catch (err) {
        console.error(err);
        alert("Failed to load subject details.");
    }
}

function closeSubjectModal() {
    document.getElementById('subject-modal').classList.remove('active');
}

// Subject Form Submit (Create or Update)
document.getElementById('subject-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const subjectCode = document.getElementById('sub-code').value;
    const data = {
        courseId: document.getElementById('sub-course-id').value,
        code: subjectCode,
        title: document.getElementById('sub-title').value,
        yearLevel: document.getElementById('sub-year').value,
        semester: document.getElementById('sub-sem').value,
        status: document.getElementById('sub-status').value
    };

    try {
        let url = `${API_URL}/subjects`;
        let method = 'POST';

        if (isEditSubjectMode) {
            url = `${API_URL}/subjects/${subjectCode}`;
            method = 'PUT';
        }

        const res = await fetch(url, {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if (res.ok) {
            closeSubjectModal();
            loadSubjectsForGrid(selectedCourseId);
        } else {
            const msg = await res.text();
            alert("Error: " + msg);
        }
    } catch (err) { console.error(err); }
});

async function deleteSubject(code) {
    if (!confirm("Delete this subject?")) return;
    try {
        await fetch(`${API_URL}/subjects/${code}`, { method: 'DELETE' });
        loadSubjectsForGrid(selectedCourseId);
    } catch (err) { console.error(err); }
}

// ==========================================
// 5. ACTIVITY LOGS (✅ NEW SECTION)
// ==========================================

async function loadActivityLogs() {
    const tbody = document.getElementById('logs-table-body');
    if(!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading logs...</td></tr>';

    try {
        const res = await fetch(`${API_URL}/logs`);
        allLogs = await res.json();
        renderLogs(allLogs);
    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">Failed to load logs.</td></tr>';
    }
}

function renderLogs(logs) {
    const tbody = document.getElementById('logs-table-body');
    if(!tbody) return;
    tbody.innerHTML = '';

    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No activity recorded yet.</td></tr>';
        return;
    }

    logs.forEach(log => {
        // Determine border color based on action keyword
        let statusClass = '';
        const actionLower = (log.action || '').toLowerCase();

        if (actionLower.includes('created')) statusClass = 'log-created';
        else if (actionLower.includes('deleted')) statusClass = 'log-deleted';
        else if (actionLower.includes('updated')) statusClass = 'log-updated';

        const tr = document.createElement('tr');
        tr.className = `log-row ${statusClass}`;

        tr.innerHTML = `
            <td style="font-weight:700;">${log.username || 'Unknown'}</td>
            <td class="log-action">${log.action}</td>
            <td class="log-role">${log.role || '-'}</td>
            <td style="color:#718096; font-size:0.9rem;">${log.timestamp}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filterLogs(filterType) {
    // Update UI Active State
    document.querySelectorAll('.log-filters .btn-sm').forEach(btn => {
        btn.classList.remove('active');
        const txt = btn.innerText.toLowerCase();
        if (txt.includes(filterType.toLowerCase()) || (filterType === 'all' && txt.includes('all'))) {
            btn.classList.add('active');
        }
    });

    if (filterType === 'all') {
        renderLogs(allLogs);
    } else {
        // Filter array based on Action or Role containing the keyword
        const filtered = allLogs.filter(log =>
            (log.action && log.action.toLowerCase().includes(filterType.toLowerCase())) ||
            (log.role && log.role.toLowerCase().includes(filterType.toLowerCase()))
        );
        renderLogs(filtered);
    }
}

// ==========================================
// 6. LOGOUT LOGIC
// ==========================================
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        // 1. Clear any stored session data
        localStorage.removeItem('user');
        sessionStorage.clear();

        // 2. Redirect to Login Page
        window.location.href = 'student-login.html';
    }
}

// Check if user is actually logged in (Security Check)
document.addEventListener("DOMContentLoaded", () => {
    // Optional: If you use localStorage to store the logged-in user
    /*
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        alert("Access Denied. Admins only.");
        window.location.href = 'student-login.html';
    }
    */
});

// ==========================================
// 6. LOGOUT LOGIC
// ==========================================
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        // 1. Clear session
        localStorage.removeItem('user');
        sessionStorage.clear();

        // 2. Redirect to Login Page
        // ✅ FIX: Go UP one level (../) then into Student folder
        window.location.href = '../Student/student-login.html';
    }
}