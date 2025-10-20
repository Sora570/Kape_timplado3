// Cashier POS System JavaScript
// Handles product loading, cart management, and checkout functionality

var cart = [];
var products = [];
var categories = [];

// Initialize POS system
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadCategories();
    setupEventListeners();
});

// Load products from database
async function loadProducts() {
    try {
        const response = await fetch('db/products_get.php');
        const data = await response.json();
        
        if (data.products) {
            products = data.products;
            renderProducts(products);
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Error loading products', 'error');
    }
}

// Load categories for filtering
async function loadCategories() {
    try {
        const response = await fetch('db/categories_getAll.php');
        categories = await response.json();
        
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">All Categories</option>' +
                categories.map(cat => `<option value="${cat.categoryID}">${cat.categoryName}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Render products in the grid
function renderProducts(productsToRender) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = productsToRender.map(product => `
        <div class="product-card" data-product-id="${product.productID}">
            <div class="product-image">
                <img src="${product.image_url || 'assest/image/no-image.png'}" alt="${product.name}" 
                     onerror="this.src='assest/image/no-image.png'">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-category">${getCategoryName(product.categoryID)}</div>
                <div class="product-sizes">
                    ${product.sizes ? product.sizes.map(size => `
                        <button class="size-btn" data-product-id="${product.productID}" 
                                data-size-id="${size.sizeID || 0}" 
                                data-price="${size.price}"
                                data-size-name="${size.size_label || 'Default'}">
                            ${size.size_label || 'Default'} - ₱${parseFloat(size.price).toFixed(2)}
                        </button>
                    `).join('') : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    // Add click handlers for size buttons
    productsGrid.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => addToCart(btn));
    });
}

// Get category name by ID
function getCategoryName(categoryID) {
    const category = categories.find(cat => cat.categoryID == categoryID);
    return category ? category.categoryName : 'Unknown';
}

// Add product to cart
function addToCart(button) {
    const productID = parseInt(button.dataset.productId);
    const sizeID = parseInt(button.dataset.sizeId);
    const price = parseFloat(button.dataset.price);
    const sizeName = button.dataset.sizeName;
    
    const product = products.find(p => p.productID == productID);
    if (!product) return;
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => 
        item.productID == productID && item.sizeID == sizeID
    );
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            productID: productID,
            sizeID: sizeID,
            productName: product.name,
            sizeName: sizeName,
            unitPrice: price,
            quantity: 1,
            addons: []
        });
    }
    
    updateCart();
    showToast(`${product.name} added to cart`, 'success');
}

// Update cart display
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Cart is empty</div>';
        cartTotal.textContent = '₱0.00';
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = cart.map((item, index) => {
        const itemTotal = item.unitPrice * item.quantity;
        total += itemTotal;
        
        return `
            <div class="cart-item">
                <div class="cart-item-header">
                    <div class="cart-item-name">${item.productName}</div>
                    <div class="cart-item-size">${item.sizeName}</div>
                </div>
                ${item.addons.length > 0 ? `
                    <div class="cart-item-addons">
                        ${item.addons.map(addon => `
                            <div class="addon-item">${addon.name} - ₱${addon.price.toFixed(2)}</div>
                        `).join('')}
                    </div>
                ` : ''}
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                    <div class="cart-item-total">₱${itemTotal.toFixed(2)}</div>
                    <button class="remove-item" onclick="removeFromCart(${index})">Remove</button>
                </div>
            </div>
        `;
    }).join('');
    
    cartTotal.textContent = `₱${total.toFixed(2)}`;
}

// Update item quantity
function updateQuantity(index, change) {
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    updateCart();
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }
    
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', processCheckout);
    }
}

// Filter products
function filterProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    let filteredProducts = products;
    
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm)
        );
    }
    
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(product => 
            product.categoryID == categoryFilter
        );
    }
    
    renderProducts(filteredProducts);
}

// Process checkout
async function processCheckout() {
    if (cart.length === 0) {
        showToast('Cart is empty', 'warning');
        return;
    }
    
    // Show checkout modal or redirect to checkout page
    const total = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    
    const paymentMethod = prompt('Payment Method (cash/card):', 'cash');
    if (!paymentMethod) return;
    
    const cashReceived = paymentMethod === 'cash' ? 
        parseFloat(prompt(`Total: ₱${total.toFixed(2)}\nCash Received:`, total.toFixed(2))) : 0;
    
    try {
        const response = await fetch('db/checkout_process.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                cartItems: JSON.stringify(cart),
                paymentMethod: paymentMethod,
                cashReceived: cashReceived,
                discountType: 'none',
                discountPercentage: 0
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            showToast('Order completed successfully!', 'success');
            cart = [];
            updateCart();
            
            // Print receipt or show receipt details
            console.log('Receipt:', result.receipt);
        } else {
            showToast('Checkout failed: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        showToast('Checkout failed', 'error');
    }
}

// Toast notification system
function showToast(message, type = 'info') {
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
        wordWrap: 'break-word'
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

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        loadProducts();
        loadCategories();
        setupEventListeners();
    });
} else {
    loadProducts();
    loadCategories();
    setupEventListeners();
}
