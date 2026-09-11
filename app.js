/* =============================================================================
   MYPOS RETAIL APPLICATION - COMPLETE INTERACTIVE CONTROLLER
   Full Forms, Modals, State Management, Real-Time Calculations & Exports
   ============================================================================= */

// --- 1. CORE APPLICATION STATE ---
const posState = {
  isAuthenticated: false,
  currentUser: { username: 'admin', role: 'ADMIN', name: 'System Administrator' },
  activeScreen: 'login',
  selectedBranch: 'Main Branch',
  nextInvoiceSeq: 1000125,
  nextPurchaseSeq: 125,
  editingProductId: null,
  editingCategoryId: null,
  editingCustomerId: null,
  editingSupplierId: null,
  editingBranchId: null,

  // Company Settings (Persisted in localStorage)
  settings: (() => {
    let saved = JSON.parse(localStorage.getItem('pos_settings') || 'null');
    if (!saved || typeof saved !== 'object') {
      saved = {
        storeName: 'ABC Retail Store',
        legalName: 'ABC Supermarkets India Pvt Ltd',
        gstin: '07ABCDE1234F1Z5',
        address: 'Shop No. 12, Green Park, New Delhi - 110016',
        phone: '+91 98765 43210',
        invoicePrefix: 'INV',
        currency: '₹',
        allowNegativeStock: false
      };
      localStorage.setItem('pos_settings', JSON.stringify(saved));
    }
    return saved;
  })(),

  // Branches Directory (Persisted in localStorage)
  branches: (() => {
    let saved = JSON.parse(localStorage.getItem('pos_branches_list') || 'null');
    if (!saved || !Array.isArray(saved) || saved.length === 0) {
      saved = [
        { id: 1, code: 'B001', name: 'Main Branch', address: 'Shop No. 12, Green Park, New Delhi', phone: '+91 98765 43210', status: 'Active' },
        { id: 2, code: 'B002', name: 'Branch 2 - Noida Sector 62', address: 'Plot 45, Sector 62, Noida, UP', phone: '+91 98765 43211', status: 'Active' },
        { id: 3, code: 'B003', name: 'Branch 3 - Gurgaon Express', address: 'DLF Phase 3, Gurgaon, Haryana', phone: '+91 98765 43212', status: 'Active' }
      ];
      localStorage.setItem('pos_branches_list', JSON.stringify(saved));
    }
    return saved;
  })(),

  // Master Product Catalog (Persisted in localStorage)
  products: (() => {
    let saved = JSON.parse(localStorage.getItem('pos_products_list') || 'null');
    if (!saved || !Array.isArray(saved) || saved.length === 0) {
      saved = [
        { id: 1, code: 'P001', name: 'Milk', category: 'Dairy', price: 52.00, cost: 42.00, stock: 45, minStock: 10, unit: 'Ltr', tax: 0, icon: '🥛', barcode: '890100100001' },
        { id: 2, code: 'P002', name: 'Bread', category: 'Bakery', price: 35.00, cost: 25.00, stock: 32, minStock: 10, unit: 'Pkt', tax: 0, icon: '🍞', barcode: '890100100002' },
        { id: 3, code: 'P003', name: 'Biscuits', category: 'Snacks', price: 20.00, cost: 14.00, stock: 56, minStock: 10, unit: 'Pkt', tax: 18, icon: '🍪', barcode: '890100100003' },
        { id: 4, code: 'P004', name: 'Maggi', category: 'Food', price: 15.00, cost: 11.00, stock: 40, minStock: 10, unit: 'Pkt', tax: 12, icon: '🍜', barcode: '890100100004' },
        { id: 5, code: 'P005', name: 'Soft Drink', category: 'Beverages', price: 45.00, cost: 32.00, stock: 26, minStock: 10, unit: 'Btl', tax: 28, icon: '🥤', barcode: '890100100005' },
        { id: 6, code: 'P006', name: 'Chips', category: 'Snacks', price: 25.00, cost: 18.00, stock: 35, minStock: 10, unit: 'Pkt', tax: 12, icon: '🍟', barcode: '890100100006' },
        { id: 7, code: 'P007', name: 'Cooking Oil', category: 'Food', price: 120.00, cost: 95.00, stock: 20, minStock: 5, unit: 'Ltr', tax: 5, icon: '🍾', barcode: '890100100007' },
        { id: 8, code: 'P008', name: 'Basmati Rice', category: 'Food', price: 60.00, cost: 45.00, stock: 50, minStock: 15, unit: 'Kg', tax: 0, icon: '🍚', barcode: '890100100008' }
      ];
      localStorage.setItem('pos_products_list', JSON.stringify(saved));
    }
    return saved;
  })(),

  // Categories Catalog (Persisted in localStorage)
  categories: (() => {
    let saved = JSON.parse(localStorage.getItem('pos_categories_list') || 'null');
    if (!saved || !Array.isArray(saved) || saved.length === 0) {
      saved = [
        { id: 1, name: 'Dairy', desc: 'Milk & Dairy Products', status: 'Active' },
        { id: 2, name: 'Bakery', desc: 'Bread, Cakes, Pastries', status: 'Active' },
        { id: 3, name: 'Snacks', desc: 'Chips, Biscuits, Namkeen', status: 'Active' },
        { id: 4, name: 'Beverages', desc: 'Soft Drinks, Juices', status: 'Active' },
        { id: 5, name: 'Food', desc: 'Instant Food, Spices', status: 'Active' },
        { id: 6, name: 'Household', desc: 'Home Care, Cleaning', status: 'Active' },
        { id: 7, name: 'Personal Care', desc: 'Cosmetics, Hygiene', status: 'Active' }
      ];
      localStorage.setItem('pos_categories_list', JSON.stringify(saved));
    }
    return saved;
  })(),

  // Customers Directory & Balances (Persisted in localStorage)
  customers: (() => {
    let saved = JSON.parse(localStorage.getItem('pos_customers_list') || 'null');
    if (!saved || !Array.isArray(saved) || saved.length === 0) {
      saved = [
        { id: 1, name: 'Walk-in Customer', mobile: '9999999999', email: '', gstin: 'Unregistered', balance: 0.00, creditLimit: 0, status: 'Active' },
        { id: 2, name: 'Rohit Sharma', mobile: '9876543210', email: 'rohit@gmail.com', gstin: '07ABCDE1234F1Z5', balance: 0.00, creditLimit: 10000, status: 'Active' },
        { id: 3, name: 'Priya Singh', mobile: '9811122334', email: 'priya@gmail.com', gstin: '07ABCDE1234F1Z6', balance: 320.00, creditLimit: 5000, status: 'Active' },
        { id: 4, name: 'Amit Kumar', mobile: '9123456789', email: 'amit@gmail.com', gstin: '-', balance: 0.00, creditLimit: 2000, status: 'Active' },
        { id: 5, name: 'Sunita Devi', mobile: '9887766554', email: 'sunita@gmail.com', gstin: '-', balance: 120.00, creditLimit: 3000, status: 'Active' },
        { id: 6, name: 'Vikram Patel', mobile: '9654321187', email: 'vikram@gmail.com', gstin: '07ABCDE1234F1Z7', balance: 450.00, creditLimit: 8000, status: 'Active' }
      ];
      localStorage.setItem('pos_customers_list', JSON.stringify(saved));
    }
    return saved;
  })(),

  // Suppliers Directory & Payables (Persisted in localStorage)
  suppliers: (() => {
    let saved = JSON.parse(localStorage.getItem('pos_suppliers_list') || 'null');
    if (!saved || !Array.isArray(saved) || saved.length === 0) {
      saved = [
        { id: 1, name: 'ABC Distributors', contact: 'Ramesh Kumar', mobile: '9876500001', email: 'abc@distributors.com', gstin: '07ABCDE1234F1Z5', balance: 5750.00, status: 'Active' },
        { id: 2, name: 'Shree Trading', contact: 'Suresh Shah', mobile: '9812345678', email: 'shree@trading.com', gstin: '07ABCDE1234F1Z6', balance: 12800.00, status: 'Active' },
        { id: 3, name: 'Global Suppliers', contact: 'Anil Gupta', mobile: '9123456780', email: 'global@suppliers.com', gstin: '-', balance: 0.00, status: 'Active' },
        { id: 4, name: 'Mahesh Traders', contact: 'Mahesh Verma', mobile: '9888777666', email: 'mahesh@traders.com', gstin: '07ABCDE1234F1Z7', balance: 3450.00, status: 'Active' },
        { id: 5, name: 'KR Enterprises', contact: 'Karan Rawat', mobile: '9654009887', email: 'kr@enterprises.com', gstin: '-', balance: 7300.00, status: 'Active' }
      ];
      localStorage.setItem('pos_suppliers_list', JSON.stringify(saved));
    }
    return saved;
  })(),

  // Users Directory & Role Assignments (Persisted in localStorage with Passwords)
  users: (() => {
    let saved = JSON.parse(localStorage.getItem('pos_users_list') || 'null');
    if (!saved || !Array.isArray(saved) || saved.length === 0) {
      saved = [
        { id: 1, name: 'System Administrator', username: 'admin', password: 'password123', role: 'ADMIN', branch: 'All Branches', status: 'Active' },
        { id: 2, name: 'Store Manager', username: 'manager', password: 'password123', role: 'MANAGER', branch: 'Main Branch', status: 'Active' },
        { id: 3, name: 'Cashier One', username: 'cashier1', password: 'password123', role: 'CASHIER', branch: 'Main Branch', status: 'Active' },
        { id: 4, name: 'Cashier Two', username: 'cashier2', password: 'password123', role: 'CASHIER', branch: 'Branch 2 - Noida', status: 'Active' }
      ];
      localStorage.setItem('pos_users_list', JSON.stringify(saved));
    } else {
      let updated = false;
      saved.forEach(u => {
        if (!u.password) {
          u.password = 'password123';
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem('pos_users_list', JSON.stringify(saved));
      }
    }
    return saved;
  })(),

  // 14-Module Role Security Permissions (Persisted in localStorage)
  rolePermissions: JSON.parse(localStorage.getItem('pos_role_permissions') || 'null') || {
    ADMIN: [
      'dashboard', 'pos', 'products', 'categories', 'inventory', 'purchase',
      'customers', 'suppliers', 'sales-history', 'sales-return', 'stock-transfer',
      'ledger', 'sales-reports', 'users'
    ],
    MANAGER: [
      'dashboard', 'pos', 'products', 'categories', 'inventory', 'purchase',
      'customers', 'suppliers', 'sales-history', 'sales-return', 'stock-transfer',
      'ledger', 'sales-reports'
    ],
    CASHIER: [
      'pos', 'sales-history', 'sales-return'
    ]
  },
  selectedPermRole: 'ADMIN',

  // Active POS Cart - ALWAYS starts 100% EMPTY on load as requested!
  cart: [],
  posCustomerName: 'Walk-in Customer',
  posCustomerMobile: '9999999999',

  // Past Sales History (Persisted in localStorage)
  salesHistory: (() => {
    let saved = JSON.parse(localStorage.getItem('pos_sales_history') || 'null');
    const now = new Date();
    const fmt = (d) => {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    };
    const d0 = fmt(now);
    const d1 = fmt(new Date(now.getTime() - 1 * 86400000));
    const d2 = fmt(new Date(now.getTime() - 2 * 86400000));
    const d3 = fmt(new Date(now.getTime() - 3 * 86400000));

    if (!saved || !Array.isArray(saved) || saved.length === 0) {
      saved = [
        { id: 125, invoiceNo: 'INV-0000125', date: d0, customer: 'Walk-in Customer', customerMobile: '9999999999', branch: 'Main Branch', cashier: 'System Administrator', amount: 167.56, payment: 'Cash', paymentMode: 'CASH', items: [
          { productId: 1, name: 'Milk', qty: 1, price: 52.00, taxRate: 0 }, { productId: 2, name: 'Bread', qty: 2, price: 35.00, taxRate: 0 }, { productId: 3, name: 'Biscuits', qty: 1, price: 20.00, taxRate: 18 }
        ]},
        { id: 124, invoiceNo: 'INV-0000124', date: d0, customer: 'Rohit Sharma', customerMobile: '9876543210', branch: 'Main Branch', cashier: 'Cashier One', amount: 310.00, payment: 'UPI', paymentMode: 'UPI', items: [{ productId: 7, name: 'Cooking Oil', qty: 2, price: 120.00, taxRate: 5 }, { productId: 8, name: 'Basmati Rice', qty: 1, price: 60.00, taxRate: 0 }] },
        { id: 123, invoiceNo: 'INV-0000123', date: d1, customer: 'Priya Singh', customerMobile: '9811122334', branch: 'Branch 2 - Noida Sector 62', cashier: 'Cashier Two', amount: 320.00, payment: 'Credit', paymentMode: 'CREDIT', items: [{ productId: 3, name: 'Biscuits', qty: 10, price: 20.00, taxRate: 18 }, { productId: 7, name: 'Cooking Oil', qty: 1, price: 120.00, taxRate: 5 }] },
        { id: 122, invoiceNo: 'INV-0000122', date: d2, customer: 'Amit Kumar', customerMobile: '9123456789', branch: 'Main Branch', cashier: 'System Administrator', amount: 540.00, payment: 'Card', paymentMode: 'CARD', items: [{ productId: 8, name: 'Basmati Rice', qty: 9, price: 60.00, taxRate: 0 }] },
        { id: 121, invoiceNo: 'INV-0000121', date: d3, customer: 'Sunita Devi', customerMobile: '9887766554', branch: 'Branch 3 - Gurgaon Express', cashier: 'Cashier One', amount: 120.00, payment: 'UPI', paymentMode: 'UPI', items: [{ productId: 7, name: 'Cooking Oil', qty: 1, price: 120.00, taxRate: 5 }] }
      ];
      localStorage.setItem('pos_sales_history', JSON.stringify(saved));
    } else {
      let updated = false;
      saved.forEach(s => {
        if (s.id === 125 && s.date && s.date.includes('2025')) { s.date = d0; updated = true; }
        if (s.id === 124 && s.date && s.date.includes('2025')) { s.date = d0; updated = true; }
        if (s.id === 123 && s.date && s.date.includes('2025')) { s.date = d1; updated = true; }
        if (s.id === 122 && s.date && s.date.includes('2025')) { s.date = d2; updated = true; }
        if (s.id === 121 && s.date && s.date.includes('2025')) { s.date = d3; updated = true; }
      });
      if (updated) {
        localStorage.setItem('pos_sales_history', JSON.stringify(saved));
      }
    }
    return saved;
  })(),

  // Purchase Master (Persisted in localStorage)
  purchases: (() => {
    let saved = JSON.parse(localStorage.getItem('pos_purchases_list') || 'null');
    if (!saved || !Array.isArray(saved) || saved.length === 0) {
      saved = [
        { id: 124, poNumber: 'PUR-000124', date: '08-09-2025', supplier: 'ABC Distributors', branch: 'Main Branch', itemsCount: 3, totalQty: 60, totalAmount: 5750.00, status: 'Received' },
        { id: 123, poNumber: 'PUR-000123', date: '06-09-2025', supplier: 'Shree Trading', branch: 'Branch 2 - Noida Sector 62', itemsCount: 2, totalQty: 40, totalAmount: 4200.00, status: 'Received' },
        { id: 122, poNumber: 'PUR-000122', date: '04-09-2025', supplier: 'Mahesh Traders', branch: 'Main Branch', itemsCount: 4, totalQty: 80, totalAmount: 8900.00, status: 'Received' }
      ];
      localStorage.setItem('pos_purchases_list', JSON.stringify(saved));
    }
    return saved;
  })(),

  // Returns Master (Sales & Purchase Returns) (Persisted in localStorage)
  returns: (() => {
    let saved = JSON.parse(localStorage.getItem('pos_returns_list') || 'null');
    if (!saved || !Array.isArray(saved) || saved.length === 0) {
      saved = [
        { id: 'RET-0001', date: '08-09-2025', type: 'Sales Return', refNo: 'INV-0000124', party: 'Rohit Sharma', branch: 'Main Branch', amount: 120.00, reason: 'Damaged packaging', status: 'Completed' },
        { id: 'RET-0002', date: '07-09-2025', type: 'Purchase Return', refNo: 'PUR-000123', party: 'Shree Trading', branch: 'Branch 2 - Noida Sector 62', amount: 350.00, reason: 'Expired stock batch', status: 'Completed' },
        { id: 'RET-0003', date: '05-09-2025', type: 'Sales Return', refNo: 'INV-0000121', party: 'Sunita Devi', branch: 'Branch 3 - Gurgaon Express', amount: 45.00, reason: 'Wrong item purchased', status: 'Completed' }
      ];
      localStorage.setItem('pos_returns_list', JSON.stringify(saved));
    }
    return saved;
  })(),

  lastCompletedSale: null,

  // Active Stock Transfer Manifest & History
  activeTransferItems: [],
  transferHistory: (() => {
    let saved = JSON.parse(localStorage.getItem('pos_transfer_history') || 'null');
    if (!saved || !Array.isArray(saved) || saved.length === 0) {
      saved = [
        {
          id: 'TRF-1001',
          date: '08-09-2025',
          from: 'Main Branch',
          to: 'Branch 2 - Noida Sector 62',
          items: [
            { name: 'Milk', qty: 10 },
            { name: 'Bread', qty: 5 },
            { name: 'Biscuits', qty: 8 }
          ],
          totalQty: 23,
          status: 'Completed'
        }
      ];
      localStorage.setItem('pos_transfer_history', JSON.stringify(saved));
    }
    return saved;
  })()
};
window.posState = posState;

// Storage Helpers: Save entities to localStorage
function saveProductsToStorage() {
  localStorage.setItem('pos_products_list', JSON.stringify(posState.products));
}
function saveBranchesToStorage() {
  localStorage.setItem('pos_branches_list', JSON.stringify(posState.branches));
}
function saveCategoriesToStorage() {
  localStorage.setItem('pos_categories_list', JSON.stringify(posState.categories));
}
function saveCustomersToStorage() {
  localStorage.setItem('pos_customers_list', JSON.stringify(posState.customers));
}
function saveSuppliersToStorage() {
  localStorage.setItem('pos_suppliers_list', JSON.stringify(posState.suppliers));
}
function saveSettingsToStorage() {
  localStorage.setItem('pos_settings', JSON.stringify(posState.settings));
}
function saveSalesHistoryToStorage() {
  localStorage.setItem('pos_sales_history', JSON.stringify(posState.salesHistory));
}
function saveTransferHistoryToStorage() {
  localStorage.setItem('pos_transfer_history', JSON.stringify(posState.transferHistory));
}
function saveUsersToStorage() {
  localStorage.setItem('pos_users_list', JSON.stringify(posState.users));
}
function savePurchasesToStorage() {
  localStorage.setItem('pos_purchases_list', JSON.stringify(posState.purchases));
}
function saveReturnsToStorage() {
  localStorage.setItem('pos_returns_list', JSON.stringify(posState.returns));
}


// --- 2. NOTIFICATION TOAST SYSTEM ---
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? '✅' : type === 'danger' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// --- 3. MODAL DIALOG CONTROLLER ---
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// --- 4. 14-MODULE REGISTRY & SCREEN ROUTER WITH ROLE ACCESS CONTROL ---
const DEFAULT_ROLE_PERMISSIONS = {
  ADMIN: [
    'dashboard', 'pos', 'products', 'categories', 'inventory', 'purchase',
    'customers', 'suppliers', 'sales-history', 'sales-return', 'stock-transfer',
    'ledger', 'sales-reports', 'users'
  ],
  MANAGER: [
    'dashboard', 'pos', 'products', 'categories', 'inventory', 'purchase',
    'customers', 'suppliers', 'sales-history', 'sales-return', 'stock-transfer',
    'ledger', 'sales-reports'
  ],
  CASHIER: [
    'pos', 'sales-history', 'sales-return'
  ]
};

const POS_MODULES = [
  { id: 'dashboard', label: '📊 Dashboard & KPIs', desc: 'Real-time sales & metrics' },
  { id: 'pos', label: '🛒 POS / Billing', desc: 'Cashier checkout & new sale' },
  { id: 'products', label: '📦 Product Catalog', desc: 'SKU maintenance & pricing' },
  { id: 'categories', label: '🏷️ Categories Master', desc: 'Item departments & grouping' },
  { id: 'inventory', label: '📈 Inventory & Stock', desc: 'Live stock & low stock alerts' },
  { id: 'purchase', label: '📥 Purchase Entry', desc: 'Supplier bills & stock intake' },
  { id: 'customers', label: '👥 Customer Master', desc: 'Customer accounts & credit limits' },
  { id: 'suppliers', label: '🏭 Supplier Master', desc: 'Vendor directory & balances' },
  { id: 'sales-history', label: '🧾 Sales History', desc: 'Invoices archive & reprints' },
  { id: 'sales-return', label: '🔄 Sales & Return', desc: 'Item returns & debit notes' },
  { id: 'stock-transfer', label: '🚚 Stock Transfer', desc: 'Inter-branch inventory transfer' },
  { id: 'ledger', label: '📒 Account Ledgers', desc: 'Customer & supplier running statements' },
  { id: 'sales-reports', label: '📑 Sales Reports', desc: 'Sales & profit margin analytics' },
  { id: 'users', label: '🔐 Users & Permissions', desc: 'User accounts, roles & permissions' }
];

function hasPermission(screenId) {
  if (!screenId || screenId === 'login') return true;
  // ADMIN role has full master privileges across all screens
  if (posState.currentUser.role === 'ADMIN') return true;

  const currentRole = posState.currentUser.role;
  const allowed = posState.rolePermissions[currentRole] || [];

  // Map sub-screens to main modules
  let checkKey = screenId;
  if (screenId === 'product-search' || screenId === 'receipt') checkKey = 'pos';
  if (screenId === 'purchase-return') checkKey = 'sales-return';
  if (screenId === 'profit-report') checkKey = 'sales-reports';
  if (['audit-log', 'settings', 'branches'].includes(screenId)) checkKey = 'users';

  return allowed.includes(checkKey) || allowed.includes(screenId);
}

// --- MOBILE SIDEBAR DRAWER CONTROLLER ---
function toggleMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!sidebar) return;
  const isOpen = sidebar.classList.toggle('sidebar-open');
  if (backdrop) {
    backdrop.classList.toggle('active', isOpen);
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.remove('sidebar-open');
  if (backdrop) backdrop.classList.remove('active');
}

function navigateToScreen(screenId) {
  // Automatically dismiss mobile drawer when a screen is chosen
  closeMobileSidebar();

  // Enforce authentication guard: must be authenticated for any screen other than login
  if (!posState.isAuthenticated && screenId !== 'login') {
    showToast('🔒 Please sign in with your username and password.', 'warning');
    screenId = 'login';
  }

  // Enforce role authorization
  if (screenId !== 'login' && !hasPermission(screenId)) {
    const mod = POS_MODULES.find(m => m.id === screenId);
    const modName = mod ? mod.label : screenId;
    showToast(`🔒 Access Denied: Role "${posState.currentUser.role}" does not have permission to access "${modName}". Only ADMIN can grant permission!`, 'danger');
    return false;
  }

  posState.activeScreen = screenId;

  // Toggle layout mode between unauthenticated full-screen and authenticated workspace
  if (screenId === 'login' || !posState.isAuthenticated) {
    document.body.classList.add('not-authenticated');
  } else {
    document.body.classList.remove('not-authenticated');
  }

  document.querySelectorAll('.screen-view').forEach(view => {
    view.classList.remove('active');
  });
  const target = document.getElementById('screen-' + screenId);
  if (target) {
    target.classList.add('active');
  }

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.screen === screenId);
  });

  const select = document.getElementById('quick-screen-select');
  if (select) {
    select.value = screenId;
  }

  // If entering login screen, focus username field
  if (screenId === 'login') {
    setTimeout(() => {
      const uField = document.getElementById('login-user');
      if (uField) uField.focus();
    }, 100);
  }

  // Refresh dynamic screen content
  if (screenId === 'dashboard') renderDashboard();
  if (screenId === 'pos') { renderPosProducts(); renderCart(); initPosCustomerBar(); }
  if (screenId === 'inventory') renderInventory();
  if (screenId === 'products') renderProductMaster();
  if (screenId === 'categories') renderCategories();
  if (screenId === 'customers') renderCustomers();
  if (screenId === 'suppliers') renderSuppliers();
  if (screenId === 'sales-history') renderSalesHistory();
  if (screenId === 'ledger') renderLedger();
  if (screenId === 'sales-reports') renderReports();
  if (screenId === 'profit-report') renderProfitReport();
  if (screenId === 'users') renderUsers();
  if (screenId === 'branches') renderBranches();
  if (screenId === 'settings') loadSettings();
  if (screenId === 'product-search') renderProductSearch();
  if (screenId === 'stock-transfer') initStockTransferScreen();
  if (screenId === 'purchase') populatePurchaseDropdowns();
}

// --- AUTHENTICATION & LOGIN CONTROLLERS ---

function handleLogin(e) {
  if (e) e.preventDefault();

  const userField = document.getElementById('login-user');
  const passField = document.getElementById('login-pass');
  const errBox = document.getElementById('login-error-msg');

  const username = userField ? userField.value.trim() : '';
  const password = passField ? passField.value : '';

  if (!username || !password) {
    showLoginError('Please enter both username and password.');
    return;
  }

  // Search user in registered accounts
  const user = posState.users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!user) {
    showLoginError(`❌ User account "${username}" not found. Only Administrator can create user accounts in Screen 20.`);
    return;
  }

  if (user.status !== 'Active') {
    showLoginError(`❌ Account "${user.username}" is disabled. Please contact System Administrator.`);
    return;
  }

  // Password verification
  const expectedPassword = user.password || 'password123';
  if (password !== expectedPassword) {
    showLoginError('❌ Incorrect password! Passwords are case-sensitive. Please check with your Admin.');
    return;
  }

  // Success: Set authenticated state
  posState.isAuthenticated = true;
  posState.currentUser = {
    username: user.username,
    role: user.role,
    name: user.name
  };

  sessionStorage.setItem('pos_active_session', JSON.stringify(posState.currentUser));

  if (errBox) errBox.style.display = 'none';

  // Sync topbar
  const curUserEl = document.getElementById('current-username');
  const curRoleEl = document.getElementById('current-role');
  if (curUserEl) curUserEl.textContent = user.username;
  if (curRoleEl) curRoleEl.textContent = user.role;

  syncActiveUserDropdown();
  updateNavigationPermissionsUI();

  showToast(`Welcome, ${user.name}! Logged in as ${user.role}.`, 'success');

  const destination = hasPermission('dashboard') ? 'dashboard' : (hasPermission('pos') ? 'pos' : (posState.rolePermissions[user.role] || [])[0] || 'pos');
  navigateToScreen(destination);
}

function showLoginError(msg) {
  const errBox = document.getElementById('login-error-msg');
  const cardBox = document.getElementById('login-card-box');

  if (errBox) {
    errBox.innerHTML = msg;
    errBox.style.display = 'block';
  }
  if (cardBox) {
    cardBox.classList.remove('shake-card');
    void cardBox.offsetWidth;
    cardBox.classList.add('shake-card');
  }
}

function handleLogout() {
  posState.isAuthenticated = false;
  sessionStorage.removeItem('pos_active_session');

  const passField = document.getElementById('login-pass');
  if (passField) passField.value = '';

  const errBox = document.getElementById('login-error-msg');
  if (errBox) errBox.style.display = 'none';

  updateNavigationPermissionsUI();
  showToast('You have been logged out successfully.', 'info');
  navigateToScreen('login');
}

function fillLoginCreds(username, password) {
  const userField = document.getElementById('login-user');
  const passField = document.getElementById('login-pass');
  const errBox = document.getElementById('login-error-msg');

  if (userField) userField.value = username;
  if (passField) passField.value = password;
  if (errBox) errBox.style.display = 'none';
  showToast(`Loaded credentials for "${username}"`, 'info');
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btn) btn.textContent = '🙈';
  } else {
    input.type = 'password';
    if (btn) btn.textContent = '👁️';
  }
}

function generateRandomUserPassword() {
  const prefixes = ['Retail', 'Smart', 'Apex', 'Store', 'Super', 'Fast'];
  const symbols = ['@', '#', '$', '!'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  const num = Math.floor(100 + Math.random() * 900);
  const genPass = `${prefix}${symbol}${num}`;

  const passInput = document.getElementById('user-password');
  if (passInput) {
    passInput.value = genPass;
    passInput.type = 'text';
  }
  showToast(`Generated secure password: ${genPass}`, 'info');
}

function copyUserPassword(pwd) {
  navigator.clipboard.writeText(pwd).then(() => {
    showToast(`Password "${pwd}" copied! Share with the user.`, 'success');
  }).catch(() => {
    showToast(`User Password: ${pwd}`, 'info');
  });
}

function showForgotPasswordHelp() {
  alert('Forgot Password?\n\nUser passwords are administered securely by your System Administrator.\nPlease contact your Admin (admin account) to view or update your password in Screen 20 (Users & Roles).');
}

function switchActiveUser(username) {
  if (!posState.isAuthenticated) {
    const u = posState.users.find(x => x.username === username);
    if (u) {
      fillLoginCreds(u.username, u.password || 'password123');
    }
    return;
  }

  // Non-admin cannot switch accounts directly
  if (posState.currentUser.role !== 'ADMIN' && username !== posState.currentUser.username) {
    showToast('🔒 Only ADMIN can switch accounts directly. Please Logout and sign in with credentials.', 'warning');
    syncActiveUserDropdown();
    return;
  }

  const u = posState.users.find(x => x.username === username);
  if (!u) return;

  posState.currentUser = {
    username: u.username,
    role: u.role,
    name: u.name
  };
  sessionStorage.setItem('pos_active_session', JSON.stringify(posState.currentUser));

  document.getElementById('current-username').textContent = u.username;
  document.getElementById('current-role').textContent = u.role;
  const switchSelect = document.getElementById('active-user-switch');
  if (switchSelect) switchSelect.value = u.username;

  showToast(`Switched active session: "${u.name}" (${u.role})`, 'info');

  updateNavigationPermissionsUI();

  if (posState.activeScreen === 'users') {
    renderUsers();
  } else if (!hasPermission(posState.activeScreen)) {
    const fallback = hasPermission('dashboard') ? 'dashboard' : 'pos';
    navigateToScreen(fallback);
  }
}

function switchRole(role) {
  const matchingUser = posState.users.find(u => u.role === role);
  if (matchingUser) {
    switchActiveUser(matchingUser.username);
  } else {
    posState.currentUser.role = role;
    posState.currentUser.username = role.toLowerCase();
    document.getElementById('current-username').textContent = posState.currentUser.username;
    document.getElementById('current-role').textContent = role;
    showToast(`Switched role session to: ${role}`, 'info');
    updateNavigationPermissionsUI();
    navigateToScreen('dashboard');
  }
}

function updateNavigationPermissionsUI() {
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    const screen = item.dataset.screen;
    const permitted = hasPermission(screen);
    item.classList.toggle('locked-nav', !permitted);
    if (!permitted) {
      item.title = `🔒 Locked: Role "${posState.currentUser.role}" has no access`;
    } else {
      item.title = '';
    }
  });

  const quickSelect = document.getElementById('quick-screen-select');
  if (quickSelect) {
    Array.from(quickSelect.options).forEach(opt => {
      const permitted = hasPermission(opt.value);
      if (!permitted) {
        if (!opt.text.includes('🔒')) opt.text += ' 🔒';
      } else {
        opt.text = opt.text.replace(' 🔒', '');
      }
    });
  }
}

// --- DASHBOARD (SCREEN 2) - REAL-TIME KPIS, INTERACTIVE SVG CHART & TOP PRODUCTS ---
let currentDashboardPeriod = '7days';

function switchDashboardPeriod(period) {
  currentDashboardPeriod = period;
  ['today', '7days', '30days'].forEach(p => {
    const btn = document.getElementById(`dash-btn-${p}`);
    if (btn) {
      if (p === period) {
        btn.className = 'btn btn-primary btn-sm';
      } else {
        btn.className = 'btn btn-outline btn-sm';
      }
    }
  });
  const badge = document.getElementById('dash-chart-period-badge');
  if (badge) {
    badge.textContent = period === 'today' ? 'Today' : period === '7days' ? '7 Days' : '30 Days';
  }
  renderDashboardChart(period);
}

function parseSaleDateObj(dateStr) {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  if (typeof dateStr === 'string') {
    const sep = dateStr.includes('/') ? '/' : dateStr.includes('-') ? '-' : null;
    if (sep) {
      const parts = dateStr.split(sep);
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else if (parts[2] && parts[2].length === 4) {
        // DD-MM-YYYY or DD/MM/YYYY
        return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
      }
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
}

function isSameCalendarDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

function renderDashboard() {
  const dashScreen = document.getElementById('screen-dashboard');
  if (!dashScreen) return;

  const now = new Date();

  // 1. Filter today's sales
  const todaySalesList = posState.salesHistory.filter(s => {
    const sDate = parseSaleDateObj(s.date);
    return isSameCalendarDay(sDate, now);
  });

  const todaySalesTotal = todaySalesList.reduce((acc, s) => acc + (s.amount || 0), 0);
  const todayBillsCount = todaySalesList.length;

  // Calculate Today Profit: (selling_price - cost_price) * qty
  let todayProfitTotal = 0;
  todaySalesList.forEach(sale => {
    if (Array.isArray(sale.items)) {
      sale.items.forEach(item => {
        const prod = posState.products.find(p => p.id === item.productId || (p.name && item.name && p.name.toLowerCase() === item.name.toLowerCase()));
        const cost = prod ? (prod.cost || 0) : ((item.price || 0) * 0.7);
        const profit = ((item.price || 0) - cost) * (item.qty || 1);
        todayProfitTotal += Math.max(0, profit);
      });
    }
  });

  const todayMargin = todaySalesTotal > 0 ? ((todayProfitTotal / todaySalesTotal) * 100).toFixed(1) : '0.0';

  // 2. Total Lifetime Sales & Bills
  const totalLifetimeSales = posState.salesHistory.reduce((acc, s) => acc + (s.amount || 0), 0);
  const totalBillsCount = posState.salesHistory.length;

  // 3. Low Stock Items count
  const lowStockProducts = posState.products.filter(p => (p.stock || 0) <= (p.minStock || 0));
  const lowStockCount = lowStockProducts.length;

  // Update DOM elements
  const elTodaySales = document.getElementById('dash-today-sales');
  if (elTodaySales) elTodaySales.textContent = `₹ ${todaySalesTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const elTodaySalesSub = document.getElementById('dash-today-sales-sub');
  if (elTodaySalesSub) elTodaySalesSub.textContent = `${todayBillsCount} order${todayBillsCount === 1 ? '' : 's'} today`;

  const elTodayProfit = document.getElementById('dash-today-profit');
  if (elTodayProfit) elTodayProfit.textContent = `₹ ${todayProfitTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const elTodayProfitMargin = document.getElementById('dash-today-profit-margin');
  if (elTodayProfitMargin) elTodayProfitMargin.textContent = `Margin: ${todayMargin}%`;

  const elTotalSales = document.getElementById('dash-total-sales');
  if (elTotalSales) elTotalSales.textContent = `₹ ${totalLifetimeSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const elTotalSalesSub = document.getElementById('dash-total-sales-sub');
  if (elTotalSalesSub) elTotalSalesSub.textContent = `All-time revenue`;

  const elTotalBills = document.getElementById('dash-total-bills');
  if (elTotalBills) elTotalBills.textContent = totalBillsCount.toString();

  const elTotalBillsSub = document.getElementById('dash-total-bills-sub');
  if (elTotalBillsSub) elTotalBillsSub.textContent = `Invoices processed`;

  const elLowStock = document.getElementById('dash-low-stock');
  if (elLowStock) {
    elLowStock.textContent = lowStockCount.toString();
    elLowStock.style.color = lowStockCount > 0 ? 'var(--danger)' : 'var(--success)';
  }

  const elLowStockSub = document.getElementById('dash-low-stock-sub');
  if (elLowStockSub) {
    elLowStockSub.textContent = lowStockCount > 0 ? `${lowStockCount} items need reorder` : `All stock levels healthy`;
  }

  // 4. Render Top Selling Products
  renderTopSellingProducts();

  // 5. Render Interactive Sales Chart
  renderDashboardChart(currentDashboardPeriod);
}

function renderTopSellingProducts() {
  const tbody = document.getElementById('dash-top-products-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const salesMap = {};
  posState.salesHistory.forEach(sale => {
    if (Array.isArray(sale.items)) {
      sale.items.forEach(item => {
        const key = item.productId || item.name;
        if (!salesMap[key]) {
          const prod = posState.products.find(p => p.id === item.productId || (p.name && item.name && p.name.toLowerCase() === item.name.toLowerCase()));
          salesMap[key] = {
            name: item.name,
            icon: prod ? prod.icon : '📦',
            qty: 0,
            revenue: 0
          };
        }
        salesMap[key].qty += (item.qty || 1);
        salesMap[key].revenue += ((item.qty || 1) * (item.price || 0));
      });
    }
  });

  const sorted = Object.values(salesMap).sort((a, b) => b.qty - a.qty);

  if (sorted.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:18px; color:var(--text-muted);">No sales recorded yet</td></tr>`;
    return;
  }

  sorted.slice(0, 5).forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span style="margin-right:6px; font-size:1.15rem;">${item.icon}</span><strong>${item.name}</strong></td>
      <td style="text-align:right; font-weight:700; color:var(--secondary);">${item.qty}</td>
      <td style="text-align:right; font-weight:600; color:var(--primary);">₹ ${item.revenue.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderDashboardChart(period = '7days') {
  const svg = document.getElementById('dash-chart-svg');
  const labelsContainer = document.getElementById('dash-chart-labels');
  if (!svg || !labelsContainer) return;

  const now = new Date();
  let pointsData = [];

  if (period === 'today') {
    const slots = [
      { label: '09:00', startH: 0, endH: 10 },
      { label: '11:00', startH: 10, endH: 12 },
      { label: '13:00', startH: 12, endH: 14 },
      { label: '15:00', startH: 14, endH: 16 },
      { label: '17:00', startH: 16, endH: 18 },
      { label: '19:00', startH: 18, endH: 20 },
      { label: '21:00', startH: 20, endH: 24 }
    ];

    const todaySales = posState.salesHistory.filter(s => isSameCalendarDay(parseSaleDateObj(s.date), now));

    pointsData = slots.map((slot, index) => {
      let total = 0;
      let count = 0;
      todaySales.forEach(s => {
        const sDate = parseSaleDateObj(s.date);
        const saleHour = sDate.getHours ? sDate.getHours() : 12;
        if (saleHour >= slot.startH && saleHour < slot.endH) {
          total += s.amount;
          count++;
        } else if (todaySales.length <= slots.length && Math.floor((s.id || 0) % slots.length) === index) {
          total += s.amount;
          count++;
        }
      });
      return { label: slot.label, shortLabel: slot.label, value: total, count: count };
    });

  } else if (period === '7days') {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dayLabel = `${dayNames[d.getDay()]} ${d.getDate()}`;
      const daySales = posState.salesHistory.filter(s => isSameCalendarDay(parseSaleDateObj(s.date), d));
      const dayTotal = daySales.reduce((acc, s) => acc + (s.amount || 0), 0);
      pointsData.push({
        label: dayLabel,
        shortLabel: dayNames[d.getDay()],
        value: dayTotal,
        count: daySales.length
      });
    }

  } else if (period === '30days') {
    for (let i = 5; i >= 0; i--) {
      const endDaysAgo = i * 5;
      const startDaysAgo = (i + 1) * 5 - 1;
      const startDate = new Date(now.getTime() - startDaysAgo * 86400000);
      const endDate = new Date(now.getTime() - endDaysAgo * 86400000);

      const label = `${startDate.getDate()}/${startDate.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`;
      const shortLabel = i === 0 ? 'Now' : `-${endDaysAgo}d`;

      const bucketSales = posState.salesHistory.filter(s => {
        const sDate = parseSaleDateObj(s.date);
        const diffTime = now.getTime() - sDate.getTime();
        const diffDays = Math.floor(diffTime / 86400000);
        return diffDays >= endDaysAgo && diffDays <= startDaysAgo;
      });
      const bucketTotal = bucketSales.reduce((acc, s) => acc + (s.amount || 0), 0);
      pointsData.push({
        label: label,
        shortLabel: shortLabel,
        value: bucketTotal,
        count: bucketSales.length
      });
    }
  }

  // Update Period summary metrics
  const periodTotalRevenue = pointsData.reduce((acc, p) => acc + p.value, 0);
  const periodTotalBills = pointsData.reduce((acc, p) => acc + p.count, 0);
  const periodAvg = periodTotalBills > 0 ? (periodTotalRevenue / periodTotalBills) : 0;

  const elPeriodSales = document.getElementById('dash-period-sales');
  if (elPeriodSales) elPeriodSales.textContent = `₹ ${periodTotalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const elPeriodBills = document.getElementById('dash-period-bills');
  if (elPeriodBills) elPeriodBills.textContent = periodTotalBills.toString();

  const elPeriodAvg = document.getElementById('dash-period-avg');
  if (elPeriodAvg) elPeriodAvg.textContent = `₹ ${periodAvg.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // SVG dimensions
  const width = 500;
  const height = 180;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 30;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxVal = Math.max(...pointsData.map(p => p.value), 200) * 1.15;

  // Calculate coords
  const coords = pointsData.map((p, idx) => {
    const x = padLeft + (idx / (pointsData.length - 1)) * chartW;
    const y = padTop + chartH - ((p.value / maxVal) * chartH);
    return { x, y, ...p };
  });

  // Curved Path calculation
  let pathD = `M ${coords[0].x},${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i];
    const next = coords[i + 1];
    const mx = (curr.x + next.x) / 2;
    pathD += ` C ${mx},${curr.y} ${mx},${next.y} ${next.x},${next.y}`;
  }

  const baselineY = padTop + chartH;
  const areaD = `${pathD} L ${coords[coords.length - 1].x},${baselineY} L ${coords[0].x},${baselineY} Z`;

  // Gridlines
  let gridlinesHtml = '';
  const gridSteps = 3;
  for (let g = 0; g <= gridSteps; g++) {
    const gy = padTop + (g / gridSteps) * chartH;
    const gVal = Math.round(maxVal * (1 - g / gridSteps));
    gridlinesHtml += `
      <line x1="${padLeft - 5}" y1="${gy}" x2="${width - padRight + 5}" y2="${gy}" stroke="#e2e8f0" stroke-dasharray="3,3" stroke-width="1" />
      <text x="${padLeft - 8}" y="${gy + 3}" fill="#94a3b8" font-size="9" text-anchor="end">₹${gVal >= 1000 ? (gVal/1000).toFixed(1) + 'k' : gVal}</text>
    `;
  }

  // Points and hover circles
  let circlesHtml = '';
  coords.forEach((c) => {
    circlesHtml += `
      <g class="chart-point-group" style="cursor:pointer;">
        <circle cx="${c.x}" cy="${c.y}" r="6" fill="#ffffff" stroke="#2563eb" stroke-width="2.5" />
        <circle cx="${c.x}" cy="${c.y}" r="3" fill="#2563eb" />
        <text x="${c.x}" y="${c.y - 10}" fill="#1e293b" font-size="10" font-weight="700" text-anchor="middle">
          ${c.value > 0 ? `₹${Math.round(c.value)}` : ''}
        </text>
        <title>${c.label}: ₹${c.value.toFixed(2)} (${c.count} orders)</title>
      </g>
    `;
  });

  svg.innerHTML = `
    <defs>
      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.02"/>
      </linearGradient>
    </defs>
    ${gridlinesHtml}
    <path d="${areaD}" fill="url(#chartGrad)" />
    <path d="${pathD}" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    ${circlesHtml}
  `;

  // X labels
  labelsContainer.innerHTML = pointsData.map(p => `<span>${p.shortLabel || p.label}</span>`).join('');
}

// --- 5. PRODUCT MASTER (SCREEN 7) & ADD/EDIT PRODUCT MODAL ---
function renderProductMaster() {
  const tbody = document.getElementById('product-master-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const query = (document.getElementById('prod-search-filter')?.value || '').toLowerCase();

  const filtered = posState.products.filter(p => !query || p.name.toLowerCase().includes(query) || p.code.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));

  filtered.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-size:1.4rem;">${p.icon}</td>
      <td><strong>${p.name}</strong></td>
      <td><code>${p.code}</code></td>
      <td>${p.category}</td>
      <td>₹ ${p.price.toFixed(2)}</td>
      <td><span style="font-weight:700">${p.stock}</span> ${p.unit}</td>
      <td><span class="badge ${p.stock <= p.minStock ? 'badge-warning' : 'badge-success'}">${p.stock <= 0 ? 'Out of Stock' : p.stock <= p.minStock ? 'Low Stock' : 'Active'}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="openEditProductModal(${p.id})">✏️ Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function populateCategorySelects() {
  const selects = ['modal-prod-category', 'purchase-item-prod-select'];
  selects.forEach(selId => {
    const el = document.getElementById(selId);
    if (!el) return;
    el.innerHTML = '';
    if (selId === 'modal-prod-category') {
      posState.categories.forEach(c => {
        el.innerHTML += `<option value="${c.name}">${c.name}</option>`;
      });
    }
  });

  const screen4Cat = document.getElementById('prod-search-category-screen4');
  if (screen4Cat) {
    const currentVal = screen4Cat.value || 'ALL';
    screen4Cat.innerHTML = `<option value="ALL">All Categories</option>`;
    posState.categories.forEach(c => {
      screen4Cat.innerHTML += `<option value="${c.name}" ${currentVal === c.name ? 'selected' : ''}>${c.name}</option>`;
    });
  }
}

function openAddProductModal() {
  posState.editingProductId = null;
  document.getElementById('modal-product-title').textContent = 'Add New Product';
  document.getElementById('prod-form').reset();
  populateCategorySelects();
  // Auto-generate code
  document.getElementById('prod-code').value = `P00${posState.products.length + 1}`;
  document.getElementById('prod-barcode').value = `89010010000${posState.products.length + 1}`;
  openModal('modal-add-product');
}

function openEditProductModal(productId) {
  const p = posState.products.find(x => x.id === productId);
  if (!p) return;

  posState.editingProductId = productId;
  document.getElementById('modal-product-title').textContent = `Edit Product: ${p.name}`;
  populateCategorySelects();

  document.getElementById('prod-code').value = p.code;
  document.getElementById('prod-name').value = p.name;
  document.getElementById('modal-prod-category').value = p.category;
  document.getElementById('prod-price').value = p.price;
  document.getElementById('prod-cost').value = p.cost;
  document.getElementById('prod-stock').value = p.stock;
  document.getElementById('prod-min-stock').value = p.minStock;
  document.getElementById('prod-unit').value = p.unit;
  document.getElementById('prod-tax').value = p.tax;
  document.getElementById('prod-icon').value = p.icon;
  document.getElementById('prod-barcode').value = p.barcode || '';

  openModal('modal-add-product');
}

function saveProduct(e) {
  if (e) e.preventDefault();

  const code = document.getElementById('prod-code').value.trim();
  const name = document.getElementById('prod-name').value.trim();
  const category = document.getElementById('modal-prod-category').value;
  const price = parseFloat(document.getElementById('prod-price').value) || 0;
  const cost = parseFloat(document.getElementById('prod-cost').value) || 0;
  const stock = parseInt(document.getElementById('prod-stock').value) || 0;
  const minStock = parseInt(document.getElementById('prod-min-stock').value) || 5;
  const unit = document.getElementById('prod-unit').value;
  const tax = parseFloat(document.getElementById('prod-tax').value) || 0;
  const icon = document.getElementById('prod-icon').value.trim() || '📦';
  const barcode = document.getElementById('prod-barcode').value.trim() || code;

  if (!name || !code || price <= 0) {
    showToast('Please enter a valid product name, code, and selling price!', 'danger');
    return;
  }

  if (posState.editingProductId) {
    // Update existing product
    const p = posState.products.find(x => x.id === posState.editingProductId);
    if (p) {
      p.code = code;
      p.name = name;
      p.category = category;
      p.price = price;
      p.cost = cost;
      p.stock = stock;
      p.minStock = minStock;
      p.unit = unit;
      p.tax = tax;
      p.icon = icon;
      p.barcode = barcode;
      showToast(`Product "${name}" updated successfully!`, 'success');
    }
  } else {
    // Add new product
    const newId = posState.products.length > 0 ? Math.max(...posState.products.map(x => x.id)) + 1 : 1;
    posState.products.push({
      id: newId,
      code, name, category, price, cost, stock, minStock, unit, tax, icon, barcode
    });
    showToast(`New product "${name}" added to catalog and inventory!`, 'success');
  }

  // Save to persistent storage
  saveProductsToStorage();

  closeModal('modal-add-product');
  renderProductMaster();
  renderPosProducts();
  renderInventory();
  renderProductSearch();
  if (typeof initStockTransferScreen === 'function') {
    initStockTransferScreen();
  }
  renderDashboard();
}

function deleteProduct(productId) {
  const p = posState.products.find(x => x.id === productId);
  if (!p) return;

  if (confirm(`Are you sure you want to delete "${p.name}" (${p.code})?`)) {
    posState.products = posState.products.filter(x => x.id !== productId);
    saveProductsToStorage();
    showToast(`Product "${p.name}" removed from catalog.`, 'warning');
    renderProductMaster();
    renderPosProducts();
    renderInventory();
    renderProductSearch();
    if (typeof initStockTransferScreen === 'function') {
      initStockTransferScreen();
    }
    renderDashboard();
  }
}

// Render dynamic Product Search (Screen 4)
function renderProductSearch() {
  const tbody = document.getElementById('product-search-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const query = (document.getElementById('prod-search-filter-screen4')?.value || '').toLowerCase();
  const catSelect = document.getElementById('prod-search-category-screen4');
  const catFilter = catSelect ? catSelect.value : 'ALL';

  const filtered = posState.products.filter(p => {
    const matchCat = (catFilter === 'ALL' || p.category.toLowerCase() === catFilter.toLowerCase());
    const matchQuery = (!query || p.name.toLowerCase().includes(query) || p.code.toLowerCase().includes(query) || (p.barcode && p.barcode.includes(query)) || p.category.toLowerCase().includes(query));
    return matchCat && matchQuery;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:18px; color:var(--text-muted);">No products match your search filter.</td></tr>`;
    return;
  }

  filtered.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-size:1.3rem;">${p.icon}</td>
      <td><strong>${p.name}</strong></td>
      <td><code>${p.code}</code></td>
      <td>${p.barcode || '-'}</td>
      <td>${p.category}</td>
      <td>₹ ${p.price.toFixed(2)}</td>
      <td><span style="font-weight:700;">${p.stock}</span> ${p.unit}</td>
      <td><button class="btn btn-success btn-sm" onclick="addToCart(${p.id}); navigateToScreen('pos')">+ Add to Cart</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Export Products to real CSV download
function exportProductsCSV() {
  let csv = 'Product Code,Name,Category,Selling Price,Cost Price,Current Stock,Unit,Tax Rate,Barcode\n';
  posState.products.forEach(p => {
    csv += `"${p.code}","${p.name}","${p.category}",${p.price},${p.cost},${p.stock},"${p.unit}",${p.tax},"${p.barcode}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `products_export_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
  showToast('Product catalog exported as CSV successfully!', 'success');
}

// --- 6. CATEGORY MASTER (SCREEN 8) & MODAL ---
function renderCategories() {
  const tbody = document.getElementById('category-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  posState.categories.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${c.name}</strong></td>
      <td>${c.desc}</td>
      <td><span class="badge ${c.status === 'Active' ? 'badge-success' : 'badge-warning'}">${c.status}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="openEditCategoryModal(${c.id})">✏️ Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteCategory(${c.id})">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openAddCategoryModal() {
  posState.editingCategoryId = null;
  document.getElementById('modal-cat-title').textContent = 'Add New Category';
  document.getElementById('cat-form').reset();
  openModal('modal-add-category');
}

function openEditCategoryModal(catId) {
  const c = posState.categories.find(x => x.id === catId);
  if (!c) return;

  posState.editingCategoryId = catId;
  document.getElementById('modal-cat-title').textContent = `Edit Category: ${c.name}`;
  document.getElementById('cat-name').value = c.name;
  document.getElementById('cat-desc').value = c.desc;
  document.getElementById('cat-status').value = c.status;
  openModal('modal-add-category');
}

function saveCategory(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('cat-name').value.trim();
  const desc = document.getElementById('cat-desc').value.trim();
  const status = document.getElementById('cat-status').value;

  if (!name) {
    showToast('Please enter category name!', 'danger');
    return;
  }

  if (posState.editingCategoryId) {
    const c = posState.categories.find(x => x.id === posState.editingCategoryId);
    if (c) {
      c.name = name;
      c.desc = desc;
      c.status = status;
      showToast(`Category "${name}" updated!`, 'success');
    }
  } else {
    const newId = posState.categories.length > 0 ? Math.max(...posState.categories.map(x => x.id)) + 1 : 1;
    posState.categories.push({ id: newId, name, desc, status });
    showToast(`New category "${name}" added!`, 'success');
  }

  saveCategoriesToStorage();
  closeModal('modal-add-category');
  renderCategories();
  updateCategoryChips();
  populateCategorySelects();
  renderProductSearch();
}

function deleteCategory(catId) {
  const c = posState.categories.find(x => x.id === catId);
  if (!c) return;

  if (confirm(`Delete category "${c.name}"?`)) {
    posState.categories = posState.categories.filter(x => x.id !== catId);
    saveCategoriesToStorage();
    showToast(`Category "${c.name}" removed.`, 'warning');
    renderCategories();
    updateCategoryChips();
    populateCategorySelects();
    renderProductSearch();
  }
}

function updateCategoryChips() {
  const container = document.getElementById('category-chips-container');
  if (!container) return;
  container.innerHTML = `<button class="cat-chip active" data-cat="ALL" onclick="filterCategory('ALL')">All Products</button>`;
  posState.categories.forEach(c => {
    container.innerHTML += `<button class="cat-chip" data-cat="${c.name}" onclick="filterCategory('${c.name}')">${c.name}</button>`;
  });
}

// --- 7. CUSTOMER MASTER (SCREEN 11) & MODAL ---
function renderCustomers() {
  const tbody = document.getElementById('customer-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  posState.customers.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${c.name}</strong></td>
      <td>${c.mobile}</td>
      <td>${c.gstin}</td>
      <td>₹ ${c.balance.toFixed(2)}</td>
      <td><span class="badge ${c.status === 'Active' ? 'badge-success' : 'badge-warning'}">${c.status}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="openEditCustomerModal(${c.id})">✏️ Edit</button>
        ${c.id !== 1 ? `<button class="btn btn-danger btn-sm" onclick="deleteCustomer(${c.id})">🗑️</button>` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  });
  updatePosCustomerDropdown();
}

function openAddCustomerModal() {
  posState.editingCustomerId = null;
  document.getElementById('modal-cust-title').textContent = 'Add New Customer';
  document.getElementById('cust-form').reset();
  openModal('modal-add-customer');
}

function openEditCustomerModal(custId) {
  const c = posState.customers.find(x => x.id === custId);
  if (!c) return;

  posState.editingCustomerId = custId;
  document.getElementById('modal-cust-title').textContent = `Edit Customer: ${c.name}`;
  document.getElementById('cust-name').value = c.name;
  document.getElementById('cust-mobile').value = c.mobile;
  document.getElementById('cust-email').value = c.email || '';
  document.getElementById('cust-gstin').value = c.gstin !== 'Unregistered' && c.gstin !== '-' ? c.gstin : '';
  document.getElementById('cust-credit').value = c.creditLimit || 0;
  openModal('modal-add-customer');
}

function saveCustomer(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('cust-name').value.trim();
  const mobile = document.getElementById('cust-mobile').value.trim();
  const email = document.getElementById('cust-email').value.trim();
  const gstin = document.getElementById('cust-gstin').value.trim() || '-';
  const creditLimit = parseFloat(document.getElementById('cust-credit').value) || 0;

  if (!name || !mobile) {
    showToast('Please enter customer name and mobile number!', 'danger');
    return;
  }

  if (posState.editingCustomerId) {
    const c = posState.customers.find(x => x.id === posState.editingCustomerId);
    if (c) {
      c.name = name;
      c.mobile = mobile;
      c.email = email;
      c.gstin = gstin;
      c.creditLimit = creditLimit;
      showToast(`Customer "${name}" updated!`, 'success');
    }
  } else {
    const newId = posState.customers.length > 0 ? Math.max(...posState.customers.map(x => x.id)) + 1 : 1;
    posState.customers.push({
      id: newId, name, mobile, email, gstin, balance: 0.00, creditLimit, status: 'Active'
    });
    showToast(`Customer "${name}" created successfully!`, 'success');
  }

  saveCustomersToStorage();
  closeModal('modal-add-customer');
  renderCustomers();
}

function deleteCustomer(custId) {
  if (custId === 1) {
    showToast('Default Walk-in Customer cannot be deleted!', 'warning');
    return;
  }
  const c = posState.customers.find(x => x.id === custId);
  if (!c) return;

  if (confirm(`Are you sure you want to delete customer "${c.name}"?`)) {
    posState.customers = posState.customers.filter(x => x.id !== custId);
    saveCustomersToStorage();
    showToast(`Customer "${c.name}" deleted.`, 'warning');
    renderCustomers();
  }
}


// --- POS CUSTOMER QUICKBAR CONTROLLERS ---
function onPosCustomerSelectChange() {
  const select = document.getElementById('pos-customer-select');
  if (!select) return;
  const custId = parseInt(select.value);
  const cust = posState.customers.find(c => c.id === custId) || posState.customers[0];

  const nameInput = document.getElementById('pos-cust-name-input');
  const mobileInput = document.getElementById('pos-cust-mobile-input');
  const badge = document.getElementById('pos-cust-status-badge');

  if (nameInput) nameInput.value = cust.name;
  if (mobileInput) mobileInput.value = cust.mobile;
  if (badge) {
    badge.textContent = cust.name === 'Walk-in Customer' ? 'Walk-in' : 'Registered';
    badge.className = cust.name === 'Walk-in Customer' ? 'badge badge-info' : 'badge badge-success';
  }
  posState.posCustomerName = cust.name;
  posState.posCustomerMobile = cust.mobile;
}

function onPosCustomerInputChange() {
  const nameInput = document.getElementById('pos-cust-name-input');
  const mobileInput = document.getElementById('pos-cust-mobile-input');
  const badge = document.getElementById('pos-cust-status-badge');
  const name = nameInput ? nameInput.value.trim() : '';
  const mobile = mobileInput ? mobileInput.value.trim() : '';

  posState.posCustomerName = name || 'Walk-in Customer';
  posState.posCustomerMobile = mobile || '9999999999';

  const select = document.getElementById('pos-customer-select');
  const match = posState.customers.find(c => (mobile && c.mobile === mobile) || (name && c.name.toLowerCase() === name.toLowerCase()));

  if (match && select) {
    select.value = match.id;
    if (badge) {
      badge.textContent = match.name === 'Walk-in Customer' ? 'Walk-in' : 'Registered';
      badge.className = match.name === 'Walk-in Customer' ? 'badge badge-info' : 'badge badge-success';
    }
  } else {
    if (badge) {
      if (name === 'Walk-in Customer' && (!mobile || mobile === '9999999999')) {
        badge.textContent = 'Walk-in';
        badge.className = 'badge badge-info';
      } else {
        badge.textContent = 'New Customer';
        badge.className = 'badge badge-warning';
      }
    }
  }
}

function initPosCustomerBar() {
  const nameInput = document.getElementById('pos-cust-name-input');
  const mobileInput = document.getElementById('pos-cust-mobile-input');
  if (nameInput && !nameInput.value) nameInput.value = posState.posCustomerName || 'Walk-in Customer';
  if (mobileInput && !mobileInput.value) mobileInput.value = posState.posCustomerMobile || '9999999999';
}

function updatePosCustomerDropdown() {
  const select = document.getElementById('pos-customer-select');
  if (!select) return;
  const currentVal = select.value;
  select.innerHTML = '';
  posState.customers.forEach(c => {
    select.innerHTML += `<option value="${c.id}">${c.name} (${c.mobile})</option>`;
  });
  if (currentVal) select.value = currentVal;
}

// --- 8. SUPPLIER MASTER (SCREEN 12) & MODAL ---
function renderSuppliers() {
  const tbody = document.getElementById('supplier-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  posState.suppliers.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${s.name}</strong></td>
      <td>${s.contact || '-'}</td>
      <td>${s.mobile}</td>
      <td>${s.gstin}</td>
      <td>₹ ${s.balance.toFixed(2)}</td>
      <td><span class="badge ${s.status === 'Active' ? 'badge-success' : 'badge-warning'}">${s.status}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="openEditSupplierModal(${s.id})">✏️ Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteSupplier(${s.id})">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  populatePurchaseDropdowns();
}

function openAddSupplierModal() {
  posState.editingSupplierId = null;
  document.getElementById('modal-supp-title').textContent = 'Add New Supplier';
  document.getElementById('supp-form').reset();
  openModal('modal-add-supplier');
}

function openEditSupplierModal(suppId) {
  const s = posState.suppliers.find(x => x.id === suppId);
  if (!s) return;

  posState.editingSupplierId = suppId;
  document.getElementById('modal-supp-title').textContent = `Edit Supplier: ${s.name}`;
  document.getElementById('supp-name').value = s.name;
  document.getElementById('supp-contact').value = s.contact || '';
  document.getElementById('supp-mobile').value = s.mobile;
  document.getElementById('supp-email').value = s.email || '';
  document.getElementById('supp-gstin').value = s.gstin !== '-' ? s.gstin : '';
  openModal('modal-add-supplier');
}

function saveSupplier(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('supp-name').value.trim();
  const contact = document.getElementById('supp-contact').value.trim();
  const mobile = document.getElementById('supp-mobile').value.trim();
  const email = document.getElementById('supp-email').value.trim();
  const gstin = document.getElementById('supp-gstin').value.trim() || '-';

  if (!name || !mobile) {
    showToast('Please enter supplier name and mobile number!', 'danger');
    return;
  }

  if (posState.editingSupplierId) {
    const s = posState.suppliers.find(x => x.id === posState.editingSupplierId);
    if (s) {
      s.name = name;
      s.contact = contact;
      s.mobile = mobile;
      s.email = email;
      s.gstin = gstin;
      showToast(`Supplier "${name}" updated!`, 'success');
    }
  } else {
    const newId = posState.suppliers.length > 0 ? Math.max(...posState.suppliers.map(x => x.id)) + 1 : 1;
    posState.suppliers.push({
      id: newId, name, contact, mobile, email, gstin, balance: 0.00, status: 'Active'
    });
    showToast(`Supplier "${name}" registered successfully!`, 'success');
  }

  saveSuppliersToStorage();
  closeModal('modal-add-supplier');
  renderSuppliers();
}

function deleteSupplier(suppId) {
  const s = posState.suppliers.find(x => x.id === suppId);
  if (!s) return;

  if (confirm(`Are you sure you want to delete supplier "${s.name}"?`)) {
    posState.suppliers = posState.suppliers.filter(x => x.id !== suppId);
    saveSuppliersToStorage();
    showToast(`Supplier "${s.name}" removed.`, 'warning');
    renderSuppliers();
    populatePurchaseDropdowns();
  }
}

// --- 9. PURCHASE ENTRY (SCREEN 10) & DYNAMIC ROWS ---
function populatePurchaseDropdowns() {
  const suppSelect = document.getElementById('purchase-supplier-select');
  if (suppSelect) {
    suppSelect.innerHTML = '';
    posState.suppliers.forEach(s => {
      suppSelect.innerHTML += `<option value="${s.id}">${s.name} (${s.mobile})</option>`;
    });
  }
}

function addPurchaseRow(productId = null, qty = 10, rate = null) {
  const tbody = document.getElementById('purchase-items-table-body');
  if (!tbody) return;

  const rowId = 'purch-row-' + Date.now() + Math.random().toString(36).substr(2, 4);
  const pDefault = productId ? posState.products.find(x => x.id === productId) : posState.products[0];
  const pRate = rate !== null ? rate : (pDefault ? pDefault.cost : 50);

  let optionsHtml = '';
  posState.products.forEach(p => {
    const selected = (pDefault && p.id === pDefault.id) ? 'selected' : '';
    optionsHtml += `<option value="${p.id}" data-cost="${p.cost}" ${selected}>${p.name} (${p.code})</option>`;
  });

  const tr = document.createElement('tr');
  tr.id = rowId;
  tr.innerHTML = `
    <td>
      <select class="form-input purchase-prod-select" onchange="onPurchaseProductChange('${rowId}')">
        ${optionsHtml}
      </select>
    </td>
    <td><input type="number" class="form-input purchase-qty-input" value="${qty}" min="1" oninput="recalcPurchaseTotals()" style="width:80px;" /></td>
    <td><input type="number" class="form-input purchase-rate-input" value="${pRate}" step="0.5" oninput="recalcPurchaseTotals()" style="width:100px;" /></td>
    <td style="font-weight:700; text-align:right" class="purchase-line-total">₹ ${(qty * pRate).toFixed(2)}</td>
    <td style="text-align:center"><button class="btn btn-danger btn-sm" onclick="document.getElementById('${rowId}').remove(); recalcPurchaseTotals()">✕</button></td>
  `;
  tbody.appendChild(tr);
  recalcPurchaseTotals();
}

function onPurchaseProductChange(rowId) {
  const row = document.getElementById(rowId);
  if (!row) return;
  const select = row.querySelector('.purchase-prod-select');
  const rateInput = row.querySelector('.purchase-rate-input');
  const p = posState.products.find(x => x.id === parseInt(select.value));
  if (p && rateInput) {
    rateInput.value = p.cost;
  }
  recalcPurchaseTotals();
}

function recalcPurchaseTotals() {
  const tbody = document.getElementById('purchase-items-table-body');
  if (!tbody) return;

  let subtotal = 0;
  tbody.querySelectorAll('tr').forEach(tr => {
    const qty = parseFloat(tr.querySelector('.purchase-qty-input')?.value) || 0;
    const rate = parseFloat(tr.querySelector('.purchase-rate-input')?.value) || 0;
    const lineTotal = qty * rate;
    subtotal += lineTotal;
    const lineTotalCell = tr.querySelector('.purchase-line-total');
    if (lineTotalCell) lineTotalCell.textContent = `₹ ${lineTotal.toFixed(2)}`;
  });

  const gst = Math.round(subtotal * 0.18 * 100) / 100;
  const total = subtotal + gst;

  const subDisplay = document.getElementById('purchase-subtotal');
  const gstDisplay = document.getElementById('purchase-gst');
  const totalDisplay = document.getElementById('purchase-total');

  if (subDisplay) subDisplay.textContent = `₹ ${subtotal.toFixed(2)}`;
  if (gstDisplay) gstDisplay.textContent = `₹ ${gst.toFixed(2)}`;
  if (totalDisplay) totalDisplay.textContent = `₹ ${total.toFixed(2)}`;
}

function savePurchase() {
  const tbody = document.getElementById('purchase-items-table-body');
  if (!tbody || tbody.children.length === 0) {
    showToast('Please add at least one product item to the purchase bill!', 'danger');
    return;
  }

  let itemsAdded = 0;
  tbody.querySelectorAll('tr').forEach(tr => {
    const prodId = parseInt(tr.querySelector('.purchase-prod-select')?.value);
    const qty = parseInt(tr.querySelector('.purchase-qty-input')?.value) || 0;
    const p = posState.products.find(x => x.id === prodId);
    if (p && qty > 0) {
      p.stock += qty;
      itemsAdded += qty;
    }
  });

  const poNumber = `PUR-000${posState.nextPurchaseSeq++}`;
  const supplierSelect = document.getElementById('purchase-supplier-select');
  const supplierName = supplierSelect ? supplierSelect.options[supplierSelect.selectedIndex]?.text.split('(')[0].trim() : 'ABC Distributors';
  const totalAmount = parseFloat(document.getElementById('purchase-grand-total')?.textContent.replace(/[^0-9.]/g, '')) || (itemsAdded * 50);
  const today = new Date().toLocaleDateString('en-GB');

  posState.purchases.unshift({
    id: posState.nextPurchaseSeq,
    poNumber: poNumber,
    date: today,
    supplier: supplierName,
    branch: posState.selectedBranch || 'Main Branch',
    itemsCount: tbody.querySelectorAll('tr').length,
    totalQty: itemsAdded,
    totalAmount: totalAmount,
    status: 'Received'
  });
  savePurchasesToStorage();
  saveProductsToStorage();

  showToast(`Purchase bill ${poNumber} recorded! ${itemsAdded} units intake into stock ledger.`, 'success');
  renderInventory();
  renderProductMaster();
  renderPosProducts();
  renderProductSearch();
  if (typeof initStockTransferScreen === 'function') {
    initStockTransferScreen();
  }
  navigateToScreen('inventory');
}

// --- 10. BRANCH MANAGEMENT (SCREEN 24) & MODAL ---
function renderBranches() {
  const tbody = document.getElementById('branches-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  posState.branches.forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${b.name}</strong> (<code>${b.code}</code>)</td>
      <td>${b.address || '-'}</td>
      <td>${b.phone || '-'}</td>
      <td><span class="badge badge-success">${b.status}</span></td>
      <td style="text-align:center;">
        <button class="btn btn-outline btn-sm" onclick="openEditBranchModal(${b.id})">✏️ Edit</button>
        ${b.name !== 'Main Branch' ? `<button class="btn btn-danger btn-sm" onclick="deleteBranch(${b.id})">🗑️</button>` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  });
  populateBranchDropdowns();
}

function populateBranchDropdowns() {
  const userBranchSelect = document.getElementById('user-branch-select');
  if (userBranchSelect) {
    const currentVal = userBranchSelect.value;
    userBranchSelect.innerHTML = '<option value="All Branches">All Branches (Global Access)</option>';
    posState.branches.forEach(b => {
      userBranchSelect.innerHTML += `<option value="${b.name}" ${currentVal === b.name ? 'selected' : ''}>${b.name}</option>`;
    });
  }

  const fromSelect = document.getElementById('transfer-from');
  const toSelect = document.getElementById('transfer-to');
  if (fromSelect && toSelect) {
    const currentFrom = fromSelect.value;
    const currentTo = toSelect.value;
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';
    posState.branches.forEach((b, idx) => {
      const fromSel = currentFrom ? (currentFrom === b.name) : (idx === 0);
      const toSel = currentTo ? (currentTo === b.name) : (idx === 1);
      fromSelect.innerHTML += `<option value="${b.name}" ${fromSel ? 'selected' : ''}>${b.name}</option>`;
      toSelect.innerHTML += `<option value="${b.name}" ${toSel ? 'selected' : ''}>${b.name}</option>`;
    });
  }
}

function openAddBranchModal() {
  posState.editingBranchId = null;
  document.getElementById('branch-form').reset();
  const editIdInput = document.getElementById('branch-edit-id');
  if (editIdInput) editIdInput.value = '';
  const titleEl = document.getElementById('modal-branch-title');
  if (titleEl) titleEl.textContent = 'Add New Branch';
  const nextNum = posState.branches.length > 0 ? Math.max(...posState.branches.map(x => x.id)) + 1 : 1;
  document.getElementById('branch-code').value = `B00${nextNum}`;
  openModal('modal-add-branch');
}

function openEditBranchModal(branchId) {
  const b = posState.branches.find(x => x.id === branchId);
  if (!b) return;

  posState.editingBranchId = branchId;
  const editIdInput = document.getElementById('branch-edit-id');
  if (editIdInput) editIdInput.value = b.id;
  const titleEl = document.getElementById('modal-branch-title');
  if (titleEl) titleEl.textContent = `Edit Branch: ${b.name}`;
  document.getElementById('branch-code').value = b.code;
  document.getElementById('branch-name').value = b.name;
  document.getElementById('branch-address').value = b.address || '';
  document.getElementById('branch-phone').value = b.phone || '';
  openModal('modal-add-branch');
}

function saveBranch(e) {
  if (e) e.preventDefault();
  const editIdInput = document.getElementById('branch-edit-id');
  const editId = editIdInput ? editIdInput.value : '';
  const code = document.getElementById('branch-code').value.trim();
  const name = document.getElementById('branch-name').value.trim();
  const address = document.getElementById('branch-address').value.trim();
  const phone = document.getElementById('branch-phone').value.trim();

  if (!code || !name) {
    showToast('Branch code and name are required!', 'danger');
    return;
  }

  if (editId) {
    const b = posState.branches.find(x => x.id === parseInt(editId));
    if (b) {
      b.code = code;
      b.name = name;
      b.address = address;
      b.phone = phone;
      showToast(`Branch "${name}" updated successfully!`, 'success');
    }
  } else {
    const nextId = posState.branches.length > 0 ? Math.max(...posState.branches.map(x => x.id)) + 1 : 1;
    posState.branches.push({
      id: nextId,
      code, name, address, phone, status: 'Active'
    });
    showToast(`Branch "${name}" added to company network!`, 'success');
  }

  saveBranchesToStorage();
  closeModal('modal-add-branch');
  renderBranches();
  if (typeof initStockTransferScreen === 'function') {
    initStockTransferScreen();
  }
}

function deleteBranch(branchId) {
  const b = posState.branches.find(x => x.id === branchId);
  if (!b) return;

  if (b.name === 'Main Branch') {
    showToast('Master Main Branch cannot be deleted!', 'warning');
    return;
  }

  if (confirm(`Are you sure you want to delete branch "${b.name}" (${b.code})?`)) {
    posState.branches = posState.branches.filter(x => x.id !== branchId);
    saveBranchesToStorage();
    showToast(`Branch "${b.name}" removed from records.`, 'warning');
    renderBranches();
    if (typeof initStockTransferScreen === 'function') {
      initStockTransferScreen();
    }
  }
}

// --- 11. USER MANAGEMENT (SCREEN 20) & 14-MODULE PERMISSION MATRIX ---

function renderUsers() {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const isAdmin = posState.currentUser.role === 'ADMIN';

  // 1. Non-admin access banner
  const banner = document.getElementById('users-access-banner');
  if (banner) {
    banner.style.display = isAdmin ? 'none' : 'block';
    const bannerUser = document.getElementById('banner-curr-user');
    const bannerRole = document.getElementById('banner-curr-role');
    if (bannerUser) bannerUser.textContent = posState.currentUser.username;
    if (bannerRole) bannerRole.textContent = posState.currentUser.role;
  }

  // 2. Control buttons authorization
  const addBtn = document.getElementById('btn-add-user-top');
  if (addBtn) addBtn.style.display = isAdmin ? 'inline-flex' : 'none';
  const savePermsBtn = document.getElementById('btn-save-perms');
  if (savePermsBtn) savePermsBtn.disabled = !isAdmin;
  const quickBtns = document.getElementById('perm-quick-btns');
  if (quickBtns) quickBtns.style.display = isAdmin ? 'flex' : 'none';

  // 3. Render Users Table
  posState.users.forEach(u => {
    const tr = document.createElement('tr');
    
    // Role selector HTML: interactive dropdown for Admin, locked badge for non-admin
    let roleHtml = '';
    if (isAdmin) {
      roleHtml = `
        <select class="user-role-select-inline" onchange="changeUserRoleInline(${u.id}, this.value)">
          <option value="ADMIN" ${u.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
          <option value="MANAGER" ${u.role === 'MANAGER' ? 'selected' : ''}>MANAGER</option>
          <option value="CASHIER" ${u.role === 'CASHIER' ? 'selected' : ''}>CASHIER</option>
        </select>
      `;
    } else {
      const roleBadgeClass = u.role === 'ADMIN' ? 'role-badge-admin' : u.role === 'MANAGER' ? 'role-badge-manager' : 'role-badge-cashier';
      roleHtml = `<span class="${roleBadgeClass}">${u.role}</span>`;
    }

    // Password Column: Admin can see and copy the password to provide to the user
    let passHtml = '';
    if (isAdmin) {
      passHtml = `
        <span class="user-password-pill" title="Click to copy password" onclick="copyUserPassword('${u.password || 'password123'}')">
          🔑 <code>${u.password || 'password123'}</code>
          <span style="font-size:0.75rem; color:var(--text-muted);" title="Copy">📋</span>
        </span>
      `;
    } else {
      passHtml = `<span style="color:#94a3b8; font-family:monospace; letter-spacing:2px;">••••••••</span>`;
    }

    // Actions HTML
    let actionsHtml = '';
    if (isAdmin) {
      actionsHtml = `
        <button class="btn btn-outline btn-sm" onclick="openEditUserModal(${u.id})">✏️ Edit</button>
        ${u.username !== 'admin' ? `<button class="btn btn-danger btn-sm" onclick="deleteUser(${u.id})">🗑️</button>` : ''}
      `;
    } else {
      actionsHtml = `<span style="color:var(--text-muted); font-size:0.75rem; font-weight:600;">🔒 Admin Only</span>`;
    }

    tr.innerHTML = `
      <td><strong>${u.name}</strong></td>
      <td><code>${u.username}</code></td>
      <td>${roleHtml}</td>
      <td>${passHtml}</td>
      <td>${u.branch || 'Main Branch'}</td>
      <td><span class="badge ${u.status === 'Active' ? 'badge-success' : 'badge-warning'}">${u.status}</span></td>
      <td style="text-align:center;">${actionsHtml}</td>
    `;
    tbody.appendChild(tr);
  });

  // Sync active user dropdown in header
  syncActiveUserDropdown();

  // Render 14-Module Permission Matrix
  renderPermissionMatrixUI();
}

function syncActiveUserDropdown() {
  const select = document.getElementById('active-user-switch');
  if (!select) return;

  const currentVal = posState.currentUser.username;
  select.innerHTML = '';
  posState.users.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.username;
    opt.textContent = `${u.username} (${u.role})`;
    if (u.username === currentVal) opt.selected = true;
    select.appendChild(opt);
  });
}

function changeUserRoleInline(userId, newRole) {
  if (posState.currentUser.role !== 'ADMIN') {
    showToast('🔒 Access Denied: Only ADMIN can assign user roles!', 'danger');
    renderUsers();
    return;
  }

  const u = posState.users.find(x => x.id === userId);
  if (!u) return;

  if (u.username === 'admin' && newRole !== 'ADMIN') {
    showToast('Cannot demote master system admin account!', 'warning');
    renderUsers();
    return;
  }

  const oldRole = u.role;
  u.role = newRole;

  if (posState.currentUser.username === u.username) {
    posState.currentUser.role = newRole;
    document.getElementById('current-role').textContent = newRole;
  }

  localStorage.setItem('pos_users_list', JSON.stringify(posState.users));
  showToast(`Role for "${u.name}" changed from ${oldRole} to ${newRole} successfully!`, 'success');

  renderUsers();
  updateNavigationPermissionsUI();
}

function openAddUserModal() {
  if (posState.currentUser.role !== 'ADMIN') {
    showToast('🔒 Permission Denied: Only ADMIN can create users!', 'danger');
    return;
  }

  document.getElementById('user-form').reset();
  document.getElementById('user-edit-id').value = '';
  document.getElementById('user-username').disabled = false;
  document.getElementById('modal-user-title').textContent = 'Add New User & Provide Password';
  document.getElementById('btn-user-submit').textContent = 'Create User & Provide Password';
  generateRandomUserPassword();
  openModal('modal-add-user');
}

function openEditUserModal(userId) {
  if (posState.currentUser.role !== 'ADMIN') {
    showToast('🔒 Permission Denied: Only ADMIN can edit users and roles!', 'danger');
    return;
  }

  const u = posState.users.find(x => x.id === userId);
  if (!u) return;

  document.getElementById('user-edit-id').value = u.id;
  document.getElementById('user-fullname').value = u.name;
  document.getElementById('user-username').value = u.username;
  document.getElementById('user-username').disabled = (u.username === 'admin');
  document.getElementById('user-role-select').value = u.role;
  document.getElementById('user-branch-select').value = u.branch || 'Main Branch';
  const passInput = document.getElementById('user-password');
  if (passInput) passInput.value = u.password || 'password123';
  document.getElementById('modal-user-title').textContent = `Edit User & Password: ${u.username}`;
  document.getElementById('btn-user-submit').textContent = 'Update User';
  openModal('modal-add-user');
}

function saveUser(e) {
  if (e) e.preventDefault();
  if (posState.currentUser.role !== 'ADMIN') {
    showToast('🔒 Permission Denied: Only ADMIN can save user changes!', 'danger');
    return;
  }

  const editId = document.getElementById('user-edit-id').value;
  const name = document.getElementById('user-fullname').value.trim();
  const username = document.getElementById('user-username').value.trim();
  const password = document.getElementById('user-password').value.trim();
  const role = document.getElementById('user-role-select').value;
  const branch = document.getElementById('user-branch-select').value;

  if (!name || !username) {
    showToast('Please enter full name and username!', 'danger');
    return;
  }

  if (!password) {
    showToast('Please enter a password for this account!', 'danger');
    return;
  }

  if (editId) {
    // Edit existing user
    const u = posState.users.find(x => x.id === parseInt(editId));
    if (u) {
      u.name = name;
      if (u.username !== 'admin') u.username = username;
      u.password = password;
      u.role = role;
      u.branch = branch;

      if (posState.currentUser.username === u.username) {
        posState.currentUser.role = role;
        document.getElementById('current-role').textContent = role;
      }

      showToast(`User "${u.username}" updated! Password set to: "${password}"`, 'success');
    }
  } else {
    // Check if username already exists
    if (posState.users.some(x => x.username.toLowerCase() === username.toLowerCase())) {
      showToast(`Username "${username}" is already taken!`, 'warning');
      return;
    }

    const newId = posState.users.length > 0 ? Math.max(...posState.users.map(x => x.id)) + 1 : 1;
    posState.users.push({
      id: newId,
      name,
      username,
      password,
      role,
      branch,
      status: 'Active'
    });
    showToast(`New user "${username}" created! Password: "${password}". User can now sign in.`, 'success');
  }

  localStorage.setItem('pos_users_list', JSON.stringify(posState.users));
  closeModal('modal-add-user');
  renderUsers();
  updateNavigationPermissionsUI();
}

function deleteUser(userId) {
  if (posState.currentUser.role !== 'ADMIN') {
    showToast('🔒 Permission Denied: Only ADMIN can delete users!', 'danger');
    return;
  }

  const u = posState.users.find(x => x.id === userId);
  if (!u) return;

  if (u.username === 'admin' || u.id === 1) {
    showToast('System Administrator master account cannot be deleted!', 'warning');
    return;
  }

  if (confirm(`Are you sure you want to delete user "${u.name}" (${u.username})?`)) {
    posState.users = posState.users.filter(x => x.id !== userId);
    localStorage.setItem('pos_users_list', JSON.stringify(posState.users));
    showToast(`User "${u.username}" deleted.`, 'info');
    renderUsers();
    updateNavigationPermissionsUI();
  }
}

// --- 14-MODULE PERMISSION MATRIX ENGINE ---
function renderPermissionMatrixUI() {
  const container = document.getElementById('permission-checkboxes-grid');
  if (!container) return;

  const targetRole = posState.selectedPermRole || 'ADMIN';
  const currentPerms = posState.rolePermissions[targetRole] || [];
  const isAdmin = posState.currentUser.role === 'ADMIN';

  // Sync role select and label
  const roleSelect = document.getElementById('perm-role-select');
  if (roleSelect) roleSelect.value = targetRole;
  const roleLabel = document.getElementById('perm-role-label');
  if (roleLabel) {
    roleLabel.textContent = targetRole;
    roleLabel.className = targetRole === 'ADMIN' ? 'role-badge-admin' : targetRole === 'MANAGER' ? 'role-badge-manager' : 'role-badge-cashier';
  }

  container.innerHTML = '';

  POS_MODULES.forEach(mod => {
    const isChecked = currentPerms.includes(mod.id);
    const card = document.createElement('label');
    card.className = `perm-checkbox-card ${isChecked ? 'checked' : ''}`;
    card.innerHTML = `
      <input type="checkbox" data-mod="${mod.id}" ${isChecked ? 'checked' : ''} ${isAdmin ? '' : 'disabled'} onchange="onPermCheckboxToggle(this)" />
      <div>
        <div style="font-weight:700; font-size:0.85rem;">${mod.label}</div>
        <div style="font-size:0.7rem; color:var(--text-muted);">${mod.desc}</div>
      </div>
    `;
    container.appendChild(card);
  });
}

function onPermRoleChange(role) {
  posState.selectedPermRole = role;
  renderPermissionMatrixUI();
}

function onPermCheckboxToggle(chk) {
  const parentCard = chk.closest('.perm-checkbox-card');
  if (parentCard) {
    parentCard.classList.toggle('checked', chk.checked);
  }
}

function toggleAllPerms(checkAll) {
  if (posState.currentUser.role !== 'ADMIN') {
    showToast('🔒 Access Denied: Only ADMIN can configure permissions!', 'danger');
    return;
  }

  const targetRole = posState.selectedPermRole || 'ADMIN';
  if (targetRole === 'ADMIN' && !checkAll) {
    showToast('Master ADMIN requires full module access!', 'warning');
    return;
  }

  document.querySelectorAll('#permission-checkboxes-grid input[type="checkbox"]').forEach(chk => {
    chk.checked = checkAll;
    const parentCard = chk.closest('.perm-checkbox-card');
    if (parentCard) parentCard.classList.toggle('checked', checkAll);
  });
}

function resetRoleDefaults() {
  if (posState.currentUser.role !== 'ADMIN') {
    showToast('🔒 Access Denied: Only ADMIN can reset permissions!', 'danger');
    return;
  }

  const targetRole = posState.selectedPermRole || 'ADMIN';
  const defaults = DEFAULT_ROLE_PERMISSIONS[targetRole] || [];
  posState.rolePermissions[targetRole] = [...defaults];
  localStorage.setItem('pos_role_permissions', JSON.stringify(posState.rolePermissions));
  renderPermissionMatrixUI();
  updateNavigationPermissionsUI();
  showToast(`Reset permissions for role ${targetRole} to factory defaults!`, 'info');
}

function savePermissions() {
  if (posState.currentUser.role !== 'ADMIN') {
    showToast('🔒 Access Denied: Only ADMIN can save and change module permissions!', 'danger');
    return;
  }

  const targetRole = posState.selectedPermRole || 'ADMIN';
  const checkedModules = [];

  document.querySelectorAll('#permission-checkboxes-grid input[type="checkbox"]').forEach(chk => {
    if (chk.checked) {
      checkedModules.push(chk.dataset.mod);
    }
  });

  // Ensure Admin retains access to users & roles
  if (targetRole === 'ADMIN' && !checkedModules.includes('users')) {
    checkedModules.push('users');
  }

  posState.rolePermissions[targetRole] = checkedModules;
  localStorage.setItem('pos_role_permissions', JSON.stringify(posState.rolePermissions));

  showToast(`✅ Permissions for role "${targetRole}" successfully updated! (${checkedModules.length} modules granted)`, 'success');
  updateNavigationPermissionsUI();
}

// --- 12. COMPANY SETTINGS (SCREEN 23) ---
function loadSettings() {
  document.getElementById('set-store-name').value = posState.settings.storeName;
  document.getElementById('set-legal-name').value = posState.settings.legalName;
  document.getElementById('set-gstin').value = posState.settings.gstin;
  document.getElementById('set-address').value = posState.settings.address;
  document.getElementById('set-phone').value = posState.settings.phone;
  document.getElementById('set-prefix').value = posState.settings.invoicePrefix;
  document.getElementById('set-currency').value = posState.settings.currency;
  document.getElementById('set-negative-stock').checked = posState.settings.allowNegativeStock;
}

function saveSettings(e) {
  if (e) e.preventDefault();
  posState.settings.storeName = document.getElementById('set-store-name').value.trim();
  posState.settings.legalName = document.getElementById('set-legal-name').value.trim();
  posState.settings.gstin = document.getElementById('set-gstin').value.trim();
  posState.settings.address = document.getElementById('set-address').value.trim();
  posState.settings.phone = document.getElementById('set-phone').value.trim();
  posState.settings.invoicePrefix = document.getElementById('set-prefix').value.trim();
  posState.settings.currency = document.getElementById('set-currency').value.trim();
  posState.settings.allowNegativeStock = document.getElementById('set-negative-stock').checked;

  saveSettingsToStorage();
  document.querySelectorAll('.app-store-name').forEach(el => el.textContent = posState.settings.storeName);
  showToast('Company settings updated successfully!', 'success');
}

// --- 13. POS BILLING & CART FUNCTIONS (SCREEN 3, 4, 5, 6) ---
let activeCategoryFilter = 'ALL';

function filterCategory(catName) {
  activeCategoryFilter = catName;
  document.querySelectorAll('.cat-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.cat === catName);
  });
  renderPosProducts();
}

function renderPosProducts() {
  const container = document.getElementById('pos-product-grid');
  if (!container) return;

  const query = (document.getElementById('pos-search-input')?.value || '').toLowerCase();
  container.innerHTML = '';

  const filtered = posState.products.filter(p => {
    const matchCat = (activeCategoryFilter === 'ALL' || p.category.toLowerCase() === activeCategoryFilter.toLowerCase());
    const matchQuery = (!query || p.name.toLowerCase().includes(query) || p.code.toLowerCase().includes(query) || (p.barcode && p.barcode.includes(query)));
    return matchCat && matchQuery;
  });

  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => addToCart(p.id);
    card.innerHTML = `
      <div class="product-thumb">${p.icon}</div>
      <div class="product-title" title="${p.name}">${p.name}</div>
      <div class="product-price">₹ ${p.price.toFixed(2)}</div>
      <div class="product-stock-tag">Stock: ${p.stock}</div>
    `;
    container.appendChild(card);
  });
}

function addToCart(productId) {
  const prod = posState.products.find(p => p.id === productId);
  if (!prod) return;

  if (prod.stock <= 0 && !posState.settings.allowNegativeStock) {
    showToast(`Insufficient Stock: "${prod.name}" is currently out of stock!`, 'danger');
    return;
  }

  const existing = posState.cart.find(c => c.productId === productId);
  if (existing) {
    if (existing.qty + 1 > prod.stock && !posState.settings.allowNegativeStock) {
      showToast(`Cannot add more than available stock (${prod.stock})`, 'warning');
      return;
    }
    existing.qty += 1;
  } else {
    posState.cart.push({
      productId: prod.id,
      name: prod.name,
      qty: 1,
      price: prod.price,
      taxRate: prod.tax
    });
  }
  renderCart();
  showToast(`Added ${prod.name} to cart`, 'success');
}

function updateCartQty(productId, delta) {
  const item = posState.cart.find(c => c.productId === productId);
  const prod = posState.products.find(p => p.id === productId);
  if (!item) return;

  if (delta > 0 && item.qty + delta > prod.stock && !posState.settings.allowNegativeStock) {
    showToast(`Cannot exceed available stock of ${prod.stock}`, 'warning');
    return;
  }

  item.qty += delta;
  if (item.qty <= 0) {
    posState.cart = posState.cart.filter(c => c.productId !== productId);
  }
  renderCart();
}

function clearCart() {
  if (posState.cart.length === 0) return;
  if (confirm('Are you sure you want to clear the active cart?')) {
    posState.cart = [];
    renderCart();
    showToast('Cart cleared.', 'info');
  }
}

function renderCart() {
  const container = document.getElementById('cart-items-list');
  if (!container) return;

  container.innerHTML = '';
  let subtotal = 0;
  let totalTax = 0;

  if (posState.cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart-state">
        <div style="font-size: 2.8rem; margin-bottom: 8px; opacity: 0.65;">🛒</div>
        <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-color);">Cart is empty</div>
        <div style="font-size: 0.8rem; margin-top: 4px; color: var(--text-muted);">Click any product card or scan barcode to add items</div>
      </div>
    `;
    const badge = document.getElementById('cart-count-badge');
    if (badge) badge.textContent = '0';
    const subDisp = document.getElementById('cart-subtotal');
    if (subDisp) subDisp.textContent = '₹ 0.00';
    const taxDisp = document.getElementById('cart-tax');
    if (taxDisp) taxDisp.textContent = '₹ 0.00';
    const totDisp = document.getElementById('cart-grand-total');
    if (totDisp) totDisp.textContent = '₹ 0.00';
    const payTotalDisplay = document.getElementById('modal-payable-total');
    if (payTotalDisplay) payTotalDisplay.textContent = '₹ 0.00';
    return;
  }

  posState.cart.forEach(item => {
    const lineTotal = item.qty * item.price;
    const lineTax = (lineTotal * item.taxRate) / 100;
    subtotal += lineTotal;
    totalTax += lineTax;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-calc">${item.qty} × ₹${item.price.toFixed(2)} = ₹${lineTotal.toFixed(2)}</div>
      </div>
      <div class="cart-item-actions">
        <button class="qty-btn" onclick="updateCartQty(${item.productId}, -1)">-</button>
        <span style="font-weight:700; font-size:0.85rem;">${item.qty}</span>
        <button class="qty-btn" onclick="updateCartQty(${item.productId}, 1)">+</button>
      </div>
    `;
    container.appendChild(div);
  });

  const grandTotal = Math.round(subtotal + totalTax);
  const cartCount = posState.cart.reduce((sum, item) => sum + item.qty, 0);

  const badge = document.getElementById('cart-count-badge');
  if (badge) badge.textContent = cartCount;
  const subDisp = document.getElementById('cart-subtotal');
  if (subDisp) subDisp.textContent = `₹ ${subtotal.toFixed(2)}`;
  const taxDisp = document.getElementById('cart-tax');
  if (taxDisp) taxDisp.textContent = `₹ ${totalTax.toFixed(2)}`;
  const totDisp = document.getElementById('cart-grand-total');
  if (totDisp) totDisp.textContent = `₹ ${grandTotal.toFixed(2)}`;

  const payTotalDisplay = document.getElementById('modal-payable-total');
  if (payTotalDisplay) payTotalDisplay.textContent = `₹ ${grandTotal.toFixed(2)}`;
  const payInput = document.getElementById('pay-amount-received');
  if (payInput && (!payInput.value || parseFloat(payInput.value) < grandTotal)) {
    payInput.value = grandTotal;
  }
  calculateChange();
}

// --- 14. PAYMENT MODAL (SCREEN 5) - COMPLETE MULTI-MODE SETTLEMENT WITH DYNAMIC UPI QR ---
let selectedPaymentMode = 'CASH';

function openPaymentModal() {
  if (posState.cart.length === 0) {
    showToast('Cart is empty. Please select products first.', 'warning');
    return;
  }

  const subtotal = posState.cart.reduce((sum, i) => sum + (i.qty * i.price), 0);
  const totalTax = posState.cart.reduce((sum, i) => sum + (i.qty * i.price * i.taxRate / 100), 0);
  const grandTotal = Math.round(subtotal + totalTax);
  const invoiceNum = `${posState.settings.invoicePrefix}-0000${posState.nextInvoiceSeq}`;

  const billNoEl = document.getElementById('modal-bill-no');
  if (billNoEl) billNoEl.textContent = invoiceNum;
  const payTotalDisplay = document.getElementById('modal-payable-total');
  if (payTotalDisplay) payTotalDisplay.textContent = `₹ ${grandTotal.toFixed(2)}`;

  openModal('payment-modal');
  selectPaymentMode(selectedPaymentMode || 'CASH');
}

function closePaymentModal() {
  closeModal('payment-modal');
}

function selectPaymentMode(mode) {
  selectedPaymentMode = mode;

  // 1. Highlight mode buttons
  document.querySelectorAll('.pay-mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  // 2. Hide all mode sections, show chosen section
  document.querySelectorAll('.pay-mode-section').forEach(sec => {
    sec.classList.remove('active');
  });
  const activeSec = document.getElementById(`pay-section-${mode.toLowerCase()}`);
  if (activeSec) {
    activeSec.classList.add('active');
  }

  const subtotal = posState.cart.reduce((sum, i) => sum + (i.qty * i.price), 0);
  const totalTax = posState.cart.reduce((sum, i) => sum + (i.qty * i.price * i.taxRate / 100), 0);
  const grandTotal = Math.round(subtotal + totalTax);

  // 3. Mode-specific initialization
  if (mode === 'UPI') {
    renderUpiQrCode();
  } else if (mode === 'CASH') {
    const payInput = document.getElementById('pay-amount-received');
    if (payInput && (!payInput.value || parseFloat(payInput.value) < grandTotal)) {
      payInput.value = grandTotal;
    }
    calculateChange();
  } else if (mode === 'CREDIT') {
    renderCreditModeDetails(grandTotal);
  } else if (mode === 'SPLIT') {
    initSplitMode(grandTotal);
  } else if (mode === 'CARD') {
    initCardMode();
  }
}

// Cash Helpers
function calculateChange() {
  const subtotal = posState.cart.reduce((sum, i) => sum + (i.qty * i.price), 0);
  const totalTax = posState.cart.reduce((sum, i) => sum + (i.qty * i.price * i.taxRate / 100), 0);
  const grandTotal = Math.round(subtotal + totalTax);

  const received = parseFloat(document.getElementById('pay-amount-received')?.value || grandTotal);
  const change = Math.max(0, received - grandTotal);

  const changeDisplay = document.getElementById('modal-change-display');
  if (changeDisplay) changeDisplay.textContent = `₹ ${change.toFixed(2)}`;
}

function setCashExact() {
  const subtotal = posState.cart.reduce((sum, i) => sum + (i.qty * i.price), 0);
  const totalTax = posState.cart.reduce((sum, i) => sum + (i.qty * i.price * i.taxRate / 100), 0);
  const grandTotal = Math.round(subtotal + totalTax);
  const payInput = document.getElementById('pay-amount-received');
  if (payInput) {
    payInput.value = grandTotal;
    calculateChange();
  }
}

function addCashPill(amount) {
  const payInput = document.getElementById('pay-amount-received');
  if (payInput) {
    const current = parseFloat(payInput.value) || 0;
    payInput.value = current + amount;
    calculateChange();
  }
}

// UPI / QR Code Rendering Engine
function renderUpiQrCode() {
  const subtotal = posState.cart.reduce((sum, i) => sum + (i.qty * i.price), 0);
  const totalTax = posState.cart.reduce((sum, i) => sum + (i.qty * i.price * i.taxRate / 100), 0);
  const grandTotal = Math.round(subtotal + totalTax);
  const invoiceNum = `${posState.settings.invoicePrefix}-0000${posState.nextInvoiceSeq}`;

  // Update Amount Tag
  const upiPayableTag = document.getElementById('upi-payable-tag');
  if (upiPayableTag) upiPayableTag.textContent = `₹ ${grandTotal.toFixed(2)}`;

  // Standard NPCI UPI URI Specification:
  // upi://pay?pa=abcretail@icici&pn=ABC%20Retail%20Store&am=168.00&cu=INR&tn=INV-0000125
  const pa = 'abcretail@icici';
  const pn = encodeURIComponent(posState.settings.storeName || 'ABC Retail Store');
  const am = grandTotal.toFixed(2);
  const tn = encodeURIComponent(invoiceNum);
  const upiString = `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;

  const qrBox = document.getElementById('upi-qrcode-box');
  if (!qrBox) return;

  qrBox.innerHTML = '';

  try {
    if (typeof QRCode !== 'undefined') {
      new QRCode(qrBox, {
        text: upiString,
        width: 164,
        height: 164,
        colorDark: '#0f172a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    } else {
      renderSvgQrFallback(qrBox, upiString, 164);
    }
  } catch (err) {
    console.warn('QRCode generation fallback:', err);
    renderSvgQrFallback(qrBox, upiString, 164);
  }

  // Reset verification UI
  const statusPill = document.getElementById('upi-status-indicator');
  const statusLabel = document.getElementById('upi-status-label');
  if (statusPill) statusPill.className = 'upi-status-pill waiting';
  if (statusLabel) statusLabel.textContent = 'Waiting for customer scan & payment...';
  const utrInput = document.getElementById('upi-utr-input');
  if (utrInput) utrInput.value = '';
}

// Ultra-reliable inline SVG QR Fallback in case external script loading is blocked
function renderSvgQrFallback(container, text, size) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  const modules = 25;
  const cellSize = (size / modules).toFixed(1);
  let rects = '';

  function addFinder(startX, startY) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          rects += `<rect x="${(startX + c) * cellSize}" y="${(startY + r) * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0f172a" />`;
        }
      }
    }
  }
  addFinder(0, 0);
  addFinder(modules - 7, 0);
  addFinder(0, modules - 7);

  for (let i = 8; i < modules - 8; i += 2) {
    rects += `<rect x="${6 * cellSize}" y="${i * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0f172a" />`;
    rects += `<rect x="${i * cellSize}" y="${6 * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0f172a" />`;
  }

  let seed = Math.abs(hash);
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if ((r < 8 && c < 8) || (r < 8 && c >= modules - 8) || (r >= modules - 8 && c < 8) || r === 6 || c === 6) {
        continue;
      }
      seed = (seed * 9301 + 49297) % 233280;
      if (seed / 233280 > 0.5) {
        rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0f172a" />`;
      }
    }
  }

  container.innerHTML = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="display:block; margin:auto;">
      <rect width="${size}" height="${size}" fill="#ffffff" />
      ${rects}
    </svg>
  `;
}

function simulateUpiSuccess() {
  const testUtr = '4' + Math.floor(10000000000 + Math.random() * 90000000000).toString();
  const utrInput = document.getElementById('upi-utr-input');
  if (utrInput) utrInput.value = testUtr;

  const statusPill = document.getElementById('upi-status-indicator');
  const statusLabel = document.getElementById('upi-status-label');
  if (statusPill) statusPill.className = 'upi-status-pill success';
  if (statusLabel) {
    statusLabel.innerHTML = `<span>✅ <strong>Payment Verified!</strong> UTR: <code>${testUtr}</code></span>`;
  }

  showToast(`UPI Payment of ${document.getElementById('modal-payable-total')?.textContent} received via ICICI UPI!`, 'success');
}

function verifyUpiManual() {
  const utrInput = document.getElementById('upi-utr-input');
  const val = utrInput ? utrInput.value.trim() : '';
  if (!val || val.length < 6) {
    showToast('Please enter a valid 12-digit UPI UTR number or click "Simulate Instant UPI Success"', 'warning');
    return;
  }

  const statusPill = document.getElementById('upi-status-indicator');
  const statusLabel = document.getElementById('upi-status-label');
  if (statusPill) statusPill.className = 'upi-status-pill success';
  if (statusLabel) {
    statusLabel.innerHTML = `<span>✅ <strong>Payment Verified!</strong> UTR: <code>${val}</code></span>`;
  }
  showToast(`UPI Reference ${val} verified with bank gateway!`, 'success');
}

function copyUpiId() {
  const vpa = document.getElementById('upi-vpa-text')?.textContent || 'abcretail@icici';
  navigator.clipboard.writeText(vpa).then(() => {
    showToast(`Copied UPI ID "${vpa}" to clipboard!`, 'info');
  }).catch(() => {
    showToast(`Merchant UPI ID: ${vpa}`, 'info');
  });
}

// Card Mode Helpers
function initCardMode() {
  const last4 = document.getElementById('card-last4-input');
  const auth = document.getElementById('card-auth-input');
  if (last4 && !last4.value) last4.value = '4288';
  if (auth && !auth.value) auth.value = 'AUTH-' + Math.floor(100000 + Math.random() * 900000);
}

function simulateCardSwipe() {
  const last4 = document.getElementById('card-last4-input');
  const auth = document.getElementById('card-auth-input');
  if (last4) last4.value = Math.floor(1000 + Math.random() * 9000).toString();
  if (auth) auth.value = 'AUTH-' + Math.floor(100000 + Math.random() * 900000).toString();
  showToast('Card swiped/tapped successfully on PineLabs EDC terminal!', 'success');
}

// Credit / Khata Helpers
function renderCreditModeDetails(grandTotal) {
  const custSelect = document.getElementById('pos-customer-select');
  const custId = custSelect ? parseInt(custSelect.value) : 1;
  const cust = posState.customers.find(c => c.id === custId) || posState.customers[0];

  const nameEl = document.getElementById('credit-cust-name');
  const balEl = document.getElementById('credit-cust-balance');
  const limitEl = document.getElementById('credit-cust-limit');
  const afterEl = document.getElementById('credit-cust-after');

  if (nameEl) nameEl.textContent = `${cust.name} (${cust.mobile})`;
  if (balEl) balEl.textContent = `₹ ${cust.balance.toFixed(2)}`;
  if (limitEl) limitEl.textContent = `₹ ${(cust.creditLimit || 0).toFixed(2)}`;
  if (afterEl) afterEl.textContent = `₹ ${(cust.balance + grandTotal).toFixed(2)}`;
}

// Split Pay Helpers
function initSplitMode(grandTotal) {
  const half = Math.round(grandTotal / 2);
  const cashInput = document.getElementById('split-cash-input');
  const upiInput = document.getElementById('split-upi-input');
  const billTotalDisp = document.getElementById('split-bill-total');

  if (billTotalDisp) billTotalDisp.textContent = `₹ ${grandTotal.toFixed(2)}`;
  if (cashInput) cashInput.value = half;
  if (upiInput) upiInput.value = grandTotal - half;
  calculateSplit();
}

function calculateSplit() {
  const subtotal = posState.cart.reduce((sum, i) => sum + (i.qty * i.price), 0);
  const totalTax = posState.cart.reduce((sum, i) => sum + (i.qty * i.price * i.taxRate / 100), 0);
  const grandTotal = Math.round(subtotal + totalTax);

  const cash = parseFloat(document.getElementById('split-cash-input')?.value) || 0;
  const upi = parseFloat(document.getElementById('split-upi-input')?.value) || 0;
  const sumPaid = cash + upi;
  const remaining = Math.max(0, grandTotal - sumPaid);

  const sumPaidDisp = document.getElementById('split-sum-paid');
  const remainingDisp = document.getElementById('split-remaining');
  if (sumPaidDisp) sumPaidDisp.textContent = `₹ ${sumPaid.toFixed(2)}`;
  if (remainingDisp) {
    remainingDisp.textContent = `₹ ${remaining.toFixed(2)}`;
    remainingDisp.style.color = remaining === 0 ? 'var(--success)' : 'var(--danger)';
  }
}

// Complete Sale Controller
function completeSale() {
  if (posState.cart.length === 0) {
    showToast('Cannot complete sale: cart is empty.', 'danger');
    return;
  }

  const subtotal = posState.cart.reduce((sum, i) => sum + (i.qty * i.price), 0);
  const totalTax = posState.cart.reduce((sum, i) => sum + (i.qty * i.price * i.taxRate / 100), 0);
  const grandTotal = Math.round(subtotal + totalTax);

  const nameInput = document.getElementById('pos-cust-name-input');
  const mobileInput = document.getElementById('pos-cust-mobile-input');
  const custSelect = document.getElementById('pos-customer-select');

  let customerName = (nameInput && nameInput.value.trim()) || '';
  let customerMobile = (mobileInput && mobileInput.value.trim()) || '';

  if (!customerName) {
    const custId = custSelect ? parseInt(custSelect.value) : 1;
    const customerObj = posState.customers.find(c => c.id === custId) || posState.customers[0];
    customerName = customerObj.name;
    customerMobile = customerObj.mobile;
  }
  if (!customerMobile) customerMobile = '9999999999';

  // If new customer details were entered (not generic Walk-in), auto-save to customer directory!
  if (customerName !== 'Walk-in Customer' && customerMobile !== '9999999999') {
    const existing = posState.customers.find(c => c.mobile === customerMobile || c.name.toLowerCase() === customerName.toLowerCase());
    if (!existing) {
      const newCust = {
        id: posState.customers.length + 1,
        name: customerName,
        mobile: customerMobile,
        email: '',
        gstin: 'Unregistered',
        balance: selectedPaymentMode === 'CREDIT' ? grandTotal : 0.00,
        creditLimit: 2000,
        status: 'Active'
      };
      posState.customers.push(newCust);
      saveCustomersToStorage();
      updatePosCustomerDropdown();
    }
  }

  // Validation according to payment mode
  let paymentDetails = selectedPaymentMode;
  if (selectedPaymentMode === 'CASH') {
    const received = parseFloat(document.getElementById('pay-amount-received')?.value || grandTotal);
    if (received < grandTotal) {
      showToast(`Amount received (₹${received.toFixed(2)}) is less than total payable (₹${grandTotal.toFixed(2)})!`, 'warning');
      return;
    }
  } else if (selectedPaymentMode === 'UPI') {
    let utr = document.getElementById('upi-utr-input')?.value.trim();
    if (!utr) {
      utr = '4' + Math.floor(10000000000 + Math.random() * 90000000000).toString();
    }
    paymentDetails = `UPI (UTR: ${utr})`;
  } else if (selectedPaymentMode === 'CARD') {
    const last4 = document.getElementById('card-last4-input')?.value.trim() || '4288';
    const auth = document.getElementById('card-auth-input')?.value.trim() || 'AUTH-OK';
    paymentDetails = `Card (Ending: ${last4}, ${auth})`;
  } else if (selectedPaymentMode === 'CREDIT') {
    const cust = posState.customers.find(c => (customerMobile && c.mobile === customerMobile) || c.name.toLowerCase() === customerName.toLowerCase());
    if (cust) {
      cust.balance += grandTotal;
      saveCustomersToStorage();
    }
    paymentDetails = `Credit Ledger (Khata)`;
  } else if (selectedPaymentMode === 'SPLIT') {
    const cash = parseFloat(document.getElementById('split-cash-input')?.value) || 0;
    const upi = parseFloat(document.getElementById('split-upi-input')?.value) || 0;
    paymentDetails = `Split (Cash: ₹${cash.toFixed(2)} + Digital: ₹${upi.toFixed(2)})`;
  }

  const invoiceNum = `${posState.settings.invoicePrefix}-0000${posState.nextInvoiceSeq++}`;
  const today = new Date().toLocaleDateString('en-GB');

  const newSale = {
    id: posState.nextInvoiceSeq,
    invoiceNo: invoiceNum,
    date: today,
    customer: customerName,
    customerMobile: customerMobile,
    branch: posState.selectedBranch || 'Main Branch',
    cashier: posState.currentUser.name || posState.currentUser.username || 'Admin',
    amount: grandTotal,
    payment: paymentDetails,
    paymentMode: selectedPaymentMode,
    items: JSON.parse(JSON.stringify(posState.cart))
  };

  // Decrement Stock
  posState.cart.forEach(cartItem => {
    const p = posState.products.find(prod => prod.id === cartItem.productId);
    if (p) p.stock -= cartItem.qty;
  });
  saveProductsToStorage();
  renderInventory();
  renderProductMaster();
  renderProductSearch();
  if (typeof initStockTransferScreen === 'function') {
    initStockTransferScreen();
  }

  posState.salesHistory.unshift(newSale);
  saveSalesHistoryToStorage();
  posState.lastCompletedSale = newSale;
  renderDashboard();

  closePaymentModal();
  posState.cart = [];
  renderCart();

  showToast(`Sale completed! Invoice ${invoiceNum} generated.`, 'success');
  renderReceipt(newSale);
  navigateToScreen('receipt');
}

// --- 15. RECEIPT (SCREEN 6) ---
function renderReceipt(sale) {
  const s = sale || posState.salesHistory[0];
  if (!s) return;

  document.getElementById('rcpt-inv-no').textContent = s.invoiceNo;
  document.getElementById('rcpt-date').textContent = s.date;
  document.getElementById('rcpt-customer').textContent = s.customer;
  const mobEl = document.getElementById('rcpt-customer-mobile');
  if (mobEl) mobEl.textContent = s.customerMobile || s.mobile || '9999999999';
  const cashierEl = document.getElementById('rcpt-cashier');
  if (cashierEl) cashierEl.textContent = s.cashier || posState.currentUser.name || 'Admin';
  const branchEl = document.getElementById('rcpt-branch');
  if (branchEl) branchEl.textContent = s.branch || posState.selectedBranch || 'Main Branch';
  document.getElementById('rcpt-payment-mode').textContent = s.payment;

  const tbody = document.getElementById('rcpt-items-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  let subtotal = 0;
  (s.items || []).forEach((item, idx) => {
    const total = item.qty * item.price;
    subtotal += total;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${idx + 1}</td>
      <td>${item.name}</td>
      <td style="text-align:center">${item.qty}</td>
      <td style="text-align:right">₹${item.price.toFixed(2)}</td>
      <td style="text-align:right">₹${total.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });

  const gst = Math.round(subtotal * 0.18 * 100) / 100;
  document.getElementById('rcpt-subtotal').textContent = `₹ ${subtotal.toFixed(2)}`;
  document.getElementById('rcpt-gst').textContent = `₹ ${gst.toFixed(2)}`;
  document.getElementById('rcpt-total').textContent = `₹ ${s.amount.toFixed(2)}`;
}

function downloadReceiptPdf() {
  window.print();
  showToast('Print dialog opened. Select "Save as PDF" to save invoice locally.', 'info');
}

// --- 16. INVENTORY (SCREEN 9) ---
function renderInventory() {
  const tbody = document.getElementById('inventory-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  posState.products.forEach(p => {
    let statusClass = 'badge-success';
    let statusLabel = 'OK';
    if (p.stock <= 0) {
      statusClass = 'badge-danger';
      statusLabel = 'OUT_OF_STOCK';
    } else if (p.stock <= p.minStock) {
      statusClass = 'badge-warning';
      statusLabel = 'LOW_STOCK';
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${p.name}</strong> (${p.code})</td>
      <td>${p.category}</td>
      <td><span style="font-weight:700; font-size:1rem;">${p.stock}</span> ${p.unit}</td>
      <td>${p.minStock} ${p.unit}</td>
      <td><span class="badge ${statusClass}">${statusLabel}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// --- 17. SALES HISTORY (SCREEN 17) ---
function renderSalesHistory() {
  const tbody = document.getElementById('sales-history-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  posState.salesHistory.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.date}</td>
      <td><strong>${s.invoiceNo}</strong></td>
      <td>${s.customer}</td>
      <td><strong>₹ ${s.amount.toFixed(2)}</strong></td>
      <td><span class="badge badge-info">${s.payment}</span></td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="renderReceipt(posState.salesHistory.find(x=>x.id===${s.id})); navigateToScreen('receipt')">👁️ Receipt</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// --- 18. LEDGER (SCREEN 16) ---
function renderLedger() {
  const tbody = document.getElementById('ledger-table-body');
  if (!tbody) return;
  tbody.innerHTML = `
    <tr><td>08-09-2025</td><td>Opening Balance</td><td>₹ 0.00</td><td>₹ 0.00</td><td>₹ 0.00</td></tr>
    <tr><td>08-09-2025</td><td>Sale INV-0000124</td><td>₹ 310.00</td><td>₹ 0.00</td><td>₹ 310.00</td></tr>
    <tr><td>08-09-2025</td><td>Payment (UPI Settlement)</td><td>₹ 0.00</td><td>₹ 310.00</td><td>₹ 0.00</td></tr>
  `;
}

// =============================================================================
// --- 19. MASTER REPORTS & ANALYTICS CENTER (SCREEN 18) ---
// 11 Complete Business Entities with Universal Date & Search Filters + Local Exports
// =============================================================================
let activeReportEntity = 'billing';
let reportDatePreset = 'all';

function switchReportEntity(entity) {
  activeReportEntity = entity;
  window.activeReportEntity = entity;

  // Update tab buttons active state
  document.querySelectorAll('.report-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.entity === entity);
  });

  populateReportBranchDropdown();
  populateReportSecondaryFilter();
  renderActiveReport();
}

function populateReportBranchDropdown() {
  const select = document.getElementById('report-branch-select');
  if (!select) return;
  const current = select.value;
  select.innerHTML = '<option value="ALL">All Branches</option>';
  posState.branches.forEach(b => {
    select.innerHTML += `<option value="${b.name}">${b.name}</option>`;
  });
  if (current) select.value = current;
}

function populateReportSecondaryFilter() {
  const select = document.getElementById('report-secondary-select');
  if (!select) return;
  select.innerHTML = '<option value="ALL">All Categories / Types</option>';

  if (activeReportEntity === 'billing') {
    select.innerHTML = `
      <option value="ALL">All Payment Modes</option>
      <option value="Cash">Cash</option>
      <option value="UPI">UPI</option>
      <option value="Card">Card</option>
      <option value="Credit">Credit / Khata</option>
      <option value="Split">Split</option>
    `;
  } else if (activeReportEntity === 'products' || activeReportEntity === 'inventory') {
    select.innerHTML = '<option value="ALL">All Categories</option>';
    posState.categories.forEach(c => {
      select.innerHTML += `<option value="${c.name}">${c.name}</option>`;
    });
  } else if (activeReportEntity === 'categories' || activeReportEntity === 'branches') {
    select.innerHTML = `
      <option value="ALL">All Status</option>
      <option value="Active">Active</option>
      <option value="Inactive">Inactive</option>
    `;
  } else if (activeReportEntity === 'purchases') {
    select.innerHTML = '<option value="ALL">All Suppliers</option>';
    posState.suppliers.forEach(s => {
      select.innerHTML += `<option value="${s.name}">${s.name}</option>`;
    });
  } else if (activeReportEntity === 'returns') {
    select.innerHTML = `
      <option value="ALL">All Return Types</option>
      <option value="Sales Return">Sales Return</option>
      <option value="Purchase Return">Purchase Return</option>
    `;
  } else if (activeReportEntity === 'transfer') {
    select.innerHTML = '<option value="ALL">All Destination Branches</option>';
    posState.branches.forEach(b => {
      select.innerHTML += `<option value="${b.name}">${b.name}</option>`;
    });
  } else if (activeReportEntity === 'customers') {
    select.innerHTML = `
      <option value="ALL">All Customers</option>
      <option value="BALANCE">With Khata Balance (> ₹0)</option>
      <option value="ZERO">Zero Balance</option>
    `;
  } else if (activeReportEntity === 'suppliers') {
    select.innerHTML = `
      <option value="ALL">All Suppliers</option>
      <option value="PAYABLE">Pending Payables (> ₹0)</option>
      <option value="ZERO">Clear Balance</option>
    `;
  } else if (activeReportEntity === 'users') {
    select.innerHTML = `
      <option value="ALL">All Roles</option>
      <option value="ADMIN">ADMIN</option>
      <option value="MANAGER">MANAGER</option>
      <option value="CASHIER">CASHIER</option>
    `;
  }
}

function setReportDatePreset(preset) {
  reportDatePreset = preset;
  document.querySelectorAll('.btn-preset').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.preset === preset);
  });

  const fromInput = document.getElementById('report-date-from');
  const toInput = document.getElementById('report-date-to');
  const now = new Date();
  const formatYmd = d => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  if (preset === 'all') {
    if (fromInput) fromInput.value = '';
    if (toInput) toInput.value = '';
  } else if (preset === 'today') {
    const ymd = formatYmd(now);
    if (fromInput) fromInput.value = ymd;
    if (toInput) toInput.value = ymd;
  } else if (preset === 'yesterday') {
    const yest = new Date(now);
    yest.setDate(now.getDate() - 1);
    const ymd = formatYmd(yest);
    if (fromInput) fromInput.value = ymd;
    if (toInput) toInput.value = ymd;
  } else if (preset === '7days') {
    const past = new Date(now);
    past.setDate(now.getDate() - 7);
    if (fromInput) fromInput.value = formatYmd(past);
    if (toInput) toInput.value = formatYmd(now);
  } else if (preset === 'month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    if (fromInput) fromInput.value = formatYmd(firstDay);
    if (toInput) toInput.value = formatYmd(now);
  }

  applyReportFilters();
}

function applyReportFilters() {
  renderActiveReport();
}

function resetReportFilters() {
  setReportDatePreset('all');
  const branchSel = document.getElementById('report-branch-select');
  if (branchSel) branchSel.value = 'ALL';
  const secSel = document.getElementById('report-secondary-select');
  if (secSel) secSel.value = 'ALL';
  const searchInput = document.getElementById('report-search-input');
  if (searchInput) searchInput.value = '';
  renderActiveReport();
  showToast('Report filters reset to All Time.', 'info');
}

function parseDateStrToTimestamp(str) {
  if (!str) return 0;
  if (typeof str === 'string') {
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts[2] && parts[2].length === 4) {
        // DD/MM/YYYY
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
      }
    }
    if (str.includes('-')) {
      const parts = str.split('-');
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])).getTime();
      } else if (parts[2] && parts[2].length === 4) {
        // DD-MM-YYYY
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
      }
    }
  }
  return new Date(str).getTime() || 0;
}

function getFilteredReportData() {
  const fromInput = document.getElementById('report-date-from')?.value;
  const toInput = document.getElementById('report-date-to')?.value;
  const branchFilter = document.getElementById('report-branch-select')?.value || 'ALL';
  const secFilter = document.getElementById('report-secondary-select')?.value || 'ALL';
  const searchQuery = (document.getElementById('report-search-input')?.value || '').trim().toLowerCase();

  const fromTime = fromInput ? parseDateStrToTimestamp(fromInput) : 0;
  const toTime = toInput ? parseDateStrToTimestamp(toInput) + (24 * 60 * 60 * 1000 - 1) : Infinity;

  let headers = [];
  let rows = [];
  let rawItems = [];
  let kpiCards = [];

  if (activeReportEntity === 'billing') {
    headers = ['Invoice No', 'Date', 'Customer', 'Mobile', 'Branch', 'Cashier', 'Payment Mode', 'Amount (₹)', 'Action'];
    rawItems = posState.salesHistory.filter(s => {
      const t = parseDateStrToTimestamp(s.date);
      if (fromTime && t < fromTime) return false;
      if (toTime !== Infinity && t > toTime) return false;
      if (branchFilter !== 'ALL' && s.branch && s.branch !== branchFilter) return false;
      if (secFilter !== 'ALL') {
        const p = (s.payment || '').toLowerCase();
        const m = (s.paymentMode || '').toLowerCase();
        if (!p.includes(secFilter.toLowerCase()) && !m.includes(secFilter.toLowerCase())) return false;
      }
      if (searchQuery) {
        const text = `${s.invoiceNo} ${s.customer} ${s.customerMobile || ''} ${s.payment} ${s.cashier || ''}`.toLowerCase();
        if (!text.includes(searchQuery)) return false;
      }
      return true;
    });

    const totalRev = rawItems.reduce((acc, s) => acc + s.amount, 0);
    const avgBill = rawItems.length > 0 ? (totalRev / rawItems.length) : 0;
    kpiCards = [
      { title: 'Total Invoices', value: rawItems.length, sub: 'Bills Generated' },
      { title: 'Total Sales Revenue', value: `₹ ${totalRev.toFixed(2)}`, sub: 'Gross Invoiced', highlight: true },
      { title: 'Average Ticket Size', value: `₹ ${avgBill.toFixed(2)}`, sub: 'Per Bill Average' },
      { title: 'Active Filter', value: secFilter === 'ALL' ? 'All Modes' : secFilter, sub: branchFilter }
    ];

    rows = rawItems.map(s => [
      `<strong>${s.invoiceNo}</strong>`,
      s.date,
      s.customer,
      s.customerMobile || s.mobile || '-',
      s.branch || 'Main Branch',
      s.cashier || 'Admin',
      `<span class="badge badge-info">${s.payment}</span>`,
      `<strong>₹ ${s.amount.toFixed(2)}</strong>`,
      `<button class="btn btn-primary btn-sm" onclick="renderReceipt(posState.salesHistory.find(x=>x.id===${s.id})); navigateToScreen('receipt')">👁️ Receipt</button>`
    ]);

  } else if (activeReportEntity === 'products') {
    headers = ['Code', 'Product Name', 'Category', 'Selling Price', 'Cost Price', 'Margin %', 'Stock Qty', 'Unit', 'Tax Rate', 'Status'];
    rawItems = posState.products.filter(p => {
      if (secFilter !== 'ALL' && p.category !== secFilter) return false;
      if (searchQuery) {
        const text = `${p.code} ${p.name} ${p.category} ${p.barcode || ''}`.toLowerCase();
        if (!text.includes(searchQuery)) return false;
      }
      return true;
    });

    const totalValuation = rawItems.reduce((acc, p) => acc + (p.stock * p.cost), 0);
    const lowStockCount = rawItems.filter(p => p.stock <= p.minStock).length;
    kpiCards = [
      { title: 'Total Products', value: rawItems.length, sub: 'Catalog Items' },
      { title: 'Total Valuation', value: `₹ ${totalValuation.toFixed(2)}`, sub: 'Based on Cost Price', highlight: true },
      { title: 'Low Stock Alert', value: lowStockCount, sub: 'Below Min Threshold' },
      { title: 'Category Scope', value: secFilter === 'ALL' ? 'All Categories' : secFilter, sub: `${rawItems.length} SKUs` }
    ];

    rows = rawItems.map(p => {
      const margin = p.price > 0 ? (((p.price - p.cost) / p.price) * 100).toFixed(1) : '0';
      const statusBadge = p.stock <= 0 ? '<span class="badge badge-danger">Out of Stock</span>' : (p.stock <= p.minStock ? '<span class="badge badge-warning">Low Stock</span>' : '<span class="badge badge-success">Available</span>');
      return [
        `<code>${p.code}</code>`,
        `<strong>${p.icon || '📦'} ${p.name}</strong>`,
        p.category,
        `₹ ${p.price.toFixed(2)}`,
        `₹ ${p.cost.toFixed(2)}`,
        `${margin}%`,
        `<strong>${p.stock}</strong>`,
        p.unit,
        `${p.tax}%`,
        statusBadge
      ];
    });

  } else if (activeReportEntity === 'categories') {
    headers = ['Category ID', 'Category Name', 'Description', 'Product Count', 'Status'];
    rawItems = posState.categories.filter(c => {
      if (secFilter !== 'ALL' && c.status !== secFilter) return false;
      if (searchQuery) {
        const text = `${c.name} ${c.desc || ''}`.toLowerCase();
        if (!text.includes(searchQuery)) return false;
      }
      return true;
    });

    kpiCards = [
      { title: 'Total Categories', value: rawItems.length, sub: 'Item Departments' },
      { title: 'Total Catalog SKUs', value: posState.products.length, sub: 'Mapped Items', highlight: true },
      { title: 'Active Categories', value: rawItems.filter(c => c.status === 'Active').length, sub: 'Operational' },
      { title: 'Top Category', value: 'Food / Dairy', sub: 'Highest Volume' }
    ];

    rows = rawItems.map(c => {
      const count = posState.products.filter(p => p.category.toLowerCase() === c.name.toLowerCase()).length;
      return [
        `CAT-00${c.id}`,
        `<strong>${c.name}</strong>`,
        c.desc || '-',
        `<span class="badge badge-info">${count} Items</span>`,
        `<span class="badge badge-success">${c.status || 'Active'}</span>`
      ];
    });

  } else if (activeReportEntity === 'inventory') {
    headers = ['Product Name', 'Code', 'Category', 'Available Stock', 'Min Stock Level', 'Unit', 'Unit Cost', 'Stock Valuation (₹)', 'Status'];
    rawItems = posState.products.filter(p => {
      if (secFilter === 'LOW_STOCK' && p.stock > p.minStock) return false;
      if (secFilter === 'OUT_OF_STOCK' && p.stock > 0) return false;
      if (secFilter === 'OK' && (p.stock <= p.minStock || p.stock <= 0)) return false;
      if (searchQuery) {
        const text = `${p.name} ${p.code} ${p.category}`.toLowerCase();
        if (!text.includes(searchQuery)) return false;
      }
      return true;
    });

    const totalValuation = rawItems.reduce((acc, p) => acc + (p.stock * p.cost), 0);
    const totalUnits = rawItems.reduce((acc, p) => acc + p.stock, 0);
    kpiCards = [
      { title: 'Total Units', value: totalUnits, sub: 'Units in Warehouse' },
      { title: 'Total Stock Valuation', value: `₹ ${totalValuation.toFixed(2)}`, sub: 'Current Inventory Value', highlight: true },
      { title: 'Out of Stock', value: posState.products.filter(p => p.stock <= 0).length, sub: 'Critical Restock' },
      { title: 'Healthy Stock Items', value: posState.products.filter(p => p.stock > p.minStock).length, sub: 'Optimal Levels' }
    ];

    rows = rawItems.map(p => {
      let statusClass = 'badge-success';
      let statusLabel = 'HEALTHY';
      if (p.stock <= 0) {
        statusClass = 'badge-danger';
        statusLabel = 'OUT_OF_STOCK';
      } else if (p.stock <= p.minStock) {
        statusClass = 'badge-warning';
        statusLabel = 'LOW_STOCK';
      }
      return [
        `<strong>${p.name}</strong>`,
        `<code>${p.code}</code>`,
        p.category,
        `<strong>${p.stock}</strong>`,
        `${p.minStock}`,
        p.unit,
        `₹ ${p.cost.toFixed(2)}`,
        `<strong>₹ ${(p.stock * p.cost).toFixed(2)}</strong>`,
        `<span class="badge ${statusClass}">${statusLabel}</span>`
      ];
    });

  } else if (activeReportEntity === 'purchases') {
    headers = ['PO Number', 'Date', 'Supplier', 'Branch', 'Items Count', 'Total Units', 'Total Amount (₹)', 'Status'];
    rawItems = posState.purchases.filter(po => {
      const t = parseDateStrToTimestamp(po.date);
      if (fromTime && t < fromTime) return false;
      if (toTime !== Infinity && t > toTime) return false;
      if (branchFilter !== 'ALL' && po.branch && po.branch !== branchFilter) return false;
      if (secFilter !== 'ALL' && po.supplier !== secFilter) return false;
      if (searchQuery) {
        const text = `${po.poNumber} ${po.supplier} ${po.branch || ''}`.toLowerCase();
        if (!text.includes(searchQuery)) return false;
      }
      return true;
    });

    const totalPurchases = rawItems.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
    const totalUnits = rawItems.reduce((acc, p) => acc + (p.totalQty || 0), 0);
    kpiCards = [
      { title: 'Total Purchase Orders', value: rawItems.length, sub: 'Inward Invoices' },
      { title: 'Total Purchase Cost', value: `₹ ${totalPurchases.toFixed(2)}`, sub: 'Payable to Vendors', highlight: true },
      { title: 'Total Units Received', value: totalUnits, sub: 'Stock Restocked' },
      { title: 'Branch Scope', value: branchFilter, sub: 'Purchase Inflow' }
    ];

    rows = rawItems.map(po => [
      `<strong>${po.poNumber}</strong>`,
      po.date,
      po.supplier,
      po.branch || 'Main Branch',
      po.itemsCount || 1,
      `<strong>${po.totalQty || 10}</strong>`,
      `<strong>₹ ${(po.totalAmount || 0).toFixed(2)}</strong>`,
      `<span class="badge badge-success">${po.status || 'Received'}</span>`
    ]);

  } else if (activeReportEntity === 'returns') {
    headers = ['Return ID', 'Date', 'Return Type', 'Reference No', 'Party / Customer', 'Branch', 'Refund Amount (₹)', 'Reason', 'Status'];
    rawItems = posState.returns.filter(ret => {
      const t = parseDateStrToTimestamp(ret.date);
      if (fromTime && t < fromTime) return false;
      if (toTime !== Infinity && t > toTime) return false;
      if (branchFilter !== 'ALL' && ret.branch && ret.branch !== branchFilter) return false;
      if (secFilter !== 'ALL' && ret.type !== secFilter) return false;
      if (searchQuery) {
        const text = `${ret.id} ${ret.refNo} ${ret.party} ${ret.reason}`.toLowerCase();
        if (!text.includes(searchQuery)) return false;
      }
      return true;
    });

    const totalRefund = rawItems.reduce((acc, r) => acc + (r.amount || 0), 0);
    kpiCards = [
      { title: 'Total Return Logs', value: rawItems.length, sub: 'Processed Claims' },
      { title: 'Total Refund Value', value: `₹ ${totalRefund.toFixed(2)}`, sub: 'Restitution Value', highlight: true },
      { title: 'Sales Returns', value: rawItems.filter(r => r.type === 'Sales Return').length, sub: 'Customer Exchanges' },
      { title: 'Purchase Returns', value: rawItems.filter(r => r.type === 'Purchase Return').length, sub: 'Vendor Debit Notes' }
    ];

    rows = rawItems.map(r => [
      `<strong>${r.id}</strong>`,
      r.date,
      `<span class="badge ${r.type === 'Sales Return' ? 'badge-info' : 'badge-warning'}">${r.type}</span>`,
      `<code>${r.refNo}</code>`,
      r.party,
      r.branch || 'Main Branch',
      `<strong>₹ ${(r.amount || 0).toFixed(2)}</strong>`,
      r.reason || 'General Return',
      `<span class="badge badge-success">${r.status || 'Completed'}</span>`
    ]);

  } else if (activeReportEntity === 'transfer') {
    headers = ['Transfer ID', 'Date', 'Origin Branch', 'Destination Branch', 'Items Manifest', 'Total Units', 'Status'];
    rawItems = posState.transferHistory.filter(tr => {
      const t = parseDateStrToTimestamp(tr.date);
      if (fromTime && t < fromTime) return false;
      if (toTime !== Infinity && t > toTime) return false;
      if (branchFilter !== 'ALL' && tr.from !== branchFilter && tr.to !== branchFilter) return false;
      if (secFilter !== 'ALL' && tr.to !== secFilter) return false;
      if (searchQuery) {
        const text = `${tr.id} ${tr.from} ${tr.to}`.toLowerCase();
        if (!text.includes(searchQuery)) return false;
      }
      return true;
    });

    const totalUnitsTransferred = rawItems.reduce((acc, t) => acc + (t.totalQty || 0), 0);
    kpiCards = [
      { title: 'Total Transfers', value: rawItems.length, sub: 'Inter-Branch Shipments' },
      { title: 'Units Relocated', value: totalUnitsTransferred, sub: 'Inventory Units Moved', highlight: true },
      { title: 'Active Branches', value: posState.branches.length, sub: 'Distribution Network' },
      { title: 'Transfer Status', value: '100% Completed', sub: 'Verified Handover' }
    ];

    rows = rawItems.map(tr => {
      const manifestStr = (tr.items || []).map(i => `${i.name} (${i.qty})`).join(', ');
      return [
        `<strong>${tr.id}</strong>`,
        tr.date,
        tr.from,
        `<strong>${tr.to}</strong>`,
        manifestStr || '-',
        `<strong>${tr.totalQty || 0}</strong>`,
        `<span class="badge badge-success">${tr.status || 'Completed'}</span>`
      ];
    });

  } else if (activeReportEntity === 'customers') {
    headers = ['Customer ID', 'Customer Name', 'Mobile Number', 'Email', 'GSTIN', 'Outstanding Khata (₹)', 'Credit Limit', 'Status'];
    rawItems = posState.customers.filter(c => {
      if (secFilter === 'BALANCE' && c.balance <= 0) return false;
      if (secFilter === 'ZERO' && c.balance > 0) return false;
      if (searchQuery) {
        const text = `${c.name} ${c.mobile} ${c.email} ${c.gstin}`.toLowerCase();
        if (!text.includes(searchQuery)) return false;
      }
      return true;
    });

    const totalBalance = rawItems.reduce((acc, c) => acc + (c.balance || 0), 0);
    kpiCards = [
      { title: 'Total Customers', value: rawItems.length, sub: 'Registered Directory' },
      { title: 'Outstanding Khata', value: `₹ ${totalBalance.toFixed(2)}`, sub: 'Customer Credit Due', highlight: true },
      { title: 'Active Accounts', value: rawItems.filter(c => c.status === 'Active').length, sub: 'Good Standing' },
      { title: 'With Due Balance', value: rawItems.filter(c => c.balance > 0).length, sub: 'Follow-up Required' }
    ];

    rows = rawItems.map(c => [
      `CUST-00${c.id}`,
      `<strong>${c.name}</strong>`,
      c.mobile,
      c.email || '-',
      c.gstin || '-',
      `<strong style="color:${c.balance > 0 ? 'var(--danger)' : 'var(--success)'}">₹ ${c.balance.toFixed(2)}</strong>`,
      `₹ ${(c.creditLimit || 0).toFixed(2)}`,
      `<span class="badge badge-success">${c.status || 'Active'}</span>`
    ]);

  } else if (activeReportEntity === 'suppliers') {
    headers = ['Supplier ID', 'Supplier / Firm Name', 'Contact Person', 'Mobile Number', 'Email', 'GSTIN', 'Pending Payables (₹)', 'Status'];
    rawItems = posState.suppliers.filter(s => {
      if (secFilter === 'PAYABLE' && s.balance <= 0) return false;
      if (secFilter === 'ZERO' && s.balance > 0) return false;
      if (searchQuery) {
        const text = `${s.name} ${s.contact} ${s.mobile} ${s.gstin}`.toLowerCase();
        if (!text.includes(searchQuery)) return false;
      }
      return true;
    });

    const totalPayables = rawItems.reduce((acc, s) => acc + (s.balance || 0), 0);
    kpiCards = [
      { title: 'Total Suppliers', value: rawItems.length, sub: 'Approved Vendors' },
      { title: 'Pending Payables', value: `₹ ${totalPayables.toFixed(2)}`, sub: 'Total Vendor Liability', highlight: true },
      { title: 'Active Vendors', value: rawItems.filter(s => s.status === 'Active').length, sub: 'Direct Suppliers' },
      { title: 'With Pending Balance', value: rawItems.filter(s => s.balance > 0).length, sub: 'Bills Payable' }
    ];

    rows = rawItems.map(s => [
      `SUPP-00${s.id}`,
      `<strong>${s.name}</strong>`,
      s.contact || '-',
      s.mobile,
      s.email || '-',
      s.gstin || '-',
      `<strong style="color:${s.balance > 0 ? 'var(--danger)' : 'var(--success)'}">₹ ${s.balance.toFixed(2)}</strong>`,
      `<span class="badge badge-success">${s.status || 'Active'}</span>`
    ]);

  } else if (activeReportEntity === 'users') {
    headers = ['User ID', 'Full Name', 'Username', 'Role', 'Assigned Branch', 'Status'];
    rawItems = posState.users.filter(u => {
      if (secFilter !== 'ALL' && u.role !== secFilter) return false;
      if (branchFilter !== 'ALL' && u.branch !== 'All Branches' && u.branch !== branchFilter) return false;
      if (searchQuery) {
        const text = `${u.name} ${u.username} ${u.role} ${u.branch}`.toLowerCase();
        if (!text.includes(searchQuery)) return false;
      }
      return true;
    });

    kpiCards = [
      { title: 'Total Users', value: rawItems.length, sub: 'System Accounts' },
      { title: 'Administrators', value: rawItems.filter(u => u.role === 'ADMIN').length, sub: 'Full Master Privileges', highlight: true },
      { title: 'Managers', value: rawItems.filter(u => u.role === 'MANAGER').length, sub: 'Store Supervisors' },
      { title: 'Cashiers', value: rawItems.filter(u => u.role === 'CASHIER').length, sub: 'Front Desk Operators' }
    ];

    rows = rawItems.map(u => [
      `USR-00${u.id}`,
      `<strong>${u.name}</strong>`,
      `<code>${u.username}</code>`,
      `<span class="badge ${u.role === 'ADMIN' ? 'badge-danger' : (u.role === 'MANAGER' ? 'badge-warning' : 'badge-info')}">${u.role}</span>`,
      u.branch || 'Main Branch',
      `<span class="badge badge-success">${u.status || 'Active'}</span>`
    ]);

  } else if (activeReportEntity === 'branches') {
    headers = ['Branch Code', 'Branch Name', 'Address', 'Contact Phone', 'Status'];
    rawItems = posState.branches.filter(b => {
      if (secFilter !== 'ALL' && b.status !== secFilter) return false;
      if (searchQuery) {
        const text = `${b.code} ${b.name} ${b.address} ${b.phone}`.toLowerCase();
        if (!text.includes(searchQuery)) return false;
      }
      return true;
    });

    kpiCards = [
      { title: 'Total Branches', value: rawItems.length, sub: 'Store Network' },
      { title: 'Main Branch Hub', value: 'Green Park', sub: 'Flagship Store', highlight: true },
      { title: 'Active Outlets', value: rawItems.filter(b => b.status === 'Active').length, sub: 'Live POS Registers' },
      { title: 'Expansion Cities', value: 'Delhi, Noida, Gurgaon', sub: 'Regional Footprint' }
    ];

    rows = rawItems.map(b => [
      `<code>${b.code}</code>`,
      `<strong>${b.name}</strong>`,
      b.address || '-',
      b.phone || '-',
      `<span class="badge badge-success">${b.status || 'Active'}</span>`
    ]);
  }

  return { headers, rows, rawItems, kpiCards };
}

function renderActiveReport() {
  const container = document.getElementById('screen-sales-reports');
  if (!container) return;

  const data = getFilteredReportData();

  // 1. Render KPI Cards
  const kpiContainer = document.getElementById('report-kpi-cards');
  if (kpiContainer) {
    kpiContainer.innerHTML = '';
    data.kpiCards.forEach(card => {
      const div = document.createElement('div');
      div.className = 'kpi-card';
      div.innerHTML = `
        <div class="kpi-header">${card.title}</div>
        <div class="kpi-value" style="${card.highlight ? 'color:var(--primary); font-weight:800;' : ''}">${card.value}</div>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${card.sub}</div>
      `;
      kpiContainer.appendChild(div);
    });
  }

  // 2. Render Table Headers
  const thead = document.getElementById('report-table-head');
  if (thead) {
    thead.innerHTML = `<tr>${data.headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
  }

  // 3. Render Table Body
  const tbody = document.getElementById('report-table-body');
  if (tbody) {
    tbody.innerHTML = '';
    if (data.rows.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${data.headers.length}" style="text-align:center; padding:36px; color:var(--text-muted);">
            <div style="font-size:2rem; margin-bottom:8px;">🔍</div>
            <div style="font-weight:600;">No matching records found</div>
            <div style="font-size:0.8rem; margin-top:4px;">Try changing the date range, branch, or search criteria</div>
          </td>
        </tr>
      `;
    } else {
      data.rows.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = r.map(cell => `<td>${cell}</td>`).join('');
        tbody.appendChild(tr);
      });
    }
  }

  // 4. Update status texts
  const countText = document.getElementById('report-record-count-text');
  if (countText) {
    countText.textContent = `Showing ${data.rows.length} ${activeReportEntity.toUpperCase()} records`;
  }
  const genText = document.getElementById('report-generated-text');
  if (genText) {
    genText.textContent = `Generated: ${new Date().toLocaleTimeString('en-GB')}`;
  }
}

// 1-Click Local File Export Engines (Direct Browser Download to User PC)
function exportReportToCsv() {
  const data = getFilteredReportData();
  if (!data.rows || data.rows.length === 0) {
    showToast('No records found to export for active filter criteria.', 'warning');
    return;
  }

  let csv = '\uFEFF'; // UTF-8 BOM for clean Excel rendering
  // Headers (clean from HTML)
  const cleanHeaders = data.headers.filter(h => h !== 'Action');
  csv += cleanHeaders.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\r\n';

  // Rows (strip HTML tags)
  data.rows.forEach(row => {
    // If last cell is Action button, skip it
    const cellsToExport = (data.headers[data.headers.length - 1] === 'Action') ? row.slice(0, -1) : row;
    const cleanCells = cellsToExport.map(cell => {
      const plain = String(cell || '').replace(/<[^>]*>/g, '').trim();
      return `"${plain.replace(/"/g, '""')}"`;
    });
    csv += cleanCells.join(',') + '\r\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const entityLabel = activeReportEntity.toUpperCase();
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `MyPOS_Report_${entityLabel}_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`✅ CSV Report downloaded to your device: ${a.download}`, 'success');
}

function printReportPdf() {
  window.print();
  showToast('Print dialog opened. Choose "Save as PDF" to save report locally.', 'info');
}

function exportReportToJson() {
  const data = getFilteredReportData();
  const exportPayload = {
    reportType: activeReportEntity,
    generatedAt: new Date().toISOString(),
    storeName: posState.settings.storeName,
    filters: {
      datePreset: reportDatePreset,
      fromDate: document.getElementById('report-date-from')?.value || 'All',
      toDate: document.getElementById('report-date-to')?.value || 'All',
      branch: document.getElementById('report-branch-select')?.value || 'ALL',
      secondary: document.getElementById('report-secondary-select')?.value || 'ALL'
    },
    totalRecords: data.rawItems.length,
    records: data.rawItems
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `MyPOS_Report_${activeReportEntity.toUpperCase()}_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`✅ JSON Data exported to your device: ${a.download}`, 'success');
}

function renderReports() {
  populateReportBranchDropdown();
  populateReportSecondaryFilter();
  renderActiveReport();
}


function renderProfitReport() {
  const tbody = document.getElementById('profit-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  posState.products.slice(0, 5).forEach(p => {
    const sales = p.price * 50;
    const cost = p.cost * 50;
    const profit = sales - cost;
    const margin = ((profit / sales) * 100).toFixed(1);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${p.name}</strong></td>
      <td>₹ ${sales.toFixed(2)}</td>
      <td>₹ ${cost.toFixed(2)}</td>
      <td style="color:var(--success); font-weight:700">₹ ${profit.toFixed(2)}</td>
      <td><span class="badge badge-success">${margin}%</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// --- 20. SALES RETURN LOGIC (SCREEN 13) ---
function lookupSaleForReturn() {
  const invInput = document.getElementById('return-inv-input').value.trim();
  const sale = posState.salesHistory.find(s => s.invoiceNo.toLowerCase() === invInput.toLowerCase());
  const container = document.getElementById('return-items-container');

  if (!sale) {
    showToast(`Invoice "${invInput}" not found in records!`, 'danger');
    return;
  }

  container.innerHTML = '';
  sale.items.forEach((item, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td><input type="number" id="ret-qty-${idx}" min="1" max="${item.qty}" value="1" style="width:60px; padding:4px;" /></td>
      <td>₹ ${item.price.toFixed(2)}</td>
      <td><span class="badge badge-warning">Eligible</span></td>
    `;
    container.appendChild(row);
  });
  document.getElementById('return-action-bar').style.display = 'block';
  showToast(`Loaded invoice ${sale.invoiceNo} for return`, 'info');
}

function processReturn() {
  const invInput = document.getElementById('return-inv-input')?.value.trim() || 'INV-0000125';
  const sale = posState.salesHistory.find(s => s.invoiceNo.toLowerCase() === invInput.toLowerCase());
  const today = new Date().toLocaleDateString('en-GB');
  const retId = 'RET-000' + (posState.returns.length + 1);

  posState.returns.unshift({
    id: retId,
    date: today,
    type: 'Sales Return',
    refNo: invInput,
    party: sale ? sale.customer : 'Walk-in Customer',
    branch: posState.selectedBranch || 'Main Branch',
    amount: sale ? Math.round(sale.amount * 0.5) : 50.00,
    reason: 'Customer return / exchange',
    status: 'Completed'
  });
  saveReturnsToStorage();

  showToast('Sales return processed! Quantity restituted to stock ledger and credit note issued.', 'success');
  navigateToScreen('inventory');
}

// --- 21. STOCK TRANSFER (SCREEN 15) CONTROLLERS ---

function initStockTransferScreen() {
  // 1. Populate Branch Selectors
  const fromSelect = document.getElementById('transfer-from');
  const toSelect = document.getElementById('transfer-to');
  if (fromSelect && toSelect) {
    const currentFrom = fromSelect.value;
    const currentTo = toSelect.value;
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';
    posState.branches.forEach((b, idx) => {
      const fromSel = currentFrom ? (currentFrom === b.name) : (idx === 0);
      const toSel = currentTo ? (currentTo === b.name) : (idx === 1);
      fromSelect.innerHTML += `<option value="${b.name}" ${fromSel ? 'selected' : ''}>${b.name}</option>`;
      toSelect.innerHTML += `<option value="${b.name}" ${toSel ? 'selected' : ''}>${b.name}</option>`;
    });
  }

  // 2. Populate product select dropdown
  const prodSelect = document.getElementById('transfer-product-select');
  if (prodSelect && posState.products.length > 0) {
    const prevVal = prodSelect.value;
    const defaultId = prevVal ? parseInt(prevVal) : posState.products[0].id;
    prodSelect.innerHTML = '';
    posState.products.forEach((p, idx) => {
      const isSelected = prevVal ? (prevVal == p.id) : (idx === 0);
      prodSelect.innerHTML += `<option value="${p.id}" ${isSelected ? 'selected' : ''}>${p.icon} ${p.name} (${p.code}) &bull; Stock: ${p.stock} ${p.unit}</option>`;
    });
    prodSelect.value = defaultId;
  }

  onTransferProductChange();
  renderTransferManifest();
  renderTransferHistory();
}

function onTransferBranchChange() {
  const fromB = document.getElementById('transfer-from')?.value;
  const toB = document.getElementById('transfer-to')?.value;
  if (fromB && toB && fromB === toB) {
    showToast('Warning: Origin and destination branch cannot be identical!', 'warning');
  }
}

function onTransferProductChange() {
  const prodSelect = document.getElementById('transfer-product-select');
  const availInput = document.getElementById('transfer-source-avail');
  const qtyInput = document.getElementById('transfer-input-qty');
  if (!prodSelect || !availInput) return;

  const prodId = parseInt(prodSelect.value);
  const p = posState.products.find(x => x.id === prodId);
  if (p) {
    availInput.value = `${p.stock} ${p.unit}`;
    if (qtyInput) {
      qtyInput.max = p.stock > 0 ? p.stock : 1;
      if (parseInt(qtyInput.value) > p.stock && p.stock > 0) {
        qtyInput.value = p.stock;
      }
    }
  } else {
    availInput.value = '0';
  }
}

function addTransferItemRow() {
  const prodSelect = document.getElementById('transfer-product-select');
  const qtyInput = document.getElementById('transfer-input-qty');
  if (!prodSelect || !qtyInput) return;

  const prodId = parseInt(prodSelect.value);
  const p = posState.products.find(x => x.id === prodId);
  if (!p) {
    showToast('Please select a valid product to transfer!', 'warning');
    return;
  }

  const qty = parseInt(qtyInput.value) || 0;
  if (qty <= 0) {
    showToast('Please enter a transfer quantity of at least 1!', 'warning');
    return;
  }

  if (qty > p.stock) {
    showToast(`Insufficient Stock: Only ${p.stock} ${p.unit} of "${p.name}" available in source branch!`, 'danger');
    return;
  }

  const existing = posState.activeTransferItems.find(x => x.id === p.id);
  if (existing) {
    if (existing.qty + qty > p.stock) {
      showToast(`Cannot add ${qty} more. Manifest total (${existing.qty + qty}) exceeds available stock (${p.stock})!`, 'warning');
      return;
    }
    existing.qty += qty;
  } else {
    posState.activeTransferItems.push({
      id: p.id,
      name: p.name,
      code: p.code,
      category: p.category,
      icon: p.icon,
      unit: p.unit,
      qty: qty,
      available: p.stock
    });
  }

  renderTransferManifest();
  showToast(`Added ${p.name} (${qty} ${p.unit}) to transfer manifest!`, 'success');
  qtyInput.value = 1;
}

function removeTransferItem(prodId) {
  posState.activeTransferItems = posState.activeTransferItems.filter(x => x.id !== prodId);
  renderTransferManifest();
  showToast('Item removed from transfer manifest.', 'info');
}

function clearTransferManifest() {
  if (posState.activeTransferItems.length === 0) return;
  posState.activeTransferItems = [];
  renderTransferManifest();
  showToast('Transfer manifest cleared.', 'info');
}

function renderTransferManifest() {
  const tbody = document.getElementById('transfer-items-table-body');
  const totalItemsEl = document.getElementById('transfer-total-items');
  const totalQtyEl = document.getElementById('transfer-total-qty');

  if (!tbody) return;
  tbody.innerHTML = '';

  if (posState.activeTransferItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:18px; color:var(--text-muted);">No items in transfer manifest. Select a product above and click "+ Add to Manifest".</td></tr>`;
    if (totalItemsEl) totalItemsEl.textContent = '0';
    if (totalQtyEl) totalQtyEl.textContent = '0';
    return;
  }

  let totalQty = 0;
  posState.activeTransferItems.forEach(item => {
    totalQty += item.qty;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.icon} <strong>${item.name}</strong></td>
      <td><code>${item.code}</code></td>
      <td>${item.category}</td>
      <td style="text-align:center; font-weight:700;">${item.qty} ${item.unit}</td>
      <td style="text-align:center;">${item.available} ${item.unit}</td>
      <td style="text-align:center;">
        <button class="btn btn-danger btn-sm" onclick="removeTransferItem(${item.id})">🗑️ Remove</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (totalItemsEl) totalItemsEl.textContent = posState.activeTransferItems.length;
  if (totalQtyEl) totalQtyEl.textContent = totalQty;
}

function renderTransferHistory() {
  const tbody = document.getElementById('transfer-history-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!posState.transferHistory || posState.transferHistory.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:16px; color:var(--text-muted);">No transfer records logged yet.</td></tr>`;
    return;
  }

  posState.transferHistory.forEach(t => {
    const itemsSummary = Array.isArray(t.items) ? t.items.map(i => `${i.name} (${i.qty})`).join(', ') : 'Stock items';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${t.id}</strong></td>
      <td>${t.date}</td>
      <td>${t.from}</td>
      <td>${t.to}</td>
      <td>${itemsSummary}</td>
      <td><strong>${t.totalQty}</strong></td>
      <td><span class="badge badge-success">${t.status}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function executeTransfer() {
  const fromB = document.getElementById('transfer-from')?.value;
  const toB = document.getElementById('transfer-to')?.value;

  if (!fromB || !toB || fromB === toB) {
    showToast('Origin and destination branch cannot be identical!', 'warning');
    return;
  }

  if (posState.activeTransferItems.length === 0) {
    showToast('Please select and add at least one product to the transfer manifest first!', 'danger');
    return;
  }

  // Verify stock availability
  for (const item of posState.activeTransferItems) {
    const prod = posState.products.find(p => p.id === item.id);
    if (!prod || prod.stock < item.qty) {
      showToast(`Cannot transfer: insufficient stock for "${item.name}"!`, 'danger');
      return;
    }
  }

  // Deduct transferred stock from source
  posState.activeTransferItems.forEach(item => {
    const prod = posState.products.find(p => p.id === item.id);
    if (prod) {
      prod.stock -= item.qty;
    }
  });
  saveProductsToStorage();

  const totalQty = posState.activeTransferItems.reduce((s, x) => s + x.qty, 0);
  const transferId = `TRF-${Math.floor(1000 + Math.random() * 9000)}`;
  const today = new Date().toLocaleDateString('en-GB');

  const transferRecord = {
    id: transferId,
    date: today,
    from: fromB,
    to: toB,
    items: JSON.parse(JSON.stringify(posState.activeTransferItems)),
    totalQty: totalQty,
    status: 'Completed'
  };

  posState.transferHistory.unshift(transferRecord);
  localStorage.setItem('pos_transfer_history', JSON.stringify(posState.transferHistory));

  posState.activeTransferItems = [];
  renderTransferManifest();
  renderTransferHistory();
  initStockTransferScreen();

  renderInventory();
  renderPosProducts();
  renderProductMaster();
  renderProductSearch();
  renderDashboard();

  showToast(`✅ Transfer ${transferId} executed! ${totalQty} units transferred from ${fromB} to ${toB}. Stock deducted!`, 'success');
}

// --- INITIALIZATION ON DOM READY ---
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  renderDashboard();
  renderPosProducts();
  renderProductSearch();
  initStockTransferScreen();
  updateCategoryChips();
  populateCategorySelects();
  populatePurchaseDropdowns();
  addPurchaseRow(1, 10, 42.00);
  addPurchaseRow(2, 20, 25.00);

  // Check automated preview query parameters
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('noanim') === '1') {
    document.body.classList.add('no-anim');
  }
  const autoUser = urlParams.get('autologin');
  if (autoUser) {
    const userObj = posState.users.find(u => u.username.toLowerCase() === autoUser.toLowerCase() && u.status === 'Active');
    if (userObj) {
      posState.isAuthenticated = true;
      posState.currentUser = {
        username: userObj.username,
        role: userObj.role,
        name: userObj.name
      };
      const curUserEl = document.getElementById('current-username');
      const curRoleEl = document.getElementById('current-role');
      if (curUserEl) curUserEl.textContent = userObj.username;
      if (curRoleEl) curRoleEl.textContent = userObj.role;

      syncActiveUserDropdown();
      updateNavigationPermissionsUI();
      const targetScreen = urlParams.get('screen') || 'dashboard';
      navigateToScreen(targetScreen);
      if (urlParams.get('drawer') === 'open') {
        toggleMobileSidebar();
      }
      setupKeybindings();
      return;
    }
  }

  // Check existing session
  const savedSession = sessionStorage.getItem('pos_active_session');
  if (savedSession) {
    try {
      const sessUser = JSON.parse(savedSession);
      const userObj = posState.users.find(u => u.username.toLowerCase() === (sessUser.username || '').toLowerCase() && u.status === 'Active');
      if (userObj) {
        posState.isAuthenticated = true;
        posState.currentUser = {
          username: userObj.username,
          role: userObj.role,
          name: userObj.name
        };
        const curUserEl = document.getElementById('current-username');
        const curRoleEl = document.getElementById('current-role');
        if (curUserEl) curUserEl.textContent = userObj.username;
        if (curRoleEl) curRoleEl.textContent = userObj.role;

        syncActiveUserDropdown();
        updateNavigationPermissionsUI();
        const startScreen = hasPermission('dashboard') ? 'dashboard' : 'pos';
        navigateToScreen(startScreen);
        setupKeybindings();
        return;
      }
    } catch (err) {
      console.error('Session restore error:', err);
    }
  }

  // Not authenticated: Enforce Login Screen
  posState.isAuthenticated = false;
  syncActiveUserDropdown();
  updateNavigationPermissionsUI();
  navigateToScreen('login');
  setupKeybindings();
});

function setupKeybindings() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F2') {
      e.preventDefault();
      if (posState.isAuthenticated) {
        navigateToScreen('pos');
        const searchBox = document.getElementById('pos-search-input');
        if (searchBox) searchBox.focus();
      } else {
        showToast('Please sign in first.', 'warning');
      }
    }
  });
}
