/**
 * Cart Logic Utility
 * Manages the shopping cart using localStorage.
 */

const CART_STORAGE_KEY = 'urban_barrels_cart';

const CartLogic = {
    /**
     * Get all items in the cart
     * @returns {Array} Array of cart items
     */
    getCart() {
        const cart = localStorage.getItem(CART_STORAGE_KEY);
        return cart ? JSON.parse(cart) : [];
    },

    /**
     * Save the cart to localStorage
     * @param {Array} cart - The cart array to save
     */
    saveCart(cart) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        // Dispatch a custom event so other components can listen for changes
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
    },

    /**
     * Add a product to the cart
     * @param {Object} product - Product object {id, name, price, image}
     * @param {number} quantity - Number of items to add
     */
    addToCart(product, quantity = 1) {
        let cart = this.getCart();
        const existingItemIndex = cart.findIndex(item => item.id === product.id);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({
                ...product,
                quantity: quantity
            });
        }

        this.saveCart(cart);
    },

    /**
     * Remove a product from the cart
     * @param {string|number} productId - The ID of the product to remove
     */
    removeFromCart(productId) {
        let cart = this.getCart();
        cart = cart.filter(item => item.id !== productId);
        this.saveCart(cart);
    },

    /**
     * Update quantity of a product in the cart
     * @param {string|number} productId - The ID of the product
     * @param {number} quantity - The new quantity
     */
    updateQuantity(productId, quantity) {
        if (quantity < 1) {
            this.removeFromCart(productId);
            return;
        }

        let cart = this.getCart();
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            this.saveCart(cart);
        }
    },

    /**
     * Clear the cart
     */
    clearCart() {
        this.saveCart([]);
    },

    /**
     * Get the total number of items in the cart
     * @returns {number}
     */
    getCartCount() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + item.quantity, 0);
    },

    /**
     * Get the total price of all items in the cart
     * @returns {number}
     */
    getCartTotal() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
};

// Export to window object for global access if not using modules
window.CartLogic = CartLogic;
