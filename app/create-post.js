import { auth, db } from "./firebase.js";
import { collection, addDoc, serverTimestamp, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { products, getProductById } from "./products.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

let currentUser = null;
let currentUserName = "Urban Farmer";

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            currentUserName = user.displayName;
            if (!currentUserName) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) currentUserName = userDoc.data().fullName;
                } catch (err) { console.log(err); }
            }
        } else {
            window.location.href = "login.html";
        }
    });

    // --- MODAL ELEMENTS ---
    const modal = document.getElementById('product-modal');
    const openModalBtn = document.getElementById('open-product-modal-btn');
    const closeModalBtn = document.getElementById('close-product-modal');
    const modalProductList = document.getElementById('modal-product-list');
    const modalSearchInput = document.getElementById('modal-product-search');
    
    // --- FORM ELEMENTS ---
    const selectedInput = document.getElementById('selected-product-id');
    const selectedDisplay = document.getElementById('selected-product-display');

    // 1. Open/Close Modal
    openModalBtn.addEventListener('click', () => {
        modal.classList.add('active');
        renderModalProducts(); // Ensure full list is loaded on open
        modalSearchInput.value = ""; // Clear old searches
    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // 2. Render Products Inside Modal
    function renderModalProducts(filterText = "") {
        if (!modalProductList) return;
        modalProductList.innerHTML = '';
        
        const filteredProducts = products.filter(p => 
            p.name.toLowerCase().includes(filterText.toLowerCase()) || 
            (p.category && p.category.toLowerCase().includes(filterText.toLowerCase()))
        );

        if (filteredProducts.length === 0) {
            modalProductList.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No products found.</div>`;
            return;
        }

        filteredProducts.forEach(prod => {
            const item = document.createElement('div');
            item.className = 'product-list-item';
            
            item.innerHTML = `
                <img src="${prod.image}" alt="${prod.name}" onerror="this.src='https://via.placeholder.com/60'"/>
                <div class="product-list-info">
                    <h5>${prod.name}</h5>
                    <p>EGP ${prod.price.toFixed(2)}</p>
                </div>
                <i class="ph-bold ph-plus-circle text-primary" style="font-size: 1.5rem;"></i>
            `;
            
            item.addEventListener('click', () => {
                selectProduct(prod.id);
            });
            
            modalProductList.appendChild(item);
        });
    }

    // Live Search Listener inside modal
    if (modalSearchInput) {
        modalSearchInput.addEventListener('input', (e) => {
            renderModalProducts(e.target.value.trim());
        });
    }

    // 3. Handle Product Selection
    function selectProduct(productId) {
        selectedInput.value = productId;
        modal.classList.remove('active'); // Close modal
        
        const prod = getProductById(productId);
        if (prod) {
            // Hide the "Select Product" button
            openModalBtn.style.display = 'none';
            
            // Show the styled selected chip
            selectedDisplay.style.display = 'block';
            selectedDisplay.innerHTML = `
                <div class="selected-chip">
                    <div class="selected-chip-content">
                        <img src="${prod.image}" alt="${prod.name}" onerror="this.src='https://via.placeholder.com/60'"/>
                        <div>
                            <h5>${prod.name}</h5>
                            <p>EGP ${prod.price.toFixed(2)}</p>
                        </div>
                    </div>
                    <button type="button" class="remove-tag-btn" id="remove-tag-btn">
                        <i class="ph-bold ph-trash"></i>
                    </button>
                </div>
            `;

            // Attach listener to remove button
            document.getElementById('remove-tag-btn').addEventListener('click', () => {
                selectedInput.value = "";
                selectedDisplay.style.display = 'none';
                openModalBtn.style.display = 'flex'; // Show select button again
            });
        }
    }

    // --- FORM SUBMISSION ---
    const postForm = document.getElementById('create-post-form');
    const submitBtn = document.getElementById('submit-post-btn');

    if (postForm) {
        postForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentUser) return;

            const content = document.getElementById('post-content').value.trim();
            const taggedProductId = document.getElementById('selected-product-id').value;

            if (!content) return;

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publishing...';

                await addDoc(collection(db, "posts"), {
                    userId: currentUser.uid,
                    authorName: currentUserName || "Urban Farmer",
                    content: content,
                    taggedProductId: taggedProductId || null,
                    createdAt: serverTimestamp(),
                    likesCount: 0,
                    likedBy: [],
                    commentsCount: 0,
                    savedBy: [] 
                });

                window.location.replace("community.html");

            } catch (error) {
                console.error("Error creating post:", error);
                alert("Failed to publish post.");
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="ph-bold ph-paper-plane-tilt"></i> Publish Post';
            }
        });
    }
});