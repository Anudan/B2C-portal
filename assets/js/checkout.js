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
            // Redirect to cart if empty
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

    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Simulate API call
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerText;
        btn.innerText = 'Processing...';
        btn.disabled = true;

        setTimeout(() => {
            // Clear cart after successful "order"
            window.CartLogic.clearCart();

            // Show success message
            checkoutGrid.style.display = 'none';
            checkoutContainer.querySelector('.hero-title').style.display = 'none';
            orderSuccess.style.display = 'block';
            
            // Scroll to top
            window.scrollTo(0, 0);
        }, 1500);
    });

    renderOrderSummary();
});
