import { products } from "./products.js";

document.addEventListener('DOMContentLoaded', () => {
    const allProductsGrid = document.getElementById('all-products-grid');
    
    if (allProductsGrid) {
        // 1. GET SEARCH QUERY FROM URL (if any)
        const urlParams = new URLSearchParams(window.location.search);
        const rawQuery = urlParams.get('q');
        const searchQuery = rawQuery ? decodeURIComponent(rawQuery).toLowerCase().trim() : '';
        
        // This holds the products after the search text is applied
        let baseProducts = products;
        
        if (searchQuery) {
            baseProducts = products.filter(p => {
                const nameMatch = p.name && p.name.toLowerCase().includes(searchQuery);
                const vendorMatch = p.vendor && p.vendor.toLowerCase().includes(searchQuery);
                const farmMatch = p.farm && p.farm.toLowerCase().includes(searchQuery);
                const catMatch = p.category && p.category.toLowerCase().includes(searchQuery);
                return nameMatch || vendorMatch || farmMatch || catMatch;
            });
            
            const pageTitle = document.getElementById('list-page-title');
            if (pageTitle) pageTitle.innerText = `Search: "${searchQuery}"`;
            
            const inputOnPage = document.querySelector('.smart-search-input');
            if (inputOnPage) inputOnPage.value = searchQuery;
        }

        // 2. REUSABLE FUNCTION TO DRAW THE GRID
        function renderGrid(productsToDisplay) {
            allProductsGrid.innerHTML = '';
            
            if (productsToDisplay.length === 0) {
                allProductsGrid.innerHTML = `
                    <div style="text-align: center; width: 100%; grid-column: 1 / -1; padding: 3rem 1rem;">
                        <i class="fa-regular fa-face-frown text-muted" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <p style="color: var(--text-main); font-weight: 700; font-size: 1.125rem;">No products found</p>
                        <p style="color: var(--text-muted); font-size: 0.875rem; margin-top: 0.5rem;">Try a different filter or search.</p>
                    </div>`;
                return;
            } 
            
            productsToDisplay.forEach(prod => {
                const supplierName = prod.vendor || prod.farm || "Local Supplier";
                allProductsGrid.innerHTML += `
                    <a href="product.html?id=${prod.id}" class="product-card" style="display:flex;">
                        <div class="product-img-wrapper">
                            <img src="${prod.image}" alt="${prod.name}"/>
                        </div>
                        <div class="product-info">
                            <span class="farm-name">${supplierName}</span>
                            <h4 class="product-title">${prod.name}</h4>
                            <span class="product-weight">${prod.unit}</span>
                            <div class="product-bottom">
                                <span class="product-price">EGP${prod.price.toFixed(2)}</span>
                                <button class="add-btn" onclick="event.preventDefault(); window.addToCartDirectly('${prod.id}', 1)">
                                    <i class="ph-bold ph-plus"></i>
                                </button>
                            </div>
                        </div>
                    </a>
                `;
                // allProductsGrid.innerHTML += `
                //     <a href="product.html?id=${prod.id}" class="product-card" style="display:flex;">
                //         <div class="product-img-wrapper">
                //             <img src="${prod.image}" alt="${prod.name}"/>
                //             <button class="fav-btn" onclick="event.preventDefault();"><i class="fa-regular fa-heart"></i></button>
                //         </div>
                //         <div class="product-info">
                //             <span class="farm-name">${supplierName}</span>
                //             <h4 class="product-title">${prod.name}</h4>
                //             <span class="product-weight">${prod.unit}</span>
                //             <div class="product-bottom">
                //                 <span class="product-price">$${prod.price.toFixed(2)}</span>
                //                 <button class="add-btn" onclick="event.preventDefault(); window.addToCartDirectly('${prod.id}', 1)">
                //                     <i class="ph-bold ph-plus"></i>
                //                 </button>
                //             </div>
                //         </div>
                //     </a>
                // `;
            });
        }

        // Initially draw the grid based on the search query alone
        renderGrid(baseProducts);

        // 3. CATEGORY CHIP FILTER LOGIC
        const filterChips = document.querySelectorAll('#category-filters .chip');
        
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                // Remove active styling from all chips
                filterChips.forEach(c => c.classList.remove('active'));
                
                // Add active styling to the clicked chip
                chip.classList.add('active');
                
                // Read the data-category attribute (e.g., "fruits")
                const selectedCategory = chip.getAttribute('data-category').toLowerCase();
                
                // Filter the current list
                let finalProducts = baseProducts;
                
                if (selectedCategory !== 'all') {
                    finalProducts = baseProducts.filter(p => 
                        p.category && p.category.toLowerCase() === selectedCategory
                    );
                }
                
                // Redraw the grid with the newly filtered list!
                renderGrid(finalProducts);
            });
        });
    }
});