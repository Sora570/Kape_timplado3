// Cashier Navigation JavaScript
// Handles navigation for cashier interface

// Initialize cashier navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupCashierNavigation();
});

function setupCashierNavigation() {
    // Products button
    const productsBtn = document.getElementById('ProductsForm-button');
    if (productsBtn) {
        productsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            hideAllCashierSections();
            document.getElementById('ProductsForm').style.display = 'block';
            setActiveCashierNav('ProductsForm-button');
            
            // Load products when tab is opened
            if (typeof loadProducts === 'function') {
                loadProducts();
            }
        });
    }

    // Orders button
    const ordersBtn = document.getElementById('OrdersForm-button');
    if (ordersBtn) {
        ordersBtn.addEventListener('click', function(e) {
            e.preventDefault();
            hideAllCashierSections();
            document.getElementById('OrdersForm').style.display = 'block';
            setActiveCashierNav('OrdersForm-button');
            
            // Load orders when tab is opened
            if (typeof loadCashierOrders === 'function') {
                loadCashierOrders();
            }
        });
    }

    // Close-Out button
    const closeoutBtn = document.getElementById('CloseoutForm-button');
    if (closeoutBtn) {
        closeoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            hideAllCashierSections();
            document.getElementById('CloseoutForm').style.display = 'block';
            setActiveCashierNav('CloseoutForm-button');
            
            // Load close-out data when tab is opened
            if (typeof loadCloseoutData === 'function') {
                loadCloseoutData();
            }
        });
    }

    // Sign Out button
    const signOutBtn = document.getElementById('SignOutForm-button');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleCashierLogout();
        });
    }

    // Logout button in top bar
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleCashierLogout();
        });
    }
}

function hideAllCashierSections() {
    const sections = ['ProductsForm', 'OrdersForm', 'CloseoutForm'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
        }
    });
}

function setActiveCashierNav(buttonId) {
    // Remove active class from all navigation items
    const allItems = document.querySelectorAll('.navigation ul li');
    allItems.forEach(li => li.classList.remove('hovered'));
    
    // Add active class to clicked item
    const button = document.getElementById(buttonId);
    if (button && button.parentElement) {
        button.parentElement.classList.add('hovered');
    }
}

function handleCashierLogout() {
    if (confirm('Are you sure you want to sign out?')) {
        fetch('db/logout.php', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
        .then(response => {
            if (response.ok) {
                // Clear any cached data
                localStorage.clear();
                sessionStorage.clear();
                
                // Redirect to login page
                window.location.href = 'loginRegister.html';
            } else {
                console.error('Logout failed');
                // Still redirect even if there's an error
                window.location.href = 'loginRegister.html';
            }
        })
        .catch(error => {
            console.error('Logout error:', error);
            // Still redirect even if there's an error
            window.location.href = 'loginRegister.html';
        });
    }
}

// Toggle navigation (for mobile/responsive)
function toggleCashierNavigation() {
    const navigation = document.getElementById('navigation');
    if (navigation) {
        navigation.classList.toggle('active');
    }
}

// Setup toggle button if it exists
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleCashierNavigation);
    }
});

// Expose functions globally
window.hideAllCashierSections = hideAllCashierSections;
window.setActiveCashierNav = setActiveCashierNav;
window.handleCashierLogout = handleCashierLogout;
window.toggleCashierNavigation = toggleCashierNavigation;
