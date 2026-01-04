document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.querySelector('.varieties-grid');
    const API_URL = 'http://localhost:3000/api/products';

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
                renderProducts(data.products);
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
            productsGrid.innerHTML = '<div class="no-products">No products found in our collection.</div>';
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

    // Initial fetch
    fetchProducts();
});
