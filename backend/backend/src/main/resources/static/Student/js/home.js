// ==========================================
// 1. CONFIGURATION
// ==========================================
let courses = [];
let currentIndex = 0;

const bgContainer = document.getElementById('bg-container');
const cardTrack = document.getElementById('card-track');
const textContent = document.getElementById('text-content');

// This points to your root uploads folder served by Spring Boot
const IMG_BASE_URL = "http://localhost:8080/uploads/";

// ==========================================
// 2. DATA FETCHING & PROCESSING
// ==========================================
async function fetchCourses() {
    try {
        const response = await fetch('http://localhost:8080/api/admin/courses');
        if (!response.ok) throw new Error("Failed to fetch courses");

        const dbCourses = await response.json();

        // Transform Database Data -> Frontend Format
        courses = dbCourses.map(c => {
            // --- IMAGE LOGIC ---
            // 1. Get the image string from DB (handle null)
            let imgPart = c.image || '';

            // 2. Clean up path: Remove 'uploads/' if it was saved in the DB string
            // We want just the filename, e.g., "my-pic.png"
            if (imgPart.startsWith('uploads/') || imgPart.startsWith('uploads\\')) {
                imgPart = imgPart.substring(8);
            }
            // Remove leading slash if present
            if (imgPart.startsWith('/')) imgPart = imgPart.substring(1);

            // 3. Construct Final URL
            // If empty, use a placeholder. Otherwise, combine base URL + filename
            let finalUrl = imgPart ? `${IMG_BASE_URL}${imgPart}` : 'https://via.placeholder.com/280x350?text=No+Image';

            // --- COLOR LOGIC ---
            const color = c.themeColor || '#3b82f6'; // Default blue
            const darkerColor = adjustBrightness(color, -50);

            return {
                id: c.id,
                title: c.title,
                desc: c.description,
                color: color,
                // Card Style: Background Color (fallback) + Image + Gradient Overlay
                cardStyle: `background-color: ${color}; background-image: url('${finalUrl}'), linear-gradient(135deg, ${darkerColor} 80%, ${color} 100%);`,
                // Background Style: Black base + Image + Dark Gradient
                bgStyle: `background-color: #000; background-image: url('${finalUrl}'), linear-gradient(to right, #000 0%, ${color} 100%);`
            };
        });

        // Only start the carousel if we have data
        if (courses.length > 0) {
            init();
        } else {
            console.warn("No courses found in database.");
        }

    } catch (error) {
        console.error("Error loading courses:", error);
    }
}

// Helper: Darken or Lighten a Hex Color
function adjustBrightness(col, amt) {
    col = col.replace(/^#/, '');
    if (col.length === 3) col = col[0]+col[0]+col[1]+col[1]+col[2]+col[2];

    let num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    let b = ((num >> 8) & 0x00FF) + amt;
    let g = (num & 0x0000FF) + amt;

    // Clamp values between 0 and 255
    return "#" + (0x1000000 + (r<255?r<1?0:r:255)*0x10000 + (b<255?b<1?0:b:255)*0x100 + (g<255?g<1?0:g:255)).toString(16).slice(1);
}

// ==========================================
// 3. CAROUSEL RENDER & LOGIC
// ==========================================
function init() {
    if (!bgContainer || !cardTrack) return;

    bgContainer.innerHTML = '<div class="bg-overlay"></div>';
    cardTrack.innerHTML = '';

    // Render Background Slides
    courses.forEach((c, index) => {
        const div = document.createElement('div');
        div.className = `bg-slide ${index === 0 ? 'active' : ''}`;
        div.style = c.bgStyle;
        bgContainer.prepend(div);
    });

    // Render Cards
    courses.forEach((c, index) => {
        const card = document.createElement('div');
        card.className = 'course-card';
        card.style = c.cardStyle;
        card.onclick = () => handleCardClick(index);
        cardTrack.appendChild(card);
    });

    updateCarousel();
}

function handleCardClick(index) {
    if (index !== currentIndex) {
        currentIndex = index;
        updateCarousel();
        return;
    }
    // Navigation Logic
    if (window.location.href.includes('landing.html')) {
        // If on Landing Page, show Login Modal
        const modal = document.getElementById('authModal');
        if (modal) modal.style.display = 'flex';
    } else {
        // If on Student Home, go to Dashboard
        window.location.href = `dashboard.html?course=${courses[currentIndex].id}`;
    }
}

function updateCarousel() {
    const cards = document.querySelectorAll('.course-card');
    const bgs = document.querySelectorAll('.bg-slide');
    const data = courses[currentIndex];

    if(!data) return;

    // 1. Update Card Positions
    cards.forEach((card, index) => {
        card.className = 'course-card';
        let diff = (index - currentIndex + courses.length) % courses.length;
        if (diff === 0) card.classList.add('active');
        else if (diff === 1) card.classList.add('next');
        else if (diff === courses.length - 1) card.classList.add('prev');
        else card.classList.add('hidden-card');
    });

    // 2. Update Backgrounds
    // (We reverse the array because prepended divs are in reverse DOM order)
    const allSlides = Array.from(document.querySelectorAll('.bg-slide')).reverse();
    allSlides.forEach((bg, index) => {
        if(index === currentIndex) bg.classList.add('active');
        else bg.classList.remove('active');
    });

    // 3. Update Text with Animation
    const titleEl = document.getElementById('course-title');
    const descEl = document.getElementById('course-desc');

    if (textContent && titleEl && descEl) {
        // Fade out
        textContent.style.opacity = '0';
        textContent.style.transform = 'translateY(20px)';

        // Wait, change text, then fade in
        setTimeout(() => {
            titleEl.innerHTML = data.title;
            descEl.innerText = data.desc;
            descEl.style.borderColor = data.color;

            textContent.style.opacity = '1';
            textContent.style.transform = 'translateY(0)';
        }, 300);
    }
}

// ==========================================
// 4. EVENT LISTENERS
// ==========================================
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const viewLessonBtn = document.getElementById('viewLessonBtn');

if (prevBtn) prevBtn.onclick = () => {
    currentIndex = (currentIndex - 1 + courses.length) % courses.length;
    updateCarousel();
};

if (nextBtn) nextBtn.onclick = () => {
    currentIndex = (currentIndex + 1) % courses.length;
    updateCarousel();
};

if (viewLessonBtn) viewLessonBtn.onclick = () => {
    window.location.href = `dashboard.html?course=${courses[currentIndex].id}`;
};

// Start the Application
fetchCourses();