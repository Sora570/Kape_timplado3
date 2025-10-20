// Inventory Management JavaScript

let inventoryData = [];
let filteredData = [];

// Initialize inventory when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeInventory();
});

function initializeInventory() {
    loadInventoryData();
    setupEventListeners();
    loadCategories();
}

function setupEventListeners() {
    // Export Button
    document.getElementById('exportInventoryBtn').addEventListener('click', exportInventory);
    
    // Search and Filter
    document.getElementById('inventorySearch').addEventListener('input', filterInventory);
    document.getElementById('categoryFilter').addEventListener('change', filterInventory);
    document.getElementById('stockFilter').addEventListener('change', filterInventory);
}

function loadInventoryData() {
    
    fetch('db/inventory_get.php')
        .then(response => response.json())
        .then(data => {
            inventoryData = data;
            filteredData = [...inventoryData];
            displayInventoryTable();
            updateSummaryCards();
        })
        .catch(error => {
            console.error('Error loading inventory:', error);
            showToast('Error loading inventory data', 'error');
        });
}

function displayInventoryTable() {
    const tbody = document.getElementById('inventory-table-list');
    tbody.innerHTML = '';
    
    if (filteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="13" style="text-align: center; padding: 40px; color: #999;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                        <div style="font-size: 48px;">📦</div>
                        <div style="font-size: 18px; font-weight: 600; color: #7f5539;">No inventory items found</div>
                        <div style="color: #6b7280;">Click "Add Stock" to start adding inventory items</div>
                        <button onclick="showAddStockModal()" class="btn-primary" style="margin-top: 10px;">
                            + Add Inventory Item
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredData.forEach(item => {
        const row = createInventoryRow(item);
        tbody.appendChild(row);
    });
}

function createInventoryRow(item) {
    const row = document.createElement('tr');
    
    const status = getStockStatus(item.currentStock, item.minStock);
    const statusClass = `status-${status.replace(' ', '-')}`;
    
    row.innerHTML = `
        <td class="font-medium text-gray-800">${item.productName}</td>
        <td class="text-gray-600">${item.categoryName}</td>
        <td class="text-gray-600">${item.sizeName}</td>
        <td>
            <input type="number" 
                   class="stock-input" 
                   value="${item.currentStock}" 
                   min="0" 
                   data-item-id="${item.inventoryID}"
                   onchange="updateStock(${item.inventoryID}, this.value)">
        </td>
        <td>
            <input type="number" 
                   class="stock-input" 
                   value="${item.minStock}" 
                   min="0" 
                   data-item-id="${item.inventoryID}"
                   onchange="updateMinStock(${item.inventoryID}, this.value)">
        </td>
        <td>
            <input type="number" 
                   class="stock-input" 
                   value="${item.maxStock}" 
                   min="0" 
                   data-item-id="${item.inventoryID}"
                   onchange="updateMaxStock(${item.inventoryID}, this.value)">
        </td>
        <td>
            <input type="number" 
                   class="stock-input" 
                   value="${item.costPrice || 0}" 
                   min="0" 
                   step="0.01"
                   data-item-id="${item.inventoryID}"
                   onchange="updateCostPrice(${item.inventoryID}, this.value)">
        </td>
        <td>
            <input type="number" 
                   class="stock-input" 
                   value="${item.sellingPrice || 0}" 
                   min="0" 
                   step="0.01"
                   data-item-id="${item.inventoryID}"
                   onchange="updateSellingPrice(${item.inventoryID}, this.value)">
        </td>
        <td class="text-center font-semibold ${item.profitMargin > 0 ? 'text-green-600' : 'text-red-600'}">
            ${item.profitMargin || 0}%
        </td>
        <td class="text-center font-semibold text-blue-600">
            ₱${(item.totalValue || 0).toFixed(2)}
        </td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
        <td class="text-gray-500 text-sm">${formatDate(item.lastUpdated)}</td>
        <td>
            <div class="action-buttons">
                <button class="action-btn btn-adjust" onclick="showAdjustStockModal(${item.inventoryID})">
                    Adjust
                </button>
                <button class="action-btn btn-history" onclick="showStockHistory(${item.inventoryID})">
                    History
                </button>
            </div>
        </td>
    `;
    
    // Add smooth animation when row is added
    row.style.opacity = '0';
    row.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        row.style.transition = 'all 0.3s ease';
        row.style.opacity = '1';
        row.style.transform = 'translateY(0)';
    }, 100);
    
    return row;
}

function getStockStatus(currentStock, minStock) {
    if (currentStock === 0) return 'out of stock';
    if (currentStock <= minStock) return 'low stock';
    return 'in stock';
}

function updateSummaryCards() {
    const totalItems = inventoryData.length;
    const lowStockItems = inventoryData.filter(item => item.currentStock > 0 && item.currentStock <= item.minStock).length;
    const inStockItems = inventoryData.filter(item => item.currentStock > item.minStock).length;
    const outOfStockItems = inventoryData.filter(item => item.currentStock === 0).length;
    
    // Calculate total value and profit
    const totalValue = inventoryData.reduce((sum, item) => sum + (parseFloat(item.totalValue) || 0), 0);
    const totalCost = inventoryData.reduce((sum, item) => sum + (parseFloat(item.costPrice) || 0) * item.currentStock, 0);
    const totalSellingValue = inventoryData.reduce((sum, item) => sum + (parseFloat(item.sellingPrice) || 0) * item.currentStock, 0);
    const totalProfit = totalSellingValue - totalCost;
    const averageProfitMargin = inventoryData.length > 0 ? 
        inventoryData.reduce((sum, item) => sum + (parseFloat(item.profitMargin) || 0), 0) / inventoryData.length : 0;
    
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('lowStockItems').textContent = lowStockItems;
    document.getElementById('inStockItems').textContent = inStockItems;
    document.getElementById('outOfStockItems').textContent = outOfStockItems;
    
    // Update summary cards with additional info
    const totalItemsCard = document.querySelector('.summary-card:nth-child(1) .summary-label');
    const lowStockCard = document.querySelector('.summary-card:nth-child(2) .summary-label');
    const inStockCard = document.querySelector('.summary-card:nth-child(3) .summary-label');
    const outOfStockCard = document.querySelector('.summary-card:nth-child(4) .summary-label');
    
    if (totalItemsCard) totalItemsCard.textContent = `Total Items (₱${totalValue.toFixed(2)} value)`;
    if (lowStockCard) lowStockCard.textContent = `Low Stock (${lowStockItems} items)`;
    if (inStockCard) inStockCard.textContent = `In Stock (${inStockItems} items)`;
    if (outOfStockCard) outOfStockCard.textContent = `Out of Stock (${outOfStockItems} items)`;
}

function filterInventory() {
    const searchTerm = document.getElementById('inventorySearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const stockFilter = document.getElementById('stockFilter').value;
    
    filteredData = inventoryData.filter(item => {
        const matchesSearch = item.productName.toLowerCase().includes(searchTerm) ||
                            item.categoryName.toLowerCase().includes(searchTerm) ||
                            item.sizeName.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !categoryFilter || item.categoryID == categoryFilter;
        
        let matchesStock = true;
        if (stockFilter) {
            const status = getStockStatus(item.currentStock, item.minStock);
            if (stockFilter === 'in-stock') {
                matchesStock = status === 'in stock';
            } else if (stockFilter === 'low-stock') {
                matchesStock = status === 'low stock';
            } else if (stockFilter === 'out-of-stock') {
                matchesStock = status === 'out of stock';
            }
        }
        
        return matchesSearch && matchesCategory && matchesStock;
    });
    
    displayInventoryTable();
}

function loadCategories() {
    fetch('db/categories_getAll.php')
        .then(response => response.json())
        .then(categories => {
            const select = document.getElementById('categoryFilter');
            select.innerHTML = '<option value="">All Categories</option>';
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.categoryID;
                option.textContent = category.categoryName;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading categories:', error);
        });
}

function updateStock(inventoryID, newStock) {
    const stock = parseInt(newStock);
    if (isNaN(stock) || stock < 0) {
        showToast('Invalid stock quantity', 'error');
        return;
    }
    
    fetch('db/inventory_update.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `inventoryID=${inventoryID}&currentStock=${stock}&action=update_stock`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showToast('Stock updated successfully', 'success');
            loadInventoryData(); // Refresh data
        } else {
            showToast(data.message || 'Error updating stock', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating stock:', error);
        showToast('Error updating stock', 'error');
    });
}

function updateMinStock(inventoryID, newMinStock) {
    const minStock = parseInt(newMinStock);
    if (isNaN(minStock) || minStock < 0) {
        showToast('Invalid minimum stock quantity', 'error');
        return;
    }
    
    fetch('db/inventory_update.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `inventoryID=${inventoryID}&minStock=${minStock}&action=update_min_stock`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showToast('Minimum stock updated successfully', 'success');
            loadInventoryData();
        } else {
            showToast(data.message || 'Error updating minimum stock', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating minimum stock:', error);
        showToast('Error updating minimum stock', 'error');
    });
}

function updateMaxStock(inventoryID, newMaxStock) {
    const maxStock = parseInt(newMaxStock);
    if (isNaN(maxStock) || maxStock < 0) {
        showToast('Invalid maximum stock quantity', 'error');
        return;
    }
    
    fetch('db/inventory_update.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `inventoryID=${inventoryID}&maxStock=${maxStock}&action=update_max_stock`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showToast('Maximum stock updated successfully', 'success');
            loadInventoryData();
        } else {
            showToast(data.message || 'Error updating maximum stock', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating maximum stock:', error);
        showToast('Error updating maximum stock', 'error');
    });
}

function updateCostPrice(inventoryID, newCostPrice) {
    const costPrice = parseFloat(newCostPrice);
    if (isNaN(costPrice) || costPrice < 0) {
        showToast('Invalid cost price', 'error');
        return;
    }
    
    fetch('db/inventory_update.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `inventoryID=${inventoryID}&costPrice=${costPrice}&action=update_cost_price`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showToast('Cost price updated successfully', 'success');
            loadInventoryData();
        } else {
            showToast(data.message || 'Error updating cost price', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating cost price:', error);
        showToast('Error updating cost price', 'error');
    });
}

function updateSellingPrice(inventoryID, newSellingPrice) {
    const sellingPrice = parseFloat(newSellingPrice);
    if (isNaN(sellingPrice) || sellingPrice < 0) {
        showToast('Invalid selling price', 'error');
        return;
    }
    
    fetch('db/inventory_update.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `inventoryID=${inventoryID}&sellingPrice=${sellingPrice}&action=update_selling_price`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showToast('Selling price updated successfully', 'success');
            loadInventoryData();
        } else {
            showToast(data.message || 'Error updating selling price', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating selling price:', error);
        showToast('Error updating selling price', 'error');
    });
}

function showAddStockModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('addStockModal');
    if (!modal) {
        modal = createAddStockModal();
        document.body.appendChild(modal);
    }

    // Reset display property and show modal with animation
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);

    loadProductsForModal();
}

function createAddStockModal() {
    const modal = document.createElement('div');
    modal.id = 'addStockModal';
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Add Stock</h3>
                <button class="modal-close" onclick="closeModal('addStockModal')">&times;</button>
            </div>
            <div class="modal-body">
                <form id="addStockForm">
                    <div class="form-group">
                        <label for="productSelect" class="form-label">Product</label>
                        <select id="productSelect" class="form-input" required>
                            <option value="">Select a product</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="sizeSelect" class="form-label">Size</label>
                        <select id="sizeSelect" class="form-input" required>
                            <option value="">Select a size</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="currentStock" class="form-label">Current Stock</label>
                        <input type="number" id="currentStock" class="form-input" min="0" required oninput="calculateProfit()">
                    </div>
                    <div class="form-group">
                        <label for="minStock" class="form-label">Minimum Stock</label>
                        <input type="number" id="minStock" class="form-input" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="maxStock" class="form-label">Maximum Stock</label>
                        <input type="number" id="maxStock" class="form-input" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="costPrice" class="form-label">Cost Price (₱)</label>
                        <input type="number" id="costPrice" class="form-input" min="0" step="0.01" required oninput="calculateProfit()">
                    </div>
                    <div class="form-group">
                        <label for="sellingPrice" class="form-label">Selling Price (₱)</label>
                        <input type="number" id="sellingPrice" class="form-input" min="0" step="0.01" required oninput="calculateProfit()">
                    </div>
                    <div class="form-group">
                        <div id="profitCalculation" style="background: #f8f9fa; padding: 1rem; border-radius: 8px; border: 1px solid #e9ecef;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span>Profit Margin:</span>
                                <span id="profitMarginDisplay" style="font-weight: 600; color: #059669;">0%</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span>Profit per Unit:</span>
                                <span id="profitPerUnit" style="font-weight: 600; color: #059669;">₱0.00</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-weight: 600; color: #7f5539; border-top: 1px solid #e9ecef; padding-top: 0.5rem;">
                                <span>Total Value:</span>
                                <span id="totalValueDisplay">₱0.00</span>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="closeModal('addStockModal')">Cancel</button>
                <button type="button" class="btn-primary" onclick="saveStock()">Save Stock</button>
            </div>
        </div>
    `;
    
    return modal;
}

function loadProductsForModal() {
    fetch('db/products_getAll.php')
        .then(response => response.json())
        .then(products => {
            // For inventory: only non-beverage and non-prepared food items
            const inventoryTrackableProducts = products.filter(product => {
                const productName = (product.productName || '').toLowerCase();
                
                // Allow accurate stock tracking only for packaged/unprocessed items
                const isWaterBreakeable = productName.includes('water') || productName.includes('bottle');
                const isIngredient = productName.includes('beans') || productName.includes('espresso') 
                    || productName.includes('milk') || productName.includes('poured_coffee=false');
                const hasMeasurableUnits = productName.includes('pc') || productName.includes('kg')
                    || productName.includes('grams') || productName.includes('bottle') 
                    || productName.includes('bag') || productName.includes('box');
                
                return (hasMeasurableUnits) || isIngredient; 
            });
            
            const productSelect = document.getElementById('productSelect');
            productSelect.innerHTML = '<option value="">Select a measurable product</option>';
            
            if (inventoryTrackableProducts.length === 0) {
                const option = document.createElement('option');
                option.value = "";
                option.textContent = "No stock-trackable items available";
                productSelect.appendChild(option);
            } else {
                inventoryTrackableProducts.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product.productID;
                    option.textContent = product.productName;
                    productSelect.appendChild(option);
                });
            }
            
            // Add event listener for product change
            productSelect.addEventListener('change', function() {
                loadSizesForProduct(this.value);
            });
        })
        .catch(error => {
            console.error('Error loading products:', error);
            showToast('Error loading products', 'error');
        });
}

function loadSizesForProduct(productID) {
    if (!productID) {
        document.getElementById('sizeSelect').innerHTML = '<option value="">Select a size</option>';
        return;
    }
    
    fetch(`db/sizes_getAll.php`)
        .then(response => response.json())
        .then(sizes => {
            const sizeSelect = document.getElementById('sizeSelect');
            sizeSelect.innerHTML = '<option value="">Select a size</option>';
            
            sizes.forEach(size => {
                const option = document.createElement('option');
                option.value = size.sizeID;
                option.textContent = size.sizeName;
                sizeSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading sizes:', error);
            showToast('Error loading sizes', 'error');
        });
}

function calculateProfit() {
    const costPrice = parseFloat(document.getElementById('costPrice').value) || 0;
    const sellingPrice = parseFloat(document.getElementById('sellingPrice').value) || 0;
    const currentStock = parseInt(document.getElementById('currentStock').value) || 0;
    
    const profitPerUnit = sellingPrice - costPrice;
    const profitMargin = sellingPrice > 0 ? (profitPerUnit / sellingPrice) * 100 : 0;
    const totalValue = costPrice * currentStock;
    
    // Update display
    document.getElementById('profitMarginDisplay').textContent = `${profitMargin.toFixed(2)}%`;
    document.getElementById('profitPerUnit').textContent = `₱${profitPerUnit.toFixed(2)}`;
    document.getElementById('totalValueDisplay').textContent = `₱${totalValue.toFixed(2)}`;
    
    // Color coding
    const profitMarginElement = document.getElementById('profitMarginDisplay');
    const profitPerUnitElement = document.getElementById('profitPerUnit');
    
    if (profitMargin > 0) {
        profitMarginElement.style.color = '#059669';
        profitPerUnitElement.style.color = '#059669';
    } else if (profitMargin < 0) {
        profitMarginElement.style.color = '#dc2626';
        profitPerUnitElement.style.color = '#dc2626';
    } else {
        profitMarginElement.style.color = '#6b7280';
        profitPerUnitElement.style.color = '#6b7280';
    }
}

function saveStock() {
    const productID = document.getElementById('productSelect').value;
    const sizeID = document.getElementById('sizeSelect').value;
    const currentStock = document.getElementById('currentStock').value;
    const minStock = document.getElementById('minStock').value;
    const maxStock = document.getElementById('maxStock').value;
    const costPrice = document.getElementById('costPrice').value;
    const sellingPrice = document.getElementById('sellingPrice').value;
    
    if (!productID || !sizeID || !currentStock || !minStock || !maxStock || !costPrice || !sellingPrice) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    // Calculate profit margin
    const profitMargin = sellingPrice > 0 ? ((sellingPrice - costPrice) / sellingPrice) * 100 : 0;
    const totalValue = costPrice * currentStock;
    
    fetch('db/inventory_add.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `productID=${productID}&sizeID=${sizeID}&currentStock=${currentStock}&minStock=${minStock}&maxStock=${maxStock}&costPrice=${costPrice}&sellingPrice=${sellingPrice}&profitMargin=${profitMargin}&totalValue=${totalValue}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showToast('Stock added successfully', 'success');
            closeModal('addStockModal');
            loadInventoryData();
        } else {
            showToast(data.message || 'Error adding stock', 'error');
        }
    })
    .catch(error => {
        console.error('Error adding stock:', error);
        showToast('Error adding stock', 'error');
    });
}

function showAdjustStockModal(inventoryID) {
    const item = inventoryData.find(item => item.inventoryID == inventoryID);
    if (!item) return;
    
    const adjustment = prompt(`Adjust stock for ${item.productName} (${item.sizeName})\nCurrent: ${item.currentStock}\nEnter adjustment (+/-):`);
    
    if (adjustment === null) return;
    
    const adjustmentValue = parseInt(adjustment);
    if (isNaN(adjustmentValue)) {
        showToast('Invalid adjustment value', 'error');
        return;
    }
    
    const newStock = item.currentStock + adjustmentValue;
    if (newStock < 0) {
        showToast('Stock cannot be negative', 'error');
        return;
    }
    
    updateStock(inventoryID, newStock);
}

function showStockHistory(inventoryID) {
    // This would show a modal with stock history
    // For now, just show an alert
    alert('Stock history feature coming soon!');
}

function exportInventory() {
    // Check if data is loaded
    if (!inventoryData || inventoryData.length === 0) {
        showToast('No inventory data to export. Please wait for data to load.', 'warning');
        return;
    }

    try {
        const csvContent = generateCSV();
        if (!csvContent || csvContent.trim() === '') {
            showToast('No data available to export', 'warning');
            return;
        }

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showToast('Inventory data exported successfully', 'success');
    } catch (error) {
        console.error('Error exporting inventory:', error);
        showToast('Failed to export inventory data', 'error');
    }
}

function generateCSV() {
    const headers = ['Product', 'Category', 'Size', 'Current Stock', 'Min Stock', 'Max Stock', 'Status', 'Last Updated'];
    const rows = filteredData.map(item => {
        const status = getStockStatus(item.currentStock, item.minStock);
        return [
            item.productName,
            item.categoryName,
            item.sizeName,
            item.currentStock,
            item.minStock,
            item.maxStock,
            status,
            formatDate(item.lastUpdated)
        ];
    });
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
    
    return csvContent;
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        if (event.target === modal) {
            closeModal(modal.id);
        }
    });
}
