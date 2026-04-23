// import { auth } from "./firebase.js";
// import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// // ==========================================
// // 1. ADMIN AUTHORIZATION LIST
// // ==========================================
// // Add all your authorized admin emails here!
// const ALLOWED_ADMINS = [
//     'mmssbishady0@gmail.com',
//     'mmsbishady0@gmail.com'
//     // 'muramust8@gmail.com'
// ]; 

// // ==========================================
// // 2. THEME ENGINE
// // ==========================================
// export function initTheme() {
//     const savedTheme = localStorage.getItem('adm-theme') || 'system';
//     applyTheme(savedTheme);

//     window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
//         if (localStorage.getItem('adm-theme') === 'system') {
//             document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
//         }
//     });
// }

// export function applyTheme(themeMode) {
//     localStorage.setItem('adm-theme', themeMode);
//     if (themeMode === 'system') {
//         const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
//         document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
//     } else {
//         document.documentElement.setAttribute('data-theme', themeMode);
//     }
// }
// initTheme(); // Run immediately

// // ==========================================
// // 3. UI & MENU LOGIC
// // ==========================================
// document.addEventListener('DOMContentLoaded', () => {
    
//     // Auth Check
//     if (!window.location.pathname.includes('admin-login.html')) {
//         onAuthStateChanged(auth, (user) => {
//             if (!user || !ALLOWED_ADMINS.includes(user.email.toLowerCase())) {
//                 window.location.replace("admin-login.html");
//             }
//         });
//     }

//     // Sidebar Toggle (Desktop)
//     const sidebar = document.getElementById('sidebar');
//     const toggleBtn = document.getElementById('toggle-sidebar');
//     if (sidebar && toggleBtn) {
//         if (localStorage.getItem('sidebar-collapsed') === 'true') sidebar.classList.add('collapsed');
//         toggleBtn.addEventListener('click', () => {
//             sidebar.classList.toggle('collapsed');
//             localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));
//         });
//     }

//     // Mobile Menu Drag Logic (Gahwa Style)
//     const menu = document.getElementById('bottomMenu');
//     const overlay = document.getElementById('overlay');
//     const openMenuBtn = document.getElementById('open-mobile-menu');
//     const dragZone = document.getElementById('dragZone');

//     if (menu && overlay && openMenuBtn && dragZone) {
//         openMenuBtn.addEventListener('click', () => {
//             menu.classList.add('active');
//             overlay.classList.add('active');
//             menu.style.transform = 'translateY(0)';
//         });

//         window.closeMobileMenu = function() {
//             menu.classList.remove('active');
//             overlay.classList.remove('active');
//             setTimeout(() => menu.style.transform = '', 300);
//         };
//         overlay.addEventListener('click', window.closeMobileMenu);

//         let startY = 0; let isDragging = false;
//         dragZone.addEventListener('touchstart', (e) => { 
//             startY = e.touches[0].clientY; 
//             isDragging = true; 
//             menu.style.transition = 'none'; 
//         }, {passive: true});
        
//         dragZone.addEventListener('touchmove', (e) => { 
//             if (!isDragging) return; 
//             const deltaY = e.touches[0].clientY - startY; 
//             if (deltaY > 0) requestAnimationFrame(() => menu.style.transform = `translateY(${deltaY}px)`); 
//         }, {passive: true});
        
//         dragZone.addEventListener('touchend', (e) => { 
//             isDragging = false; 
//             menu.style.transition = 'bottom 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s'; 
//             if (e.changedTouches[0].clientY - startY > 50) {
//                 window.closeMobileMenu();
//             } else {
//                 menu.style.transform = 'translateY(0)';
//             }
//         });
//     }

//     // Logout Functionality
//     const logoutBtns = document.querySelectorAll('.logout-btn');
//     logoutBtns.forEach(btn => {
//         btn.addEventListener('click', () => {
//             signOut(auth).then(() => window.location.replace("admin-login.html"));
//         });
//     });
// });




















import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const ALLOWED_ADMINS = ['mmssbishady0@gmail.com', 'mmsbishady0@gmail.com', 'muramust8@gmail.com'];

// ==========================================
// 1. THEME ENGINE (For Settings & OS Changes)
// ==========================================
export function applyTheme(themeMode) {
    localStorage.setItem('adm-theme', themeMode);
    if (themeMode === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
        document.documentElement.setAttribute('data-theme', themeMode);
    }
}

// Watch for OS level theme changes dynamically
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (localStorage.getItem('adm-theme') === 'system') {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
});

// ==========================================
// 2. UI & MENU LOGIC
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    if (!window.location.pathname.includes('admin-login.html')) {
        onAuthStateChanged(auth, (user) => {
            if (!user || !ALLOWED_ADMINS.includes(user.email.toLowerCase())) {
                window.location.replace("admin-login.html");
            }
        });
    }

    // --- Desktop Sidebar Toggle ---
    const toggleBtn = document.getElementById('toggle-sidebar');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            // Toggle the class on the HTML tag, which triggers CSS instantly
            const isCollapsed = document.documentElement.classList.toggle('sidebar-is-collapsed');
            localStorage.setItem('sidebar-collapsed', isCollapsed);
        });
    }

    // --- Mobile Bottom Menu (Drag to Close) ---
    const menu = document.getElementById('bottomMenu');
    const overlay = document.getElementById('overlay');
    const openMenuBtn = document.getElementById('open-mobile-menu');
    const dragZone = document.getElementById('dragZone');

    if (menu && overlay && openMenuBtn && dragZone) {
        openMenuBtn.addEventListener('click', () => {
            menu.classList.add('active');
            overlay.classList.add('active');
            menu.style.transform = 'translateY(0)';
        });

        window.closeMobileMenu = function() {
            menu.classList.remove('active');
            overlay.classList.remove('active');
            setTimeout(() => menu.style.transform = '', 300);
        };
        overlay.addEventListener('click', window.closeMobileMenu);

        let startY = 0; let isDragging = false;
        
        dragZone.addEventListener('touchstart', (e) => { 
            startY = e.touches[0].clientY; isDragging = true; menu.style.transition = 'none'; 
        }, {passive: true});
        
        dragZone.addEventListener('touchmove', (e) => { 
            if (!isDragging) return; const deltaY = e.touches[0].clientY - startY; 
            if (deltaY > 0) requestAnimationFrame(() => menu.style.transform = `translateY(${deltaY}px)`); 
        }, {passive: true});
        
        dragZone.addEventListener('touchend', (e) => { 
            isDragging = false; menu.style.transition = 'bottom 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s'; 
            if (e.changedTouches[0].clientY - startY > 50) window.closeMobileMenu();
            else menu.style.transform = 'translateY(0)';
        });
    }

    // --- Logout Functionality ---
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', () => signOut(auth).then(() => window.location.replace("admin-login.html")));
    });
});