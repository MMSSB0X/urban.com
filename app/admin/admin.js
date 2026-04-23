import { auth, db } from "./firebase.js";
import { showToast } from "./toast.js";
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
    collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// ==========================================
// 1. ADMIN AUTHORIZATION LIST
// ==========================================
// Only these emails can access the admin dashboard.
const ALLOWED_ADMINS = [
    // 'admin@urbanharvest.com', 
    'mmsbishady0@gmail.com' // <-- Add your real email here!
];

// ==========================================
// 2. AUTHENTICATION ROUTING
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // Check if we are on the login page
    const loginForm = document.getElementById('admin-login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('admin-email').value.trim();
            const password = document.getElementById('admin-pass').value;
            const btn = loginForm.querySelector('button');

            if (!ALLOWED_ADMINS.includes(email.toLowerCase())) {
                showToast("Access Denied: Not an admin account.", "error");
                return;
            }

            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
            try {
                await signInWithEmailAndPassword(auth, email, password);
                window.location.replace("admin.html");
            } catch (error) {
                showToast("Invalid credentials.", "error");
                btn.innerHTML = 'Access Dashboard';
            }
        });
    }

    // Protect the Dashboard Page
    if (window.location.pathname.includes('admin.html')) {
        onAuthStateChanged(auth, (user) => {
            if (!user || !ALLOWED_ADMINS.includes(user.email.toLowerCase())) {
                window.location.replace("admin-login.html");
            } else {
                document.getElementById('admin-user-name').innerText = user.email.split('@')[0];
                initDashboard();
            }
        });

        document.getElementById('admin-logout-btn').addEventListener('click', () => {
            signOut(auth).then(() => window.location.replace("admin-login.html"));
        });
    }
});

// ==========================================
// 3. DASHBOARD LOGIC (Runs only on admin.html)
// ==========================================
function initDashboard() {
    
    // --- UI NAVIGATION ---
    const navItems = document.querySelectorAll('.admin-nav-item');
    const views = document.querySelectorAll('.admin-view');
    const title = document.getElementById('current-view-title');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));
            item.classList.add('active');
            document.getElementById(item.dataset.view).classList.add('active');
            title.innerText = item.innerText;
        });
    });

    // Fetch all data immediately
    loadStatsAndOrders();
    loadProducts();
    loadUsers();

    // --- PRODUCTS LOGIC ---
    const prodModal = document.getElementById('product-modal');
    document.getElementById('btn-add-product').addEventListener('click', () => {
        document.getElementById('admin-product-form').reset();
        document.getElementById('ap-id').value = '';
        document.getElementById('prod-modal-title').innerText = "Add New Product";
        prodModal.classList.add('active');
    });
    document.getElementById('close-prod-modal').addEventListener('click', () => prodModal.classList.remove('active'));

    document.getElementById('admin-product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('save-prod-btn');
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
        
        const prodId = document.getElementById('ap-id').value;
        const prodData = {
            name: document.getElementById('ap-name').value,
            price: parseFloat(document.getElementById('ap-price').value),
            category: document.getElementById('ap-category').value,
            vendor: document.getElementById('ap-vendor').value,
            unit: document.getElementById('ap-unit').value,
            image: document.getElementById('ap-image').value,
        };

        try {
            if (prodId) {
                await updateDoc(doc(db, "products", prodId), prodData);
                showToast("Product updated!");
            } else {
                await addDoc(collection(db, "products"), prodData);
                showToast("Product created!");
            }
            prodModal.classList.remove('active');
            loadProducts();
        } catch (error) {
            console.error(error);
            showToast("Failed to save product", "error");
        } finally {
            btn.innerHTML = 'Save Product';
        }
    });
}

// ==========================================
// 4. FIREBASE DATA FETCHING FUNCTIONS
// ==========================================

async function loadStatsAndOrders() {
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        let totalRevenue = 0;
        let orderCount = snapshot.size;
        const tbody = document.getElementById('admin-orders-table');
        tbody.innerHTML = '';

        if(orderCount === 0) tbody.innerHTML = '<tr><td colspan="6">No orders yet.</td></tr>';

        snapshot.forEach(docSnap => {
            const order = docSnap.data();
            const orderId = docSnap.id;
            const shortId = orderId.substring(0, 8).toUpperCase();
            
            totalRevenue += order.totalAmount || 0;

            const date = order.createdAt ? order.createdAt.toDate().toLocaleDateString() : 'N/A';
            const customerName = order.shippingAddress ? order.shippingAddress.name : 'Unknown';

            tbody.innerHTML += `
                <tr>
                    <td style="font-weight:700; color:var(--primary);">#${shortId}</td>
                    <td>${customerName}</td>
                    <td>${date}</td>
                    <td style="font-weight:800;">$${order.totalAmount.toFixed(2)}</td>
                    <td>
                        <select onchange="updateOrderStatus('${orderId}', this.value)" style="color: ${order.status==='Delivered'?'#10b981':'#f59e0b'}">
                            <option value="Processing" ${order.status==='Processing'?'selected':''}>Processing</option>
                            <option value="Shipped" ${order.status==='Shipped'?'selected':''}>Shipped</option>
                            <option value="Delivered" ${order.status==='Delivered'?'selected':''}>Delivered</option>
                        </select>
                    </td>
                    <td><button class="btn-cancel" style="padding: 0.5rem;" onclick="alert('Viewing details coming soon')"><i class="fa-solid fa-eye"></i></button></td>
                </tr>
            `;
        });

        // Update Stats Dashboard
        document.getElementById('stat-revenue').innerText = `$${totalRevenue.toFixed(2)}`;
        document.getElementById('stat-total-orders').innerText = orderCount;

    } catch (error) {
        console.error("Orders load error:", error);
    }
}

async function loadProducts() {
    try {
        const snapshot = await getDocs(collection(db, "products"));
        const tbody = document.getElementById('admin-products-table');
        tbody.innerHTML = '';

        if(snapshot.empty) tbody.innerHTML = '<tr><td colspan="5">No products found. Add one!</td></tr>';

        snapshot.forEach(docSnap => {
            const prod = docSnap.data();
            const prodId = docSnap.id;

            // Make sure the object is globally accessible for the Edit button
            window[`prod_${prodId}`] = prod;

            tbody.innerHTML += `
                <tr>
                    <td><img src="${prod.image}" class="admin-img-thumb" onerror="this.src='https://via.placeholder.com/50'"/></td>
                    <td style="font-weight:700;">${prod.name} <br> <span style="font-size:0.75rem; color:var(--text-muted); font-weight:500;">${prod.vendor}</span></td>
                    <td style="text-transform: capitalize;">${prod.category}</td>
                    <td style="font-weight:800;">$${prod.price.toFixed(2)}</td>
                    <td>
                        <button class="btn-cancel" style="padding: 0.5rem; margin-right:0.5rem;" onclick="editProduct('${prodId}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-danger" style="padding: 0.5rem;" onclick="deleteProduct('${prodId}')"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
    } catch (error) { console.error(error); }
}

async function loadUsers() {
    try {
        const snapshot = await getDocs(collection(db, "users"));
        const tbody = document.getElementById('admin-users-table');
        tbody.innerHTML = '';
        
        document.getElementById('stat-users').innerText = snapshot.size;

        snapshot.forEach(docSnap => {
            const user = docSnap.data();
            const date = user.createdAt ? user.createdAt.toDate().toLocaleDateString() : 'N/A';
            tbody.innerHTML += `
                <tr>
                    <td style="font-weight:700;">${user.fullName || 'User'}</td>
                    <td>${user.email}</td>
                    <td>${user.phone || 'N/A'}</td>
                    <td>${date}</td>
                </tr>
            `;
        });
    } catch (error) { console.error(error); }
}

// ==========================================
// 5. GLOBAL HTML HELPERS
// ==========================================

window.updateOrderStatus = async function(orderId, newStatus) {
    try {
        await updateDoc(doc(db, "orders", orderId), { status: newStatus });
        showToast("Order status updated!");
    } catch (error) { showToast("Failed to update status", "error"); }
}

window.deleteProduct = async function(prodId) {
    if(confirm("Are you sure you want to delete this product?")) {
        try {
            await deleteDoc(doc(db, "products", prodId));
            showToast("Product deleted!");
            loadProducts();
        } catch (error) { showToast("Failed to delete", "error"); }
    }
}

window.editProduct = function(prodId) {
    const prod = window[`prod_${prodId}`];
    document.getElementById('ap-id').value = prodId;
    document.getElementById('ap-name').value = prod.name;
    document.getElementById('ap-price').value = prod.price;
    document.getElementById('ap-category').value = prod.category;
    document.getElementById('ap-vendor').value = prod.vendor;
    document.getElementById('ap-unit').value = prod.unit;
    document.getElementById('ap-image').value = prod.image;
    
    document.getElementById('prod-modal-title').innerText = "Edit Product";
    document.getElementById('product-modal').classList.add('active');
}