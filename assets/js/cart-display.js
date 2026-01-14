document.addEventListener('DOMContentLoaded', () => {
    const itemsList = document.getElementById('cart-items-list');
    const summaryDetails = document.getElementById('summary-details');

    function renderCart() {
        if (!window.CartLogic) return;

        const cart = window.CartLogic.getCart();
        const total = window.CartLogic.getCartTotal();

        if (cart.length === 0) {
            itemsList.innerHTML = `
                <div class="empty-cart-msg">
                    <p>Your cart is currently empty.</p>
                    <a href="shop.html" class="btn-primary" style="text-decoration: none; display: inline-block;">Browse Collection</a>
                </div>
            `;
            summaryDetails.innerHTML = `
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>₨ 0</span>
                </div>
                <div class="summary-total summary-row">
                    <span>Total</span>
                    <span>₨ 0</span>
                </div>
            `;
            document.querySelector('.checkout-btn').style.display = 'none';
            return;
        }

        document.querySelector('.checkout-btn').style.display = 'block';

        // Render items table
        let itemsHTML = `
            <table class="cart-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
        `;

        cart.forEach(item => {
            const imagePath = item.image 
                ? `../assets/images/${item.image}` 
                : '../assets/images/placeholder.webp';

            itemsHTML += `
                <tr class="cart-item">
                    <td>
                        <div class="item-info">
                            <img src="${imagePath}" alt="${item.name}" onerror="this.src='../assets/images/placeholder.webp'">
                            <div class="item-details">
                                <h4>${item.name}</h4>
                                <p>₨ ${item.price.toLocaleString()}</p>
                                <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="quantity-controls">
                            <button class="qty-btn" onclick="updateQty('${item.id}', ${item.quantity - 1})">-</button>
                            <span class="qty-value">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQty('${item.id}', ${item.quantity + 1})">+</button>
                        </div>
                    </td>
                    <td>
                        <span class="item-subtotal">₨ ${(item.price * item.quantity).toLocaleString()}</span>
                    </td>
                </tr>
            `;
        });

        itemsHTML += `
                </tbody>
            </table>
        `;

        itemsList.innerHTML = itemsHTML;

        // Render summary
        summaryDetails.innerHTML = `
            <div class="summary-row">
                <span>Subtotal</span>
                <span>₨ ${total.toLocaleString()}</span>
            </div>
            <div class="summary-row">
                <span>Shipping</span>
                <span>Calculated at next step</span>
            </div>
            <div class="summary-total summary-row">
                <span>Total</span>
                <span>₨ ${total.toLocaleString()}</span>
            </div>
        `;
    }

    // Define global functions for the onclick handlers
    window.updateQty = (id, qty) => {
        window.CartLogic.updateQuantity(id, qty);
        renderCart();
    };

    window.removeFromCart = (id) => {
        if (confirm('Remove this item from your cart?')) {
            window.CartLogic.removeFromCart(id);
            renderCart();
        }
    };

    // Initial render
    renderCart();

    // Listen for cart updates from other parts of the app
    window.addEventListener('cartUpdated', () => {
        // Only re-render if we are on the cart page and not triggered by our own functions
        // To avoid redundant renders, but simple for now
        renderCart();
    });
});
