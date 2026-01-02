// Product Management - Database Integration
// Author: UrbanBarrels Team
// Description: Handles product CRUD operations with backend API

const API_URL = 'http://localhost:3000/api/products';

/**
 * Fetch all products from the database
 * @returns {Promise<Array>} Array of products
 */
async function getProducts() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.success) {
            return data.products;
        } else {
            console.error('Failed to fetch products:', data.message);
            alert('Failed to load products. Please try again.');
            return [];
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        alert('Unable to connect to server. Please ensure the backend is running.');
        return [];
    }
}

/**
 * Save a new product or update existing product
 * @param {Object} product - Product data
 * @returns {Promise<boolean>} Success status
 */
async function saveProduct(product) {
    try {
        const isUpdate = product.product_id && product.product_id > 0;
        const url = isUpdate ? `${API_URL}/${product.product_id}` : API_URL;
        const method = isUpdate ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
            return true;
        } else {
            alert('Error: ' + data.message);
            return false;
        }
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Failed to save product. Please try again.');
        return false;
    }
}

/**
 * Delete a product from the database (soft delete)
 * @param {number} productId - ID of product to delete
 * @returns {Promise<boolean>} Success status
 */
async function deleteProductFromDB(productId) {
    try {
        const response = await fetch(`${API_URL}/${productId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            return true;
        } else {
            alert('Error: ' + data.message);
            return false;
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
        return false;
    }
}

// Legacy compatibility functions (for existing admin.html code)
// These maintain the same interface but use database instead of localStorage

/**
 * Legacy function - replaced with getProducts()
 * Kept for backward compatibility
 */
function saveProducts(products) {
    console.warn('saveProducts() is deprecated. Use saveProduct() instead.');
    // No-op - individual saves are now handled by saveProduct()
}
