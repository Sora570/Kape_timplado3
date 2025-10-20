// Cashier Orders Management JavaScript

var orders = [];
var filteredOrders = [];

// Initialize orders when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('OrdersForm')) {
        loadOrders();
        setupOrderFilters();
    }
});

function loadOrders() {
    fetch('db/orders_get.php')
        .then(response => response.json())
        .then(data => {
            orders = data.pending ? [...data.pending, ...data.completed] : data;
            filteredOrders = [...orders];
            displayOrders();
        })
        .catch(error => {
            console.error('Error loading orders:', error);
            showToast('Error loading orders', 'error');
        });
}

function setupOrderFilters() {
    const searchInput = document.getElementById('orderSearch');
    const statusFilter = document.getElementById('orderStatusFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterOrders);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterOrders);
    }
}

function filterOrders() {
    const searchTerm = document.getElementById('orderSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('orderStatusFilter')?.value || 'all';
    
    filteredOrders = orders.filter(order => {
        const matchesSearch = 
            (order.customerName && order.customerName.toLowerCase().includes(searchTerm)) ||
            (order.items && order.items.toLowerCase().includes(searchTerm)) ||
            (order.orderID && order.orderID.toString().includes(searchTerm));
            
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    displayOrders();
}

function displayOrders() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (filteredOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #999;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                        <div style="font-size: 48px;">📄</div>
                        <div style="font-size: 18px; font-weight: 600; color: #7f5539;">No orders found</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredOrders.forEach(order => {
        const row = createOrderRow(order);
        tbody.appendChild(row);
    });
}

function createOrderRow(order) {
    const row = document.createElement('tr');
    
    // Determine status styling
    const statusClass = getStatusClass(order.status);
    const statusColor = getStatusColor(order.status);
    
    row.innerHTML = `
        <td class="font-medium text-gray-800">#${order.orderID || order.id || 'N/A'}</td>
        <td class="text-gray-600">${order.customerName || 'Guest'}</td>
        <td class="text-gray-600">${order.items || 'No items'}</td>
        <td class="font-semibold text-green-600">₱${order.totalAmount || order.total || 0}</td>
        <td>
            <span class="status-badge" style="background: ${statusColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">
                ${order.status || 'pending'}
            </span>
        </td>
        <td class="text-gray-500 text-sm">${formatDate(order.createdAt || order.date)}</td>
        <td>
            <div class="action-buttons" style="display: flex; gap: 5px;">
                ${order.status === 'pending' ? 
                    `<button class="btn btn-success" onclick="updateOrderStatus(${order.orderID || order.id}, 'completed')" style="background: #10b981; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">Complete</button>` :
                    `<button class="btn btn-primary" onclick="viewOrderDetails(${order.orderID || order.id})" style="background: #3b82f6; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">View</button>`
                }
            </div>
        </td>
    `;
    
    return row;
}

function getStatusClass(status) {
    switch (status) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function getStatusColor(status) {
    switch (status) {
        case 'completed': return '#10b981';
        case 'cancelled': return '#ef4444';
        case 'pending': return '#f59e0b';
        default: return '#6b7280';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (error) {
        return 'Invalid Date';
    }
}

function updateOrderStatus(orderId, newStatus) {
    const formData = new FormData();
    formData.append('orderID', orderId);
    formData.append('status', newStatus);
    
    fetch('db/orders_update.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(result => {
        if (result === 'success') {
            showToast(`Order status updated to ${newStatus}`, 'success');
            loadOrders(); // Refresh orders
        } else {
            showToast('Error updating order status: ' + result, 'error');
        }
    })
    .catch(error => {
        console.error('Error updating order status:', error);
        showToast('Error updating order status', 'error');
    });
}

function viewOrderDetails(orderId) {
    // Find the order and show details
    const order = orders.find(o => o.orderID == orderId || o.id == orderId);
    if (!order) return;
    
    const items = order.items || 'No items specified';
    const total = order.totalAmount || order.total || 0;
    const status = order.status || 'unknown';
    const customer = order.customerName || 'Guest';
    
    // Create a simple modal or alert with order details
    alert(`Order Details:\n\nOrder ID: #${orderId}\nCustomer: ${customer}\nItems: ${items}\nTotal: ₱${total}\nStatus: ${status}`);
}

function showToast(message, type) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 1000;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}
