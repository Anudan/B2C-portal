// Orders Management - Admin Panel
// Fetches and renders all customer orders from the backend API

const ORDERS_API_URL = 'http://localhost:3000/api/orders';

/**
 * Fetch all orders from the database
 * @returns {Promise<Array>} Array of orders
 */
async function getOrders() {
    try {
        const response = await fetch(ORDERS_API_URL);
        const data = await response.json();
        if (data.success) {
            return data.orders;
        } else {
            console.error('Failed to fetch orders:', data.message);
            return [];
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}

/**
 * Update the status of an order
 * @param {number} orderId 
 * @param {string} newStatus 
 */
async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`${ORDERS_API_URL}/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Error updating order status:', error);
        return false;
    }
}
