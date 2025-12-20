document.addEventListener('DOMContentLoaded', () => {
    const dropdowns = document.querySelectorAll('.has-submenu');

    // Toggle submenu when clicking its parent link. Do not close it automatically on other clicks.
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.nav-link');
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const isOpen = dropdown.classList.contains('open');

            // Close other open menus only when opening a different one
            if (!isOpen) {
                dropdowns.forEach(item => {
                    if (item !== dropdown) {
                        item.classList.remove('open');
                        item.classList.remove('active');
                    }
                });
            }

            // Clear active state from all top-level items (so Dashboard deactivates)
            document.querySelectorAll('.nav-menu .nav-item').forEach(ni => ni.classList.remove('active'));

            // Toggle current menu (open if closed, close if open)
            dropdown.classList.toggle('open', !isOpen);

            // If opening the submenu, set this top-level item active; if closing, leave none active
            if (!isOpen) dropdown.classList.add('active');
        });
    });

    // If a top-level nav link that is NOT part of a submenu is clicked (e.g. Dashboard, Logout), close any open submenu.
    const topLinks = document.querySelectorAll('.nav-menu .nav-link');
    topLinks.forEach(link => {
        // skip links that belong to a dropdown parent (those are handled above)
        if (!link.closest('.has-submenu')) {
            link.addEventListener('click', () => {
                // close any open submenus
                dropdowns.forEach(item => item.classList.remove('open'));
                // reset active state for all top-level nav items
                document.querySelectorAll('.nav-menu .nav-item').forEach(ni => ni.classList.remove('active'));
                // mark the clicked top-level item active
                const parentNavItem = link.closest('.nav-item');
                if (parentNavItem) parentNavItem.classList.add('active');
            });
        }
    });

    // Open submenu that matches the current page so it stays open after navigation
    (function openSubmenuForCurrentPage() {
        const currentFull = window.location.pathname.split('/').pop() || '';
        const current = currentFull.split('?')[0].split('#')[0];
        if (!current) return;

        const submenuAnchors = document.querySelectorAll('.submenu a');
        let matched = false;
        submenuAnchors.forEach(a => {
            const href = a.getAttribute('href') || '';
            const file = href.split('/').pop().split('?')[0].split('#')[0];
            if (file && file === current) {
                    const parent = a.closest('.has-submenu');
                    if (parent) {
                        // Temporarily disable animation to avoid flicker during navigation
                        const submenu = parent.querySelector('.submenu');
                        if (submenu) {
                            submenu.classList.add('no-anim');
                        }

                        parent.classList.add('open');

                        // keep the parent top-level item active when the current page is inside its submenu
                        parent.classList.add('active');

                        // remove the no-anim class after a tick so future interactions animate normally
                        if (submenu) setTimeout(() => submenu.classList.remove('no-anim'), 60);
                    }

                    // mark active submenu item
                    const li = a.closest('li');
                    if (li) li.classList.add('active');
                    matched = true;
                }
        });

            // If no submenu matched, try to match top-level links (e.g., professor-dashboard.html)
            if (!matched) {
                const topLinks = document.querySelectorAll('.nav-menu > ul > .nav-item > .nav-link');
                topLinks.forEach(link => {
                    const href = link.getAttribute('href') || '';
                    const file = href.split('/').pop().split('?')[0].split('#')[0];
                    if (file && file === current) {
                        // clear active from others
                        document.querySelectorAll('.nav-menu .nav-item').forEach(ni => ni.classList.remove('active'));
                        const parent = link.closest('.nav-item');
                        if (parent) parent.classList.add('active');
                    }
                });
            }
    })();
});

function searchTable(tableId) {
    const input = document.querySelector('.search-input');
    const filter = input.value.toUpperCase();
    const table = document.getElementById(tableId);
    const tr = table.getElementsByTagName('tr');
    for (let i = 1; i < tr.length; i++) { 
        let td = tr[i].getElementsByTagName('td')[0];
        if (td) {
            const txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) tr[i].style.display = "";
            else tr[i].style.display = "none";
        }
    }
}

const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("fileInput");
if (dropArea) {
    dropArea.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (file) document.querySelector(".upload-text h3").textContent = `Selected: ${file.name}`;
    });
}