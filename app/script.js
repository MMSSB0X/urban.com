import { auth, db } from "./firebase.js";
import { showToast } from "./toast.js"; 
import { products, getProductById } from "./products.js";
import { 
    onAuthStateChanged, 
    signOut,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
    doc, 
    getDoc, 
    setDoc, 
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    




    // ==========================================
    // 1. GLOBAL STATE & STRICT AUTHENTICATION
    // ==========================================
    let currentUser = null;

    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        const globalLoader = document.getElementById('global-loader');
        
        if (user) {
            // USER IS LOGGED IN -> Let them use the app
            
            // Set User Name in Header
            const authStateContainer = document.getElementById('auth-state');
            if (authStateContainer) {
                let displayName = user.displayName;
                if (!displayName) {
                    try {
                        const userDoc = await getDoc(doc(db, "users", user.uid));
                        if (userDoc.exists()) displayName = userDoc.data().fullName;
                    } catch (err) { console.log(err); }
                }
                const firstName = (displayName || 'Friend').split(' ')[0];

                authStateContainer.innerHTML = `
                    <span id="header-username" style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">
                        Hello, ${firstName} 👋
                    </span>
                `;
            }

            // Activate global cart badge features
            setupCartBadgeListener(user.uid);
            
            // Render cart items only if we are on the cart page
            if (window.location.pathname.includes('cart.html')) {
                renderFirebaseCart(user.uid);
            }

            // -> FIREBASE IS READY: HIDE THE LOADER
            if (globalLoader) {
                globalLoader.classList.add('hidden');
            }
} else {
    // USER IS NOT LOGGED IN
    if (!window.location.pathname.includes('start.html') && 
        !window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('signup.html')) {
        window.location.replace("start.html"); // <--- THIS IS TRIGGERING
} else {
    // ...

        // } else {
        //     // USER IS NOT LOGGED IN
        //     if (!window.location.pathname.includes('start.html') && 
        //         !window.location.pathname.includes('login.html') && 
        //         !window.location.pathname.includes('signup.html')) {
        //         window.location.replace("start.html");
        //     } else {
                // If they are safely on start/login/signup, just hide the loader
                if (globalLoader) {
                    globalLoader.classList.add('hidden');
                }
            }
        }
    });
// onAuthStateChanged(auth, async (user) => {
//         currentUser = user;
        
//         if (user) {
//             // USER IS LOGGED IN -> Let them use the app
            
//             // Set User Name in Header (Clean App Greeting)
//             const authStateContainer = document.getElementById('auth-state');
//             if (authStateContainer) {
//                 let displayName = user.displayName;
//                 if (!displayName) {
//                     try {
//                         const userDoc = await getDoc(doc(db, "users", user.uid));
//                         if (userDoc.exists()) displayName = userDoc.data().fullName;
//                     } catch (err) { console.log(err); }
//                 }
//                 const firstName = (displayName || 'Friend').split(' ')[0];

//                 // Just a clean greeting, no logout button here!
//                 authStateContainer.innerHTML = `
//                     <span id="header-username" style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">
//                         Hi, ${firstName} 👋
//                     </span>
//                 `;
//             }

//             // Activate global cart badge features
//             setupCartBadgeListener(user.uid);
            
//             // Render cart items only if we are on the cart page
//             if (window.location.pathname.includes('cart.html')) {
//                 renderFirebaseCart(user.uid);
//             }

//         } else {
//             // USER IS NOT LOGGED IN -> Kick them immediately to start.html
//             if (!window.location.pathname.includes('start.html') && 
//                 !window.location.pathname.includes('login.html') && 
//                 !window.location.pathname.includes('signup.html')) {
//                 window.location.replace("start.html");
//             }
//         }
//     });
    // onAuthStateChanged(auth, async (user) => {
    //     currentUser = user;
        
    //     if (user) {
    //         // USER IS LOGGED IN -> Let them use the app
            
    //         // Set User Name in Header
    //         const authStateContainer = document.getElementById('auth-state');
    //         if (authStateContainer) {
    //             let displayName = user.displayName;
    //             if (!displayName) {
    //                 try {
    //                     const userDoc = await getDoc(doc(db, "users", user.uid));
    //                     if (userDoc.exists()) displayName = userDoc.data().fullName;
    //                 } catch (err) { console.log(err); }
    //             }
    //             const firstName = (displayName || 'Friend').split(' ')[0];

    //             authStateContainer.innerHTML = `
    //                 <div style="display:flex; align-items:center; gap:10px;">
    //                     <span id="header-username" style="font-size: 0.9rem; font-weight: 600; color: var(--text-dark);">
    //                         Hi, ${firstName}
    //                     </span>
    //                     <button id="logout-btn" title="Log Out" style="background: #fee2e2; border:none; border-radius: 50%; width: 32px; height: 32px; cursor:pointer; color:#ef4444; display:flex; align-items:center; justify-content:center; transition:0.3s;">
    //                         <i class="fa-solid fa-arrow-right-from-bracket"></i>
    //                     </button>
    //                 </div>
    //             `;

    //             // Logout logic
    //             document.getElementById('logout-btn').addEventListener('click', () => {
    //                 signOut(auth).then(() => {
    //                     window.location.replace("start.html");
    //                 });
    //             });
    //         }

    //         // Activate global cart badge features
    //         setupCartBadgeListener(user.uid);
            
    //         // Render cart items only if we are on the cart page
    //         if (window.location.pathname.includes('cart.html')) {
    //             renderFirebaseCart(user.uid);
    //         }

    //     } else {
    //         // USER IS NOT LOGGED IN -> Kick them immediately to start.html
    //         // Prevent users from using the app unauthenticated
    //         if (!window.location.pathname.includes('start.html') && 
    //             !window.location.pathname.includes('login.html') && 
    //             !window.location.pathname.includes('signup.html')) {
    //             window.location.replace("start.html");
    //         }
    //     }
    // });

    // ==========================================
    // 2. PAGE ROUTING & RENDERING
    // ==========================================
    
    // ---> HOME PAGE (index.html)
    // const mainGrid = document.getElementById('main-product-grid');
    // if (mainGrid) {
    //     mainGrid.innerHTML = '';
    //     products.forEach(prod => {
    //         mainGrid.innerHTML += `
    //             <a href="product.html?id=${prod.id}" class="product-card" style="display:flex;">
    //                 <div class="product-img-wrapper">
    //                     <img src="${prod.image}" alt="${prod.name}"/>
    //                 </div>
    //                 <div class="product-info">
    //                     <span class="farm-name">${prod.farm}</span>
    //                     <h4 class="product-title">${prod.name}</h4>
    //                     <span class="product-weight">${prod.unit}</span>
    //                     <div class="product-bottom">
    //                         <span class="product-price">EGP${prod.price.toFixed(2)}</span>
    //                         <button class="add-btn" onclick="event.preventDefault(); addToCartDirectly('${prod.id}', 1)"><i class="ph-bold ph-plus"></i></button>
    //                     </div>
    //                 </div>
    //             </a>
    //         `;
    //         // mainGrid.innerHTML += `
    //         //     <a href="product.html?id=${prod.id}" class="product-card" style="display:flex;">
    //         //         <div class="product-img-wrapper">
    //         //             <img src="${prod.image}" alt="${prod.name}"/>
    //         //             <button class="fav-btn" onclick="event.preventDefault();"><i class="fa-regular fa-heart"></i></button>
    //         //         </div>
    //         //         <div class="product-info">
    //         //             <span class="farm-name">${prod.farm}</span>
    //         //             <h4 class="product-title">${prod.name}</h4>
    //         //             <span class="product-weight">${prod.unit}</span>
    //         //             <div class="product-bottom">
    //         //                 <span class="product-price">EGP${prod.price.toFixed(2)}</span>
    //         //                 <button class="add-btn" onclick="event.preventDefault(); addToCartDirectly('${prod.id}', 1)"><i class="ph-bold ph-plus"></i></button>
    //         //             </div>
    //         //         </div>
    //         //     </a>
    //         // `;
    //     });
    // }
// ==========================================
    // 2. PAGE ROUTING & RENDERING
    // ==========================================
    
    // ---> HOME PAGE (index.html)
    const mainGrid = document.getElementById('main-product-grid');
    if (mainGrid) {
        mainGrid.innerHTML = '';
        
        // 🌟 CHANGE THIS NUMBER TO LIMIT HOME PAGE PRODUCTS 🌟
        const PRODUCT_LIMIT = 10; 
        
        // Slice the array to only grab the first N products
        const limitedProducts = products.slice(0, PRODUCT_LIMIT);
        
        limitedProducts.forEach(prod => {
            mainGrid.innerHTML += `
                <a href="product.html?id=${prod.id}" class="product-card" style="display:flex;">
                    <div class="product-img-wrapper">
                        <img src="${prod.image}" alt="${prod.name}" onerror="this.src='https://via.placeholder.com/150'"/>
                    </div>
                    <div class="product-info">
                        <span class="farm-name">${prod.farm}</span>
                        <h4 class="product-title">${prod.name}</h4>
                        <span class="product-weight">${prod.unit}</span>
                        <div class="product-bottom">
                            <span class="product-price">EGP${(prod.price || 0).toFixed(2)}</span>
                            <button class="add-btn" onclick="event.preventDefault(); addToCartDirectly('${prod.id}', 1)"><i class="ph-bold ph-plus"></i></button>
                        </div>
                    </div>
                </a>
            `;
            // mainGrid.innerHTML += `
            //     <a href="product.html?id=${prod.id}" class="product-card" style="display:flex;">
            //         <div class="product-img-wrapper">
            //             <img src="${prod.image}" alt="${prod.name}" onerror="this.src='https://via.placeholder.com/150'"/>
            //             <button class="fav-btn" onclick="event.preventDefault();"><i class="fa-regular fa-heart"></i></button>
            //         </div>
            //         <div class="product-info">
            //             <span class="farm-name">${prod.farm}</span>
            //             <h4 class="product-title">${prod.name}</h4>
            //             <span class="product-weight">${prod.unit}</span>
            //             <div class="product-bottom">
            //                 <span class="product-price">EGP${(prod.price || 0).toFixed(2)}</span>
            //                 <button class="add-btn" onclick="event.preventDefault(); addToCartDirectly('${prod.id}', 1)"><i class="ph-bold ph-plus"></i></button>
            //             </div>
            //         </div>
            //     </a>
            // `;
        });
    }


    
    // ---> PRODUCT DETAILS PAGE (product.html)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (window.location.pathname.includes('product.html') && productId) {
        const prod = getProductById(productId);
        if (prod) {
            document.getElementById('prod-title').innerText = prod.name;
            document.getElementById('prod-farm').innerText = prod.farm;
            document.getElementById('prod-badge').innerText = prod.badge;
            document.getElementById('prod-unit').innerText = prod.unit;
            document.getElementById('prod-price').innerText = `EGP${prod.price.toFixed(2)}`;
            document.querySelector('#desc p').innerHTML = prod.desc;
            document.querySelector('#nutri p').innerHTML = prod.nutri;
            document.querySelector('#farm p').innerHTML = prod.farmDesc;

            const mainImg = document.getElementById('mainImage');
            mainImg.src = prod.image;

            const thumbList = document.getElementById('thumbnail-list');
            thumbList.innerHTML = '';
            prod.images.forEach((imgSrc, index) => {
                thumbList.innerHTML += `
                    <div class="thumb ${index === 0 ? 'active' : ''}">
                        <img src="${imgSrc}" alt="thumb">
                    </div>
                `;
            });

            const thumbs = document.querySelectorAll('.thumb');
            thumbs.forEach(thumb => {
                thumb.addEventListener('click', function() {
                    mainImg.src = this.querySelector('img').src;
                    thumbs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                });
            });

            document.getElementById('add-to-cart-btn').addEventListener('click', () => {
                const qty = parseInt(document.getElementById('qtyInput').value);
                addToCartDirectly(prod.id, qty);
            });
        }
    }


    // ==========================================
    // 3. FIREBASE CART LOGIC
    // ==========================================
    
    window.addToCartDirectly = async function(prodId, qty) {
        if (!currentUser) return;

        const cartRef = doc(db, "carts", currentUser.uid);
        try {
            const cartSnap = await getDoc(cartRef);
            let currentItems = cartSnap.exists() ? cartSnap.data().items : [];

            const existingItemIndex = currentItems.findIndex(i => i.id === prodId);
            if (existingItemIndex > -1) {
                currentItems[existingItemIndex].qty += qty;
            } else {
                currentItems.push({ id: prodId, qty: qty });
            }

            await setDoc(cartRef, { items: currentItems });
            showToast("Added to cart!", "success");

        } catch (error) {
            console.error("Cart Error:", error);
            showToast("Failed to add to cart", "error");
        }
    };

    function renderFirebaseCart(userId) {
        const container = document.getElementById('cart-items-container');
        if (!container) return;

        onSnapshot(doc(db, "carts", userId), (docSnap) => {
            if (docSnap.exists() && docSnap.data().items.length > 0) {
                const items = docSnap.data().items;
                container.innerHTML = '';
                let subtotal = 0;

                items.forEach((cartItem) => {
                    const prodInfo = getProductById(cartItem.id);
                    if (prodInfo) {
                        subtotal += (prodInfo.price * cartItem.qty);
                        container.innerHTML += `
                            <div class="cart-item">
                                <img src="${prodInfo.image}" class="cart-item-img"/>
                                <div class="cart-item-details">
                                    <div class="cart-item-header">
                                        <h4>${prodInfo.name}</h4>
                                        <button class="remove-btn" onclick="updateCartItem('${cartItem.id}', 0)"><i class="fa-solid fa-xmark"></i></button>
                                    </div>
                                    <p class="cart-item-desc">${prodInfo.farm} • ${prodInfo.unit}</p>
                                    <div class="cart-item-bottom">
                                        <span class="cart-item-price">EGP${(prodInfo.price * cartItem.qty).toFixed(2)}</span>
                                        <div class="qty-control">
                                            <button class="qty-btn" onclick="updateCartItem('${cartItem.id}', ${cartItem.qty - 1})"><i class="ph-bold ph-minus"></i></button>
                                            <span class="qty-num">${cartItem.qty}</span>
                                            <button class="qty-btn add" onclick="updateCartItem('${cartItem.id}', ${cartItem.qty + 1})"><i class="ph-bold ph-plus"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                });
                
                document.getElementById('cart-subtotal').innerText = `EGP${subtotal.toFixed(2)}`;
                document.getElementById('cart-total').innerText = `EGP${subtotal.toFixed(2)}`;
                
            } else {
                container.innerHTML = `<div style="text-align:center; padding: 2rem;">Your cart is empty.</div>`;
                document.getElementById('cart-subtotal').innerText = `EGP0.00`;
                document.getElementById('cart-total').innerText = `EGP0.00`;
            }
        });
    }

    window.updateCartItem = async function(prodId, newQty) {
        if (!currentUser) return;
        const cartRef = doc(db, "carts", currentUser.uid);
        const cartSnap = await getDoc(cartRef);
        
        if (cartSnap.exists()) {
            let items = cartSnap.data().items;
            if (newQty <= 0) {
                items = items.filter(i => i.id !== prodId); 
            } else {
                const idx = items.findIndex(i => i.id === prodId);
                if(idx > -1) items[idx].qty = newQty;
            }
            await setDoc(cartRef, { items });
        }
    };

    function setupCartBadgeListener(userId) {
        onSnapshot(doc(db, "carts", userId), (docSnap) => {
            const badges = document.querySelectorAll('.cart-badge');
            let totalQty = 0;
            if (docSnap.exists()) {
                totalQty = docSnap.data().items.reduce((sum, item) => sum + item.qty, 0);
            }
            badges.forEach(badge => {
                badge.innerText = totalQty;
                badge.style.display = totalQty > 0 ? 'flex' : 'none';
            });
        });
    }

    // ==========================================
    // 4. UI UTILITIES (Tabs & Quantities)
    // ==========================================
    
    const qtyInput = document.getElementById('qtyInput');
    const btnPlus = document.getElementById('btnPlus');
    const btnMinus = document.getElementById('btnMinus');
    if(qtyInput && btnPlus && btnMinus) {
        btnPlus.addEventListener('click', () => { qtyInput.value = parseInt(qtyInput.value) + 1; });
        btnMinus.addEventListener('click', () => { 
            let val = parseInt(qtyInput.value);
            if(val > 1) qtyInput.value = val - 1; 
        });
    }

    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    if(tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(btn.getAttribute('data-target')).classList.add('active');
            });
        });
    }
});
























































// import { auth, db } from "./firebase.js";
// import { showToast } from "./toast.js"; 
// import { 
//     onAuthStateChanged, 
//     signOut,
// } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
// import { 
//     doc, getDoc, setDoc, onSnapshot, collection, getDocs 
// } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// // ==========================================
// // 1. GLOBAL CATALOG CACHE
// // ==========================================
// // We store the Firebase products here so the cart loads instantly
// window.globalProducts = {};

// window.getProductById = function(id) {
//     return window.globalProducts[id] || null;
// };

// document.addEventListener('DOMContentLoaded', async () => {

//     const globalLoader = document.getElementById('global-loader');

//     // ==========================================
//     // 2. FETCH LIVE PRODUCTS FROM FIREBASE
//     // ==========================================
//     try {
//         const pSnap = await getDocs(collection(db, "products"));
//         pSnap.forEach(docSnap => {
//             window.globalProducts[docSnap.id] = docSnap.data();
//         });
//     } catch (e) {
//         console.error("Error loading live products:", e);
//     }

//     // ==========================================
//     // 3. RENDER HOME PAGE (index.html)
//     // ==========================================
//     const mainGrid = document.getElementById('main-product-grid');
//     if (mainGrid) {
//         mainGrid.innerHTML = '';
//         for (const [id, prod] of Object.entries(window.globalProducts)) {
//             mainGrid.innerHTML += `
//                 <a href="product.html?id=${id}" class="product-card" style="display:flex;">
//                     <div class="product-img-wrapper">
//                         <img src="${prod.image}" alt="${prod.name}" onerror="this.src='https://via.placeholder.com/150'"/>
//                     </div>
//                     <div class="product-info">
//                         <span class="farm-name">${prod.farm || 'Local Vendor'}</span>
//                         <h4 class="product-title">${prod.name}</h4>
//                         <span class="product-weight">${prod.unit || '1 pc'}</span>
//                         <div class="product-bottom">
//                             <span class="product-price">$${(prod.price || 0).toFixed(2)}</span>
//                             <button class="add-btn" onclick="event.preventDefault(); window.addToCartDirectly('${id}', 1)"><i class="ph-bold ph-plus"></i></button>
//                         </div>
//                     </div>
//                 </a>
//             `;
//         }
//     }

//     // ==========================================
//     // 4. RENDER PRODUCT DETAILS (product.html)
//     // ==========================================
//     const urlParams = new URLSearchParams(window.location.search);
//     const productId = urlParams.get('id');
    
//     if (window.location.pathname.includes('product.html') && productId) {
//         const prod = window.getProductById(productId);
//         if (prod) {
//             document.getElementById('prod-title').innerText = prod.name;
//             document.getElementById('prod-farm').innerText = prod.farm || 'Local Vendor';
//             document.getElementById('prod-badge').innerText = prod.category || 'Fresh';
//             document.getElementById('prod-unit').innerText = prod.unit || '';
//             document.getElementById('prod-price').innerText = `$${prod.price.toFixed(2)}`;
            
//             const mainImg = document.getElementById('mainImage');
//             if(mainImg) mainImg.src = prod.image;

//             document.getElementById('add-to-cart-btn').addEventListener('click', () => {
//                 const qty = parseInt(document.getElementById('qtyInput').value) || 1;
//                 window.addToCartDirectly(productId, qty);
//             });
//         }
//     }

//     // ==========================================
//     // 5. GLOBAL STATE & STRICT AUTHENTICATION
//     // ==========================================
//     let currentUser = null;

//     onAuthStateChanged(auth, async (user) => {
//         currentUser = user;
        
//         if (user) {
//             const authStateContainer = document.getElementById('auth-state');
//             if (authStateContainer) {
//                 let displayName = user.displayName;
//                 if (!displayName) {
//                     try {
//                         const userDoc = await getDoc(doc(db, "users", user.uid));
//                         if (userDoc.exists()) displayName = userDoc.data().fullName;
//                     } catch (err) {}
//                 }
//                 const firstName = (displayName || 'Friend').split(' ')[0];
//                 authStateContainer.innerHTML = `<span id="header-username" style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">Hi, ${firstName} 👋</span>`;
//             }

//             setupCartBadgeListener(user.uid);
            
//             if (window.location.pathname.includes('cart.html')) {
//                 renderFirebaseCart(user.uid);
//             }

//             if (globalLoader) globalLoader.classList.add('hidden');

//         } else {
//             if (!window.location.pathname.includes('start.html') && 
//                 !window.location.pathname.includes('login.html') && 
//                 !window.location.pathname.includes('signup.html')) {
//                 window.location.replace("start.html");
//             } else {
//                 if (globalLoader) globalLoader.classList.add('hidden');
//             }
//         }
//     });

//     // ==========================================
//     // 6. FIREBASE CART LOGIC
//     // ==========================================
//     window.addToCartDirectly = async function(prodId, qty) {
//         if (!currentUser) return;
//         const cartRef = doc(db, "carts", currentUser.uid);
//         try {
//             const cartSnap = await getDoc(cartRef);
//             let currentItems = cartSnap.exists() ? cartSnap.data().items : [];

//             const existingItemIndex = currentItems.findIndex(i => i.id === prodId);
//             if (existingItemIndex > -1) currentItems[existingItemIndex].qty += qty;
//             else currentItems.push({ id: prodId, qty: qty });

//             await setDoc(cartRef, { items: currentItems });
//             showToast("Added to cart!", "success");
//         } catch (error) {
//             console.error("Cart Error:", error);
//             showToast("Failed to add to cart", "error");
//         }
//     };

//     function renderFirebaseCart(userId) {
//         const container = document.getElementById('cart-items-container');
//         if (!container) return;

//         onSnapshot(doc(db, "carts", userId), (docSnap) => {
//             if (docSnap.exists() && docSnap.data().items.length > 0) {
//                 const items = docSnap.data().items;
//                 container.innerHTML = '';
//                 let subtotal = 0;

//                 items.forEach((cartItem) => {
//                     const prodInfo = window.getProductById(cartItem.id);
//                     if (prodInfo) {
//                         subtotal += (prodInfo.price * cartItem.qty);
//                         container.innerHTML += `
//                             <div class="cart-item">
//                                 <img src="${prodInfo.image}" class="cart-item-img" onerror="this.src='https://via.placeholder.com/100'"/>
//                                 <div class="cart-item-details">
//                                     <div class="cart-item-header">
//                                         <h4>${prodInfo.name}</h4>
//                                         <button class="remove-btn" onclick="updateCartItem('${cartItem.id}', 0)"><i class="fa-solid fa-xmark"></i></button>
//                                     </div>
//                                     <p class="cart-item-desc">${prodInfo.farm || 'Local'} • ${prodInfo.unit || '1 pc'}</p>
//                                     <div class="cart-item-bottom">
//                                         <span class="cart-item-price">$${(prodInfo.price * cartItem.qty).toFixed(2)}</span>
//                                         <div class="qty-control">
//                                             <button class="qty-btn" onclick="updateCartItem('${cartItem.id}', ${cartItem.qty - 1})"><i class="ph-bold ph-minus"></i></button>
//                                             <span class="qty-num">${cartItem.qty}</span>
//                                             <button class="qty-btn add" onclick="updateCartItem('${cartItem.id}', ${cartItem.qty + 1})"><i class="ph-bold ph-plus"></i></button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         `;
//                     }
//                 });
                
//                 document.getElementById('cart-subtotal').innerText = `$${subtotal.toFixed(2)}`;
//                 document.getElementById('cart-total').innerText = `$${subtotal.toFixed(2)}`;
//             } else {
//                 container.innerHTML = `<div style="text-align:center; padding: 2rem;">Your cart is empty.</div>`;
//                 document.getElementById('cart-subtotal').innerText = `$0.00`;
//                 document.getElementById('cart-total').innerText = `$0.00`;
//             }
//         });
//     }

//     window.updateCartItem = async function(prodId, newQty) {
//         if (!currentUser) return;
//         const cartRef = doc(db, "carts", currentUser.uid);
//         const cartSnap = await getDoc(cartRef);
        
//         if (cartSnap.exists()) {
//             let items = cartSnap.data().items;
//             if (newQty <= 0) items = items.filter(i => i.id !== prodId); 
//             else {
//                 const idx = items.findIndex(i => i.id === prodId);
//                 if(idx > -1) items[idx].qty = newQty;
//             }
//             await setDoc(cartRef, { items });
//         }
//     };

//     function setupCartBadgeListener(userId) {
//         onSnapshot(doc(db, "carts", userId), (docSnap) => {
//             const badges = document.querySelectorAll('.cart-badge');
//             let totalQty = 0;
//             if (docSnap.exists()) totalQty = docSnap.data().items.reduce((sum, item) => sum + item.qty, 0);
//             badges.forEach(badge => {
//                 badge.innerText = totalQty;
//                 badge.style.display = totalQty > 0 ? 'flex' : 'none';
//             });
//         });
//     }

//     // UI Utilities
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
// });