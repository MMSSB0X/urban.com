<div align="center">
  <img src="https://raw.githubusercontent.com/phosphor-icons/core/main/assets/regular/plant.svg" alt="Urban Harvest Logo" width="100" height="100">
  
  # Urban Harvest 🌿
  
  **Fresh local produce delivered straight from the farm to your door.**
  
  [![Tech Stack: HTML/CSS/JS](https://img.shields.io/badge/Tech_Stack-Vanilla_Web-2d9636?style=flat-square)]()
  [![Database: Firebase](https://img.shields.io/badge/Database-Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)]()
  [![Status: Active](https://img.shields.io/badge/Status-Active-success?style=flat-square)]()
</div>

---

## 📖 Overview

**Urban Harvest** is a lightweight, high-performance e-commerce web application designed with a mobile-first approach. It connects users directly with local farms, allowing them to browse, cart, and purchase fresh agricultural products. 

This project intentionally avoids heavy frontend frameworks like React or Tailwind, relying entirely on **pure HTML, custom CSS, and Vanilla JavaScript** for maximum performance, granular control, and clean code architecture.

## ✨ Key Features

* **📱 Mobile-First UI/UX:** Responsive, app-like experience with bottom-navigation bars, sticky headers, and smooth CSS animations.
* **🔐 Secure Authentication:** Full user onboarding (Sign Up / Log In) with Firebase Authentication.
* **🛒 Smart Cart System:** Real-time quantity adjustments, price calculations, and sticky checkout summaries.
* **🔍 Intelligent Search:** Real-time dropdown search suggestions to easily find specific farms or products.
* **🛡️ Role-Based Access Control:** Secure Firestore rules supporting `Customer`, `Admin`, and `Driver` roles for comprehensive order management.
* **🔔 Custom Toast Notifications:** Elegant, non-blocking UI alerts built entirely with custom CSS and JS.

## 🛠️ Technology Stack

* **Frontend:** Pure HTML5, Native CSS3 (CSS Variables, Flexbox/Grid), Vanilla JavaScript (ES6+ Modules).
* **Backend & Database:** Firebase (Authentication, Cloud Firestore).
* **Icons:** FontAwesome & Phosphor Icons.
* **Design Assets:** Custom modern styling with subtle glassmorphism and animated loaders.

## 📂 Project Structure

```text
/
├── index.html          # Main store / product feed
├── signup.html         # User registration page
├── login.html          # User login page
├── product.html        # Detailed product view
├── cart.html           # Shopping cart and checkout
├── profile.html        # User profile and order history
├── style.css           # Global custom stylesheet
├── auth.js             # Firebase authentication logic
├── app.js              # Main application logic (cart, UI interactions)
└── firebase.js         # Firebase initialization and config
