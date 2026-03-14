// // document.addEventListener('DOMContentLoaded', () => {
// //     const menuToggle = document.getElementById('menuToggle');
// //     const navMenu = document.getElementById('navMenu');
// //     const mobileSearchBtn = document.getElementById('mobileSearchBtn');
// //     const searchBar = document.getElementById('searchBar');
// //     const searchClose = document.getElementById('searchClose');

// //     /* --- Mobile Menu Logic --- */
// //     if(menuToggle && navMenu) {
// //         menuToggle.addEventListener('click', () => {
// //             if(searchBar) searchBar.classList.remove('active'); // Close search
// //             navMenu.classList.toggle('active');
            
// //             // Toggle Icon Animation
// //             const icon = menuToggle.querySelector('i');
// //             if (navMenu.classList.contains('active')) {
// //                 icon.classList.remove('fa-bars');
// //                 icon.classList.add('fa-xmark');
// //             } else {
// //                 icon.classList.remove('fa-xmark');
// //                 icon.classList.add('fa-bars');
// //             }
// //         });
// //     }

// //     /* --- Mobile Search Logic --- */
// //     if(mobileSearchBtn && searchBar) {
// //         mobileSearchBtn.addEventListener('click', () => {
// //             if(navMenu) navMenu.classList.remove('active'); // Close menu
// //             // Reset menu icon
// //             if(menuToggle) {
// //                  const icon = menuToggle.querySelector('i');
// //                  icon.classList.remove('fa-xmark');
// //                  icon.classList.add('fa-bars');
// //             }
// //             searchBar.classList.toggle('active');
// //             if(searchBar.classList.contains('active')) {
// //                 const input = searchBar.querySelector('input');
// //                 if(input) setTimeout(() => input.focus(), 100);
// //             }
// //         });
// //     }

// //     if(searchClose) {
// //         searchClose.addEventListener('click', () => {
// //             searchBar.classList.remove('active');
// //         });
// //     }

// //     /* --- Close on Click Outside --- */
// //     document.addEventListener('click', (e) => {
// //         // Close Menu
// //         if (navMenu && menuToggle && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
// //             navMenu.classList.remove('active');
// //             const icon = menuToggle.querySelector('i');
// //             if(icon) { icon.classList.remove('fa-xmark'); icon.classList.add('fa-bars'); }
// //         }
// //         // Close Search (Mobile)
// //         if (window.innerWidth <= 900) {
// //             if (searchBar && mobileSearchBtn && !searchBar.contains(e.target) && !mobileSearchBtn.contains(e.target)) {
// //                 searchBar.classList.remove('active');
// //             }
// //         }
// //     });

// //     /* --- Product Gallery & Quantity Logic --- */
// //     const mainImage = document.getElementById('mainImage');
// //     const thumbs = document.querySelectorAll('.thumb');
// //     if(mainImage && thumbs.length > 0) {
// //         thumbs.forEach(thumb => {
// //             thumb.addEventListener('click', function() {
// //                 mainImage.src = this.querySelector('img').src;
// //                 thumbs.forEach(t => t.classList.remove('active'));
// //                 this.classList.add('active');
// //             });
// //         });
// //     }
// //     const qtyInput = document.getElementById('qtyInput');
// //     const btnPlus = document.getElementById('btnPlus');
// //     const btnMinus = document.getElementById('btnMinus');
// //     if(qtyInput && btnPlus && btnMinus) {
// //         btnPlus.addEventListener('click', () => { qtyInput.value = parseInt(qtyInput.value) + 1; });
// //         btnMinus.addEventListener('click', () => { 
// //             let val = parseInt(qtyInput.value);
// //             if(val > 1) qtyInput.value = val - 1; 
// //         });
// //     }
// //     const tabBtns = document.querySelectorAll('.tab-btn');
// //     const tabContents = document.querySelectorAll('.tab-content');
// //     if(tabBtns.length > 0) {
// //         tabBtns.forEach(btn => {
// //             btn.addEventListener('click', () => {
// //                 tabBtns.forEach(b => b.classList.remove('active'));
// //                 tabContents.forEach(c => c.classList.remove('active'));
// //                 btn.classList.add('active');
// //                 document.getElementById(btn.getAttribute('data-target')).classList.add('active');
// //             });
// //         });
// //     }
// // });








// // ==========================================
// // 1. IMPORTS & SECURITY
// // ==========================================
// import { auth, db } from "./firebase.js";
// import { 
//     onAuthStateChanged, 
//     signOut,
//     createUserWithEmailAndPassword, 
//     signInWithEmailAndPassword,
//     updateProfile 
// } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
// import { 
//     doc, 
//     getDoc, 
//     setDoc, 
//     serverTimestamp 
// } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// // ==========================================
// // 2. AUTHENTICATION LOGIC (Login/Logout/Header)
// // ==========================================
// document.addEventListener('DOMContentLoaded', () => {
    
//     // --- A. HANDLE HEADER (Show "Hi, Name" or "Log In") ---
//     const authStateContainer = document.getElementById('auth-state');

//     // This runs automatically whenever the user login status changes
//     onAuthStateChanged(auth, async (user) => {
//         if (authStateContainer) {
//             if (user) {
//                 // > User is Logged In
//                 let displayName = user.displayName;
                
//                 // If displayName is missing in Auth, try fetching from Database
//                 if (!displayName) {
//                     try {
//                         const userDoc = await getDoc(doc(db, "users", user.uid));
//                         if (userDoc.exists()) {
//                             displayName = userDoc.data().fullName;
//                         }
//                     } catch (err) {
//                         console.log("Error fetching user name:", err);
//                     }
//                 }

//                 // Update Header HTML with Secure Logout Button
//                 authStateContainer.innerHTML = `
//                     <div style="display:flex; align-items:center; gap:10px;">
//                         <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-dark);">
//                             Hi, ${displayName || 'Friend'}
//                         </span>
//                         <button id="logout-btn" title="Log Out" style="background: #fee2e2; border:none; border-radius: 50%; width: 32px; height: 32px; cursor:pointer; color:#ef4444; display:flex; align-items:center; justify-content:center; transition:0.3s;">
//                             <i class="fa-solid fa-arrow-right-from-bracket"></i>
//                         </button>
//                     </div>
//                 `;

//                 // Add Click Listener to the new Logout Button
//                 document.getElementById('logout-btn').addEventListener('click', () => {
//                     signOut(auth).then(() => {
//                         window.location.href = "index.html";
//                     });
//                 });

//             } else {
//                 // > User is Logged Out
//                 authStateContainer.innerHTML = `
//                     <a href="login.html" style="font-weight: 600; font-size: 0.9rem;">Log In</a>
//                 `;
//             }
//         }
//     });

//     // --- B. HANDLE LOGIN FORM (If on login page) ---
//     const loginForm = document.getElementById('login-form');
//     if (loginForm) {
//         loginForm.addEventListener('submit', async (e) => {
//             e.preventDefault();
//             const email = document.getElementById('login-email').value;
//             const password = document.getElementById('login-password').value;
//             const btn = loginForm.querySelector('button');

//             try {
//                 btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...'; // Loading state
//                 await signInWithEmailAndPassword(auth, email, password);
//                 window.location.href = "index.html"; 
//             } catch (error) {
//                 console.error("Login Error:", error);
//                 btn.innerHTML = 'Log In <i class="fa-solid fa-arrow-right-to-bracket"></i>'; // Reset button
//                 alert("Invalid email or password.");
//             }
//         });
//     }

//     // --- C. HANDLE SIGNUP FORM (If on signup page) ---
//     const signupForm = document.getElementById('signup-form');
//     if (signupForm) {
//         signupForm.addEventListener('submit', async (e) => {
//             e.preventDefault();
//             const name = document.getElementById('signup-name').value;
//             const email = document.getElementById('signup-email').value;
//             const password = document.getElementById('signup-password').value;
//             const confirmPassword = document.getElementById('signup-confirm').value;
//             const btn = signupForm.querySelector('button');

//             if (password !== confirmPassword) {
//                 alert("Passwords do not match!");
//                 return;
//             }

//             try {
//                 btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';
                
//                 // 1. Create Auth User
//                 const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//                 const user = userCredential.user;

//                 // 2. Set Display Name
//                 await updateProfile(user, { displayName: name });

//                 // 3. Save to Firestore (Security Best Practice)
//                 await setDoc(doc(db, "users", user.uid), {
//                     uid: user.uid,
//                     fullName: name,
//                     email: email,
//                     createdAt: serverTimestamp(),
//                     role: "customer"
//                 });

//                 alert("Account created successfully!");
//                 window.location.href = "index.html";

//             } catch (error) {
//                 console.error("Signup Error:", error);
//                 btn.innerHTML = 'Create Account <i class="fa-solid fa-arrow-right"></i>';
//                 let msg = error.message;
//                 if (error.code === 'auth/email-already-in-use') msg = "That email is already used.";
//                 if (error.code === 'auth/weak-password') msg = "Password must be at least 6 characters.";
//                 alert(msg);
//             }
//         });
//     }

//     // ==========================================
//     // 3. UI LOGIC (Mobile Menu, Gallery, Tabs)
//     // ==========================================
    
//     // Mobile Menu & Search
//     const menuToggle = document.getElementById('menuToggle');
//     const navMenu = document.getElementById('navMenu');
//     const mobileSearchBtn = document.getElementById('mobileSearchBtn');
//     const searchBar = document.getElementById('searchBar');
//     const searchClose = document.getElementById('searchClose');

//     if(menuToggle && navMenu) {
//         menuToggle.addEventListener('click', () => {
//             if(searchBar) searchBar.classList.remove('active');
//             navMenu.classList.toggle('active');
//             const icon = menuToggle.querySelector('i');
//             if (navMenu.classList.contains('active')) {
//                 icon.classList.remove('fa-bars');
//                 icon.classList.add('fa-xmark');
//             } else {
//                 icon.classList.remove('fa-xmark');
//                 icon.classList.add('fa-bars');
//             }
//         });
//     }

//     if(mobileSearchBtn && searchBar) {
//         mobileSearchBtn.addEventListener('click', () => {
//             if(navMenu) navMenu.classList.remove('active');
//             if(menuToggle) {
//                  const icon = menuToggle.querySelector('i');
//                  icon.classList.remove('fa-xmark');
//                  icon.classList.add('fa-bars');
//             }
//             searchBar.classList.toggle('active');
//             if(searchBar.classList.contains('active')) {
//                 const input = searchBar.querySelector('input');
//                 if(input) setTimeout(() => input.focus(), 100);
//             }
//         });
//     }

//     if(searchClose) {
//         searchClose.addEventListener('click', () => {
//             searchBar.classList.remove('active');
//         });
//     }

//     // Close on Click Outside
//     document.addEventListener('click', (e) => {
//         if (navMenu && menuToggle && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
//             navMenu.classList.remove('active');
//             const icon = menuToggle.querySelector('i');
//             if(icon) { icon.classList.remove('fa-xmark'); icon.classList.add('fa-bars'); }
//         }
//         if (window.innerWidth <= 900) {
//             if (searchBar && mobileSearchBtn && !searchBar.contains(e.target) && !mobileSearchBtn.contains(e.target)) {
//                 searchBar.classList.remove('active');
//             }
//         }
//     });

//     // Product Gallery
//     const mainImage = document.getElementById('mainImage');
//     const thumbs = document.querySelectorAll('.thumb');
//     if(mainImage && thumbs.length > 0) {
//         thumbs.forEach(thumb => {
//             thumb.addEventListener('click', function() {
//                 mainImage.src = this.querySelector('img').src;
//                 thumbs.forEach(t => t.classList.remove('active'));
//                 this.classList.add('active');
//             });
//         });
//     }

//     // Quantity Selectors
//     const qtyInput = document.getElementById('qtyInput');
//     const btnPlus = document.getElementById('btnPlus');
//     const btnMinus = document.getElementById('btnMinus');
//     if(qtyInput && btnPlus && btnMinus) {
//         btnPlus.addEventListener('click', () => { qtyInput.value = parseInt(qtyInput.value) + 1; });
//         btnMinus.addEventListener('click', () => { 
//             let val = parseInt(qtyInput.value);
//             if(val > 1) qtyInput.value = val - 1; 
//         });
//     }

//     // Tabs
//     const tabBtns = document.querySelectorAll('.tab-btn');
//     const tabContents = document.querySelectorAll('.tab-content');
//     if(tabBtns.length > 0) {
//         tabBtns.forEach(btn => {
//             btn.addEventListener('click', () => {
//                 tabBtns.forEach(b => b.classList.remove('active'));
//                 tabContents.forEach(c => c.classList.remove('active'));
//                 btn.classList.add('active');
//                 document.getElementById(btn.getAttribute('data-target')).classList.add('active');
//             });
//         });
//     }
// });










// import { auth, db } from "./firebase.js";
// import { showToast } from "./toast.js"; 
// import { 
//     onAuthStateChanged, 
//     signOut,
//     createUserWithEmailAndPassword, 
//     signInWithEmailAndPassword,
//     updateProfile 
// } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
// import { 
//     doc, 
//     getDoc, 
//     setDoc, 
//     serverTimestamp 
// } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// document.addEventListener('DOMContentLoaded', () => {
    
//     // --- AUTH STATE & HEADER ---
//     const authStateContainer = document.getElementById('auth-state');
    
//     onAuthStateChanged(auth, async (user) => {
//         if (authStateContainer) {
//             if (user) {
//                 let displayName = user.displayName;
                
//                 // If Auth name is missing, try Database
//                 if (!displayName) {
//                     try {
//                         const userDoc = await getDoc(doc(db, "users", user.uid));
//                         if (userDoc.exists()) displayName = userDoc.data().fullName;
//                     } catch (err) { console.log(err); }
//                 }

//                 // --- CHANGE IS HERE: Get First Name Only ---
//                 const firstName = (displayName || 'Friend').split(' ')[0];

//                 authStateContainer.innerHTML = `
//                     <div style="display:flex; align-items:center; gap:10px;">
//                         <span id="header-username" style="font-size: 0.9rem; font-weight: 600; color: var(--text-dark);">
//                             Hi, ${firstName}
//                         </span>
//                         <button id="logout-btn" title="Log Out" style="background: #fee2e2; border:none; border-radius: 50%; width: 32px; height: 32px; cursor:pointer; color:#ef4444; display:flex; align-items:center; justify-content:center; transition:0.3s;">
//                             <i class="fa-solid fa-arrow-right-from-bracket"></i>
//                         </button>
//                     </div>
//                 `;

//                 document.getElementById('logout-btn').addEventListener('click', () => {
//                     signOut(auth).then(() => {
//                         window.location.href = "index.html";
//                     });
//                 });

//             } else {
//                 authStateContainer.innerHTML = `
//                     <a href="login.html" style="font-weight: 600; font-size: 0.9rem;">Log In</a>
//                 `;
//             }
//         }
//     });

//     // --- LOGIN FORM ---
//     const loginForm = document.getElementById('login-form');
//     if (loginForm) {
//         loginForm.addEventListener('submit', async (e) => {
//             e.preventDefault();
//             const email = document.getElementById('login-email').value;
//             const password = document.getElementById('login-password').value;
//             const btn = loginForm.querySelector('button');

//             try {
//                 btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';
//                 await signInWithEmailAndPassword(auth, email, password);
//                 showToast("Welcome back!", "success");
//                 setTimeout(() => window.location.href = "index.html", 1000);
//             } catch (error) {
//                 console.error("Login Error:", error);
//                 btn.innerHTML = 'Log In <i class="fa-solid fa-arrow-right-to-bracket"></i>';
//                 if (error.code === 'auth/invalid-credential') {
//                     showToast("Invalid email or password.", "error");
//                 } else {
//                     showToast("Login failed. Please try again.", "error");
//                 }
//             }
//         });
//     }

//     // --- SIGNUP FORM ---
//     const signupForm = document.getElementById('signup-form');
//     if (signupForm) {
//         signupForm.addEventListener('submit', async (e) => {
//             e.preventDefault();
//             const name = document.getElementById('signup-name').value;
//             const email = document.getElementById('signup-email').value;
//             const password = document.getElementById('signup-password').value;
//             const confirmPassword = document.getElementById('signup-confirm').value;
//             const btn = signupForm.querySelector('button');

//             if (password !== confirmPassword) {
//                 showToast("Passwords do not match!", "error");
//                 return;
//             }

//             try {
//                 btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';
                
//                 const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//                 const user = userCredential.user;

//                 await updateProfile(user, { displayName: name });

//                 await setDoc(doc(db, "users", user.uid), {
//                     uid: user.uid,
//                     fullName: name,
//                     email: email,
//                     createdAt: serverTimestamp(),
//                     role: "customer"
//                 });

//                 showToast("Account created successfully!", "success");
//                 setTimeout(() => window.location.href = "index.html", 1500);

//             } catch (error) {
//                 console.error("Signup Error:", error);
//                 btn.innerHTML = 'Create Account <i class="fa-solid fa-arrow-right"></i>';
                
//                 if (error.code === 'auth/email-already-in-use') {
//                     showToast("That email is already registered.", "error");
//                 } else if (error.code === 'auth/weak-password') {
//                     showToast("Password must be at least 6 characters.", "error");
//                 } else {
//                     showToast(error.message, "error");
//                 }
//             }
//         });
//     }

//     // --- MOBILE UI LOGIC ---
//     const menuToggle = document.getElementById('menuToggle');
//     const navMenu = document.getElementById('navMenu');
//     const mobileSearchBtn = document.getElementById('mobileSearchBtn');
//     const searchBar = document.getElementById('searchBar');
//     const searchClose = document.getElementById('searchClose');

//     if(menuToggle && navMenu) {
//         menuToggle.addEventListener('click', () => {
//             if(searchBar) searchBar.classList.remove('active');
//             navMenu.classList.toggle('active');
//             const icon = menuToggle.querySelector('i');
//             if (navMenu.classList.contains('active')) {
//                 icon.classList.remove('fa-bars'); icon.classList.add('fa-xmark');
//             } else {
//                 icon.classList.remove('fa-xmark'); icon.classList.add('fa-bars');
//             }
//         });
//     }
//     if(mobileSearchBtn && searchBar) {
//         mobileSearchBtn.addEventListener('click', () => {
//             if(navMenu) navMenu.classList.remove('active');
//             if(menuToggle) {
//                  const icon = menuToggle.querySelector('i');
//                  icon.classList.remove('fa-xmark'); icon.classList.add('fa-bars');
//             }
//             searchBar.classList.toggle('active');
//             if(searchBar.classList.contains('active')) {
//                 const input = searchBar.querySelector('input');
//                 if(input) setTimeout(() => input.focus(), 100);
//             }
//         });
//     }
//     if(searchClose) {
//         searchClose.addEventListener('click', () => searchBar.classList.remove('active'));
//     }
//     document.addEventListener('click', (e) => {
//         if (navMenu && menuToggle && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
//             navMenu.classList.remove('active');
//             const icon = menuToggle.querySelector('i');
//             if(icon) { icon.classList.remove('fa-xmark'); icon.classList.add('fa-bars'); }
//         }
//         if (window.innerWidth <= 900) {
//             if (searchBar && mobileSearchBtn && !searchBar.contains(e.target) && !mobileSearchBtn.contains(e.target)) {
//                 searchBar.classList.remove('active');
//             }
//         }
//     });
    
//     const mainImage = document.getElementById('mainImage');
//     const thumbs = document.querySelectorAll('.thumb');
//     if(mainImage && thumbs.length > 0) {
//         thumbs.forEach(thumb => {
//             thumb.addEventListener('click', function() {
//                 mainImage.src = this.querySelector('img').src;
//                 thumbs.forEach(t => t.classList.remove('active'));
//                 this.classList.add('active');
//             });
//         });
//     }
//     const qtyInput = document.getElementById('qtyInput');
//     const btnPlus = document.getElementById('btnPlus');
//     const btnMinus = document.getElementById('btnMinus');
//     if(qtyInput && btnPlus && btnMinus) {
//         btnPlus.addEventListener('click', () => { qtyInput.value = parseInt(qtyInput.value) + 1; });
//         btnMinus.addEventListener('click', () => { 
//             let val = parseInt(qtyInput.value);
//             if(val > 1) qtyInput.value = val - 1; 
//         });
//     }
//     const tabBtns = document.querySelectorAll('.tab-btn');
//     const tabContents = document.querySelectorAll('.tab-content');
//     if(tabBtns.length > 0) {
//         tabBtns.forEach(btn => {
//             btn.addEventListener('click', () => {
//                 tabBtns.forEach(b => b.classList.remove('active'));
//                 tabContents.forEach(c => c.classList.remove('active'));
//                 btn.classList.add('active');
//                 document.getElementById(btn.getAttribute('data-target')).classList.add('active');
//             });
//         });
//     }
// });









import { auth, db } from "./firebase.js";
import { showToast } from "./toast.js"; 
import { 
    onAuthStateChanged, 
    signOut,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    updateProfile 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
    doc, 
    getDoc, 
    setDoc, 
    onSnapshot, // <--- NEW: Listens for real-time updates
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    
    // --- AUTH STATE & HEADER ---
    const authStateContainer = document.getElementById('auth-state');
    
    onAuthStateChanged(auth, async (user) => {
        if (authStateContainer) {
            if (user) {
                // 1. Set User Name
                let displayName = user.displayName;
                if (!displayName) {
                    try {
                        const userDoc = await getDoc(doc(db, "users", user.uid));
                        if (userDoc.exists()) displayName = userDoc.data().fullName;
                    } catch (err) { console.log(err); }
                }
                const firstName = (displayName || 'Friend').split(' ')[0];

                authStateContainer.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span id="header-username" style="font-size: 0.9rem; font-weight: 600; color: var(--text-dark);">
                            Hi, ${firstName}
                        </span>
                        <button id="logout-btn" title="Log Out" style="background: #fee2e2; border:none; border-radius: 50%; width: 32px; height: 32px; cursor:pointer; color:#ef4444; display:flex; align-items:center; justify-content:center; transition:0.3s;">
                            <i class="fa-solid fa-arrow-right-from-bracket"></i>
                        </button>
                    </div>
                `;

                document.getElementById('logout-btn').addEventListener('click', () => {
                    signOut(auth).then(() => {
                        window.location.href = "index.html";
                    });
                });

                // 2. ACTIVATE CART COUNTER (Real-time)
                setupCartListener(user.uid);

            } else {
                authStateContainer.innerHTML = `
                    <a href="login.html" style="font-weight: 600; font-size: 0.9rem;">Log In</a>
                `;
            }
        }
    });

    // --- CART LISTENER FUNCTION ---
    function setupCartListener(userId) {
        // Find the cart icon container
        const cartLink = document.querySelector('a[href="cart.html"]');
        if(!cartLink) return;

        // Listen to the database
        onSnapshot(doc(db, "carts", userId), (docSnap) => {
            if (docSnap.exists()) {
                const items = docSnap.data().items || [];
                // Calculate total quantity
                const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
                
                // Update or Create Badge
                let badge = cartLink.querySelector('.cart-badge');
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'cart-badge';
                    cartLink.appendChild(badge);
                }
                
                if (totalQty > 0) {
                    badge.style.display = 'flex';
                    badge.innerText = totalQty;
                } else {
                    badge.style.display = 'none';
                }
            }
        });
    }

    // --- LOGIN FORM ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const btn = loginForm.querySelector('button');

            try {
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';
                await signInWithEmailAndPassword(auth, email, password);
                showToast("Welcome back!", "success");
                setTimeout(() => window.location.href = "index.html", 1000);
            } catch (error) {
                console.error("Login Error:", error);
                btn.innerHTML = 'Log In <i class="fa-solid fa-arrow-right-to-bracket"></i>';
                if (error.code === 'auth/invalid-credential') {
                    showToast("Invalid email or password.", "error");
                } else {
                    showToast("Login failed. Please try again.", "error");
                }
            }
        });
    }

    // --- SIGNUP FORM ---
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm').value;
            const btn = signupForm.querySelector('button');

            if (password !== confirmPassword) {
                showToast("Passwords do not match!", "error");
                return;
            }

            try {
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';
                
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await updateProfile(user, { displayName: name });

                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    fullName: name,
                    email: email,
                    createdAt: serverTimestamp(),
                    role: "customer"
                });

                showToast("Account created successfully!", "success");
                setTimeout(() => window.location.href = "index.html", 1500);

            } catch (error) {
                console.error("Signup Error:", error);
                btn.innerHTML = 'Create Account <i class="fa-solid fa-arrow-right"></i>';
                
                if (error.code === 'auth/email-already-in-use') {
                    showToast("That email is already registered.", "error");
                } else if (error.code === 'auth/weak-password') {
                    showToast("Password must be at least 6 characters.", "error");
                } else {
                    showToast(error.message, "error");
                }
            }
        });
    }

    // --- UI LOGIC (Menus) ---
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');
    const searchBar = document.getElementById('searchBar');
    const searchClose = document.getElementById('searchClose');

    if(menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            if(searchBar) searchBar.classList.remove('active');
            navMenu.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars'); icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark'); icon.classList.add('fa-bars');
            }
        });
    }
    if(mobileSearchBtn && searchBar) {
        mobileSearchBtn.addEventListener('click', () => {
            if(navMenu) navMenu.classList.remove('active');
            if(menuToggle) {
                 const icon = menuToggle.querySelector('i');
                 icon.classList.remove('fa-xmark'); icon.classList.add('fa-bars');
            }
            searchBar.classList.toggle('active');
            if(searchBar.classList.contains('active')) {
                const input = searchBar.querySelector('input');
                if(input) setTimeout(() => input.focus(), 100);
            }
        });
    }
    if(searchClose) {
        searchClose.addEventListener('click', () => searchBar.classList.remove('active'));
    }
    
    // Tab Logic (Crucial for Description to show)
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if(tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active from all
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Add active to click
                btn.classList.add('active');
                const targetId = btn.getAttribute('data-target');
                const targetContent = document.getElementById(targetId);
                if(targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }
});






// =========================================
// THEME MANAGEMENT SYSTEM
// =========================================

// Theme settings functions
function setTheme(theme) {
    const html = document.documentElement;
    
    // Remove existing theme attributes
    html.removeAttribute('data-theme');
    
    // Set new theme
    if (theme !== 'system') {
        html.setAttribute('data-theme', theme);
    }
    
    // Save preference to localStorage
    localStorage.setItem('theme-preference', theme);
    
    // Update theme selector UI
    updateThemeSelector(theme);
    
    // Dispatch custom event for theme change
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

function getPreferredTheme() {
    const saved = localStorage.getItem('theme-preference');
    if (saved) return saved;
    
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function updateThemeSelector(selectedTheme) {
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.theme === selectedTheme) {
            option.classList.add('active');
        }
    });
}

// Initialize theme on page load
function initTheme() {
    const preferredTheme = getPreferredTheme();
    setTheme(preferredTheme);
    
    // Listen for theme option clicks
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => {
            setTheme(option.dataset.theme);
        });
    });
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme-preference') || localStorage.getItem('theme-preference') === 'system') {
            const theme = e.matches ? 'dark' : 'light';
            setTheme(theme);
        }
    });
}

// Call initTheme when DOM is loaded
document.addEventListener('DOMContentLoaded', initTheme);

// Also add a global function to check theme
window.getCurrentTheme = function() {
    const html = document.documentElement;
    return html.getAttribute('data-theme') || 'system';
};

// // Add this to script.js for theme toggle button
// function initThemeToggle() {
//     const toggleBtn = document.getElementById('theme-toggle');
//     if (!toggleBtn) return;
    
//     toggleBtn.addEventListener('click', () => {
//         const currentTheme = getCurrentTheme();
//         const html = document.documentElement;
        
//         if (currentTheme === 'dark') {
//             setTheme('light');
//         } else if (currentTheme === 'light') {
//             // If switching from light, check if system preference exists
//             if (!localStorage.getItem('theme-preference')) {
//                 setTheme('system');
//             } else {
//                 setTheme('dark');
//             }
//         } else {
//             // If system, switch to dark
//             setTheme('dark');
//         }
//     });
// }

// // Call this in your DOMContentLoaded event
// // initThemeToggle();