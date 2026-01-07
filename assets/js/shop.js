document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.querySelector('.varieties-grid');
    const API_URL = 'http://localhost:3000/api/products';
    
    // Filter elements
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const applyFilterBtn = document.getElementById('applyPriceFilter');
    const resetFiltersBtn = document.getElementById('resetFilters');
    const sortRadios = document.querySelectorAll('input[name="priceSort"]');
    
    // Store all products for filtering
    let allProducts = [];
    let filteredProducts = [];

    // Function to fetch products from the backend
    async function fetchProducts() {
        try {
            // Show loading state if needed
            productsGrid.innerHTML = '<div class="loading">Loading our premium collection...</div>';

            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();
            if (data.success && data.products) {
                allProducts = data.products;
                filteredProducts = [...allProducts];
                renderProducts(filteredProducts);
            } else {
                throw new Error(data.message || 'Unknown error occurred');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            productsGrid.innerHTML = `
                <div class="error-message">
                    <p>Apologies, we encountered an error loading our products.</p>
                    <button onclick="location.reload()" class="retry-btn">Try Again</button>
                </div>
            `;
        }
    }

    // Function to render products into the grid
    function renderProducts(products) {
        if (products.length === 0) {
            productsGrid.innerHTML = '<div class="no-products">No products found matching your filters.</div>';
            return;
        }

        productsGrid.innerHTML = ''; // Clear existing content

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'variety-card';

            // Construct image path - assuming images are in ../assets/images/
            // and the product.image_url holds just the filename or a relative path
            const imagePath = product.image_url 
                ? `../assets/images/${product.image_url}` 
                : '../assets/images/placeholder.webp'; // Fallback image

            productCard.innerHTML = `
                <img src="${imagePath}" alt="${product.product_name}" onerror="this.src='../assets/images/placeholder.webp'">
                <h3>${product.product_name}</h3>
                <p>${product.description || 'No description available.'}</p>
                <div class="product-footer">
                    <span class="price">₨ ${parseFloat(product.price).toLocaleString()}</span>
                    <button class="add-to-cart-btn" data-id="${product.product_id}">Add to Cart</button>
                </div>
            `;

            productsGrid.appendChild(productCard);
        });
    }

    // Function to apply filters and sorting
    function applyFiltersAndSort() {
        let result = [...allProducts];
        
        // Get filter values
        const minPrice = parseFloat(minPriceInput.value) || 0;
        const maxPrice = parseFloat(maxPriceInput.value) || Infinity;
        
        // Get selected sort option
        const selectedSort = document.querySelector('input[name="priceSort"]:checked').value;
        
        // Apply price range filter
        if (minPrice > 0 || maxPrice < Infinity) {
            result = filterByPriceRange(result, minPrice, maxPrice);
        }
        
        // Apply sorting
        if (selectedSort === 'low-to-high') {
            result = sortLowToHigh(result);
        } else if (selectedSort === 'high-to-low') {
            result = sortHighToLow(result);
        }
        
        filteredProducts = result;
        renderProducts(filteredProducts);
    }

    // Event listener for Apply Filter button
    applyFilterBtn.addEventListener('click', () => {
        applyFiltersAndSort();
    });

    // Event listener for sort radio buttons
    sortRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            applyFiltersAndSort();
        });
    });

    // Event listener for Reset Filters button
    resetFiltersBtn.addEventListener('click', () => {
        // Clear input fields
        minPriceInput.value = '';
        maxPriceInput.value = '';
        
        // Reset sort to default
        document.querySelector('input[name="priceSort"][value="default"]').checked = true;
        
        // Reset to all products
        filteredProducts = [...allProducts];
        renderProducts(filteredProducts);
    });

    // Allow Enter key to apply filter
    minPriceInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyFiltersAndSort();
        }
    });

    maxPriceInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyFiltersAndSort();
        }
    });

    // Initial fetch
    fetchProducts();
});

// Filter and Sort Functions (from products.js)
function filterByPriceRange(products, minPrice, maxPrice) {
    return products.filter(product => 
        product.price >= minPrice && product.price <= maxPrice
    );
}

function sortLowToHigh(products) {
    return [...products].sort((a, b) => a.price - b.price);
}

function sortHighToLow(products) {
    return [...products].sort((a, b) => b.price - a.price);
}