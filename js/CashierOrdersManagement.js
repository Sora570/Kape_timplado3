// Cashier Orders Management JavaScript
// Handles order management for cashiers

let cashierOrders = [];
let filteredCashierOrders = [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadCashierOrders();
    setupCashierEventListeners();
});

// Load orders for cashier
async function loadCashierOrders() {
    try {
        const response = await fetch('db/orders_get.php');
        const data = await response.json();
        
        // Combine pending and completed orders
        cashierOrders = [...(data.pending || []), ...(data.completed || [])];
        filteredCashierOrders = [...cashierOrders];
        renderCashierOrders();
    } catch (error) {
        console.error('Error loading orders:', error);
        showCashierToast('Error loading orders', 'error');
    }
}

// Render orders in table
function renderCashierOrders() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    if (filteredCashierOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="empty-state">
                        <div style="font-size: 48px; margin-bottom: 12px;">📋</div>
                        No orders found
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredCashierOrders.map(order => {
        const statusClass = order.status === 'completed' ? 'completed' : 'pending';
        const statusIcon = order.status === 'completed' ? 'checkmark-circle' : 'time';
        
        return `
            <tr>
                <td>
                    <div class="order-id">
                        <strong>#${order.orderID}</strong>
                    </div>
                </td>
                <td>
                    <div class="customer-info">
                        ${order.customerID ? `Customer #${order.customerID}` : 'Walk-in'}
                    </div>
                </td>
                <td>
                    <div class="order-items">
                        ${order.items || 'No items'}
                    </div>
                </td>
                <td>
                    <div class="order-amount">
                        <strong>₱${parseFloat(order.totalAmount || 0).toFixed(2)}</strong>
                    </div>
                </td>
                <td>
                    <div class="payment-method">
                        <span class="payment-badge ${order.paymentMethod?.toLowerCase() || 'cash'}">
                            ${order.paymentMethod || 'Cash'}
                        </span>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">
                        <ion-icon name="${statusIcon}"></ion-icon>
                        ${order.status === 'completed' ? 'Completed' : 'Pending'}
                    </span>
                </td>
                <td>
                    <div class="order-date">
                        ${new Date(order.createdAt || Date.now()).toLocaleString()}
                    </div>
                </td>
                <td>
                    <div class="order-actions">
                        ${order.status === 'pending' ? `
                            <button class="btn-small btn-success" onclick="markOrderCompleted(${order.orderID})">
                                <ion-icon name="checkmark-outline"></ion-icon>
                                Complete
                            </button>
                        ` : `
                            <button class="btn-small btn-info" onclick="viewOrderDetails(${order.orderID})">
                                <ion-icon name="eye-outline"></ion-icon>
                                View
                            </button>
                        `}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Setup event listeners
function setupCashierEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('orderSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterCashierOrders);
    }

    // Status filter
    const statusFilter = document.getElementById('orderStatusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterCashierOrders);
    }
}

// Filter orders
function filterCashierOrders() {
    const searchTerm = document.getElementById('orderSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('orderStatusFilter')?.value || '';

    filteredCashierOrders = cashierOrders;

    if (searchTerm) {
        filteredCashierOrders = filteredCashierOrders.filter(order =>
            order.orderID.toString().includes(searchTerm) ||
            (order.items && order.items.toLowerCase().includes(searchTerm)) ||
            (order.paymentMethod && order.paymentMethod.toLowerCase().includes(searchTerm))
        );
    }

    if (statusFilter) {
        filteredCashierOrders = filteredCashierOrders.filter(order =>
            order.status === statusFilter
        );
    }

    renderCashierOrders();
}

// Mark order as completed
async function markOrderCompleted(orderID) {
    if (!confirm('Are you sure you want to mark this order as completed?')) {
        return;
    }

    try {
        const formData = new FormData();
        formData.append('orderID', orderID);
        formData.append('status', 'completed');

        const response = await fetch('db/orders_update.php', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            showCashierToast('Order marked as completed!', 'success');
            loadCashierOrders(); // Refresh orders
        } else {
            showCashierToast('Failed to update order', 'error');
        }
    } catch (error) {
        console.error('Error updating order:', error);
        showCashierToast('Error updating order', 'error');
    }
}

// View order details
function viewOrderDetails(orderID) {
    const order = cashierOrders.find(o => o.orderID == orderID);
    if (!order) {
        showCashierToast('Order not found', 'error');
        return;
    }

    // Create order details modal
    const modal = document.createElement('div');
    modal.className = 'order-details-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Order Details #${order.orderID}</h3>
                <button class="close-modal" onclick="closeOrderModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="order-info">
                    <p><strong>Customer:</strong> ${order.customerID ? `Customer #${order.customerID}` : 'Walk-in'}</p>
                    <p><strong>Items:</strong> ${order.items || 'No items'}</p>
                    <p><strong>Total Amount:</strong> ₱${parseFloat(order.totalAmount || 0).toFixed(2)}</p>
                    <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Cash'}</p>
                    <p><strong>Status:</strong> ${order.status === 'completed' ? 'Completed' : 'Pending'}</p>
                    <p><strong>Created:</strong> ${new Date(order.createdAt || Date.now()).toLocaleString()}</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeOrderModal()">Close</button>
            </div>
        </div>
    `;

    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

    document.body.appendChild(modal);
}

// Close order modal
function closeOrderModal() {
    const modal = document.querySelector('.order-details-modal');
    if (modal) {
        modal.remove();
    }
}

// Toast notification system
function showCashierToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Style the toast
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        maxWidth: '300px',
        wordWrap: 'break-word',
        fontFamily: 'Fredoka, sans-serif'
    });
    
    // Set background color based on type
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    toast.style.backgroundColor = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

// Expose functions globally
window.loadOrders = loadCashierOrders;
window.markOrderCompleted = markOrderCompleted;
window.viewOrderDetails = viewOrderDetails;
window.closeOrderModal = closeOrderModal;
