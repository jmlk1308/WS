const params = new URLSearchParams(window.location.search);
const subjectId = params.get('id');
const subjectTitle = params.get('title');

const titleElement = document.getElementById('roadmap-title');
const container = document.getElementById('timeline-tracks');

// 1. Set the Title immediately
if (subjectId) {
    titleElement.innerText = `${subjectId}: ${subjectTitle || ''}`;
} else {
    titleElement.innerText = "Error: No Subject Selected";
}

// 2. Fetch Modules from Backend
if (subjectId) {
    // IMPORTANT: Accessing port 8080 where your backend runs
    fetch(`http://localhost:8080/api/admin/modules?subjectCode=${subjectId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server Error: ${response.status}`);
            }
            return response.json();
        })
        .then(modules => {
            if (modules.length === 0) {
                container.innerHTML = "<div class='text-center mt-10' style='text-align:center; color:gray;'>No modules created for this subject yet.</div>";
                return;
            }
            renderModules(modules);
        })
        .catch(err => {
            console.error("Fetch failed:", err);
            container.innerHTML = `<div style='text-align:center; color:red; margin-top:20px;'>
                <strong>Failed to load modules.</strong><br>
                Is the backend running?<br>
                <small>${err.message}</small>
            </div>`;
        });
}

function renderModules(modules) {
    container.innerHTML = ''; // Clear loading text

    modules.forEach((mod, index) => {
        // Alternating Layout (Left/Right)
        const isLeft = index % 2 === 0;
        const sideClass = isLeft ? 'left' : 'right';

        // Color: Red if active, Gray if locked
        const pinColor = mod.status === 'active' ? '#ef4444' : '#9ca3af';

        // NOTE: mod.moduleNumber matches your JSON output
        const html = `
        <div class="module-row ${sideClass}">
            <div class="module-card" onclick="openModule(${mod.id}, '${mod.title}')">
                <div class="module-title">Module ${mod.moduleNumber}: ${mod.title}</div>
                <div class="module-desc">${mod.description || ''}</div>
                <span class="status-badge ${mod.status === 'active' ? 'status-active' : 'status-locked'}">
                    ${mod.status ? mod.status.toUpperCase() : 'LOCKED'}
                </span>
            </div>
            <div class="module-marker" style="background-color: ${pinColor};">
                ${mod.moduleNumber}
            </div>
            <div style="width: 42%;"></div>
        </div>`;

        container.innerHTML += html;
    });
}

function openModule(moduleId, moduleTitle) {
    // Redirects to the Subject page
    window.location.href = `Subject.html?id=${subjectId}&title=${encodeURIComponent(subjectTitle)}&moduleId=${moduleId}&moduleTitle=${encodeURIComponent(moduleTitle)}`;
}