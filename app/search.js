import { products } from "./products.js";

document.addEventListener('DOMContentLoaded', () => {
    const searchInputs = document.querySelectorAll('.smart-search-input');
    
    searchInputs.forEach(searchInput => {
        const suggestionBox = searchInput.nextElementSibling;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length < 1) {
                suggestionBox.classList.add('hidden');
                return;
            }

            // Expanded search to catch vendor, category, and name
            const matchedProducts = products.filter(p => {
                const nameMatch = p.name && p.name.toLowerCase().includes(query);
                const vendorMatch = p.vendor && p.vendor.toLowerCase().includes(query);
                const farmMatch = p.farm && p.farm.toLowerCase().includes(query);
                const catMatch = p.category && p.category.toLowerCase().includes(query);
                return nameMatch || vendorMatch || farmMatch || catMatch;
            });

            if (matchedProducts.length > 0) {
                suggestionBox.innerHTML = matchedProducts.slice(0, 4).map(prod => `
                    <a href="product.html?id=${prod.id}" class="suggestion-item">
                        <img src="${prod.image}" class="suggestion-img" />
                        <div class="suggestion-info">
                            <span class="suggestion-title">${prod.name}</span>
                            <span class="suggestion-farm">${prod.farm || prod.vendor} • EGP${prod.price.toFixed(2)}</span>
                        </div>
                    </a>
                `)
                // .join('') + `
                //     <a href="products-list.html?q=${encodeURIComponent(query)}" class="suggestion-item" style="justify-content: center; color: var(--primary); font-weight: 700;">
                //         See all results for "${query}" <i class="fa-solid fa-arrow-right ml-1"></i>
                //     </a>
                // `;
                suggestionBox.classList.remove('hidden');
            } else {
                suggestionBox.innerHTML = `<div class="suggestion-item" style="color: var(--text-muted); justify-content: center;">No products found.</div>`;
                suggestionBox.classList.remove('hidden');
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = e.target.value.trim();
                if(query) window.location.href = `products-list.html?q=${encodeURIComponent(query)}`;
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionBox.contains(e.target)) {
                suggestionBox.classList.add('hidden');
            }
        });
    });
});