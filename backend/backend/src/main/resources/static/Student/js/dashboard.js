// ==========================================
// 1. INIT & GLOBAL VARIABLES
// ==========================================
const params = new URLSearchParams(window.location.search);
const courseId = params.get('course') || 'it';
let allSubjects = [];
let currentYearFilter = "All Years";
let showAllCards = false; // ✅ NEW: Tracks if we should show all cards or just 3

document.addEventListener("DOMContentLoaded", () => {
    // A. Load Course Info
    fetch(`https://YOUR-APP-NAME.onrender.com/api/courses/${cId}/subjects`)
        .then(r => r.json())
        .then(data => {
            const titleEl = document.getElementById('dashboard-title');
            if(titleEl) titleEl.innerText = data.title;
            fetchSubjects(courseId);
        })
        .catch(e => console.error("Error loading course:", e));

    // B. Load Recent Views (Syncs automatically from LocalStorage)
    renderRecentViews();
});

// ==========================================
// 2. DATA FETCHING
// ==========================================
function fetchSubjects(cId) {
    fetch(`https://YOUR-APP-NAME.onrender.com/api/courses/${cId}/subjects`)
        .then(r => r.json())
        .then(subjects => {
            allSubjects = subjects;
            applyFilter();
        })
        .catch(e => console.error(e));
}

// ==========================================
// 3. RENDERING CARDS (With "Show More" Logic)
// ==========================================
function renderCards(subjects) {
    const grid = document.getElementById('cardsGrid');
    if (!grid) return;

    if (subjects.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No subjects found for this category.</p>';
        return;
    }

    // ✅ LOGIC: Determine which subjects to show
    // If showAllCards is true, show everything. If false, show only the first 3.
    const visibleSubjects = showAllCards ? subjects : subjects.slice(0, 3);
    const hasHiddenCards = subjects.length > 3;

    const palette = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6'];

    // 1. Generate HTML for the visible cards
    let html = visibleSubjects.map((s, index) => {
        const color = palette[index % palette.length];
        const subjectData = encodeURIComponent(JSON.stringify(s));

        return `
        <div class="card" style="border-top-color: ${color}">
            <div>
                <div class="card-code" style="color:${color}">${s.code}</div>
                <div class="card-title">${s.title}</div>
                <div style="font-size: 0.8rem; color: #9ca3af; margin-top: 5px;">
                    ${s.yearLevel ? convertYear(s.yearLevel) : 'Year N/A'}
                </div>
            </div>
            <div>
                <button class="btn-view"
                        style="background:${color}"
                        onclick="handleSubjectClick('${subjectData}')">
                    View
                </button>
            </div>
        </div>`;
    }).join('');

    // 2. Add "View More" / "View Less" Button if needed
    if (hasHiddenCards) {
        const btnText = showAllCards ? "Show Less ▲" : `View More (${subjects.length - 3} hidden) ▼`;

        // We append a special div that spans all columns to hold the button
        html += `
        <div style="grid-column: 1 / -1; display: flex; justify-content: center; margin-top: 10px;">
            <button onclick="toggleShowAll()"
                    style="padding: 10px 20px; background: #e5e7eb; border: none; border-radius: 20px; cursor: pointer; font-weight: 600; color: #374151; transition: background 0.2s;">
                ${btnText}
            </button>
        </div>
        `;
    }

    grid.innerHTML = html;
}

// ✅ NEW: Toggles the view mode
function toggleShowAll() {
    showAllCards = !showAllCards;
    applyFilter(); // Re-render with new state
}

function convertYear(num) {
    if(num == 1) return "1st Year";
    if(num == 2) return "2nd Year";
    if(num == 3) return "3rd Year";
    if(num == 4) return "4th Year";
    return num + " Year";
}

// ==========================================
// 4. FILTERING LOGIC
// ==========================================
function applyFilter() {
    let filtered = allSubjects;

    // Filter by Year
    if (currentYearFilter !== "All Years") {
        const yearMap = { "1st Year": 1, "2nd Year": 2, "3rd Year": 3, "4th Year": 4 };
        const targetYear = yearMap[currentYearFilter];
        if (targetYear) filtered = filtered.filter(s => s.yearLevel === targetYear);
    }

    // Filter by Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value) {
        const term = searchInput.value.toLowerCase();
        filtered = filtered.filter(s =>
            s.title.toLowerCase().includes(term) ||
            s.code.toLowerCase().includes(term)
        );
    }

    // Note: We do NOT reset 'showAllCards' here so the user stays expanded if they are searching
    // But if you want to collapse every time they filter, uncomment the next line:
    // showAllCards = false;

    renderCards(filtered);
}

// ==========================================
// 5. DROPDOWN & SEARCH UI
// ==========================================
const filterBtn = document.getElementById('filterBtn');
const filterDropdown = document.getElementById('filterDropdown');
const filterText = document.getElementById('filterBtnText');
const filterOptions = document.querySelectorAll('.filter-option');

if (filterBtn && filterDropdown) {
    filterBtn.onclick = (e) => {
        e.stopPropagation();
        filterDropdown.classList.toggle('show');
    };
}

filterOptions.forEach(opt => {
    opt.onclick = (e) => {
        const val = e.target.getAttribute('data-value');
        currentYearFilter = val;
        if(filterText) filterText.innerText = val;
        filterDropdown.classList.remove('show');

        showAllCards = false; // Optional: Collapse list when changing year filter
        applyFilter();
    };
});

window.onclick = (e) => {
    if (filterDropdown && !filterBtn.contains(e.target)) filterDropdown.classList.remove('show');
};

const searchInput = document.getElementById('searchInput');
if(searchInput) searchInput.onkeyup = () => applyFilter();

// ==========================================
// 6. RECENT VIEW SYNC LOGIC
// ==========================================
function handleSubjectClick(encodedSubject) {
    const subject = JSON.parse(decodeURIComponent(encodedSubject));

    // 1. Get existing
    let recent = JSON.parse(localStorage.getItem('recentSubjects')) || [];

    // 2. Remove duplicate if exists
    recent = recent.filter(r => r.code !== subject.code);

    // 3. Add to top
    recent.unshift({
        title: subject.title,
        code: subject.code,
        yearLevel: subject.yearLevel
    });

    // 4. Limit to 3 items in history
    if (recent.length > 3) recent.pop();

    // 5. Save
    localStorage.setItem('recentSubjects', JSON.stringify(recent));

    // 6. Redirect
    window.location.href = `Roadmap.html?id=${subject.code}&title=${encodeURIComponent(subject.title)}`;
}

function renderRecentViews() {
    const recentListEl = document.querySelector('.recent-list');
    if (!recentListEl) return;

    const recent = JSON.parse(localStorage.getItem('recentSubjects')) || [];

    if (recent.length === 0) {
        recentListEl.innerHTML = '<div style="color:#9ca3af; padding:10px;">No recently viewed subjects.</div>';
        return;
    }

    // ✅ SYNC: This reads from the same LocalStorage we write to above
    recentListEl.innerHTML = recent.map(s => `
        <div class="recent-item" onclick="window.location.href='Roadmap.html?id=${s.code}&title=${encodeURIComponent(s.title)}'" style="cursor:pointer;">
            <span class="recent-title">${s.code}: ${s.title}</span>
            <span class="recent-year">${convertYear(s.yearLevel)}</span>
        </div>
    `).join('');
}