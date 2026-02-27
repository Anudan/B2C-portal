document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkout-form');
    const orderItems = document.getElementById('order-items');
    const finalTotal = document.getElementById('final-total');
    const checkoutGrid = document.getElementById('checkout-grid');
    const checkoutContainer = document.getElementById('checkout-container');
    const orderSuccess = document.getElementById('order-success');

    function renderOrderSummary() {
        if (!window.CartLogic) return;

        const cart = window.CartLogic.getCart();
        const total = window.CartLogic.getCartTotal();

        if (cart.length === 0) {
            location.href = 'cart.html';
            return;
        }

        let itemsHTML = '';
        cart.forEach(item => {
            itemsHTML += `
                <div class="summary-item">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>₨ ${(item.price * item.quantity).toLocaleString()}</span>
                </div>
            `;
        });

        orderItems.innerHTML = itemsHTML;
        finalTotal.textContent = `₨ ${total.toLocaleString()}`;

        // Auto-fill form if user is logged in
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        if (user && user.name) {
            const nameParts = user.name.split(' ');
            document.getElementById('fname').value = nameParts[0] || '';
            document.getElementById('lname').value = nameParts.slice(1).join(' ') || '';
            document.getElementById('email').value = user.email || '';
        }
    }

    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = document.querySelector('.checkout-btn');
        btn.innerText = 'Processing...';
        btn.disabled = true;

        // Gather form data
        const firstName = document.getElementById('fname').value.trim();
        const lastName = document.getElementById('lname').value.trim();
        const email = document.getElementById('email').value.trim();
        const address = document.getElementById('address').value.trim();
        const city = document.getElementById('city').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cod';

        // Get cart data
        const cart = window.CartLogic.getCart();
        const totalAmount = window.CartLogic.getCartTotal();

        // Get logged-in user id if available
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        const userId = user.id || null;

        // Build items array for the API
        const items = cart.map(item => ({
            productId: item.id || item.product_id || null,
            quantity: item.quantity,
            price: item.price
        }));

        try {
            const response = await fetch('http://localhost:3000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    address,
                    city,
                    phone,
                    paymentMethod,
                    items,
                    totalAmount,
                    userId
                })
            });

            const data = await response.json();

            if (data.success) {
                // Clear cart
                window.CartLogic.clearCart();

                // Show real order ID in success message
                const orderIdEl = orderSuccess.querySelector('p[style*="color"]');
                if (orderIdEl) {
                    orderIdEl.textContent = `Order ID: #UB-${data.orderId}`;
                }

                // Show success screen
                checkoutGrid.style.display = 'none';
                checkoutContainer.querySelector('.hero-title').style.display = 'none';
                orderSuccess.style.display = 'block';
                window.scrollTo(0, 0);
            } else {
                alert(`Failed to place order: ${data.message}`);
                btn.innerText = 'Place Order';
                btn.disabled = false;
            }
        } catch (err) {
            console.error('Order submission error:', err);
            alert('Could not connect to the server. Please make sure the backend is running and try again.');
            btn.innerText = 'Place Order';
            btn.disabled = false;
        }
    });

    renderOrderSummary();
});
