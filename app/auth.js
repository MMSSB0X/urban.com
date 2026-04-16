// import { auth, db } from "./firebase.js";
// import { 
//     createUserWithEmailAndPassword, 
//     signInWithEmailAndPassword,
//     updateProfile,
//     onAuthStateChanged
// } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
// import { 
//     doc, 
//     setDoc, 
//     serverTimestamp 
// } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// // SMART REDIRECT: If user is already logged in, instantly push them to the store
// onAuthStateChanged(auth, (user) => {
//     if (user) {
//         window.location.replace("index.html");
//     }
// });
// // --- HANDLE SIGN UP ---
// const signupForm = document.getElementById('signup-form');

// if (signupForm) {
//     signupForm.addEventListener('submit', async (e) => {
//         e.preventDefault(); 

//         const firstName = document.getElementById('signup-first').value;
//         const lastName = document.getElementById('signup-last').value;
//         const phone = document.getElementById('signup-phone').value;
//         const email = document.getElementById('signup-email').value;
//         const password = document.getElementById('signup-password').value;

//         try {
//             const btn = signupForm.querySelector('button');
//             btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';

//             const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//             const user = userCredential.user;

//             await updateProfile(user, {
//                 displayName: `${firstName} ${lastName}`
//             });

//             // Save all fields to Firestore
//             await setDoc(doc(db, "users", user.uid), {
//                 uid: user.uid,
//                 firstName: firstName,
//                 lastName: lastName,
//                 fullName: `${firstName} ${lastName}`,
//                 phone: phone,
//                 email: email,
//                 createdAt: serverTimestamp(),
//                 role: "customer" 
//             });

//             window.location.href = "tour.html"; 

//     //     } catch (error) {
//     //         console.error("Signup Error:", error);
//     //         const btn = signupForm.querySelector('button');
//     //         btn.innerHTML = 'Create Account';
//     //         alert(error.message);
//     //     }
//     // });
//             } catch (error) {
//             console.error("Signup Error:", error);
//             const btn = signupForm.querySelector('button');
//             btn.innerHTML = 'Create Account';

//             let message = error.message;
//             if (error.code === 'auth/email-already-in-use') {
//                 message = "This email is already registered.";
//             } else if (error.code === 'auth/weak-password') {
//                 message = "Password should be at least 6 characters.";
//             }
//             alert(message);
//         }
//     });
// }
// // // --- SIGN UP LOGIC ---
// // const signupForm = document.getElementById('signup-form');
// // if (signupForm) {
// //     signupForm.addEventListener('submit', async (e) => {
// //         e.preventDefault(); 

// //         const name = document.getElementById('signup-name').value;
// //         const email = document.getElementById('signup-email').value;
// //         const password = document.getElementById('signup-password').value;
// //         const confirmPassword = document.getElementById('signup-confirm').value;

// //         if (password !== confirmPassword) {
// //             alert("Passwords do not match!");
// //             return;
// //         }

// //         try {
// //             const btn = signupForm.querySelector('button');
// //             btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';

// //             const userCredential = await createUserWithEmailAndPassword(auth, email, password);
// //             const user = userCredential.user;

// //             await updateProfile(user, { displayName: name });

// //             await setDoc(doc(db, "users", user.uid), {
// //                 uid: user.uid,
// //                 fullName: name,
// //                 email: email,
// //                 createdAt: serverTimestamp(),
// //                 role: "customer" 
// //             });

// //             window.location.replace("index.html"); 

// //         } catch (error) {
// //             console.error("Signup Error:", error);
// //             const btn = signupForm.querySelector('button');
// //             btn.innerHTML = 'Create Account';

// //             let message = error.message;
// //             if (error.code === 'auth/email-already-in-use') {
// //                 message = "This email is already registered.";
// //             } else if (error.code === 'auth/weak-password') {
// //                 message = "Password should be at least 6 characters.";
// //             }
// //             alert(message);
// //         }
// //     });
// // }

// // --- LOGIN LOGIC ---
// const loginForm = document.getElementById('login-form');
// if (loginForm) {
//     loginForm.addEventListener('submit', async (e) => {
//         e.preventDefault();

//         const email = document.getElementById('login-email').value;
//         const password = document.getElementById('login-password').value;

//         try {
//             const btn = loginForm.querySelector('button');
//             btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';

//             await signInWithEmailAndPassword(auth, email, password);
//             window.location.replace("index.html"); 

//         } catch (error) {
//             console.error("Login Error:", error);
//             const btn = loginForm.querySelector('button');
//             btn.innerHTML = '<span>Log In</span><i class="fa-solid fa-arrow-right-to-bracket"></i>';

//             let message = "Failed to login. Please check your email and password.";
//             if(error.code === 'auth/invalid-credential') {
//                 message = "Invalid email or password.";
//             }
//             alert(message);
//         }
//     });
// }















import { auth, db } from "./firebase.js";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// A flag to prevent the redirect from killing the signup process
let isSigningUp = false;

// --- CUSTOM TOAST FUNCTION ---
function showToast(message, type = 'error') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const iconClass = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    
    toast.innerHTML = `
        <i class="fa-solid ${iconClass} toast-icon"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('toast-show');
    });

    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 300); 
    }, 4000);
}

// SMART REDIRECT
onAuthStateChanged(auth, (user) => {
    // Only redirect if they are logged in AND they are NOT actively signing up
    if (user && window.location.pathname.includes('signup.html') && !isSigningUp) {
        window.location.replace("index.html");
    }
});

// --- HANDLE SIGN UP ---
const signupForm = document.getElementById('signup-form');

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        // Set the flag to true as soon as they submit!
        isSigningUp = true;

        const firstName = document.getElementById('signup-first').value;
        const lastName = document.getElementById('signup-last').value;
        const phone = document.getElementById('signup-phone').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const btn = signupForm.querySelector('button');

        try {
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';
            btn.disabled = true;

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: `${firstName} ${lastName}`
            });

            // Because 'isSigningUp' is true, the page won't redirect, giving this time to run
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                firstName: firstName,
                lastName: lastName,
                fullName: `${firstName} ${lastName}`,
                phone: phone,
                email: email,
                createdAt: serverTimestamp(),
                role: "customer" 
            });

            showToast("Account created successfully!", "success");
            
            setTimeout(() => {
                window.location.replace("tour.html"); 
            }, 1000);

        } catch (error) {
            console.error("Signup Error:", error);
            btn.innerHTML = 'Create Account';
            btn.disabled = false;
            
            // Reset the flag if there's an error so the page behaves normally again
            isSigningUp = false;

            let message = error.message;
            if (error.code === 'auth/email-already-in-use') {
                message = "This email is already registered.";
            } else if (error.code === 'auth/weak-password') {
                message = "Password should be at least 6 characters.";
            } else if (error.code === 'permission-denied') {
                message = "Database error: Permission denied. Check Firestore rules.";
            }
            
            showToast(message, "error");
        }
    });
}

// --- LOGIN LOGIC ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const btn = loginForm.querySelector('button');

        try {
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';
            btn.disabled = true;

            await signInWithEmailAndPassword(auth, email, password);
            window.location.replace("index.html"); 

        } catch (error) {
            console.error("Login Error:", error);
            btn.innerHTML = 'Log In';
            btn.disabled = false;

            let message = "Failed to login. Please check your email and password.";
            if(error.code === 'auth/invalid-credential') {
                message = "Invalid email or password.";
            }
            
            showToast(message, "error");
        }
    });
}