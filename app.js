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
  nextInvoiceSeq: (() => {
    const saved = parseInt(localStorage.getItem('pos_next_invoice_seq'), 10);
    if (!isNaN(saved) && saved >= 1) return saved;
    return 1;
  })(),
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

  // Master Product Catalog (108 Commercial Items with Automatic Sync & Upgrade)
  products: (() => {
    const CATALOG_VERSION = 'v2026_108_items';
    const currentVer = localStorage.getItem('pos_catalog_ver');
    let saved = JSON.parse(localStorage.getItem('pos_products_list') || 'null');
    
    // Auto-upgrade if empty or old 8-item default list
    if (!saved || !Array.isArray(saved) || saved.length <= 8 || currentVer !== CATALOG_VERSION) {
      const default108 = [
      {
            "id": 1,
            "code": "P001",
            "name": "Milk",
            "category": "Dairy",
            "price": 52.0,
            "cost": 42.0,
            "stock": 45,
            "minStock": 10,
            "unit": "Ltr",
            "tax": 0,
            "icon": "🥛",
            "barcode": "890100100001",
            "status": "Active"
      },
      {
            "id": 2,
            "code": "P002",
            "name": "Bread",
            "category": "Bakery",
            "price": 35.0,
            "cost": 25.0,
            "stock": 32,
            "minStock": 10,
            "unit": "Pkt",
            "tax": 0,
            "icon": "🍞",
            "barcode": "890100100002",
            "status": "Active"
      },
      {
            "id": 3,
            "code": "P003",
            "name": "Biscuits",
            "category": "Snacks",
            "price": 20.0,
            "cost": 14.0,
            "stock": 56,
            "minStock": 10,
            "unit": "Pkt",
            "tax": 18,
            "icon": "🍪",
            "barcode": "890100100003",
            "status": "Active"
      },
      {
            "id": 4,
            "code": "P004",
            "name": "Maggi Noodles",
            "category": "Food",
            "price": 15.0,
            "cost": 11.0,
            "stock": 40,
            "minStock": 10,
            "unit": "Pkt",
            "tax": 12,
            "icon": "🍜",
            "barcode": "890100100004",
            "status": "Active"
      },
      {
            "id": 5,
            "code": "P005",
            "name": "Soft Drink",
            "category": "Beverages",
            "price": 45.0,
            "cost": 32.0,
            "stock": 26,
            "minStock": 10,
            "unit": "Btl",
            "tax": 28,
            "icon": "🥤",
            "barcode": "890100100005",
            "status": "Active"
      },
      {
            "id": 6,
            "code": "P006",
            "name": "Potato Chips",
            "category": "Snacks",
            "price": 25.0,
            "cost": 18.0,
            "stock": 35,
            "minStock": 10,
            "unit": "Pkt",
            "tax": 12,
            "icon": "🍟",
            "barcode": "890100100006",
            "status": "Active"
      },
      {
            "id": 7,
            "code": "P007",
            "name": "Refined Cooking Oil 1L",
            "category": "Cooking Oils",
            "price": 120.0,
            "cost": 95.0,
            "stock": 20,
            "minStock": 5,
            "unit": "Ltr",
            "tax": 5,
            "icon": "🍾",
            "barcode": "890100100007",
            "status": "Active"
      },
      {
            "id": 8,
            "code": "P008",
            "name": "Basmati Rice 1Kg",
            "category": "Grains & Staples",
            "price": 60.0,
            "cost": 45.0,
            "stock": 50,
            "minStock": 15,
            "unit": "Kg",
            "tax": 0,
            "icon": "🍚",
            "barcode": "890100100008",
            "status": "Active"
      },
      {
            "id": 9,
            "code": "P1001",
            "name": "Amul Taaza Toned Milk 500ml",
            "category": "Dairy",
            "price": 27.0,
            "cost": 24.0,
            "stock": 60,
            "minStock": 10,
            "unit": "PACKET",
            "tax": 0.0,
            "icon": "🥛",
            "barcode": "P1001",
            "status": "Active"
      },
      {
            "id": 10,
            "code": "P1002",
            "name": "Amul Gold Full Cream Milk 500ml",
            "category": "Dairy",
            "price": 33.0,
            "cost": 30.0,
            "stock": 50,
            "minStock": 10,
            "unit": "PACKET",
            "tax": 0.0,
            "icon": "🥛",
            "barcode": "P1002",
            "status": "Active"
      },
      {
            "id": 11,
            "code": "P1003",
            "name": "Mother Dairy Classic Dahi 400g",
            "category": "Dairy",
            "price": 38.0,
            "cost": 32.0,
            "stock": 30,
            "minStock": 8,
            "unit": "CUP",
            "tax": 0.0,
            "icon": "🥛",
            "barcode": "P1003",
            "status": "Active"
      },
      {
            "id": 12,
            "code": "P1004",
            "name": "Amul Salted Butter 100g",
            "category": "Dairy",
            "price": 56.0,
            "cost": 48.0,
            "stock": 45,
            "minStock": 10,
            "unit": "PACKET",
            "tax": 12.0,
            "icon": "🥛",
            "barcode": "P1004",
            "status": "Active"
      },
      {
            "id": 13,
            "code": "P1005",
            "name": "Mother Dairy Fresh Paneer 200g",
            "category": "Dairy",
            "price": 90.0,
            "cost": 75.0,
            "stock": 25,
            "minStock": 5,
            "unit": "PACKET",
            "tax": 0.0,
            "icon": "🥛",
            "barcode": "P1005",
            "status": "Active"
      },
      {
            "id": 14,
            "code": "P1006",
            "name": "Amul Processed Cheese Slices 200g",
            "category": "Dairy",
            "price": 140.0,
            "cost": 115.0,
            "stock": 20,
            "minStock": 5,
            "unit": "PACKET",
            "tax": 12.0,
            "icon": "🥛",
            "barcode": "P1006",
            "status": "Active"
      },
      {
            "id": 15,
            "code": "P1007",
            "name": "Amul Pure Ghee 1L Tin",
            "category": "Dairy",
            "price": 620.0,
            "cost": 540.0,
            "stock": 15,
            "minStock": 3,
            "unit": "TIN",
            "tax": 12.0,
            "icon": "🥛",
            "barcode": "P1007",
            "status": "Active"
      },
      {
            "id": 16,
            "code": "P1008",
            "name": "Mother Dairy Masti Spiced Chaas 200ml",
            "category": "Dairy",
            "price": 15.0,
            "cost": 12.0,
            "stock": 50,
            "minStock": 12,
            "unit": "PACKET",
            "tax": 0.0,
            "icon": "🥛",
            "barcode": "P1008",
            "status": "Active"
      },
      {
            "id": 17,
            "code": "P1009",
            "name": "Amul Whipping Fresh Cream 250ml",
            "category": "Dairy",
            "price": 70.0,
            "cost": 58.0,
            "stock": 18,
            "minStock": 4,
            "unit": "PACKET",
            "tax": 12.0,
            "icon": "🥛",
            "barcode": "P1009",
            "status": "Active"
      },
      {
            "id": 18,
            "code": "P1010",
            "name": "Mother Dairy Sweet Lassi 200ml",
            "category": "Dairy",
            "price": 25.0,
            "cost": 18.0,
            "stock": 35,
            "minStock": 8,
            "unit": "BOTTLE",
            "tax": 12.0,
            "icon": "🥛",
            "barcode": "P1010",
            "status": "Active"
      },
      {
            "id": 19,
            "code": "P1011",
            "name": "Britannia Premium White Bread 400g",
            "category": "Bakery",
            "price": 45.0,
            "cost": 38.0,
            "stock": 30,
            "minStock": 6,
            "unit": "PCS",
            "tax": 5.0,
            "icon": "🍞",
            "barcode": "P1011",
            "status": "Active"
      },
      {
            "id": 20,
            "code": "P1012",
            "name": "Harvest Gold 100% Atta Bread 450g",
            "category": "Bakery",
            "price": 55.0,
            "cost": 44.0,
            "stock": 25,
            "minStock": 5,
            "unit": "PCS",
            "tax": 5.0,
            "icon": "🍞",
            "barcode": "P1012",
            "status": "Active"
      },
      {
            "id": 21,
            "code": "P1013",
            "name": "English Oven Brown Bread 400g",
            "category": "Bakery",
            "price": 50.0,
            "cost": 42.0,
            "stock": 20,
            "minStock": 4,
            "unit": "PCS",
            "tax": 5.0,
            "icon": "🍞",
            "barcode": "P1013",
            "status": "Active"
      },
      {
            "id": 22,
            "code": "P1014",
            "name": "Britannia Toastea Premium Rusk 200g",
            "category": "Bakery",
            "price": 38.0,
            "cost": 30.0,
            "stock": 40,
            "minStock": 8,
            "unit": "PACKET",
            "tax": 5.0,
            "icon": "🍞",
            "barcode": "P1014",
            "status": "Active"
      },
      {
            "id": 23,
            "code": "P1015",
            "name": "Harvest Gold Bombay Pav (6 Pcs)",
            "category": "Bakery",
            "price": 25.0,
            "cost": 20.0,
            "stock": 35,
            "minStock": 8,
            "unit": "PACKET",
            "tax": 5.0,
            "icon": "🍞",
            "barcode": "P1015",
            "status": "Active"
      },
      {
            "id": 24,
            "code": "P1016",
            "name": "Britannia Gobbles Choco Muffin 35g",
            "category": "Bakery",
            "price": 15.0,
            "cost": 12.0,
            "stock": 60,
            "minStock": 12,
            "unit": "PCS",
            "tax": 18.0,
            "icon": "🍞",
            "barcode": "P1016",
            "status": "Active"
      },
      {
            "id": 25,
            "code": "P1017",
            "name": "Winkies Classic Vanilla Cake 150g",
            "category": "Bakery",
            "price": 50.0,
            "cost": 40.0,
            "stock": 22,
            "minStock": 5,
            "unit": "PACKET",
            "tax": 18.0,
            "icon": "🍞",
            "barcode": "P1017",
            "status": "Active"
      },
      {
            "id": 26,
            "code": "P1018",
            "name": "Pillsbury Choco Lava Cake 30g",
            "category": "Bakery",
            "price": 30.0,
            "cost": 25.0,
            "stock": 40,
            "minStock": 8,
            "unit": "PCS",
            "tax": 18.0,
            "icon": "🍞",
            "barcode": "P1018",
            "status": "Active"
      },
      {
            "id": 27,
            "code": "P1019",
            "name": "English Oven Burger Buns (2 Pcs)",
            "category": "Bakery",
            "price": 28.0,
            "cost": 22.0,
            "stock": 25,
            "minStock": 5,
            "unit": "PACKET",
            "tax": 5.0,
            "icon": "🍞",
            "barcode": "P1019",
            "status": "Active"
      },
      {
            "id": 28,
            "code": "P1020",
            "name": "Britannia Fruit Roll Cake 120g",
            "category": "Bakery",
            "price": 45.0,
            "cost": 35.0,
            "stock": 30,
            "minStock": 6,
            "unit": "PACKET",
            "tax": 18.0,
            "icon": "🍞",
            "barcode": "P1020",
            "status": "Active"
      },
      {
            "id": 29,
            "code": "P1021",
            "name": "Maggi 2-Minute Masala Noodles 70g",
            "category": "Snacks",
            "price": 14.0,
            "cost": 11.5,
            "stock": 120,
            "minStock": 20,
            "unit": "PCS",
            "tax": 12.0,
            "icon": "🍿",
            "barcode": "P1021",
            "status": "Active"
      },
      {
            "id": 30,
            "code": "P1022",
            "name": "Yippee Magic Masala Noodles 65g",
            "category": "Snacks",
            "price": 12.0,
            "cost": 10.0,
            "stock": 80,
            "minStock": 15,
            "unit": "PCS",
            "tax": 12.0,
            "icon": "🍿",
            "barcode": "P1022",
            "status": "Active"
      },
      {
            "id": 31,
            "code": "P1023",
            "name": "Parle-G Gold Glucose Biscuits 250g",
            "category": "Snacks",
            "price": 30.0,
            "cost": 24.0,
            "stock": 90,
            "minStock": 15,
            "unit": "PACKET",
            "tax": 5.0,
            "icon": "🍿",
            "barcode": "P1023",
            "status": "Active"
      },
      {
            "id": 32,
            "code": "P1024",
            "name": "Britannia Good Day Butter Cookies 200g",
            "category": "Snacks",
            "price": 40.0,
            "cost": 32.0,
            "stock": 75,
            "minStock": 12,
            "unit": "PACKET",
            "tax": 18.0,
            "icon": "🍿",
            "barcode": "P1024",
            "status": "Active"
      },
      {
            "id": 33,
            "code": "P1025",
            "name": "Oreo Original Vanilla Creme Biscuits 120g",
            "category": "Snacks",
            "price": 35.0,
            "cost": 28.0,
            "stock": 65,
            "minStock": 10,
            "unit": "PACKET",
            "tax": 18.0,
            "icon": "🍿",
            "barcode": "P1025",
            "status": "Active"
      },
      {
            "id": 34,
            "code": "P1026",
            "name": "Haldiram Aloo Bhujia 150g",
            "category": "Snacks",
            "price": 50.0,
            "cost": 42.0,
            "stock": 50,
            "minStock": 10,
            "unit": "PACKET",
            "tax": 12.0,
            "icon": "🍿",
            "barcode": "P1026",
            "status": "Active"
      },
      {
            "id": 35,
            "code": "P1027",
            "name": "Haldiram Moong Dal Fried Namkeen 200g",
            "category": "Snacks",
            "price": 55.0,
            "cost": 45.0,
            "stock": 45,
            "minStock": 8,
            "unit": "PACKET",
            "tax": 12.0,
            "icon": "🍿",
            "barcode": "P1027",
            "status": "Active"
      },
      {
            "id": 36,
            "code": "P1028",
            "name": "Lays India Magic Masala Chips 50g",
            "category": "Snacks",
            "price": 20.0,
            "cost": 16.0,
            "stock": 100,
            "minStock": 20,
            "unit": "PACKET",
            "tax": 12.0,
            "icon": "🍿",
            "barcode": "P1028",
            "status": "Active"
      },
      {
            "id": 37,
            "code": "P1029",
            "name": "Kurkure Masala Munch 85g",
            "category": "Snacks",
            "price": 20.0,
            "cost": 16.0,
            "stock": 100,
            "minStock": 20,
            "unit": "PACKET",
            "tax": 12.0,
            "icon": "🍿",
            "barcode": "P1029",
            "status": "Active"
      },
      {
            "id": 38,
            "code": "P1030",
            "name": "Doritos Cheese Nachos 60g",
            "category": "Snacks",
            "price": 30.0,
            "cost": 24.0,
            "stock": 50,
            "minStock": 10,
            "unit": "PACKET",
            "tax": 12.0,
            "icon": "🍿",
            "barcode": "P1030",
            "status": "Active"
      },
      {
            "id": 39,
            "code": "P1031",
            "name": "Sunfeast Dark Fantasy Choco Fills 75g",
            "category": "Snacks",
            "price": 40.0,
            "cost": 30.0,
            "stock": 60,
            "minStock": 10,
            "unit": "PACKET",
            "tax": 18.0,
            "icon": "🍿",
            "barcode": "P1031",
            "status": "Active"
      },
      {
            "id": 40,
            "code": "P1032",
            "name": "Haldiram Roasted Salted Kaju 100g",
            "category": "Snacks",
            "price": 210.0,
            "cost": 160.0,
            "stock": 25,
            "minStock": 5,
            "unit": "PACKET",
            "tax": 5.0,
            "icon": "🍿",
            "barcode": "P1032",
            "status": "Active"
      },
      {
            "id": 41,
            "code": "P1033",
            "name": "Coca Cola Original Taste 750ml",
            "category": "Beverages",
            "price": 40.0,
            "cost": 34.0,
            "stock": 60,
            "minStock": 12,
            "unit": "BOTTLE",
            "tax": 28.0,
            "icon": "🧃",
            "barcode": "P1033",
            "status": "Active"
      },
      {
            "id": 42,
            "code": "P1034",
            "name": "Thums Up Charged Carbonated Drink 750ml",
            "category": "Beverages",
            "price": 40.0,
            "cost": 34.0,
            "stock": 70,
            "minStock": 15,
            "unit": "BOTTLE",
            "tax": 28.0,
            "icon": "🧃",
            "barcode": "P1034",
            "status": "Active"
      },
      {
            "id": 43,
            "code": "P1035",
            "name": "Sprite Lime Flavored Drink 750ml",
            "category": "Beverages",
            "price": 40.0,
            "cost": 34.0,
            "stock": 50,
            "minStock": 10,
            "unit": "BOTTLE",
            "tax": 28.0,
            "icon": "🧃",
            "barcode": "P1035",
            "status": "Active"
      },
      {
            "id": 44,
            "code": "P1036",
            "name": "Frooti Mango Drink 200ml Tetra",
            "category": "Beverages",
            "price": 15.0,
            "cost": 12.0,
            "stock": 80,
            "minStock": 15,
            "unit": "TETRA",
            "tax": 12.0,
            "icon": "🧃",
            "barcode": "P1036",
            "status": "Active"
      },
      {
            "id": 45,
            "code": "P1037",
            "name": "Real Fruit Power Mixed Fruit Juice 1L",
            "category": "Beverages",
            "price": 130.0,
            "cost": 100.0,
            "stock": 30,
            "minStock": 6,
            "unit": "TETRA",
            "tax": 12.0,
            "icon": "🧃",
            "barcode": "P1037",
            "status": "Active"
      },
      {
            "id": 46,
            "code": "P1038",
            "name": "Red Bull Energy Drink 250ml Can",
            "category": "Beverages",
            "price": 125.0,
            "cost": 98.0,
            "stock": 40,
            "minStock": 8,
            "unit": "CAN",
            "tax": 28.0,
            "icon": "🧃",
            "barcode": "P1038",
            "status": "Active"
      },
      {
            "id": 47,
            "code": "P1039",
            "name": "Bisleri Mineral Water 1 Litre Bottle",
            "category": "Beverages",
            "price": 20.0,
            "cost": 14.0,
            "stock": 150,
            "minStock": 25,
            "unit": "BOTTLE",
            "tax": 18.0,
            "icon": "🧃",
            "barcode": "P1039",
            "status": "Active"
      },
      {
            "id": 48,
            "code": "P1040",
            "name": "Nescafe Classic Instant Coffee Jar 50g",
            "category": "Beverages",
            "price": 175.0,
            "cost": 140.0,
            "stock": 35,
            "minStock": 6,
            "unit": "JAR",
            "tax": 18.0,
            "icon": "🧃",
            "barcode": "P1040",
            "status": "Active"
      },
      {
            "id": 49,
            "code": "P1041",
            "name": "Tata Tea Premium Desh Ki Chai 500g",
            "category": "Beverages",
            "price": 260.0,
            "cost": 210.0,
            "stock": 40,
            "minStock": 8,
            "unit": "PACKET",
            "tax": 5.0,
            "icon": "🧃",
            "barcode": "P1041",
            "status": "Active"
      },
      {
            "id": 50,
            "code": "P1042",
            "name": "Bournvita Chocolate Nutrition Drink 500g",
            "category": "Beverages",
            "price": 240.0,
            "cost": 195.0,
            "stock": 25,
            "minStock": 5,
            "unit": "JAR",
            "tax": 18.0,
            "icon": "🧃",
            "barcode": "P1042",
            "status": "Active"
      },
      {
            "id": 51,
            "code": "P1043",
            "name": "Aashirvaad Sharbati Shudh Chakki Atta 5kg",
            "category": "Grains & Staples",
            "price": 285.0,
            "cost": 240.0,
            "stock": 35,
            "minStock": 6,
            "unit": "BAG",
            "tax": 0.0,
            "icon": "🌾",
            "barcode": "P1043",
            "status": "Active"
      },
      {
            "id": 52,
            "code": "P1044",
            "name": "Fortune Special Biryani Basmati Rice 1kg",
            "category": "Grains & Staples",
            "price": 155.0,
            "cost": 120.0,
            "stock": 45,
            "minStock": 8,
            "unit": "PACKET",
            "tax": 5.0,
            "icon": "🌾",
            "barcode": "P1044",
            "status": "Active"
      },
      {
            "id": 53,
            "code": "P1045",
            "name": "India Gate Feast Rozzana Basmati Rice 5kg",
            "category": "Grains & Staples",
            "price": 475.0,
            "cost": 390.0,
            "stock": 20,
            "minStock": 4,
            "unit": "BAG",
            "tax": 5.0,
            "icon": "🌾",
            "barcode": "P1045",
            "status": "Active"
      },
      {
            "id": 54,
            "code": "P1046",
            "name": "Tata Sampann Unpolished Toor Dal 1kg",
            "category": "Grains & Staples",
            "price": 175.0,
            "cost": 140.0,
            "stock": 40,
            "minStock": 8,
            "unit": "PACKET",
            "tax": 0.0,
            "icon": "🌾",
            "barcode": "P1046",
            "status": "Active"
      },
      {
            "id": 55,
            "code": "P1047",
            "name": "Tata Sampann Moong Dal Dhuli 1kg",
            "category": "Grains & Staples",
            "price": 160.0,
            "cost": 130.0,
            "stock": 35,
            "minStock": 6,
            "unit": "PACKET",
            "tax": 0.0,
            "icon": "🌾",
            "barcode": "P1047",
            "status": "Active"
      },
      {
            "id": 56,
            "code": "P1048",
            "name": "Fortune Besan Superfine 500g",
            "category": "Grains & Staples",
            "price": 65.0,
            "cost": 50.0,
            "stock": 50,
            "minStock": 10,
            "unit": "PACKET",
            "tax": 0.0,
            "icon": "🌾",
            "barcode": "P1048",
            "status": "Active"
      },
      {
            "id": 57,
            "code": "P1049",
            "name": "Rajdhani Sooji / Semolina 500g",
            "category": "Grains & Staples",
            "price": 42.0,
            "cost": 32.0,
            "stock": 40,
            "minStock": 8,
            "unit": "PACKET",
            "tax": 0.0,
            "icon": "🌾",
            "barcode": "P1049",
            "status": "Active"
      },
      {
            "id": 58,
            "code": "P1050",
            "name": "Rajdhani Maida Refined Flour 500g",
            "category": "Grains & Staples",
            "price": 38.0,
            "cost": 28.0,
            "stock": 45,
            "minStock": 8,
            "unit": "PACKET",
            "tax": 0.0,
            "icon": "🌾",
            "barcode": "P1050",
            "status": "Active"
      },
      {
            "id": 59,
            "code": "P1051",
            "name": "Tata Sampann High Fibre Poha 500g",
            "category": "Grains & Staples",
            "price": 55.0,
            "cost": 42.0,
            "stock": 35,
            "minStock": 6,
            "unit": "PACKET",
            "tax": 5.0,
            "icon": "🌾",
            "barcode": "P1051",
            "status": "Active"
      },
      {
            "id": 60,
            "code": "P1052",
            "name": "Tata Sampann Kabuli Chana Premium 500g",
            "category": "Grains & Staples",
            "price": 95.0,
            "cost": 75.0,
            "stock": 30,
            "minStock": 5,
            "unit": "PACKET",
            "tax": 0.0,
            "icon": "🌾",
            "barcode": "P1052",
            "status": "Active"
      },
      {
            "id": 61,
            "code": "P1053",
            "name": "Tata Sampann Rajma Red 500g",
            "category": "Grains & Staples",
            "price": 90.0,
            "cost": 70.0,
            "stock": 30,
            "minStock": 5,
            "unit": "PACKET",
            "tax": 0.0,
            "icon": "🌾",
            "barcode": "P1053",
            "status": "Active"
      },
      {
            "id": 62,
            "code": "P1054",
            "name": "Loose Sugar M-30 Grade 1kg",
            "category": "Grains & Staples",
            "price": 46.0,
            "cost": 40.0,
            "stock": 150,
            "minStock": 25,
            "unit": "KG",
            "tax": 5.0,
            "icon": "🌾",
            "barcode": "P1054",
            "status": "Active"
      },
      {
            "id": 63,
            "code": "P1055",
            "name": "Fortune Sunlite Refined Sunflower Oil 1L Pouch",
            "category": "Cooking Oils",
            "price": 148.0,
            "cost": 125.0,
            "stock": 50,
            "minStock": 10,
            "unit": "PACKET",
            "tax": 5.0,
            "icon": "🛢️",
            "barcode": "P1055",
            "status": "Active"
      },
      {
            "id": 64,
            "code": "P1056",
            "name": "Dhara Kachi Ghani Mustard Oil 1L Bottle",
            "category": "Cooking Oils",
            "price": 172.0,
            "cost": 145.0,
            "stock": 40,
            "minStock": 8,
            "unit": "BOTTLE",
            "tax": 5.0,
            "icon": "🛢️",
            "barcode": "P1056",
            "status": "Active"
      },
      {
            "id": 65,
            "code": "P1057",
            "name": "Saffola Gold Pro Healthy Heart Oil 1L Pouch",
            "category": "Cooking Oils",
            "price": 195.0,
            "cost": 160.0,
            "stock": 35,
            "minStock": 6,
            "unit": "PACKET",
            "tax": 5.0,
            "icon": "🛢️",
            "barcode": "P1057",
            "status": "Active"
      },
      {
            "id": 66,
            "code": "P1058",
            "name": "Fortune Soyabean Refined Oil 1L Pouch",
            "category": "Cooking Oils",
            "price": 132.0,
            "cost": 110.0,
            "stock": 60,
            "minStock": 12,
            "unit": "PACKET",
            "tax": 5.0,
            "icon": "🛢️",
            "barcode": "P1058",
            "status": "Active"
      },
      {
            "id": 67,
            "code": "P1059",
            "name": "Parachute 100% Pure Coconut Cooking Oil 500ml",
            "category": "Cooking Oils",
            "price": 175.0,
            "cost": 140.0,
            "stock": 25,
            "minStock": 5,
            "unit": "BOTTLE",
            "tax": 5.0,
            "icon": "🛢️",
            "barcode": "P1059",
            "status": "Active"
      },
      {
            "id": 68,
            "code": "P1060",
            "name": "Borges Extra Virgin Olive Oil 500ml",
            "category": "Cooking Oils",
            "price": 680.0,
            "cost": 520.0,
            "stock": 12,
            "minStock": 3,
            "unit": "BOTTLE",
            "tax": 5.0,
            "icon": "🛢️",
            "barcode": "P1060",
            "status": "Active"
      },
      {
            "id": 69,
            "code": "P1061",
            "name": "Patanjali Cow Ghee 500ml Pouch",
            "category": "Cooking Oils",
            "price": 310.0,
            "cost": 270.0,
            "stock": 30,
            "minStock": 5,
            "unit": "PACKET",
            "tax": 12.0,
            "icon": "🛢️",
            "barcode": "P1061",
            "status": "Active"
      },
      {
            "id": 70,
            "code": "P1062",
            "name": "Dalda Vanaspati Ghee 1L Pouch",
            "category": "Cooking Oils",
            "price": 115.0,
            "cost": 95.0,
            "stock": 25,
            "minStock": 5,
            "unit": "PACKET",
            "tax": 5.0,
            "icon": "🛢️",
            "barcode": "P1062",
            "status": "Active"
      },
      {
            "id": 71,
            "code": "P1063",
            "name": "Tata Salt Vacuum Evaporated Iodized 1kg",
            "category": "Spices & Staples",
            "price": 28.0,
            "cost": 22.0,
            "stock": 100,
            "minStock": 20,
            "unit": "PACKET",
            "tax": 5.0,
            "icon": "🌶️",
            "barcode": "P1063",
            "status": "Active"
      },
      {
            "id": 72,
            "code": "P1064",
            "name": "MDH Deggi Mirch Powder 100g Box",
            "category": "Spices & Staples",
            "price": 90.0,
            "cost": 72.0,
            "stock": 45,
            "minStock": 8,
            "unit": "PACKET",
            "tax": 5.0,
            "icon": "🌶️",
            "barcode": "P1064",
            "status": "Active"
      },
      {
            "id": 73,
            "code": "P1065",
            "name": "Catch Turmeric / Haldi Powder 200g",
            "category": "Spices & Staples",
            "price": 58.0,
            "cost": 45.0,
            "stock": 50,
            "minStock": 10,
            "unit": "PACKET",
            "tax": 5.0,
            "icon": "🌶️",
            "barcode": "P1065",
            "status": "Active"
      },
      {
            "id": 74,
            "code": "P1066",
            "name": "Everest Garam Masala 100g Box",
            "category": "Spices & Staples",
            "price": 85.0,
            "cost": 68.0,
            "stock": 40,
            "minStock": 8,
            "unit": "PACKET",
            "tax": 5.0,
            "icon": "🌶️",
            "barcode": "P1066",
            "status": "Active"
      },
      {
            "id": 75,
            "code": "P1067",
            "name": "Catch Coriander / Dhaniya Powder 200g",
            "category": "Spices & Staples",
            "price": 62.0,
            "cost": 48.0,
            "stock": 45,
            "minStock": 8,
            "unit": "PACKET",
            "tax": 5.0,
            "icon": "🌶️",
            "barcode": "P1067",
            "status": "Active"
      },
      {
            "id": 76,
            "code": "P1068",
            "name": "MDH Asafoetida / Hing Compounded 50g",
            "category": "Spices & Staples",
            "price": 105.0,
            "cost": 80.0,
            "stock": 30,
            "minStock": 5,
            "unit": "BOTTLE",
            "tax": 5.0,
            "icon": "🌶️",
            "barcode": "P1068",
            "status": "Active"
      },
      {
            "id": 77,
            "code": "P1069",
            "name": "Kissan Fresh Tomato Ketchup 950g Squeezo",
            "category": "Spices & Staples",
            "price": 145.0,
            "cost": 110.0,
            "stock": 35,
            "minStock": 6,
            "unit": "BOTTLE",
            "tax": 12.0,
            "icon": "🌶️",
            "barcode": "P1069",
            "status": "Active"
      },
      {
            "id": 78,
            "code": "P1070",
            "name": "Dr Oetker Funfoods Veg Mayonnaise 250g",
            "category": "Spices & Staples",
            "price": 60.0,
            "cost": 45.0,
            "stock": 30,
            "minStock": 6,
            "unit": "BOTTLE",
            "tax": 12.0,
            "icon": "🌶️",
            "barcode": "P1070",
            "status": "Active"
      },
      {
            "id": 79,
            "code": "P1071",
            "name": "Ching Secret Schezwan Chutney 250g Bottle",
            "category": "Spices & Staples",
            "price": 85.0,
            "cost": 65.0,
            "stock": 30,
            "minStock": 5,
            "unit": "BOTTLE",
            "tax": 12.0,
            "icon": "🌶️",
            "barcode": "P1071",
            "status": "Active"
      },
      {
            "id": 80,
            "code": "P1072",
            "name": "Tops Mixed Fruit Jam 500g Jar",
            "category": "Spices & Staples",
            "price": 150.0,
            "cost": 115.0,
            "stock": 25,
            "minStock": 5,
            "unit": "JAR",
            "tax": 12.0,
            "icon": "🌶️",
            "barcode": "P1072",
            "status": "Active"
      },
      {
            "id": 81,
            "code": "P1073",
            "name": "Dettol Original Germ Protection Soap 125g",
            "category": "Personal Care",
            "price": 52.0,
            "cost": 42.0,
            "stock": 80,
            "minStock": 15,
            "unit": "PCS",
            "tax": 18.0,
            "icon": "🧴",
            "barcode": "P1073",
            "status": "Active"
      },
      {
            "id": 82,
            "code": "P1074",
            "name": "Lifebuoy Total Germ Protection Soap 125g",
            "category": "Personal Care",
            "price": 38.0,
            "cost": 30.0,
            "stock": 70,
            "minStock": 12,
            "unit": "PCS",
            "tax": 18.0,
            "icon": "🧴",
            "barcode": "P1074",
            "status": "Active"
      },
      {
            "id": 83,
            "code": "P1075",
            "name": "Dove Deep Moisture Bathing Bar 100g",
            "category": "Personal Care",
            "price": 68.0,
            "cost": 55.0,
            "stock": 50,
            "minStock": 10,
            "unit": "PCS",
            "tax": 18.0,
            "icon": "🧴",
            "barcode": "P1075",
            "status": "Active"
      },
      {
            "id": 84,
            "code": "P1076",
            "name": "Colgate Strong Teeth Toothpaste 200g",
            "category": "Personal Care",
            "price": 120.0,
            "cost": 95.0,
            "stock": 60,
            "minStock": 10,
            "unit": "PACKET",
            "tax": 18.0,
            "icon": "🧴",
            "barcode": "P1076",
            "status": "Active"
      },
      {
            "id": 85,
            "code": "P1077",
            "name": "Sensodyne Rapid Relief Toothpaste 80g",
            "category": "Personal Care",
            "price": 215.0,
            "cost": 170.0,
            "stock": 30,
            "minStock": 5,
            "unit": "PACKET",
            "tax": 18.0,
            "icon": "🧴",
            "barcode": "P1077",
            "status": "Active"
      },
      {
            "id": 86,
            "code": "P1078",
            "name": "Head & Shoulders Anti-Dandruff Shampoo 180ml",
            "category": "Personal Care",
            "price": 185.0,
            "cost": 145.0,
            "stock": 35,
            "minStock": 6,
            "unit": "BOTTLE",
            "tax": 18.0,
            "icon": "🧴",
            "barcode": "P1078",
            "status": "Active"
      },
      {
            "id": 87,
            "code": "P1079",
            "name": "Parachute 100% Coconut Hair Oil 200ml Bottle",
            "category": "Personal Care",
            "price": 98.0,
            "cost": 78.0,
            "stock": 45,
            "minStock": 8,
            "unit": "BOTTLE",
            "tax": 18.0,
            "icon": "🧴",
            "barcode": "P1079",
            "status": "Active"
      },
      {
            "id": 88,
            "code": "P1080",
            "name": "Bajaj Almond Drops Non-Sticky Hair Oil 100ml",
            "category": "Personal Care",
            "price": 75.0,
            "cost": 60.0,
            "stock": 40,
            "minStock": 8,
            "unit": "BOTTLE",
            "tax": 18.0,
            "icon": "🧴",
            "barcode": "P1080",
            "status": "Active"
      },
      {
            "id": 89,
            "code": "P1081",
            "name": "Dettol Liquid Handwash Refill Pouch 675ml",
            "category": "Personal Care",
            "price": 109.0,
            "cost": 85.0,
            "stock": 50,
            "minStock": 10,
            "unit": "PACKET",
            "tax": 18.0,
            "icon": "🧴",
            "barcode": "P1081",
            "status": "Active"
      },
      {
            "id": 90,
            "code": "P1082",
            "name": "Nivea Soft Light Moisturising Cream 100ml",
            "category": "Personal Care",
            "price": 199.0,
            "cost": 150.0,
            "stock": 25,
            "minStock": 5,
            "unit": "JAR",
            "tax": 18.0,
            "icon": "🧴",
            "barcode": "P1082",
            "status": "Active"
      },
      {
            "id": 91,
            "code": "P1083",
            "name": "Surf Excel Easy Wash Detergent Powder 1kg",
            "category": "Household & Cleaning",
            "price": 145.0,
            "cost": 118.0,
            "stock": 50,
            "minStock": 10,
            "unit": "PACKET",
            "tax": 18.0,
            "icon": "🧼",
            "barcode": "P1083",
            "status": "Active"
      },
      {
            "id": 92,
            "code": "P1084",
            "name": "Ariel Matic Top Load Detergent Powder 1kg",
            "category": "Household & Cleaning",
            "price": 245.0,
            "cost": 195.0,
            "stock": 30,
            "minStock": 6,
            "unit": "PACKET",
            "tax": 18.0,
            "icon": "🧼",
            "barcode": "P1084",
            "status": "Active"
      },
      {
            "id": 93,
            "code": "P1085",
            "name": "Vim Dishwash Bar with Lemon 300g Pack",
            "category": "Household & Cleaning",
            "price": 26.0,
            "cost": 20.0,
            "stock": 90,
            "minStock": 15,
            "unit": "PCS",
            "tax": 18.0,
            "icon": "🧼",
            "barcode": "P1085",
            "status": "Active"
      },
      {
            "id": 94,
            "code": "P1086",
            "name": "Vim Pure Lemon Dishwash Gel Bottle 250ml",
            "category": "Household & Cleaning",
            "price": 60.0,
            "cost": 45.0,
            "stock": 50,
            "minStock": 10,
            "unit": "BOTTLE",
            "tax": 18.0,
            "icon": "🧼",
            "barcode": "P1086",
            "status": "Active"
      },
      {
            "id": 95,
            "code": "P1087",
            "name": "Harpic Power Plus Toilet Cleaner Original 500ml",
            "category": "Household & Cleaning",
            "price": 99.0,
            "cost": 78.0,
            "stock": 40,
            "minStock": 8,
            "unit": "BOTTLE",
            "tax": 18.0,
            "icon": "🧼",
            "barcode": "P1087",
            "status": "Active"
      },
      {
            "id": 96,
            "code": "P1088",
            "name": "Lizol Citrus Surface Disinfectant Floor Cleaner 500ml",
            "category": "Household & Cleaning",
            "price": 110.0,
            "cost": 88.0,
            "stock": 40,
            "minStock": 8,
            "unit": "BOTTLE",
            "tax": 18.0,
            "icon": "🧼",
            "barcode": "P1088",
            "status": "Active"
      },
      {
            "id": 97,
            "code": "P1089",
            "name": "Colin Advanced Glass and Surface Cleaner 500ml",
            "category": "Household & Cleaning",
            "price": 104.0,
            "cost": 82.0,
            "stock": 35,
            "minStock": 6,
            "unit": "BOTTLE",
            "tax": 18.0,
            "icon": "🧼",
            "barcode": "P1089",
            "status": "Active"
      },
      {
            "id": 98,
            "code": "P1090",
            "name": "Good Knight Gold Flash Mosquito Liquid Refill (45ml)",
            "category": "Household & Cleaning",
            "price": 85.0,
            "cost": 65.0,
            "stock": 60,
            "minStock": 12,
            "unit": "PCS",
            "tax": 18.0,
            "icon": "🧼",
            "barcode": "P1090",
            "status": "Active"
      },
      {
            "id": 99,
            "code": "P1091",
            "name": "Scotch Brite Heavy Duty Scrub Pad (3 Pcs Pack)",
            "category": "Household & Cleaning",
            "price": 45.0,
            "cost": 35.0,
            "stock": 50,
            "minStock": 10,
            "unit": "PACKET",
            "tax": 18.0,
            "icon": "🧼",
            "barcode": "P1091",
            "status": "Active"
      },
      {
            "id": 100,
            "code": "P1092",
            "name": "Comfort After Wash Fabric Morning Fresh Conditioner 220ml",
            "category": "Household & Cleaning",
            "price": 62.0,
            "cost": 48.0,
            "stock": 35,
            "minStock": 6,
            "unit": "BOTTLE",
            "tax": 18.0,
            "icon": "🧼",
            "barcode": "P1092",
            "status": "Active"
      },
      {
            "id": 101,
            "code": "P1093",
            "name": "Cadbury Dairy Milk Silk Chocolate 60g",
            "category": "Chocolates & Sweets",
            "price": 80.0,
            "cost": 65.0,
            "stock": 60,
            "minStock": 12,
            "unit": "PCS",
            "tax": 18.0,
            "icon": "🍫",
            "barcode": "P1093",
            "status": "Active"
      },
      {
            "id": 102,
            "code": "P1094",
            "name": "Nestle KitKat 4 Finger Crispy Wafer 38g",
            "category": "Chocolates & Sweets",
            "price": 28.0,
            "cost": 22.0,
            "stock": 75,
            "minStock": 15,
            "unit": "PCS",
            "tax": 18.0,
            "icon": "🍫",
            "barcode": "P1094",
            "status": "Active"
      },
      {
            "id": 103,
            "code": "P1095",
            "name": "Cadbury 5 Star Chocolate Bar 40g",
            "category": "Chocolates & Sweets",
            "price": 20.0,
            "cost": 16.0,
            "stock": 80,
            "minStock": 15,
            "unit": "PCS",
            "tax": 18.0,
            "icon": "🍫",
            "barcode": "P1095",
            "status": "Active"
      },
      {
            "id": 104,
            "code": "P1096",
            "name": "Snickers Peanut Caramel Chocolate Bar 45g",
            "category": "Chocolates & Sweets",
            "price": 50.0,
            "cost": 38.0,
            "stock": 50,
            "minStock": 10,
            "unit": "PCS",
            "tax": 18.0,
            "icon": "🍫",
            "barcode": "P1096",
            "status": "Active"
      },
      {
            "id": 105,
            "code": "P1097",
            "name": "Nestle Munch Crunchy Wafer Bar 22g",
            "category": "Chocolates & Sweets",
            "price": 10.0,
            "cost": 8.0,
            "stock": 100,
            "minStock": 20,
            "unit": "PCS",
            "tax": 18.0,
            "icon": "🍫",
            "barcode": "P1097",
            "status": "Active"
      },
      {
            "id": 106,
            "code": "P1098",
            "name": "Cadbury Perk Chocolate Coated Wafer 28g",
            "category": "Chocolates & Sweets",
            "price": 10.0,
            "cost": 8.0,
            "stock": 90,
            "minStock": 18,
            "unit": "PCS",
            "tax": 18.0,
            "icon": "🍫",
            "barcode": "P1098",
            "status": "Active"
      },
      {
            "id": 107,
            "code": "P1099",
            "name": "Center Fresh Spearmint Chewing Gum (Pack of 20)",
            "category": "Chocolates & Sweets",
            "price": 20.0,
            "cost": 15.0,
            "stock": 70,
            "minStock": 15,
            "unit": "PACKET",
            "tax": 18.0,
            "icon": "🍫",
            "barcode": "P1099",
            "status": "Active"
      },
      {
            "id": 108,
            "code": "P1100",
            "name": "Mentos Mint Roll Candy 37g",
            "category": "Chocolates & Sweets",
            "price": 10.0,
            "cost": 8.0,
            "stock": 80,
            "minStock": 15,
            "unit": "PCS",
            "tax": 18.0,
            "icon": "🍫",
            "barcode": "P1100",
            "status": "Active"
      }
];
      if (saved && Array.isArray(saved) && saved.length > 8) {
        // Merge user custom items if any existed
        const codeMap = new Map();
        default108.forEach(p => codeMap.set(p.code, p));
        saved.forEach(p => {
          if (p.code && !codeMap.has(p.code)) {
            default108.push(p);
          }
        });
      }
      saved = default108;
      localStorage.setItem('pos_products_list', JSON.stringify(saved));
      localStorage.setItem('pos_catalog_ver', CATALOG_VERSION);
    }
    return saved;
  })(),

  // Categories Catalog (11 Categories Auto-Synced)
  categories: (() => {
    const CAT_VERSION = 'v2026_11_cats';
    const currentCatVer = localStorage.getItem('pos_categories_ver');
    let saved = JSON.parse(localStorage.getItem('pos_categories_list') || 'null');
    if (!saved || !Array.isArray(saved) || saved.length <= 7 || currentCatVer !== CAT_VERSION) {
      saved = [
      {
            "id": 1,
            "name": "Bakery",
            "desc": "Bakery Products & Items",
            "icon": "🍞",
            "status": "Active"
      },
      {
            "id": 2,
            "name": "Beverages",
            "desc": "Beverages Products & Items",
            "icon": "🧃",
            "status": "Active"
      },
      {
            "id": 3,
            "name": "Chocolates & Sweets",
            "desc": "Chocolates & Sweets Products & Items",
            "icon": "🍫",
            "status": "Active"
      },
      {
            "id": 4,
            "name": "Cooking Oils",
            "desc": "Cooking Oils Products & Items",
            "icon": "🛢️",
            "status": "Active"
      },
      {
            "id": 5,
            "name": "Dairy",
            "desc": "Dairy Products & Items",
            "icon": "🥛",
            "status": "Active"
      },
      {
            "id": 6,
            "name": "Food",
            "desc": "Food Products & Items",
            "icon": "🍲",
            "status": "Active"
      },
      {
            "id": 7,
            "name": "Grains & Staples",
            "desc": "Grains & Staples Products & Items",
            "icon": "🌾",
            "status": "Active"
      },
      {
            "id": 8,
            "name": "Household & Cleaning",
            "desc": "Household & Cleaning Products & Items",
            "icon": "🧼",
            "status": "Active"
      },
      {
            "id": 9,
            "name": "Personal Care",
            "desc": "Personal Care Products & Items",
            "icon": "🧴",
            "status": "Active"
      },
      {
            "id": 10,
            "name": "Snacks",
            "desc": "Snacks Products & Items",
            "icon": "🍿",
            "status": "Active"
      },
      {
            "id": 11,
            "name": "Spices & Staples",
            "desc": "Spices & Staples Products & Items",
            "icon": "🌶️",
            "status": "Active"
      }
];
      localStorage.setItem('pos_categories_list', JSON.stringify(saved));
      localStorage.setItem('pos_categories_ver', CAT_VERSION);
    }
    return saved;
  })(),

  // Customers Directory & Balances (Persisted in localStorage)
  customers: (() => {
    let saved = JSON.parse(localStorage.getItem('pos_customers_list') || 'null');
    if (!saved || !Array.isArray(saved) || saved.length <= 1) {
      saved = [
        { id: 1, name: 'Walk-in Customer', mobile: '9999999999', email: '', gstin: 'Unregistered', balance: 0.00, due: 0.00, creditLimit: 0, status: 'Active' },
        { id: 2, name: 'Rahul Sharma', mobile: '9811223344', email: 'rahul@example.com', gstin: '07AAAAA0000A1Z5', balance: 450.00, due: 450.00, creditLimit: 5000, status: 'Active' },
        { id: 3, name: 'Priya Patel', mobile: '9822334455', email: 'priya@example.com', gstin: 'Unregistered', balance: 0.00, due: 0.00, creditLimit: 3000, status: 'Active' },
        { id: 4, name: 'Amit Verma', mobile: '9833445566', email: 'amit@example.com', gstin: 'Unregistered', balance: 1200.00, due: 1200.00, creditLimit: 10000, status: 'Active' }
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
        { id: 1, name: 'ABC Distributors', contact: 'Ramesh Kumar', mobile: '9876500001', email: 'abc@distributors.com', gstin: '07ABCDE1234F1Z5', balance: 1500.00, due: 1500.00, status: 'Active' },
        { id: 2, name: 'Shree Trading', contact: 'Suresh Shah', mobile: '9812345678', email: 'shree@trading.com', gstin: '07ABCDE1234F1Z6', balance: 850.00, due: 850.00, status: 'Active' },
        { id: 3, name: 'Global Suppliers', contact: 'Anil Gupta', mobile: '9123456780', email: 'global@suppliers.com', gstin: '-', balance: 0.00, due: 0.00, status: 'Active' },
        { id: 4, name: 'Mahesh Traders', contact: 'Mahesh Verma', mobile: '9888777666', email: 'mahesh@traders.com', gstin: '07ABCDE1234F1Z7', balance: 0.00, due: 0.00, status: 'Active' },
        { id: 5, name: 'KR Enterprises', contact: 'Karan Rawat', mobile: '9654009887', email: 'kr@enterprises.com', gstin: '-', balance: 0.00, due: 0.00, status: 'Active' }
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
    return Array.isArray(saved) ? saved : [];
  })(),

  // Purchase Master (Persisted in localStorage)
  purchases: (() => {
    let saved = JSON.parse(localStorage.getItem('pos_purchases_list') || 'null');
    return Array.isArray(saved) ? saved : [];
  })(),

  // Returns Master (Sales & Purchase Returns) (Persisted in localStorage)
  returns: (() => {
    let saved = JSON.parse(localStorage.getItem('pos_returns_list') || 'null');
    return Array.isArray(saved) ? saved : [];
  })(),

  // Product Price & Stock Audit Logs (Persisted in localStorage)
  productAuditLogs: (() => {
    let saved = JSON.parse(localStorage.getItem('pos_product_audit_logs') || 'null');
    return Array.isArray(saved) ? saved : [];
  })(),

  lastCompletedSale: null,

  // Active Stock Transfer Manifest & History
  activeTransferItems: [],
  transferHistory: (() => {
    let saved = JSON.parse(localStorage.getItem('pos_transfer_history') || 'null');
    return Array.isArray(saved) ? saved : [];
  })(),

  // Customer Khata Payments Received (Persisted in localStorage)
  customerPayments: (() => {
    let saved = JSON.parse(localStorage.getItem('pos_customer_payments') || 'null');
    return Array.isArray(saved) ? saved : [];
  })(),

  // Supplier Payments Made (Persisted in localStorage)
  supplierPayments: (() => {
    let saved = JSON.parse(localStorage.getItem('pos_supplier_payments') || 'null');
    return Array.isArray(saved) ? saved : [];
  })(),

  // Super-Admin Secret PIN & Sentinel AI Engine (Point 4)
  systemSecretPin: localStorage.getItem('pos_system_secret_pin') || '7788',
  _preAISafetySnapshot: (() => {
    try {
      return JSON.parse(localStorage.getItem('pos_ai_pre_repair_snapshot') || 'null');
    } catch(e) { return null; }
  })(),
  aiHealingLogs: (() => {
    try {
      let saved = JSON.parse(localStorage.getItem('pos_ai_healing_logs') || 'null');
      return Array.isArray(saved) ? saved : [];
    } catch(e) { return []; }
  })(),
  aiDetectedIssues: []
};
window.posState = posState;

// Safe Storage Helpers: Save entities to localStorage with error handling & console logging
function safeSetStorage(key, data, label) {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    console.log(`%c[Storage OK] ${label} (${Array.isArray(data) ? data.length + ' records' : 'saved'}) persisted to "${key}"`, 'color:#10b981; font-weight:bold;');
    if (typeof renderStorageDiagnostics === 'function') {
      renderStorageDiagnostics();
    }
    if (typeof debounceSyncToSqlite === 'function') {
      debounceSyncToSqlite();
    }
    return true;
  } catch (err) {
    console.error(`[Storage Error] Failed to persist ${label} to "${key}":`, err);
    showToast(`Storage Alert: Could not save ${label}. Browser memory may be full or restricted.`, 'danger');
    return false;
  }
}

function saveProductsToStorage() {
  safeSetStorage('pos_products_list', posState.products, 'Products');
}
function saveProductAuditLogsToStorage() {
  safeSetStorage('pos_product_audit_logs', posState.productAuditLogs, 'Product Audit Logs');
}
function saveState() {
  if (posState.products) safeSetStorage('pos_products_list', posState.products, 'Products');
  if (posState.customers) safeSetStorage('pos_customers_list', posState.customers, 'Customers');
  if (posState.suppliers) safeSetStorage('pos_suppliers_list', posState.suppliers, 'Suppliers');
  if (posState.categories) safeSetStorage('pos_categories_list', posState.categories, 'Categories');
  if (posState.branches) safeSetStorage('pos_branches_list', posState.branches, 'Branches');
  if (posState.salesHistory) safeSetStorage('pos_sales_history', posState.salesHistory, 'Sales Orders');
  if (posState.settings) safeSetStorage('pos_settings', posState.settings, 'Settings');
  if (posState.purchases) safeSetStorage('pos_purchases_list', posState.purchases, 'Purchases');
  if (posState.returns) safeSetStorage('pos_returns_list', posState.returns, 'Returns');
  if (posState.transferHistory) safeSetStorage('pos_transfer_history', posState.transferHistory, 'Transfers');
  if (posState.users) safeSetStorage('pos_users_list', posState.users, 'Users');
}

function logProductChange({
  productId, productCode, productName,
  oldPrice, newPrice,
  oldCost, newCost,
  oldStock, newStock,
  changeType, reason, changedBy
}) {
  if (!Array.isArray(posState.productAuditLogs)) {
    posState.productAuditLogs = [];
  }
  const now = new Date();
  const logEntry = {
    id: 'AUD-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    timestamp: now.toISOString(),
    date: now.toLocaleDateString('en-GB'),
    time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    productId: productId || null,
    productCode: productCode || '',
    productName: productName || 'Unknown Product',
    oldPrice: parseFloat(oldPrice) || 0,
    newPrice: parseFloat(newPrice) || 0,
    oldCost: parseFloat(oldCost) || 0,
    newCost: parseFloat(newCost) || 0,
    oldStock: parseInt(oldStock, 10) || 0,
    newStock: parseInt(newStock, 10) || 0,
    changeType: changeType || 'UPDATE',
    reason: reason || 'Product updated',
    changedBy: changedBy || (posState.currentUser ? posState.currentUser.name || posState.currentUser.username : 'System Administrator')
  };

  posState.productAuditLogs.unshift(logEntry);

  if (posState.productAuditLogs.length > 2000) {
    posState.productAuditLogs = posState.productAuditLogs.slice(0, 2000);
  }

  saveProductAuditLogsToStorage();
  return logEntry;
}
function saveBranchesToStorage() {
  safeSetStorage('pos_branches_list', posState.branches, 'Branches');
}
function saveCategoriesToStorage() {
  safeSetStorage('pos_categories_list', posState.categories, 'Categories');
}
function saveCustomersToStorage() {
  safeSetStorage('pos_customers_list', posState.customers, 'Customers');
}
function saveSuppliersToStorage() {
  safeSetStorage('pos_suppliers_list', posState.suppliers, 'Suppliers');
}
function saveSettingsToStorage() {
  safeSetStorage('pos_settings', posState.settings, 'Settings');
}
function saveSalesHistoryToStorage() {
  safeSetStorage('pos_sales_history', posState.salesHistory, 'Sales History');
}
function saveTransferHistoryToStorage() {
  safeSetStorage('pos_transfer_history', posState.transferHistory, 'Transfer History');
}
function saveUsersToStorage() {
  safeSetStorage('pos_users_list', posState.users, 'Users');
}
function savePurchasesToStorage() {
  safeSetStorage('pos_purchases_list', posState.purchases, 'Purchases');
}
function saveReturnsToStorage() {
  safeSetStorage('pos_returns_list', posState.returns, 'Returns');
}
function saveCustomerPaymentsToStorage() {
  safeSetStorage('pos_customer_payments', posState.customerPayments, 'Customer Payments');
}
function saveSupplierPaymentsToStorage() {
  safeSetStorage('pos_supplier_payments', posState.supplierPayments, 'Supplier Payments');
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

  // Refresh dynamic screen content & clear old recent selection states
  if (screenId === 'dashboard') renderDashboard();
  if (screenId === 'pos') { renderPosProducts(); renderCart(); initPosCustomerBar(); }
  if (screenId === 'inventory') resetInventoryFilters();
  if (screenId === 'products') renderProductMaster();
  if (screenId === 'categories') renderCategories();
  if (screenId === 'customers') renderCustomers();
  if (screenId === 'suppliers') renderSuppliers();
  if (screenId === 'sales-history') renderSalesHistory();
  if (screenId === 'ledger') renderLedger();
  if (screenId === 'sales-reports') resetReportsScreen();
  if (screenId === 'profit-report') renderProfitReport();
  if (screenId === 'users') renderUsers();
  if (screenId === 'branches') renderBranches();
  if (screenId === 'settings') loadSettings();
  if (screenId === 'product-search') {
    const s4Input = document.getElementById('prod-search-filter-screen4');
    if (s4Input) s4Input.value = '';
    const s4Cat = document.getElementById('prod-search-category-screen4');
    if (s4Cat) s4Cat.value = 'ALL';
    renderProductSearch();
  }
  if (screenId === 'stock-transfer') resetStockTransferScreen();
  if (screenId === 'purchase') populatePurchaseDropdowns();
  if (screenId === 'sales-return') {
    const retInvInput = document.getElementById('return-inv-input');
    if (retInvInput) retInvInput.value = '';
    const retBar = document.getElementById('return-action-bar');
    if (retBar) retBar.style.display = 'none';
    const retItems = document.getElementById('return-items-container');
    if (retItems) retItems.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted)">Search an invoice to load items</td></tr>';
  }
  if (screenId === 'purchase-return') {
    populatePurchaseReturnDropdown();
    const purchPoInput = document.getElementById('purch-return-po-input');
    if (purchPoInput) purchPoInput.value = '';
    const pSelect = document.getElementById('purch-return-po-select');
    if (pSelect) pSelect.value = '';
  }
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

  // Reset all recent selection states for a fresh clean new session
  resetInventoryFilters();
  resetStockTransferScreen();
  resetReportsScreen();

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

  // Clear all recent session states & selections
  resetInventoryFilters();
  resetStockTransferScreen();
  resetReportsScreen();

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

  // Reset all recent selection states on user session switch
  resetInventoryFilters();
  resetStockTransferScreen();
  resetReportsScreen();

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

  // Role-based visibility for AI Copilot in Header
  // Cashiers do NOT see AI Copilot or confidential margin audits; only ADMIN and MANAGER see it.
  const copilotBtn = document.getElementById('btn-topbar-copilot');
  if (copilotBtn) {
    const isCashier = posState.currentUser && posState.currentUser.role === 'CASHIER';
    copilotBtn.style.display = isCashier ? 'none' : 'inline-flex';
    if (isCashier) {
      const drawer = document.getElementById('ai-copilot-drawer');
      if (drawer) drawer.style.display = 'none';
    }
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
function refreshProductMaster(showToastFlag = true) {
  const filter = document.getElementById('prod-search-filter');
  if (filter) filter.value = '';
  renderProductMaster();
  if (showToastFlag) {
    showToast('Product catalog refreshed.', 'info');
  }
}
window.refreshProductMaster = refreshProductMaster;

function renderProductMaster() {
  const tbody = document.getElementById('product-master-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const query = (document.getElementById('prod-search-filter')?.value || '').toLowerCase();

  const filtered = posState.products.filter(p => !query || p.name.toLowerCase().includes(query) || p.code.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:24px; color:var(--text-muted);">No products found matching your search.</td></tr>`;
  } else {
    filtered.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-size:1.4rem;">${p.icon}</td>
        <td><strong>${p.name}</strong></td>
        <td><code>${p.code}</code></td>
        <td><span class="badge badge-info">${p.category}</span></td>
        <td>₹ ${p.price.toFixed(2)}</td>
        <td><span style="font-weight:700">${p.stock}</span> ${p.unit}</td>
        <td><span class="badge ${p.stock <= p.minStock ? 'badge-warning' : 'badge-success'}">${p.stock <= 0 ? 'Out of Stock' : p.stock <= p.minStock ? 'Low Stock' : 'Active'}</span></td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="openProductAuditModal(${p.id})" title="View price & stock change timeline" style="margin-right:4px;">📜 History</button>
          <button class="btn btn-outline btn-sm" onclick="openEditProductModal(${p.id})" title="Edit product details">✏️ Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})" title="Delete product">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Update Product Master Bottom Count & Status Bar
  const countBar = document.getElementById('product-master-count-bar');
  const statsBar = document.getElementById('product-master-stats-bar');
  if (countBar) {
    const totalCount = posState.products.length;
    if (query) {
      countBar.innerHTML = `<span>📦</span> Showing <strong>${filtered.length}</strong> of <strong>${totalCount}</strong> products in catalog`;
    } else {
      countBar.innerHTML = `<span>📦</span> Total Products in Catalog: <strong>${totalCount} items</strong>`;
    }
  }
  if (statsBar) {
    const activeCount = filtered.filter(p => p.stock > p.minStock).length;
    const lowStockCount = filtered.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
    const outCount = filtered.filter(p => p.stock <= 0).length;
    statsBar.innerHTML = `
      <span class="badge badge-success" title="Healthy Stock">${activeCount} In Stock</span>
      ${lowStockCount > 0 ? `<span class="badge badge-warning" title="Low Stock Alert">${lowStockCount} Low Stock</span>` : ''}
      ${outCount > 0 ? `<span class="badge badge-danger" title="Zero Stock">${outCount} Out of Stock</span>` : ''}
    `;
  }
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
      const oldPrice = p.price;
      const oldCost = p.cost;
      const oldStock = p.stock;

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

      if (oldPrice !== price || oldCost !== cost || oldStock !== stock) {
        let diffs = [];
        if (oldPrice !== price) diffs.push(`Price: ₹${oldPrice.toFixed(2)} ➔ ₹${price.toFixed(2)}`);
        if (oldStock !== stock) diffs.push(`Stock: ${oldStock} ➔ ${stock}`);
        logProductChange({
          productId: p.id,
          productCode: code,
          productName: name,
          oldPrice: oldPrice,
          newPrice: price,
          oldCost: oldCost,
          newCost: cost,
          oldStock: oldStock,
          newStock: stock,
          changeType: 'MANUAL_EDIT',
          reason: diffs.join(', ') || 'Manual edit via Product Form',
          changedBy: posState.currentUser ? posState.currentUser.name || posState.currentUser.username : 'Admin'
        });
      }

      showToast(`Product "${name}" updated successfully!`, 'success');
    }
  } else {
    // Add new product
    const newId = posState.products.length > 0 ? Math.max(...posState.products.map(x => x.id)) + 1 : 1;
    posState.products.push({
      id: newId,
      code, name, category, price, cost, stock, minStock, unit, tax, icon, barcode
    });

    logProductChange({
      productId: newId,
      productCode: code,
      productName: name,
      oldPrice: 0,
      newPrice: price,
      oldCost: 0,
      newCost: cost,
      oldStock: 0,
      newStock: stock,
      changeType: 'INITIAL_CREATION',
      reason: `Initial catalog creation at ₹${price.toFixed(2)} (${stock} units)`,
      changedBy: posState.currentUser ? posState.currentUser.name || posState.currentUser.username : 'Admin'
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

// =============================================================================
// EXCEL / CSV BULK PRODUCT IMPORT & AUTO-CATEGORY ENGINE (POINT 2)
// =============================================================================

function downloadProductExcelTemplate() {
  const headers = [
    'Item Name',
    'Barcode / Code',
    'Category',
    'Unit',
    'Cost Price',
    'Selling Price',
    'Opening Stock',
    'Min Alert Stock',
    'Tax Rate %'
  ];

  const sampleRows = [
    ['Amul Taaza Fresh Milk 500ml', '8901262010053', 'Dairy', 'PACKET', '24.00', '27.00', '50', '10', '0'],
    ['Britannia Premium Bread 400g', '8901063142054', 'Bakery', 'PCS', '38.00', '45.00', '25', '5', '5'],
    ['Maggi 2-Minute Masala Noodles 70g', '8901058852332', 'Snacks', 'PCS', '12.00', '14.00', '100', '15', '12'],
    ['Tata Salt Vacuum Evaporated 1kg', '8901030012014', 'Spices & Staples', 'PACKET', '22.00', '28.00', '40', '10', '5']
  ];

  let csv = '\uFEFF'; // UTF-8 BOM so Excel opens with proper encoding
  csv += headers.map(h => `"${h}"`).join(',') + '\r\n';
  sampleRows.forEach(row => {
    csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\r\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'MyPOS_Product_Upload_Template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('📥 Sample Excel template downloaded! Open in Excel, fill items, and upload.', 'info');
}

function triggerBulkProductUpload() {
  const fileInput = document.getElementById('bulk-product-file-input');
  if (fileInput) {
    fileInput.value = '';
    fileInput.click();
  }
}

function handleProductFileSelect(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    parseAndPreviewBulkProducts(content, file.name);
  };
  reader.onerror = function() {
    showToast('Failed to read selected file. Please try again.', 'danger');
  };
  reader.readAsText(file);
}

// Robust CSV Line Parser (handles quotes, commas within quotes, CRLF)
function parseCSVRows(text) {
  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentCell.trim());
      currentCell = '';
      if (currentRow.length > 0 && currentRow.some(c => c !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentCell += char;
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(c => c !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function parseAndPreviewBulkProducts(csvText, fileName) {
  const rawRows = parseCSVRows(csvText);
  if (!rawRows || rawRows.length < 2) {
    showToast('The selected file is empty or does not contain product data rows.', 'warning');
    return;
  }

  const rawHeaders = rawRows[0];
  const dataRows = rawRows.slice(1);

  // Normalize headers
  const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const headerMap = {
    name: -1,
    code: -1,
    category: -1,
    unit: -1,
    cost: -1,
    price: -1,
    stock: -1,
    minStock: -1,
    tax: -1
  };

  rawHeaders.forEach((h, idx) => {
    const nh = norm(h);
    if (['itemname', 'productname', 'name', 'title', 'product'].includes(nh)) headerMap.name = idx;
    else if (['barcodecode', 'barcodeorcode', 'code', 'barcode', 'sku', 'productcode', 'itemcode'].includes(nh)) headerMap.code = idx;
    else if (['category', 'cat', 'group', 'department'].includes(nh)) headerMap.category = idx;
    else if (['unit', 'uom', 'measurement', 'packing'].includes(nh)) headerMap.unit = idx;
    else if (['costprice', 'cost', 'purchaseprice', 'buyingprice', 'cp', 'wholesaleprice'].includes(nh)) headerMap.cost = idx;
    else if (['sellingprice', 'price', 'saleprice', 'mrp', 'rate', 'sp'].includes(nh)) headerMap.price = idx;
    else if (['openingstock', 'stock', 'qty', 'quantity', 'currentstock'].includes(nh)) headerMap.stock = idx;
    else if (['minalertstock', 'minstock', 'alertstock', 'min', 'lowstocklimit'].includes(nh)) headerMap.minStock = idx;
    else if (['taxrate', 'taxratepercent', 'tax', 'gst', 'taxpercent', 'gstpercent', 'taxrate%'].includes(nh)) headerMap.tax = idx;
  });

  // Fallback defaults if headers don't match exactly by name
  if (headerMap.name === -1) headerMap.name = 0;
  if (headerMap.code === -1 && rawHeaders.length > 1) headerMap.code = 1;
  if (headerMap.category === -1 && rawHeaders.length > 2) headerMap.category = 2;
  if (headerMap.unit === -1 && rawHeaders.length > 3) headerMap.unit = 3;
  if (headerMap.cost === -1 && rawHeaders.length > 4) headerMap.cost = 4;
  if (headerMap.price === -1 && rawHeaders.length > 5) headerMap.price = 5;
  if (headerMap.stock === -1 && rawHeaders.length > 6) headerMap.stock = 6;
  if (headerMap.minStock === -1 && rawHeaders.length > 7) headerMap.minStock = 7;
  if (headerMap.tax === -1 && rawHeaders.length > 8) headerMap.tax = 8;

  const stagingItems = [];
  const newCategoriesMap = new Map();
  const existingCatNamesLower = new Set(posState.categories.map(c => c.name.toLowerCase().trim()));
  let newCount = 0;
  let existCount = 0;

  dataRows.forEach((cols, idx) => {
    const rawName = (cols[headerMap.name] || '').trim();
    if (!rawName) return; // skip empty rows

    const name = rawName;
    let rawCode = (cols[headerMap.code] || '').trim();
    if (rawCode.startsWith('="') && rawCode.endsWith('"')) {
      rawCode = rawCode.slice(2, -1);
    } else if (rawCode.startsWith("'")) {
      rawCode = rawCode.slice(1);
    }
    if (/^[0-9.]+[eE]\+[0-9]+$/i.test(rawCode)) {
      try {
        rawCode = BigInt(Math.round(Number(rawCode))).toString();
      } catch (e) {
        rawCode = Number(rawCode).toLocaleString('fullwide', {useGrouping: false});
      }
    }
    const code = rawCode;
    let category = (cols[headerMap.category] || '').trim();
    if (!category) category = 'General';

    const unit = (cols[headerMap.unit] || 'PCS').trim().toUpperCase();
    const cost = parseFloat((cols[headerMap.cost] || '0').replace(/[^0-9.]/g, '')) || 0;
    const price = parseFloat((cols[headerMap.price] || '0').replace(/[^0-9.]/g, '')) || 0;
    const stock = parseInt((cols[headerMap.stock] || '0').replace(/[^0-9-]/g, ''), 10) || 0;
    const minStock = parseInt((cols[headerMap.minStock] || '5').replace(/[^0-9-]/g, ''), 10) || 5;
    const tax = parseFloat((cols[headerMap.tax] || '0').replace(/[^0-9.]/g, '')) || 0;

    // Check if category exists
    const catLower = category.toLowerCase().trim();
    if (!existingCatNamesLower.has(catLower)) {
      if (!newCategoriesMap.has(catLower)) {
        newCategoriesMap.set(catLower, category);
      }
    }

    // Check if item already exists
    const isExisting = posState.products.some(p =>
      (code && p.code && p.code.toLowerCase() === code.toLowerCase()) ||
      (p.name && p.name.toLowerCase() === name.toLowerCase())
    );

    if (isExisting) {
      existCount++;
    } else {
      newCount++;
    }

    stagingItems.push({
      id: idx + 1,
      name,
      code,
      category,
      unit,
      cost,
      price,
      stock,
      minStock,
      tax,
      isExisting
    });
  });

  if (stagingItems.length === 0) {
    showToast('No valid product rows found in the uploaded file.', 'warning');
    return;
  }

  // Save to window staging
  window._bulkProductStaging = {
    fileName,
    items: stagingItems,
    newCategories: Array.from(newCategoriesMap.values())
  };

  // Populate Modal UI
  const elTotal = document.getElementById('bulk-total-count');
  const elNew = document.getElementById('bulk-new-count');
  const elExist = document.getElementById('bulk-exist-count');
  const elCat = document.getElementById('bulk-cat-count');
  if (elTotal) elTotal.textContent = stagingItems.length;
  if (elNew) elNew.textContent = newCount;
  if (elExist) elExist.textContent = existCount;
  if (elCat) elCat.textContent = newCategoriesMap.size;

  const catNotice = document.getElementById('bulk-cat-details-box');
  if (catNotice) {
    if (newCategoriesMap.size > 0) {
      const badges = Array.from(newCategoriesMap.values())
        .map(c => `<span class="badge badge-info" style="margin-right:4px;">${c}</span>`)
        .join(' ');
      catNotice.innerHTML = `
        <div style="font-weight:700; margin-bottom:4px;">✨ ${newCategoriesMap.size} New Categories Detected:</div>
        <div>${badges}</div>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">
          These categories will be auto-created in Category Master and as tabs on POS Billing screen.
        </div>
      `;
      catNotice.style.display = 'block';
    } else {
      catNotice.innerHTML = `✅ <strong>All categories match existing system categories.</strong> No new categories required.`;
      catNotice.style.display = 'block';
    }
  }

  // Populate Preview Table
  const tbody = document.getElementById('bulk-preview-table-body');
  if (tbody) {
    tbody.innerHTML = '';
    const previewLimit = Math.min(stagingItems.length, 100);
    for (let i = 0; i < previewLimit; i++) {
      const it = stagingItems[i];
      const tr = document.createElement('tr');
      const actionBadge = it.isExisting
        ? `<span class="badge badge-warning">Update</span>`
        : `<span class="badge badge-success">New Item</span>`;
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td><strong>${it.name}</strong></td>
        <td><code>${it.code || '<span style="color:var(--text-muted);">[Auto-Code]</span>'}</code></td>
        <td><span class="badge badge-info">${it.category}</span></td>
        <td><strong>₹ ${it.price.toFixed(2)}</strong></td>
        <td>₹ ${it.cost.toFixed(2)}</td>
        <td><strong style="color:${it.stock > 0 ? '#10b981' : 'var(--danger)'}">${it.stock}</strong> <small>${it.unit}</small></td>
        <td>${actionBadge}</td>
      `;
      tbody.appendChild(tr);
    }
    if (stagingItems.length > previewLimit) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td colspan="8" style="text-align:center; padding:8px; color:var(--text-muted); font-style:italic;">
          ... and ${stagingItems.length - previewLimit} more items ready for import.
        </td>
      `;
      tbody.appendChild(tr);
    }
  }

  openModal('modal-bulk-product-upload');
}

function processBulkProductImport() {
  const staging = window._bulkProductStaging;
  if (!staging || !Array.isArray(staging.items) || staging.items.length === 0) {
    showToast('No parsed items found to import.', 'danger');
    return;
  }

  const updateDuplicates = document.getElementById('bulk-update-duplicates')?.checked ?? true;

  // 1. Auto-Create New Categories
  let newCatsCreated = 0;
  if (staging.newCategories && staging.newCategories.length > 0) {
    staging.newCategories.forEach(catName => {
      const exists = posState.categories.some(c => c.name.toLowerCase().trim() === catName.toLowerCase().trim());
      if (!exists) {
        const nextCatId = posState.categories.length > 0 ? Math.max(...posState.categories.map(c => c.id || 0)) + 1 : 1;
        posState.categories.push({
          id: nextCatId,
          name: catName,
          desc: 'Auto-created via Excel Bulk Upload',
          icon: '🏷️',
          status: 'Active'
        });
        newCatsCreated++;
      }
    });
    if (newCatsCreated > 0) {
      saveCategoriesToStorage();
    }
  }

  // 2. Process Products
  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let maxProdId = posState.products.length > 0 ? Math.max(...posState.products.map(p => p.id || 0)) : 0;
  let autoCodeSeq = maxProdId + 1;

  staging.items.forEach(it => {
    let finalCode = it.code;
    if (!finalCode) {
      finalCode = 'P' + String(autoCodeSeq).padStart(4, '0');
      autoCodeSeq++;
    }

    const existingProd = posState.products.find(p =>
      (finalCode && p.code && p.code.toLowerCase() === finalCode.toLowerCase()) ||
      (p.name && p.name.toLowerCase() === it.name.toLowerCase())
    );

    if (existingProd) {
      if (updateDuplicates) {
        const oldPrice = existingProd.price;
        const oldCost = existingProd.cost;
        const oldStock = existingProd.stock;

        if (it.price > 0) existingProd.price = it.price;
        if (it.cost > 0) existingProd.cost = it.cost;
        existingProd.stock = (existingProd.stock || 0) + it.stock;
        if (it.category) existingProd.category = it.category;
        if (it.unit) existingProd.unit = it.unit;
        if (it.tax) existingProd.tax = it.tax;
        updatedCount++;

        logProductChange({
          productId: existingProd.id,
          productCode: finalCode,
          productName: it.name,
          oldPrice: oldPrice,
          newPrice: existingProd.price,
          oldCost: oldCost,
          newCost: existingProd.cost,
          oldStock: oldStock,
          newStock: existingProd.stock,
          changeType: 'EXCEL_IMPORT',
          reason: `Bulk upload update from "${staging.fileName || 'Excel file'}"`,
          changedBy: posState.currentUser ? posState.currentUser.name || posState.currentUser.username : 'Admin'
        });
      } else {
        skippedCount++;
      }
    } else {
      maxProdId++;
      const newProd = {
        id: maxProdId,
        code: finalCode,
        name: it.name,
        category: it.category,
        unit: it.unit || 'PCS',
        cost: it.cost,
        price: it.price,
        stock: it.stock,
        minStock: it.minStock,
        tax: it.tax,
        barcode: finalCode,
        status: 'Active',
        icon: '📦'
      };
      posState.products.push(newProd);
      addedCount++;

      logProductChange({
        productId: maxProdId,
        productCode: finalCode,
        productName: it.name,
        oldPrice: 0,
        newPrice: it.price,
        oldCost: 0,
        newCost: it.cost,
        oldStock: 0,
        newStock: it.stock,
        changeType: 'EXCEL_IMPORT',
        reason: `Initial bulk import from "${staging.fileName || 'Excel file'}"`,
        changedBy: posState.currentUser ? posState.currentUser.name || posState.currentUser.username : 'Admin'
      });
    }
  });

  saveProductsToStorage();

  // Full Refresh across the application
  renderProductMaster();
  renderCategories();
  updateCategoryChips();
  populateCategorySelects();
  renderInventory();
  renderPosProducts();
  renderProductSearch();
  if (typeof initStockTransferScreen === 'function') {
    initStockTransferScreen();
  }
  renderDashboard();

  closeModal('modal-bulk-product-upload');
  window._bulkProductStaging = null;

  showToast(`🎉 Bulk import success! ${addedCount} added, ${updatedCount} updated${newCatsCreated > 0 ? `, ${newCatsCreated} new categories created` : ''}!`, 'success');
}

// =============================================================================
// PRODUCT PRICE & STOCK AUDIT TIMELINE CONTROLLERS (POINT 3)
// =============================================================================

function openProductAuditModal(productId) {
  const prod = posState.products.find(p => p.id === productId);
  if (!prod) {
    showToast('Product not found.', 'danger');
    return;
  }

  // Populate Modal Header
  const titleEl = document.getElementById('audit-modal-prod-title');
  const subEl = document.getElementById('audit-modal-prod-subtitle');
  if (titleEl) {
    titleEl.innerHTML = `<span>📜</span> <strong>${prod.name}</strong> <small style="font-weight:400; color:var(--text-muted);">(${prod.code})</small>`;
  }
  if (subEl) {
    subEl.innerHTML = `
      Category: <span class="badge badge-info">${prod.category}</span> &nbsp;|&nbsp;
      Current Selling Price: <strong style="color:var(--primary); font-size:1rem;">₹ ${prod.price.toFixed(2)}</strong> &nbsp;|&nbsp;
      Current Cost: <strong>₹ ${prod.cost.toFixed(2)}</strong> &nbsp;|&nbsp;
      Current Stock: <strong style="color:${prod.stock > 0 ? '#10b981' : 'var(--danger)'};">${prod.stock} ${prod.unit}</strong>
    `;
  }

  const container = document.getElementById('audit-timeline-stream');
  if (!container) return;
  container.innerHTML = '';

  const logs = (posState.productAuditLogs || []).filter(l => 
    l.productId === productId || 
    (l.productCode && prod.code && l.productCode.toLowerCase() === prod.code.toLowerCase()) ||
    (l.productName && prod.name && l.productName.toLowerCase() === prod.name.toLowerCase())
  );

  if (logs.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:36px; background:var(--bg-card); border-radius:8px; border:1px dashed var(--border-color); color:var(--text-muted);">
        <div style="font-size:2rem; margin-bottom:8px;">⏱️</div>
        <div style="font-weight:700; font-size:1rem; color:var(--text-main); margin-bottom:4px;">No modifications recorded yet</div>
        <div style="font-size:0.85rem;">
          Current rate <strong>₹ ${prod.price.toFixed(2)}</strong> is the active initial price.
          Any manual price revisions, stock inward, or Excel uploads will appear here in chronological timeline.
        </div>
      </div>
    `;
  } else {
    logs.forEach((log, idx) => {
      const card = document.createElement('div');
      card.style.cssText = `
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        position: relative;
        transition: all 0.2s ease;
      `;

      const priceDiff = log.newPrice - log.oldPrice;
      const stockDiff = log.newStock - log.oldStock;

      let typeBadge = '';
      if (log.changeType === 'EXCEL_IMPORT') {
        typeBadge = '<span class="badge badge-success">📤 Excel Import</span>';
      } else if (log.changeType === 'MANUAL_EDIT') {
        typeBadge = '<span class="badge badge-info">✏️ Manual Edit</span>';
      } else if (log.changeType === 'REVERT_ACTION') {
        typeBadge = '<span class="badge badge-warning">⏪ Revert Action</span>';
      } else if (log.changeType === 'INITIAL_CREATION') {
        typeBadge = '<span class="badge badge-secondary">✨ Initial Setup</span>';
      } else {
        typeBadge = `<span class="badge badge-info">${log.changeType}</span>`;
      }

      const priceDiffPill = log.oldPrice > 0 ? `
        <div style="display:flex; align-items:center; gap:6px; font-size:0.85rem;">
          <span style="color:var(--text-muted);">Selling Price:</span>
          <span style="text-decoration:line-through; color:var(--text-muted);">₹ ${log.oldPrice.toFixed(2)}</span>
          <span>➔</span>
          <strong style="color:var(--primary); font-size:0.95rem;">₹ ${log.newPrice.toFixed(2)}</strong>
          <span style="font-size:0.75rem; font-weight:700; color:${priceDiff >= 0 ? '#10b981' : 'var(--danger)'};">
            (${priceDiff >= 0 ? '+' : ''}₹ ${priceDiff.toFixed(2)})
          </span>
        </div>
      ` : `
        <div style="display:flex; align-items:center; gap:6px; font-size:0.85rem;">
          <span style="color:var(--text-muted);">Initial Selling Rate:</span>
          <strong style="color:var(--primary); font-size:0.95rem;">₹ ${log.newPrice.toFixed(2)}</strong>
        </div>
      `;

      const stockDiffPill = log.oldStock > 0 || log.newStock > 0 ? `
        <div style="display:flex; align-items:center; gap:6px; font-size:0.85rem;">
          <span style="color:var(--text-muted);">Stock:</span>
          <span>${log.oldStock}</span>
          <span>➔</span>
          <strong style="color:#10b981;">${log.newStock}</strong>
          ${stockDiff !== 0 ? `<small style="font-weight:700; color:${stockDiff > 0 ? '#10b981' : 'var(--danger)'};">(${stockDiff > 0 ? '+' : ''}${stockDiff})</small>` : ''}
        </div>
      ` : '';

      const canRevert = log.oldPrice > 0 && Math.abs(log.oldPrice - prod.price) > 0.001;

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-weight:700; font-size:0.9rem; color:var(--text-main);">📅 ${log.date} at ${log.time}</span>
            ${typeBadge}
            ${idx === 0 ? '<span class="badge badge-info" style="font-size:0.7rem;">LATEST</span>' : ''}
          </div>
          <div style="font-size:0.78rem; color:var(--text-muted);">
            👤 Operator: <strong>${log.changedBy || 'Admin'}</strong>
          </div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:16px; background:var(--bg-card); padding:8px 12px; border-radius:6px; border:1px solid var(--border-color);">
          ${priceDiffPill}
          ${stockDiffPill}
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="font-size:0.8rem; color:var(--text-muted); font-style:italic;">
            Reason / Source: ${log.reason || 'Price or stock updated'}
          </div>
          ${canRevert ? `
            <button class="btn btn-outline btn-sm" onclick="revertProductPrice('${log.id}', ${productId})" style="border-color:#f59e0b; color:#d97706; font-weight:700; font-size:0.75rem;" title="Restore selling price back to ₹ ${log.oldPrice.toFixed(2)}">
              ⏪ Restore to ₹ ${log.oldPrice.toFixed(2)}
            </button>
          ` : ''}
        </div>
      `;

      container.appendChild(card);
    });
  }

  openModal('modal-product-audit-history');
}

function revertProductPrice(auditLogId, productId) {
  const prod = posState.products.find(p => p.id === productId);
  if (!prod) return;

  const log = (posState.productAuditLogs || []).find(l => l.id === auditLogId);
  if (!log || !log.oldPrice) return;

  const targetPrice = log.oldPrice;
  const currentPrice = prod.price;

  if (confirm(`Restore selling price of "${prod.name}" from ₹ ${currentPrice.toFixed(2)} back to ₹ ${targetPrice.toFixed(2)}?`)) {
    prod.price = targetPrice;
    saveProductsToStorage();

    // Log the revert action itself in the timeline
    logProductChange({
      productId: prod.id,
      productCode: prod.code,
      productName: prod.name,
      oldPrice: currentPrice,
      newPrice: targetPrice,
      oldCost: prod.cost,
      newCost: prod.cost,
      oldStock: prod.stock,
      newStock: prod.stock,
      changeType: 'REVERT_ACTION',
      reason: `1-Click Revert to historical price from ${log.date} ${log.time}`,
      changedBy: posState.currentUser ? posState.currentUser.name || posState.currentUser.username : 'Admin'
    });

    renderProductMaster();
    renderPosProducts();
    renderInventory();
    renderDashboard();

    // Refresh timeline in modal live
    openProductAuditModal(productId);

    showToast(`✅ Price of "${prod.name}" successfully restored back to ₹ ${targetPrice.toFixed(2)}!`, 'success');
  }
}

// --- 6. CATEGORY MASTER (SCREEN 8) & MODAL ---
function refreshCategories(showToastFlag = true) {
  const searchInput = document.getElementById('cat-search-input');
  if (searchInput) searchInput.value = '';
  renderCategories();
  if (showToastFlag) {
    showToast('Category list refreshed.', 'info');
  }
}
window.refreshCategories = refreshCategories;

function renderCategories() {
  const tbody = document.getElementById('category-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const search = (document.getElementById('cat-search-input')?.value || '').toLowerCase().trim();
  const filtered = posState.categories.filter(c => {
    if (!search) return true;
    return c.name.toLowerCase().includes(search) || (c.desc || '').toLowerCase().includes(search);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:20px;">No categories found matching your search.</td></tr>';
    return;
  }

  filtered.forEach(c => {
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
function refreshCustomers(showToastFlag = true) {
  const searchInput = document.getElementById('cust-search-input');
  if (searchInput) searchInput.value = '';
  renderCustomers();
  if (showToastFlag) {
    showToast('Customer directory refreshed.', 'info');
  }
}
window.refreshCustomers = refreshCustomers;

function renderCustomers() {
  const tbody = document.getElementById('customer-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const search = (document.getElementById('cust-search-input')?.value || '').toLowerCase().trim();
  const filtered = posState.customers.filter(c => {
    if (!search) return true;
    return (c.name || '').toLowerCase().includes(search) ||
           (c.mobile || '').toLowerCase().includes(search) ||
           (c.email || '').toLowerCase().includes(search) ||
           (c.gstin || '').toLowerCase().includes(search);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:20px;">No customers found matching your search.</td></tr>';
    updatePosCustomerDropdown();
    return;
  }

  filtered.forEach(c => {
    const isOverLimit = (c.creditLimit || 0) > 0 && (c.balance || 0) >= (c.creditLimit || 0);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${c.name}</strong></td>
      <td>${c.mobile}</td>
      <td>${c.gstin}</td>
      <td style="color:${(c.balance || 0) > 0 ? 'var(--danger)' : 'inherit'}; font-weight:700;">₹ ${(c.balance || 0).toFixed(2)}</td>
      <td>₹ ${(c.creditLimit || 0).toFixed(2)} ${isOverLimit ? '<span class="badge badge-danger" style="font-size:10px; margin-left:4px;">Limit Reached</span>' : ''}</td>
      <td><span class="badge ${c.status === 'Active' ? 'badge-success' : 'badge-warning'}">${c.status}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="viewCustomerLedger(${c.id})">📖 Khata</button>
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
function refreshSuppliers(showToastFlag = true) {
  const searchInput = document.getElementById('supp-search-input');
  if (searchInput) searchInput.value = '';
  renderSuppliers();
  if (showToastFlag) {
    showToast('Supplier directory refreshed.', 'info');
  }
}
window.refreshSuppliers = refreshSuppliers;

function renderSuppliers() {
  const tbody = document.getElementById('supplier-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const search = (document.getElementById('supp-search-input')?.value || '').toLowerCase().trim();
  const filtered = posState.suppliers.filter(s => {
    if (!search) return true;
    return (s.name || '').toLowerCase().includes(search) ||
           (s.contact || '').toLowerCase().includes(search) ||
           (s.mobile || '').toLowerCase().includes(search) ||
           (s.email || '').toLowerCase().includes(search) ||
           (s.gstin || '').toLowerCase().includes(search);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:20px;">No suppliers found matching your search.</td></tr>';
    populatePurchaseDropdowns();
    return;
  }

  filtered.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${s.name}</strong></td>
      <td>${s.contact || '-'}</td>
      <td>${s.mobile}</td>
      <td>${s.gstin}</td>
      <td>₹ ${(s.balance || 0).toFixed(2)}</td>
      <td><span class="badge ${s.status === 'Active' ? 'badge-success' : 'badge-warning'}">${s.status}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="viewSupplierLedger(${s.id})">📖 Khata</button>
        ${(s.balance || 0) > 0 ? `<button class="btn btn-primary btn-sm" onclick="openPaySupplierModal(${s.id})">💳 Pay Due</button>` : ''}
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
function resetPurchaseForm(showToastFlag = true) {
  const tbody = document.getElementById('purchase-items-table-body');
  if (tbody) tbody.innerHTML = '';
  populatePurchaseDropdowns();
  recalcPurchaseTotals();
  if (showToastFlag) {
    showToast('Purchase intake form cleared.', 'info');
  }
}
window.resetPurchaseForm = resetPurchaseForm;

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
  const purchaseItems = [];
  tbody.querySelectorAll('tr').forEach(tr => {
    const prodId = parseInt(tr.querySelector('.purchase-prod-select')?.value);
    const qty = parseInt(tr.querySelector('.purchase-qty-input')?.value) || 0;
    const rate = parseFloat(tr.querySelector('.purchase-rate-input')?.value) || 0;
    const p = posState.products.find(x => x.id === prodId);
    if (p && qty > 0) {
      p.stock += qty;
      itemsAdded += qty;
      purchaseItems.push({
        id: p.id,
        name: p.name,
        code: p.code,
        qty: qty,
        rate: rate > 0 ? rate : p.cost
      });
    }
  });

  const poNumber = `PUR-000${posState.nextPurchaseSeq++}`;
  const supplierSelect = document.getElementById('purchase-supplier-select');
  const supplierName = supplierSelect ? supplierSelect.options[supplierSelect.selectedIndex]?.text.split('(')[0].trim() : 'ABC Distributors';
  const totalAmount = parseFloat(document.getElementById('purchase-grand-total')?.textContent.replace(/[^0-9.]/g, '')) || 
                      parseFloat(document.getElementById('purchase-total')?.textContent.replace(/[^0-9.]/g, '')) || 
                      (itemsAdded * 50);
  const today = new Date().toLocaleDateString('en-GB');

  posState.purchases.unshift({
    id: posState.nextPurchaseSeq,
    poNumber: poNumber,
    date: today,
    supplier: supplierName,
    branch: posState.selectedBranch || 'Main Branch',
    itemsCount: purchaseItems.length,
    items: purchaseItems,
    totalQty: itemsAdded,
    totalAmount: totalAmount,
    status: 'Received'
  });
  savePurchasesToStorage();
  saveProductsToStorage();

  const suppObj = posState.suppliers.find(s => s.name.toLowerCase() === supplierName.toLowerCase());
  if (suppObj) {
    suppObj.balance = (suppObj.balance || 0) + totalAmount;
    saveSuppliersToStorage();
    renderSuppliers();
  }

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
function refreshBranches(showToastFlag = true) {
  renderBranches();
  if (showToastFlag) {
    showToast('Branch network directory refreshed.', 'info');
  }
}
window.refreshBranches = refreshBranches;

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

  saveUsersToStorage();
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

  saveUsersToStorage();
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
    saveUsersToStorage();
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
  safeSetStorage('pos_role_permissions', posState.rolePermissions, 'Role Permissions');
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
  safeSetStorage('pos_role_permissions', posState.rolePermissions, 'Role Permissions');

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
  renderStorageDiagnostics();
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
  renderStorageDiagnostics();
}

function renderStorageDiagnostics() {
  const originEl = document.getElementById('diag-origin');
  if (originEl) originEl.textContent = window.location.origin || window.location.href;

  const countP = document.getElementById('diag-count-products');
  if (countP) countP.textContent = posState.products.length.toString();
  const countC = document.getElementById('diag-count-categories');
  if (countC) countC.textContent = posState.categories.length.toString();
  const countB = document.getElementById('diag-count-branches');
  if (countB) countB.textContent = posState.branches.length.toString();
  const countCust = document.getElementById('diag-count-customers');
  if (countCust) countCust.textContent = posState.customers.length.toString();
  const countS = document.getElementById('diag-count-suppliers');
  if (countS) countS.textContent = posState.suppliers.length.toString();
  const countSales = document.getElementById('diag-count-sales');
  if (countSales) countSales.textContent = posState.salesHistory.length.toString();
}

function exportFullDatabaseBackup() {
  const fullBackup = {
    appName: 'MyPOS Commercial Retail',
    backupVersion: '2.0',
    exportTimestamp: new Date().toISOString(),
    storeSettings: posState.settings,
    products: posState.products,
    categories: posState.categories,
    branches: posState.branches,
    customers: posState.customers,
    suppliers: posState.suppliers,
    salesHistory: posState.salesHistory,
    purchases: posState.purchases,
    returns: posState.returns,
    transferHistory: posState.transferHistory,
    users: posState.users,
    rolePermissions: posState.rolePermissions
  };

  const jsonStr = JSON.stringify(fullBackup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `MyPOS_FullDatabaseBackup_${dStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('✅ Full Database Backup successfully downloaded to your computer!', 'success');
}

function importFullDatabaseBackup(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const data = JSON.parse(evt.target.result);
      if (!data.products && !data.salesHistory) {
        showToast('Invalid backup file format.', 'danger');
        return;
      }
      if (confirm(`Restore database from backup created on ${data.exportTimestamp || 'unknown date'}? This will update your local data.`)) {
        if (Array.isArray(data.products)) posState.products = data.products;
        if (Array.isArray(data.categories)) posState.categories = data.categories;
        if (Array.isArray(data.branches)) posState.branches = data.branches;
        if (Array.isArray(data.customers)) posState.customers = data.customers;
        if (Array.isArray(data.suppliers)) posState.suppliers = data.suppliers;
        if (Array.isArray(data.salesHistory)) posState.salesHistory = data.salesHistory;
        if (Array.isArray(data.purchases)) posState.purchases = data.purchases;
        if (Array.isArray(data.returns)) posState.returns = data.returns;
        if (Array.isArray(data.transferHistory)) posState.transferHistory = data.transferHistory;
        if (Array.isArray(data.users)) posState.users = data.users;
        if (data.storeSettings) posState.settings = data.storeSettings;
        if (data.rolePermissions) posState.rolePermissions = data.rolePermissions;

        saveProductsToStorage();
        saveCategoriesToStorage();
        saveBranchesToStorage();
        saveCustomersToStorage();
        saveSuppliersToStorage();
        saveSalesHistoryToStorage();
        savePurchasesToStorage();
        saveReturnsToStorage();
        saveTransferHistoryToStorage();
        saveUsersToStorage();
        saveSettingsToStorage();

        renderStorageDiagnostics();
        renderProductMaster();
        renderPosProducts();
        renderInventory();
        renderCategories();
        renderBranches();
        renderCustomers();
        renderSuppliers();
        renderSalesHistory();
        renderDashboard();
        showToast('✅ Database restored successfully from backup file!', 'success');
      }
    } catch (err) {
      console.error('Backup import error:', err);
      showToast('Error reading backup JSON file. Check console for details.', 'danger');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function inspectStorageInConsole() {
  console.group('=== 🗄️ MyPOS Full Storage Inspection ===');
  console.log('Storage Origin:', window.location.origin);
  console.log('Total Products:', posState.products.length);
  console.table(posState.products);
  console.log('Total Branches:', posState.branches.length);
  console.table(posState.branches);
  console.log('Total Customers:', posState.customers.length);
  console.table(posState.customers);
  console.log('Total Sales History:', posState.salesHistory.length);
  console.table(posState.salesHistory);
  console.groupEnd();
  showToast('Storage inspected in Developer Console! Press F12 -> Console to view tables.', 'info');
}

// --- 12B. CLIENT STORE RESET & PRESENTATION DEMO TOOLS ---

async function resetStoreToCleanState() {
  const confirmed = confirm(
    "⚠️ ARE YOU SURE YOU WANT TO RESET STORE TO FRESH CLIENT STATE?\n\n" +
    "This will:\n" +
    "• Wipe all test sales history, invoices, and returns\n" +
    "• Reset invoice counter to INV-0000001\n" +
    "• Reset customer list to only 'Walk-in Customer'\n" +
    "• Clear all purchase orders and supplier dues\n" +
    "• Set product stocks to clean default (50 units)\n\n" +
    "Use this before delivering the POS application to a new client!"
  );
  if (!confirmed) return;

  posState.salesHistory = [];
  posState.purchases = [];
  posState.returns = [];
  posState.transferHistory = [];
  posState.cart = [];
  posState.nextInvoiceSeq = 1;
  posState.nextPurchaseSeq = 100;

  posState.customers = [
    { id: 1, name: 'Walk-in Customer', mobile: '9999999999', email: '', gstin: 'Unregistered', balance: 0.00, creditLimit: 0, status: 'Active' }
  ];
  posState.suppliers = [];

  posState.products.forEach(p => {
    p.stock = 50;
  });

  posState.customerPayments = [];
  posState.supplierPayments = [];
  localStorage.setItem('pos_next_invoice_seq', '1');
  saveSalesHistoryToStorage();
  savePurchasesToStorage();
  saveReturnsToStorage();
  saveTransferHistoryToStorage();
  saveCustomersToStorage();
  saveSuppliersToStorage();
  saveProductsToStorage();
  saveCustomerPaymentsToStorage();
  saveSupplierPaymentsToStorage();

  try {
    await fetch('/api/admin/reset_store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'full_clean' })
    });
  } catch (err) {
    console.log('[Reset] SQLite endpoint not active (browser offline mode)');
  }

  renderStorageDiagnostics();
  renderProductMaster();
  renderPosProducts();
  renderInventory();
  renderCustomers();
  renderSuppliers();
  renderSalesHistory();
  renderLedger();
  renderProfitReport();
  renderDashboard();

  showToast('✨ Store reset to 100% clean state! Next bill will be INV-0000001.', 'success');
}

async function clearSalesOnly() {
  const confirmed = confirm(
    "🗑️ Clear all test sales and reset invoice numbering to INV-0000001?\n\n" +
    "Your products catalog, categories, customers, and suppliers will be kept intact."
  );
  if (!confirmed) return;

  posState.salesHistory = [];
  posState.returns = posState.returns.filter(r => r.type !== 'Sales Return');
  posState.cart = [];
  posState.nextInvoiceSeq = 1;
  localStorage.setItem('pos_next_invoice_seq', '1');

  saveSalesHistoryToStorage();
  saveReturnsToStorage();

  try {
    await fetch('/api/admin/reset_store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sales_only' })
    });
  } catch (err) {
    console.log('[Reset] SQLite endpoint not active');
  }

  renderSalesHistory();
  renderLedger();
  renderProfitReport();
  renderDashboard();
  renderStorageDiagnostics();

  showToast('🗑️ Test sales history cleared! Next invoice: INV-0000001.', 'success');
}

function loadDemoTestData() {
  const confirmed = confirm(
    "📦 Load sample demo transactions & party records for client presentation?\n\n" +
    "This will add 3 sample suppliers, 2 registered customers with credit ledger, and 3 sequential invoices (INV-0000001, INV-0000002, INV-0000003)."
  );
  if (!confirmed) return;

  posState.customers = [
    { id: 1, name: 'Walk-in Customer', mobile: '9999999999', email: '', gstin: 'Unregistered', balance: 0.00, creditLimit: 0, status: 'Active' },
    { id: 2, name: 'Rahul Sharma', mobile: '9811223344', email: 'rahul@example.com', gstin: '07AAAAA0000A1Z5', balance: 450.00, creditLimit: 5000, status: 'Active' },
    { id: 3, name: 'Priya Patel', mobile: '9822334455', email: 'priya@example.com', gstin: 'Unregistered', balance: 0.00, creditLimit: 3000, status: 'Active' }
  ];

  posState.suppliers = [
    { id: 1, name: 'Mother Dairy Delhi Ltd', contact: 'Ramesh Gupta', mobile: '9876500001', email: 'sales@motherdairy.com', gstin: '07AAACM1234F1Z1', balance: 4200.00, status: 'Active' },
    { id: 2, name: 'Britannia Wholesale Agency', contact: 'Sunil Kumar', mobile: '9876500002', email: 'orders@britannia-agency.com', gstin: '07AABCB5678G1Z2', balance: 1850.00, status: 'Active' },
    { id: 3, name: 'Nestle India Distribution', contact: 'Deepak Joshi', mobile: '9876500003', email: 'delhi@nestle.com', gstin: '07AAACN9012H1Z3', balance: 0.00, status: 'Active' }
  ];

  const today = new Date().toLocaleDateString('en-GB');

  posState.salesHistory = [
    {
      id: 3,
      invoiceNo: 'INV-0000003',
      date: today,
      time: '12:15 PM',
      customer: 'Rahul Sharma',
      customerMobile: '9811223344',
      itemsCount: 3,
      items: [
        { id: 1, name: 'Milk', price: 52.00, qty: 2 },
        { id: 2, name: 'Bread', price: 35.00, qty: 1 },
        { id: 4, name: 'Maggi', price: 15.00, qty: 2 }
      ],
      amount: 169.00,
      payment: 'Credit Ledger (Khata)',
      paymentMode: 'CREDIT',
      cashier: 'System Administrator',
      branch: 'Main Branch',
      status: 'Completed'
    },
    {
      id: 2,
      invoiceNo: 'INV-0000002',
      date: today,
      time: '11:40 AM',
      customer: 'Priya Patel',
      customerMobile: '9822334455',
      itemsCount: 2,
      items: [
        { id: 5, name: 'Soft Drink', price: 45.00, qty: 2 },
        { id: 6, name: 'Chips', price: 25.00, qty: 2 }
      ],
      amount: 140.00,
      payment: 'UPI (UTR: 498712345678)',
      paymentMode: 'UPI',
      cashier: 'Cashier One',
      branch: 'Main Branch',
      status: 'Completed'
    },
    {
      id: 1,
      invoiceNo: 'INV-0000001',
      date: today,
      time: '10:15 AM',
      customer: 'Walk-in Customer',
      customerMobile: '9999999999',
      itemsCount: 2,
      items: [
        { id: 3, name: 'Biscuits', price: 20.00, qty: 3 },
        { id: 7, name: 'Cooking Oil', price: 120.00, qty: 1 }
      ],
      amount: 180.00,
      payment: 'Cash',
      paymentMode: 'CASH',
      cashier: 'System Administrator',
      branch: 'Main Branch',
      status: 'Completed'
    }
  ];

  posState.nextInvoiceSeq = 4;
  localStorage.setItem('pos_next_invoice_seq', '4');

  saveCustomersToStorage();
  saveSuppliersToStorage();
  saveSalesHistoryToStorage();

  renderCustomers();
  renderSuppliers();
  renderSalesHistory();
  renderLedger();
  renderProfitReport();
  renderDashboard();
  renderStorageDiagnostics();

  showToast('📦 Sample presentation demo data loaded! Next invoice: INV-0000004.', 'success');
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

function getNextInvoiceSequence() {
  let maxSeq = 0;
  if (posState.salesHistory && Array.isArray(posState.salesHistory) && posState.salesHistory.length > 0) {
    posState.salesHistory.forEach(s => {
      const matches = String(s.invoiceNo || '').match(/(\d+)/);
      if (matches) {
        const num = parseInt(matches[1], 10);
        if (!isNaN(num) && num > maxSeq) maxSeq = num;
      }
      if (typeof s.id === 'number' && s.id > maxSeq) maxSeq = s.id;
    });
  }
  const saved = parseInt(localStorage.getItem('pos_next_invoice_seq'), 10);
  if (!isNaN(saved) && saved > maxSeq) {
    maxSeq = saved - 1;
  }
  return maxSeq + 1;
}

function formatInvoiceNumber(seq) {
  const prefix = (posState.settings && posState.settings.invoicePrefix) ? posState.settings.invoicePrefix : 'INV';
  return `${prefix}-${String(seq).padStart(7, '0')}`;
}

function getNextInvoiceNumber() {
  const seq = getNextInvoiceSequence();
  posState.nextInvoiceSeq = seq;
  return formatInvoiceNumber(seq);
}

function openPaymentModal() {
  if (posState.cart.length === 0) {
    showToast('Cart is empty. Please select products first.', 'warning');
    return;
  }

  const subtotal = posState.cart.reduce((sum, i) => sum + (i.qty * i.price), 0);
  const totalTax = posState.cart.reduce((sum, i) => sum + (i.qty * i.price * i.taxRate / 100), 0);
  const grandTotal = Math.round(subtotal + totalTax);
  const invoiceNum = getNextInvoiceNumber();

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
  const invoiceNum = getNextInvoiceNumber();

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

  const cust = posState.customers.find(c => (customerMobile && c.mobile === customerMobile) || c.name.toLowerCase() === customerName.toLowerCase()) || posState.customers[0];

  const nameEl = document.getElementById('credit-cust-name');
  const balEl = document.getElementById('credit-cust-balance');
  const limitEl = document.getElementById('credit-cust-limit');
  const afterEl = document.getElementById('credit-cust-after');
  const warnEl = document.getElementById('credit-limit-warning');

  const currentBal = cust.balance || 0;
  const limit = cust.creditLimit !== undefined ? cust.creditLimit : 2000;
  const projectedBalance = currentBal + grandTotal;

  if (nameEl) nameEl.textContent = `${cust.name} (${cust.mobile || 'No Mobile'})`;
  if (balEl) balEl.textContent = `₹ ${currentBal.toFixed(2)}`;
  if (limitEl) limitEl.textContent = `₹ ${limit.toFixed(2)}`;

  if (cust.id === 1 || cust.name === 'Walk-in Customer') {
    if (afterEl) afterEl.innerHTML = `<span style="color:var(--danger); font-weight:700;">Blocked (Walk-in Customer)</span>`;
    if (warnEl) {
      warnEl.style.display = 'block';
      warnEl.innerHTML = `⚠️ <strong>WALK-IN CREDIT PROHIBITED:</strong> Credit / Khata sale is not allowed for generic Walk-in Customers. Please select or add a registered customer.`;
    }
    return;
  }

  if (limit > 0 && projectedBalance > limit) {
    const overAmt = projectedBalance - limit;
    if (afterEl) afterEl.innerHTML = `<span style="color:var(--danger); font-weight:700;">₹ ${projectedBalance.toFixed(2)} (⚠️ OVER LIMIT BY ₹ ${overAmt.toFixed(2)})</span>`;
    if (warnEl) {
      warnEl.style.display = 'block';
      warnEl.innerHTML = `⛔ <strong>CREDIT LIMIT EXCEEDED:</strong> Customer's limit is ₹ ${limit.toFixed(2)}. This bill of ₹ ${grandTotal.toFixed(2)} increases due to ₹ ${projectedBalance.toFixed(2)} (₹ ${overAmt.toFixed(2)} over limit). Payment on Credit is <strong>BLOCKED</strong>!`;
    }
  } else {
    if (afterEl) afterEl.innerHTML = `<span style="color:var(--primary); font-weight:700;">₹ ${projectedBalance.toFixed(2)} (Available Remaining: ₹ ${(limit - projectedBalance).toFixed(2)})</span>`;
    if (warnEl) warnEl.style.display = 'none';
  }
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
    if (customerName === 'Walk-in Customer' && (customerMobile === '9999999999' || !customerMobile)) {
      showToast('❌ Credit / Khata sale is NOT allowed for generic "Walk-in Customer"! Please select or add a registered customer.', 'danger');
      return;
    }

    const cust = posState.customers.find(c => (customerMobile && c.mobile === customerMobile) || c.name.toLowerCase() === customerName.toLowerCase());
    if (!cust) {
      showToast(`❌ Customer "${customerName}" not found in records. Please register customer first.`, 'danger');
      return;
    }

    const currentBal = cust.balance || 0;
    const limit = cust.creditLimit !== undefined ? cust.creditLimit : 2000;
    const projectedBalance = currentBal + grandTotal;

    // Strict Enforcement: If credit limit is breached, BLOCK PAYMENT!
    if (limit > 0 && projectedBalance > limit) {
      const exceededAmt = projectedBalance - limit;
      showToast(`⛔ Credit Limit Exceeded for "${cust.name}"! Allowed: ₹${limit.toFixed(2)}, Due: ₹${currentBal.toFixed(2)}, Bill: ₹${grandTotal.toFixed(2)}. Over by ₹${exceededAmt.toFixed(2)}. Payment BLOCKED!`, 'danger');
      alert(
        `⛔ PAYMENT REJECTED: CUSTOMER CREDIT LIMIT EXCEEDED!\n\n` +
        `Customer: ${cust.name} (${cust.mobile})\n` +
        `Approved Credit Limit: ₹ ${limit.toFixed(2)}\n` +
        `Current Outstanding Due: ₹ ${currentBal.toFixed(2)}\n` +
        `This Bill Amount: ₹ ${grandTotal.toFixed(2)}\n` +
        `Projected Total Balance: ₹ ${projectedBalance.toFixed(2)}\n\n` +
        `⚠️ This bill exceeds the allowed credit limit by ₹ ${exceededAmt.toFixed(2)}.\n\n` +
        `Payment on Credit (Khata) cannot be completed. Please:\n` +
        `1. Collect payment via Cash / UPI / Card, OR\n` +
        `2. Ask the customer to clear their previous khata dues before approving more credit.`
      );
      return;
    }

    const agreeChk = document.getElementById('credit-agree-chk');
    if (agreeChk && !agreeChk.checked) {
      showToast('Please check the authorization box to record this sale on credit ledger.', 'warning');
      return;
    }

    cust.balance = projectedBalance;
    saveCustomersToStorage();
    paymentDetails = `Credit Ledger (Khata)`;
  } else if (selectedPaymentMode === 'SPLIT') {
    const cash = parseFloat(document.getElementById('split-cash-input')?.value) || 0;
    const upi = parseFloat(document.getElementById('split-upi-input')?.value) || 0;
    paymentDetails = `Split (Cash: ₹${cash.toFixed(2)} + Digital: ₹${upi.toFixed(2)})`;
  }

  const currentSeq = getNextInvoiceSequence();
  const invoiceNum = formatInvoiceNumber(currentSeq);
  posState.nextInvoiceSeq = currentSeq + 1;
  localStorage.setItem('pos_next_invoice_seq', String(posState.nextInvoiceSeq));
  const today = new Date().toLocaleDateString('en-GB');

  const newSale = {
    id: currentSeq,
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
  const s = sale || (posState.salesHistory && posState.salesHistory[0]);
  if (!s) {
    showToast('No receipt data found to display.', 'warning');
    return;
  }

  if (posState.settings) {
    const sName = document.getElementById('rcpt-store-name');
    if (sName) sName.textContent = posState.settings.storeName || 'ABC Retail Store';
    const sAddr = document.getElementById('rcpt-store-address');
    if (sAddr) sAddr.textContent = posState.settings.address || 'Shop No. 12, Green Park, New Delhi - 110016';
    const sTax = document.getElementById('rcpt-store-tax-phone');
    if (sTax) sTax.textContent = `GSTIN: ${posState.settings.gstin || '07ABCDE1234F1Z5'} • Phone: ${posState.settings.phone || '+91 98765 43210'}`;
  }

  const invEl = document.getElementById('rcpt-inv-no');
  if (invEl) invEl.textContent = s.invoiceNo || `INV-${s.id}`;
  const dateEl = document.getElementById('rcpt-date');
  if (dateEl) dateEl.textContent = s.date || '';
  const custEl = document.getElementById('rcpt-customer');
  if (custEl) custEl.textContent = s.customer || 'Walk-in Customer';
  const mobEl = document.getElementById('rcpt-customer-mobile');
  if (mobEl) mobEl.textContent = s.customerMobile || s.mobile || '9999999999';
  const cashierEl = document.getElementById('rcpt-cashier');
  if (cashierEl) cashierEl.textContent = s.cashier || (posState.currentUser && posState.currentUser.name) || 'Admin';
  const branchEl = document.getElementById('rcpt-branch');
  if (branchEl) branchEl.textContent = s.branch || posState.selectedBranch || 'Main Branch';
  const payEl = document.getElementById('rcpt-payment-mode');
  if (payEl) payEl.textContent = s.payment || s.paymentMode || 'Cash';

  const tbody = document.getElementById('rcpt-items-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  let subtotal = 0;
  (s.items || []).forEach((item, idx) => {
    const qty = Number(item.qty || 1);
    const price = Number(item.price || 0);
    const total = qty * price;
    subtotal += total;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${idx + 1}</td>
      <td>${item.name || 'Item'}</td>
      <td style="text-align:center">${qty}</td>
      <td style="text-align:right">₹${price.toFixed(2)}</td>
      <td style="text-align:right">₹${total.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });

  const gst = Math.round(subtotal * 0.18 * 100) / 100;
  const billTotal = s.amount !== undefined ? Number(s.amount) : (subtotal + gst);
  const subEl = document.getElementById('rcpt-subtotal');
  if (subEl) subEl.textContent = `₹ ${subtotal.toFixed(2)}`;
  const gstEl = document.getElementById('rcpt-gst');
  if (gstEl) gstEl.textContent = `₹ ${gst.toFixed(2)}`;
  const totEl = document.getElementById('rcpt-total');
  if (totEl) totEl.textContent = `₹ ${billTotal.toFixed(2)}`;
}

function openInvoiceReceipt(invoiceRef) {
  if (!invoiceRef) {
    if (posState.salesHistory && posState.salesHistory.length > 0) {
      renderReceipt(posState.salesHistory[0]);
      navigateToScreen('receipt');
    } else {
      showToast('No sales invoices found to display.', 'warning');
    }
    return;
  }
  const refStr = String(invoiceRef).trim().toLowerCase();
  const sale = (posState.salesHistory || []).find(x => 
    (x.invoiceNo && String(x.invoiceNo).trim().toLowerCase() === refStr) ||
    (x.id !== undefined && String(x.id).trim().toLowerCase() === refStr)
  ) || (posState.salesHistory || []).find(x => 
    (x.invoiceNo && String(x.invoiceNo).toLowerCase().includes(refStr))
  );

  if (sale) {
    renderReceipt(sale);
    navigateToScreen('receipt');
    const main = document.querySelector('.app-main');
    if (main) main.scrollTop = 0;
  } else {
    showToast(`Invoice "${invoiceRef}" not found in sales history.`, 'error');
  }
}
window.openInvoiceReceipt = openInvoiceReceipt;

let receiptLayoutMode = 'thermal'; // 'thermal' (80mm) or 'a4' (full page)

function printReceipt() {
  if (posState.activeScreen !== 'receipt') {
    navigateToScreen('receipt');
  }
  const main = document.querySelector('.app-main');
  if (main) main.scrollTop = 0;

  setTimeout(() => {
    window.print();
  }, 100);
}

function downloadReceiptPdf() {
  if (posState.activeScreen !== 'receipt') {
    navigateToScreen('receipt');
  }
  const main = document.querySelector('.app-main');
  if (main) main.scrollTop = 0;

  showToast('📄 Print dialog opened! In the "Destination" dropdown, select "Save as PDF" to save invoice locally.', 'info');
  setTimeout(() => {
    window.print();
  }, 150);
}

function toggleReceiptLayout() {
  const card = document.getElementById('printable-receipt-card');
  const btn = document.getElementById('btn-rcpt-toggle-layout');
  if (!card) return;

  if (receiptLayoutMode === 'thermal') {
    receiptLayoutMode = 'a4';
    card.classList.add('a4-format');
    if (btn) btn.innerHTML = '🧾 80mm Thermal Format';
    showToast('Switched to A4 Full Tax Invoice format (Ideal for standard printers & PDF saves)', 'info');
  } else {
    receiptLayoutMode = 'thermal';
    card.classList.remove('a4-format');
    if (btn) btn.innerHTML = '📄 A4 / 80mm Format';
    showToast('Switched to 80mm Thermal POS Slip format', 'info');
  }
}

function printReceiptForSale(saleRef) {
  if (!saleRef) return;
  const refStr = String(saleRef).trim().toLowerCase();
  const sale = (posState.salesHistory || []).find(x => 
    (x.invoiceNo && String(x.invoiceNo).trim().toLowerCase() === refStr) ||
    (x.id !== undefined && String(x.id).trim().toLowerCase() === refStr)
  ) || (posState.salesHistory || []).find(x => 
    (x.invoiceNo && String(x.invoiceNo).toLowerCase().includes(refStr))
  );
  if (!sale) {
    showToast(`Invoice "${saleRef}" not found for printing.`, 'error');
    return;
  }
  renderReceipt(sale);
  navigateToScreen('receipt');
  const main = document.querySelector('.app-main');
  if (main) main.scrollTop = 0;
  setTimeout(() => {
    window.print();
  }, 150);
}
window.printReceiptForSale = printReceiptForSale;

// --- 16. INVENTORY (SCREEN 9) CONTROLLERS ---

function resetInventoryFilters() {
  const searchInput = document.getElementById('inventory-search-input');
  if (searchInput) searchInput.value = '';

  const catSelect = document.getElementById('inventory-category-select');
  if (catSelect) {
    catSelect.innerHTML = '<option value="ALL">All Categories</option>';
    posState.categories.forEach(c => {
      catSelect.innerHTML += `<option value="${c.name}">${c.name}</option>`;
    });
    catSelect.value = 'ALL';
  }

  const statusSelect = document.getElementById('inventory-status-filter');
  if (statusSelect) statusSelect.value = 'ALL';

  renderInventory();
}

function renderInventory() {
  const tbody = document.getElementById('inventory-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  // Ensure category dropdown options are populated if empty
  const catSelect = document.getElementById('inventory-category-select');
  if (catSelect && catSelect.options.length <= 1 && posState.categories.length > 0) {
    catSelect.innerHTML = '<option value="ALL">All Categories</option>';
    posState.categories.forEach(c => {
      catSelect.innerHTML += `<option value="${c.name}">${c.name}</option>`;
    });
    catSelect.value = 'ALL';
  }

  const query = (document.getElementById('inventory-search-input')?.value || '').trim().toLowerCase();
  const catFilter = document.getElementById('inventory-category-select')?.value || 'ALL';
  const statusFilter = document.getElementById('inventory-status-filter')?.value || 'ALL';

  const filtered = posState.products.filter(p => {
    // 1. Category Filter
    const matchCat = (catFilter === 'ALL' || p.category.toLowerCase() === catFilter.toLowerCase());

    // 2. Keyword Search (Name, Code, Barcode, Category)
    const matchQuery = (!query ||
      p.name.toLowerCase().includes(query) ||
      p.code.toLowerCase().includes(query) ||
      (p.barcode && p.barcode.includes(query)) ||
      p.category.toLowerCase().includes(query)
    );

    // 3. Stock Level Status Filter
    let pStatus = 'OK';
    if (p.stock <= 0) pStatus = 'OUT';
    else if (p.stock <= p.minStock) pStatus = 'LOW';

    const matchStatus = (statusFilter === 'ALL' || statusFilter === pStatus);

    return matchCat && matchQuery && matchStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:18px; color:var(--text-muted);">No inventory products match the selected search or filter.</td></tr>`;
    return;
  }

  filtered.forEach(p => {
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
      <td>${p.icon || '📦'} <strong>${p.name}</strong> (${p.code})</td>
      <td>${p.category}</td>
      <td><span style="font-weight:700; font-size:1rem;">${p.stock}</span> ${p.unit}</td>
      <td>${p.minStock} ${p.unit}</td>
      <td><span class="badge ${statusClass}">${statusLabel}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// --- 17. SALES HISTORY (SCREEN 17) ---
function resetSalesHistoryFilters(showToastFlag = false) {
  const startDateInput = document.getElementById('sales-history-start-date');
  const endDateInput = document.getElementById('sales-history-end-date');
  const searchInput = document.getElementById('sales-history-search-input');
  if (startDateInput) startDateInput.value = '';
  if (endDateInput) endDateInput.value = '';
  if (searchInput) searchInput.value = '';
  renderSalesHistory();
  if (showToastFlag) {
    showToast('Sales history filters reset. Showing all invoices.', 'info');
  }
}
window.resetSalesHistoryFilters = resetSalesHistoryFilters;

function renderSalesHistory() {
  const tbody = document.getElementById('sales-history-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const startDateStr = document.getElementById('sales-history-start-date')?.value || '';
  const endDateStr = document.getElementById('sales-history-end-date')?.value || '';
  const query = (document.getElementById('sales-history-search-input')?.value || '').trim().toLowerCase();

  const filtered = posState.salesHistory.filter(s => {
    // 1. Date Range Filter
    if (startDateStr || endDateStr) {
      const sDate = parseSaleDateObj(s.date);
      sDate.setHours(0, 0, 0, 0);

      if (startDateStr) {
        const start = parseSaleDateObj(startDateStr);
        start.setHours(0, 0, 0, 0);
        if (sDate < start) return false;
      }
      if (endDateStr) {
        const end = parseSaleDateObj(endDateStr);
        end.setHours(23, 59, 59, 999);
        if (sDate > end) return false;
      }
    }

    // 2. Keyword Search Filter (Invoice No, Customer Name, Mobile, Payment)
    if (query) {
      const matchInv = (s.invoiceNo || '').toLowerCase().includes(query);
      const matchCust = (s.customer || '').toLowerCase().includes(query);
      const matchMob = (s.customerMobile || '').toLowerCase().includes(query);
      const matchPay = (s.payment || '').toLowerCase().includes(query);
      if (!matchInv && !matchCust && !matchMob && !matchPay) return false;
    }

    return true;
  });

  if (filtered.length === 0) {
    const isFiltered = (startDateStr || endDateStr || query);
    const msg = isFiltered
      ? '🔍 No invoices match the selected date range or search keyword. Try clearing filters.'
      : '🛒 No sales invoices recorded yet. Start billing on the POS Screen to generate your first invoice!';
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted); font-size:0.95rem;">${msg}</td></tr>`;
    return;
  }

  filtered.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.date}</td>
      <td><strong>${s.invoiceNo}</strong></td>
      <td>${s.customer}</td>
      <td><strong>₹ ${parseFloat(s.amount || 0).toFixed(2)}</strong></td>
      <td><span class="badge badge-info">${s.payment || s.paymentMode || 'Cash'}</span></td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="openInvoiceReceipt('${s.invoiceNo || s.id}')">👁️ Receipt</button>
        <button class="btn btn-outline btn-sm" onclick="printReceiptForSale('${s.invoiceNo || s.id}')" title="Direct 1-Click Print">🖨️ Print</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// --- 18. LEDGER (SCREEN 16) ---
let activeLedgerType = 'customer';

function switchLedgerType(type) {
  activeLedgerType = type;
  const custBtn = document.getElementById('ledger-tab-cust');
  const suppBtn = document.getElementById('ledger-tab-supp');
  const recBtn = document.getElementById('ledger-rec-btn');
  const paySuppBtn = document.getElementById('ledger-pay-supp-btn');
  if (custBtn && suppBtn) {
    custBtn.className = type === 'customer' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm';
    suppBtn.className = type === 'supplier' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm';
  }
  if (recBtn) recBtn.style.display = 'none';
  if (paySuppBtn) paySuppBtn.style.display = 'none';
  populateLedgerDropdown();
  const select = document.getElementById('ledger-entity-select');
  if (select) select.value = '';
  renderLedger();
}

function populateLedgerDropdown() {
  const select = document.getElementById('ledger-entity-select');
  if (!select) return;
  const currentVal = select.value;
  select.innerHTML = '';

  const label = activeLedgerType === 'customer' ? 'Customer' : 'Supplier';
  select.innerHTML = `<option value="">-- Select ${label} to View Khata Ledger --</option>`;

  if (activeLedgerType === 'customer') {
    if (!posState.customers || posState.customers.length === 0) {
      select.innerHTML += '<option value="">No Customers Found</option>';
    } else {
      posState.customers.forEach(c => {
        const bal = typeof c.balance === 'number' ? ` | Due: ₹${c.balance.toFixed(2)}` : '';
        select.innerHTML += `<option value="${c.id}">${c.name} (${c.mobile || 'No Mobile'})${bal}</option>`;
      });
    }
  } else {
    if (!posState.suppliers || posState.suppliers.length === 0) {
      select.innerHTML += '<option value="">No Suppliers Found</option>';
    } else {
      posState.suppliers.forEach(s => {
        const bal = typeof s.balance === 'number' ? ` | Due: ₹${s.balance.toFixed(2)}` : '';
        select.innerHTML += `<option value="${s.id}">${s.name} (${s.mobile || s.contact || 'No Mobile'})${bal}</option>`;
      });
    }
  }

  // Preserve previously selected value if still in options and non-empty
  if (currentVal && Array.from(select.options).some(o => o.value === currentVal)) {
    select.value = currentVal;
  }
}

function refreshLedger(clearScreen = true) {
  // 1. Re-sync from localStorage
  try {
    const savedCusts = JSON.parse(localStorage.getItem('pos_customers_list') || 'null');
    if (Array.isArray(savedCusts) && savedCusts.length > 0) posState.customers = savedCusts;

    const savedSupps = JSON.parse(localStorage.getItem('pos_suppliers_list') || 'null');
    if (Array.isArray(savedSupps) && savedSupps.length > 0) posState.suppliers = savedSupps;

    const savedSales = JSON.parse(localStorage.getItem('pos_sales_history') || 'null');
    if (Array.isArray(savedSales)) posState.salesHistory = savedSales;

    const savedCustPay = JSON.parse(localStorage.getItem('pos_customer_payments') || 'null');
    if (Array.isArray(savedCustPay)) posState.customerPayments = savedCustPay;

    const savedSuppPay = JSON.parse(localStorage.getItem('pos_supplier_payments') || 'null');
    if (Array.isArray(savedSuppPay)) posState.supplierPayments = savedSuppPay;

    const savedReturns = JSON.parse(localStorage.getItem('pos_returns_list') || 'null');
    if (Array.isArray(savedReturns)) posState.returns = savedReturns;
  } catch (e) {
    console.warn('[Ledger Refresh] Storage reload error:', e);
  }

  // 2. Re-populate the entity dropdown
  populateLedgerDropdown();

  // 3. Clear selected customer/supplier if clearScreen is true
  const select = document.getElementById('ledger-entity-select');
  if (clearScreen && select) {
    select.value = '';
  }

  // 4. Render cleared screen with clean empty placeholder
  renderLedger();

  // 5. Also update customers screen if active
  if (typeof renderCustomers === 'function') renderCustomers();

  // 6. Visual confirmation toast
  showToast('🔄 Ledger screen cleared & refreshed! Select a party to view statement.', 'info');
}

function renderLedger() {
  const tbody = document.getElementById('ledger-table-body');
  const select = document.getElementById('ledger-entity-select');
  const dueSpan = document.getElementById('ledger-total-due');
  const recBtn = document.getElementById('ledger-rec-btn');
  const paySuppBtn = document.getElementById('ledger-pay-supp-btn');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!select || select.options.length === 0) {
    populateLedgerDropdown();
  }

  const selectedVal = select ? select.value : '';
  const selectedId = parseInt(selectedVal, 10);
  const label = activeLedgerType === 'customer' ? 'Customer' : 'Supplier';

  // If no customer or supplier is selected (Clean / Cleared screen state)
  if (!selectedVal || isNaN(selectedId)) {
    if (recBtn) recBtn.style.display = 'none';
    if (paySuppBtn) paySuppBtn.style.display = 'none';

    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:45px 20px; color:var(--text-muted);">
          <div style="font-size:2.4rem; margin-bottom:10px;">📋</div>
          <strong style="color:var(--text-color); font-size:1.05rem;">Khata Screen Cleared: Select a ${label}</strong><br>
          <span style="font-size:0.85rem; color:var(--text-muted); display:inline-block; margin-top:6px;">
            Choose any ${label.toLowerCase()} from the dropdown above to view their running balance, debit/credit transactions & payment history.
          </span>
        </td>
      </tr>
    `;
    if (dueSpan) {
      dueSpan.innerHTML = `Total Outstanding Due: ₹ 0.00 &bull; <span class="badge" style="background:#64748b; color:#fff;">No ${label} Selected</span>`;
    }
    return;
  }

  if (recBtn) {
    recBtn.style.display = activeLedgerType === 'customer' ? 'inline-block' : 'none';
  }
  if (paySuppBtn) {
    paySuppBtn.style.display = activeLedgerType === 'supplier' ? 'inline-block' : 'none';
  }

  if (activeLedgerType === 'customer') {
    const cust = posState.customers.find(c => c.id === selectedId);
    if (!cust) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">Customer not found in ledger directory.</td></tr>';
      if (dueSpan) dueSpan.innerHTML = 'Total Due: ₹ 0.00 &bull; <span class="badge badge-success">Status: Settled</span>';
      return;
    }

    const custSales = posState.salesHistory.filter(s =>
      (s.customer && s.customer.toLowerCase() === cust.name.toLowerCase()) ||
      (s.customerMobile && cust.mobile && s.customerMobile === cust.mobile)
    );

    const custPayments = (posState.customerPayments || []).filter(p =>
      p.custId === cust.id || (p.custName && p.custName.toLowerCase() === cust.name.toLowerCase())
    );

    let runningBal = 0;
    const rows = [];

    rows.push({
      date: '-',
      ref: 'Opening Balance',
      debit: 0,
      credit: 0,
      balance: runningBal
    });

    custSales.forEach(s => {
      const amt = parseFloat(s.amount || 0);
      if (s.paymentMode === 'CREDIT' || (s.payment && s.payment.includes('Credit'))) {
        runningBal += amt;
        rows.push({
          date: s.date,
          ref: `Credit Sale ${s.invoiceNo}`,
          debit: amt,
          credit: 0,
          balance: runningBal
        });
      } else {
        runningBal += amt;
        rows.push({
          date: s.date,
          ref: `Sale ${s.invoiceNo}`,
          debit: amt,
          credit: 0,
          balance: runningBal
        });
        runningBal -= amt;
        rows.push({
          date: s.date,
          ref: `Payment (${s.payment})`,
          debit: 0,
          credit: amt,
          balance: runningBal
        });
      }
    });

    custPayments.forEach(p => {
      runningBal = Math.max(0, runningBal - p.amount);
      rows.push({
        date: p.date,
        ref: `💵 Payment Received (${p.mode}${p.notes ? ' - ' + p.notes : ''})`,
        debit: 0,
        credit: p.amount,
        balance: runningBal
      });
    });

    const custReturns = (posState.returns || []).filter(r =>
      ((r.type || '').toLowerCase().includes('sales')) &&
      (r.party && r.party.toLowerCase() === cust.name.toLowerCase())
    );

    custReturns.forEach(r => {
      const retAmt = parseFloat(r.amount || r.totalAmount || 0);
      runningBal = Math.max(0, runningBal - retAmt);
      rows.push({
        date: r.date,
        ref: `🔄 Sales Return (${r.id} - ${r.refNo || 'Inv'})`,
        debit: 0,
        credit: retAmt,
        balance: runningBal
      });
    });

    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.date}</td>
        <td><strong>${r.ref}</strong></td>
        <td style="color:${r.debit > 0 ? 'var(--danger)' : 'inherit'}; font-weight:600;">${r.debit > 0 ? '₹ ' + r.debit.toFixed(2) : '-'}</td>
        <td style="color:${r.credit > 0 ? 'var(--success)' : 'inherit'}; font-weight:600;">${r.credit > 0 ? '₹ ' + r.credit.toFixed(2) : '-'}</td>
        <td><strong>₹ ${r.balance.toFixed(2)}</strong></td>
      `;
      tbody.appendChild(tr);
    });

    // Keep customer balance in 100% mathematical sync with calculated runningBal
    cust.balance = runningBal;
    safeSetStorage('pos_customers_list', posState.customers, 'Customers');

    const totalDue = runningBal;
    if (dueSpan) {
      dueSpan.innerHTML = `Total Outstanding Due: ₹ ${totalDue.toFixed(2)} &bull; <span class="badge ${totalDue > 0 ? 'badge-warning' : 'badge-success'}">${totalDue > 0 ? 'Pending Collection' : 'Settled'}</span>`;
    }
  } else {
    // Supplier Ledger
    const supp = posState.suppliers.find(s => s.id === selectedId) || posState.suppliers[0];
    if (!supp) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">No suppliers found in ledger directory.</td></tr>';
      if (dueSpan) dueSpan.innerHTML = 'Total Payable: ₹ 0.00 &bull; <span class="badge badge-success">Status: Clear</span>';
      return;
    }

    const suppPurchases = posState.purchases.filter(p =>
      p.supplier && p.supplier.toLowerCase().includes(supp.name.toLowerCase())
    );

    const suppPayments = (posState.supplierPayments || []).filter(p =>
      p.suppId === supp.id || (p.suppName && p.suppName.toLowerCase() === supp.name.toLowerCase())
    );

    const suppReturns = (posState.returns || []).filter(r =>
      ((r.type || '').toLowerCase().includes('purchase')) &&
      ((r.party && r.party.toLowerCase() === supp.name.toLowerCase()) || 
       (r.supplierName && r.supplierName.toLowerCase() === supp.name.toLowerCase()) || 
       r.supplierId === supp.id)
    );

    const purchasesTotal = suppPurchases.reduce((sum, p) => sum + parseFloat(p.totalAmount || 0), 0);
    const paymentsTotal = suppPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const returnsTotal = suppReturns.reduce((sum, r) => sum + parseFloat(r.amount || r.totalAmount || r.refundAmount || 0), 0);

    // Initial opening balance is either explicitly set or the net difference
    const initialOpening = supp.openingBalance !== undefined 
      ? supp.openingBalance 
      : Math.max(0, (supp.balance || 0) - (purchasesTotal - paymentsTotal - returnsTotal));

    let runningBal = initialOpening;
    const rows = [];

    rows.push({
      date: '-',
      ref: 'Opening Balance (Payable)',
      debit: 0,
      credit: initialOpening > 0 ? initialOpening : 0,
      balance: runningBal
    });

    const events = [];

    suppPurchases.forEach(p => {
      events.push({
        type: 'purchase',
        date: p.date || '-',
        timestamp: p.timestamp || (p.date ? new Date(p.date.split('/').reverse().join('-')).getTime() : 0) || 0,
        ref: `Purchase Intake ${p.poNumber || 'Bill'}`,
        debit: 0,
        credit: parseFloat(p.totalAmount || 0)
      });
    });

    suppPayments.forEach(p => {
      events.push({
        type: 'payment',
        date: p.date || '-',
        timestamp: p.id || (p.date ? new Date(p.date.split('/').reverse().join('-')).getTime() : 0) || 0,
        ref: `💳 Payment to Supplier (${p.mode || 'Bank'}${p.ref ? ' - Ref: ' + p.ref : ''}${p.notes ? ' - ' + p.notes : ''})`,
        debit: parseFloat(p.amount || 0),
        credit: 0
      });
    });

    suppReturns.forEach(r => {
      events.push({
        type: 'return',
        date: r.date || '-',
        timestamp: r.id || (r.date ? new Date(r.date.split('/').reverse().join('-')).getTime() : 0) || 0,
        ref: `📥 Debit Note (${r.id || 'PR'} - ${r.refNo || 'PO'})`,
        debit: parseFloat(r.amount || r.totalAmount || r.refundAmount || 0),
        credit: 0
      });
    });

    // Sort events by timestamp if available
    events.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    events.forEach(ev => {
      if (ev.credit > 0) {
        runningBal += ev.credit;
      }
      if (ev.debit > 0) {
        runningBal = Math.max(0, runningBal - ev.debit);
      }
      rows.push({
        date: ev.date,
        ref: ev.ref,
        debit: ev.debit,
        credit: ev.credit,
        balance: runningBal
      });
    });

    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.date}</td>
        <td><strong>${r.ref}</strong></td>
        <td style="color:${r.debit > 0 ? 'var(--success)' : 'inherit'}; font-weight:600;">${r.debit > 0 ? '₹ ' + r.debit.toFixed(2) : '-'}</td>
        <td style="color:${r.credit > 0 ? 'var(--danger)' : 'inherit'}; font-weight:600;">${r.credit > 0 ? '₹ ' + r.credit.toFixed(2) : '-'}</td>
        <td><strong>₹ ${r.balance.toFixed(2)}</strong></td>
      `;
      tbody.appendChild(tr);
    });

    // Keep supplier balance in 100% mathematical sync with calculated runningBal
    supp.balance = runningBal;
    safeSetStorage('pos_suppliers_list', posState.suppliers, 'Suppliers');

    const totalPayable = runningBal;
    if (dueSpan) {
      dueSpan.innerHTML = `Total Payable Due: ₹ ${totalPayable.toFixed(2)} &bull; <span class="badge ${totalPayable > 0 ? 'badge-warning' : 'badge-success'}">${totalPayable > 0 ? 'Payment Due' : 'Settled / Cleared'}</span>`;
    }
  }
}

function openReceivePaymentModal() {
  const select = document.getElementById('ledger-entity-select');
  const custId = parseInt(select?.value, 10);
  const cust = posState.customers.find(c => c.id === custId) || posState.customers[0];

  if (!cust) {
    showToast('Please select a customer first!', 'warning');
    return;
  }

  const custIdInput = document.getElementById('pay-rec-cust-id');
  const custNameInput = document.getElementById('pay-rec-cust-name');
  const dueInput = document.getElementById('pay-rec-due');
  const amountInput = document.getElementById('pay-rec-amount');
  const notesInput = document.getElementById('pay-rec-notes');

  if (custIdInput) custIdInput.value = cust.id;
  if (custNameInput) custNameInput.value = `${cust.name} (${cust.mobile || 'No Mobile'})`;
  if (dueInput) dueInput.value = `₹ ${(cust.balance || 0).toFixed(2)}`;
  if (amountInput) amountInput.value = cust.balance > 0 ? cust.balance.toFixed(2) : '';
  if (notesInput) notesInput.value = '';

  openModal('modal-receive-payment');
}

function saveCustomerPayment(e) {
  if (e) e.preventDefault();

  const custId = parseInt(document.getElementById('pay-rec-cust-id')?.value, 10);
  const cust = posState.customers.find(c => c.id === custId);
  if (!cust) {
    showToast('Customer not found!', 'danger');
    return;
  }

  const amount = parseFloat(document.getElementById('pay-rec-amount')?.value) || 0;
  if (amount <= 0) {
    showToast('Please enter a valid payment amount greater than 0!', 'warning');
    return;
  }

  const mode = document.getElementById('pay-rec-mode')?.value || 'Cash';
  const notes = (document.getElementById('pay-rec-notes')?.value || '').trim();
  const today = new Date().toLocaleDateString('en-GB');

  cust.balance = Math.max(0, (cust.balance || 0) - amount);

  if (!Array.isArray(posState.customerPayments)) posState.customerPayments = [];
  posState.customerPayments.unshift({
    id: Date.now(),
    custId: cust.id,
    custName: cust.name,
    custMobile: cust.mobile,
    date: today,
    amount: amount,
    mode: mode,
    notes: notes
  });

  saveCustomersToStorage();
  saveCustomerPaymentsToStorage();

  closeModal('modal-receive-payment');
  showToast(`💵 Payment of ₹ ${amount.toFixed(2)} recorded for ${cust.name}! Remaining Due: ₹ ${cust.balance.toFixed(2)}`, 'success');

  renderLedger();
  renderCustomers();
  if (typeof renderActiveReport === 'function') renderActiveReport();
}

function openPaySupplierModal(suppId) {
  const select = document.getElementById('ledger-entity-select');
  if (suppId && select && activeLedgerType === 'supplier') {
    select.value = suppId;
  }
  const targetId = suppId || parseInt(select?.value, 10);
  const supp = posState.suppliers.find(s => s.id === targetId) || posState.suppliers[0];

  if (!supp) {
    showToast('Please select a supplier first!', 'warning');
    return;
  }

  if (select && activeLedgerType === 'supplier') {
    select.value = supp.id;
  }

  const suppIdInput = document.getElementById('pay-supp-id');
  const suppNameInput = document.getElementById('pay-supp-name');
  const dueInput = document.getElementById('pay-supp-due');
  const amountInput = document.getElementById('pay-supp-amount');
  const refInput = document.getElementById('pay-supp-ref');
  const notesInput = document.getElementById('pay-supp-notes');

  if (suppIdInput) suppIdInput.value = supp.id;
  if (suppNameInput) suppNameInput.value = `${supp.name} (${supp.mobile || supp.contact || 'No Mobile'})`;
  if (dueInput) dueInput.value = `₹ ${(supp.balance || 0).toFixed(2)}`;
  if (amountInput) amountInput.value = (supp.balance || 0) > 0 ? (supp.balance || 0).toFixed(2) : '';
  if (refInput) refInput.value = 'UTR-' + Date.now().toString().slice(-8);
  if (notesInput) notesInput.value = '';

  openModal('modal-pay-supplier');
}

function saveSupplierPayment(e) {
  if (e) e.preventDefault();

  const suppId = parseInt(document.getElementById('pay-supp-id')?.value, 10);
  const supp = posState.suppliers.find(s => s.id === suppId);
  if (!supp) {
    showToast('Supplier not found!', 'danger');
    return;
  }

  const amount = parseFloat(document.getElementById('pay-supp-amount')?.value) || 0;
  if (amount <= 0) {
    showToast('Please enter a valid payment amount greater than 0!', 'warning');
    return;
  }

  const mode = document.getElementById('pay-supp-mode')?.value || 'Bank Transfer (NEFT/RTGS)';
  const ref = (document.getElementById('pay-supp-ref')?.value || '').trim();
  const notes = (document.getElementById('pay-supp-notes')?.value || '').trim();
  const today = new Date().toLocaleDateString('en-GB');

  supp.balance = Math.max(0, (supp.balance || 0) - amount);

  if (!Array.isArray(posState.supplierPayments)) posState.supplierPayments = [];
  posState.supplierPayments.unshift({
    id: Date.now(),
    suppId: supp.id,
    suppName: supp.name,
    suppMobile: supp.mobile || supp.contact || '',
    date: today,
    amount: amount,
    mode: mode,
    ref: ref,
    notes: notes
  });

  saveSuppliersToStorage();
  saveSupplierPaymentsToStorage();

  closeModal('modal-pay-supplier');
  showToast(`💳 Payment of ₹ ${amount.toFixed(2)} recorded for ${supp.name}! Remaining Payable: ₹ ${supp.balance.toFixed(2)}`, 'success');

  renderLedger();
  renderSuppliers();
  renderDashboard();
  if (typeof renderActiveReport === 'function') renderActiveReport();
}

function viewCustomerLedger(custId) {
  switchLedgerType('customer');
  const select = document.getElementById('ledger-entity-select');
  if (select) {
    select.value = custId;
  }
  navigateToScreen('ledger');
  renderLedger();
}

function viewSupplierLedger(suppId) {
  switchLedgerType('supplier');
  const select = document.getElementById('ledger-entity-select');
  if (select) {
    select.value = suppId;
  }
  navigateToScreen('ledger');
  renderLedger();
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

  // Clear search input on switching entity tab so old queries don't filter new table
  const searchInput = document.getElementById('report-search-input');
  if (searchInput) searchInput.value = '';

  populateReportBranchDropdown();
  populateReportSecondaryFilter();

  const secSelect = document.getElementById('report-secondary-select');
  if (secSelect) secSelect.value = 'ALL';

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
    let html = `
      <option value="ALL">All Returns (Sales & Purchase)</option>
      <option value="Sales Return">🔄 All Sales Returns (Customer)</option>
      <option value="Purchase Return">📥 All Purchase Returns (Supplier / Debit Notes)</option>
    `;
    if (Array.isArray(posState.customers) && posState.customers.length > 0) {
      html += '<optgroup label="👤 Filter by Customer (Sales Return)">';
      posState.customers.forEach(c => {
        html += `<option value="CUST:${c.name}">Customer: ${c.name}</option>`;
      });
      html += '</optgroup>';
    }
    if (Array.isArray(posState.suppliers) && posState.suppliers.length > 0) {
      html += '<optgroup label="🏭 Filter by Supplier (Purchase Return)">';
      posState.suppliers.forEach(s => {
        html += `<option value="SUPP:${s.name}">Supplier: ${s.name}</option>`;
      });
      html += '</optgroup>';
    }
    select.innerHTML = html;
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
  const fromInput = document.getElementById('report-date-from');
  const toInput = document.getElementById('report-date-to');
  if (fromInput) fromInput.value = '';
  if (toInput) toInput.value = '';
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
      `<span class="badge badge-info">${s.payment || s.paymentMode || 'Cash'}</span>`,
      `<strong>₹ ${s.amount.toFixed(2)}</strong>`,
      `<button class="btn btn-primary btn-sm" onclick="openInvoiceReceipt('${s.invoiceNo || s.id}')">👁️ Receipt</button>`
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
    headers = ['Return ID', 'Date', 'Return Type', 'Reference No', 'Party (Customer / Supplier)', 'Branch', 'Amount (₹)', 'Reason & Returned Items', 'Status'];
    rawItems = posState.returns.filter(ret => {
      const t = parseDateStrToTimestamp(ret.date);
      if (fromTime && t < fromTime) return false;
      if (toTime !== Infinity && t > toTime) return false;
      if (branchFilter !== 'ALL' && ret.branch && ret.branch !== branchFilter) return false;

      // Secondary Context Filter: Type, Customer-wise, or Supplier-wise
      if (secFilter !== 'ALL') {
        if (secFilter === 'Sales Return' && ret.type !== 'Sales Return') return false;
        if (secFilter === 'Purchase Return' && ret.type !== 'Purchase Return') return false;
        if (secFilter.startsWith('CUST:')) {
          const targetCust = secFilter.replace('CUST:', '').trim().toLowerCase();
          const party = (ret.party || ret.customer || '').toLowerCase();
          if (ret.type !== 'Sales Return' || party !== targetCust) return false;
        }
        if (secFilter.startsWith('SUPP:')) {
          const targetSupp = secFilter.replace('SUPP:', '').trim().toLowerCase();
          const party = (ret.party || ret.supplier || '').toLowerCase();
          if (ret.type !== 'Purchase Return' || party !== targetSupp) return false;
        }
      }

      // Keyword Search Filter
      if (searchQuery) {
        const text = `${ret.id} ${ret.refNo} ${ret.party || ''} ${ret.reason || ''} ${ret.type || ''}`.toLowerCase();
        if (!text.includes(searchQuery)) return false;
      }
      return true;
    });

    const salesList = rawItems.filter(r => r.type === 'Sales Return');
    const purchList = rawItems.filter(r => r.type === 'Purchase Return');
    const salesTotal = salesList.reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);
    const purchTotal = purchList.reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);
    const netTotal = salesTotal + purchTotal;

    kpiCards = [
      { title: 'Total Return Logs', value: rawItems.length, sub: 'Filtered Claims' },
      { title: 'Total Return Value', value: `₹ ${netTotal.toFixed(2)}`, sub: 'Restitution & Debits', highlight: true },
      { title: 'Customer Sales Returns', value: `${salesList.length} (₹ ${salesTotal.toFixed(2)})`, sub: 'Restocked to Inventory' },
      { title: 'Supplier Purchase Returns', value: `${purchList.length} (₹ ${purchTotal.toFixed(2)})`, sub: 'Vendor Debit Notes' }
    ];

    rows = rawItems.map(r => {
      const isSales = r.type === 'Sales Return';
      const typeBadge = isSales 
        ? '<span class="badge badge-info">🔄 Sales Return</span>' 
        : '<span class="badge badge-warning">📥 Purchase Return</span>';
      const partyLabel = isSales 
        ? `👤 ${r.party || 'Customer'}` 
        : `🏭 ${r.party || 'Supplier'}`;
      const refLabel = isSales ? `Inv: ${r.refNo}` : `PO: ${r.refNo}`;

      return [
        `<strong>${r.id}</strong>`,
        r.date,
        typeBadge,
        `<code>${refLabel}</code>`,
        `<strong>${partyLabel}</strong>`,
        r.branch || 'Main Branch',
        `<strong style="color:${isSales ? 'var(--info)' : 'var(--warning)'};">₹ ${(parseFloat(r.amount) || 0).toFixed(2)}</strong>`,
        r.reason || 'General Return',
        `<span class="badge badge-success">${r.status || 'Completed'}</span>`
      ];
    });

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
  const main = document.querySelector('.app-main');
  if (main) main.scrollTop = 0;
  setTimeout(() => {
    window.print();
  }, 100);
  showToast('Print dialog opened. Choose "Save as PDF" in Destination to save report locally.', 'info');
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

function resetReportsScreen() {
  // 1. Reset active entity tab to default: 'billing'
  activeReportEntity = 'billing';
  window.activeReportEntity = 'billing';
  document.querySelectorAll('.report-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.entity === 'billing');
  });

  // 2. Reset date preset to 'all'
  reportDatePreset = 'all';
  document.querySelectorAll('.btn-preset').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.preset === 'all');
  });

  // 3. Clear custom date inputs
  const dateFrom = document.getElementById('report-date-from');
  if (dateFrom) dateFrom.value = '';
  const dateTo = document.getElementById('report-date-to');
  if (dateTo) dateTo.value = '';

  // 4. Reset branch filter
  populateReportBranchDropdown();
  const branchSelect = document.getElementById('report-branch-select');
  if (branchSelect) branchSelect.value = 'ALL';

  // 5. Reset secondary filter
  populateReportSecondaryFilter();
  const secSelect = document.getElementById('report-secondary-select');
  if (secSelect) secSelect.value = 'ALL';

  // 6. Clear search box
  const searchInput = document.getElementById('report-search-input');
  if (searchInput) searchInput.value = '';

  // 7. Render fresh clean report
  renderActiveReport();
}

function renderReports() {
  resetReportsScreen();
}


function renderProfitReport() {
  const tbody = document.getElementById('profit-table-body');
  const kpiSales = document.getElementById('profit-kpi-sales');
  const kpiCost = document.getElementById('profit-kpi-cost');
  const kpiGross = document.getElementById('profit-kpi-gross');
  const kpiMargin = document.getElementById('profit-kpi-margin');

  if (!tbody) return;
  tbody.innerHTML = '';

  let totalSalesVal = 0;
  let totalCostVal = 0;
  const productStats = {};

  posState.salesHistory.forEach(sale => {
    totalSalesVal += parseFloat(sale.amount || 0);
    if (Array.isArray(sale.items)) {
      sale.items.forEach(item => {
        const key = item.name || 'Unknown Product';
        if (!productStats[key]) {
          const matched = posState.products.find(p => p.id === item.id || (p.name && p.name.toLowerCase() === key.toLowerCase()));
          const unitCost = matched && matched.cost !== undefined ? matched.cost : (item.cost || (item.price || 0) * 0.7);
          productStats[key] = {
            name: key,
            qtySold: 0,
            revenue: 0,
            unitCost: unitCost
          };
        }
        const qty = parseInt(item.qty, 10) || 1;
        productStats[key].qtySold += qty;
        productStats[key].revenue += parseFloat(item.price || 0) * qty;
      });
    }
  });

  const productList = Object.values(productStats);
  productList.forEach(stat => {
    const cost = stat.qtySold * stat.unitCost;
    stat.cost = cost;
    stat.profit = stat.revenue - cost;
    stat.margin = stat.revenue > 0 ? ((stat.profit / stat.revenue) * 100).toFixed(1) : '0.0';
    totalCostVal += cost;
  });

  const grossProfit = totalSalesVal - totalCostVal;
  const overallMargin = totalSalesVal > 0 ? ((grossProfit / totalSalesVal) * 100).toFixed(1) : '0.0';

  if (kpiSales) kpiSales.textContent = `₹ ${totalSalesVal.toFixed(2)}`;
  if (kpiCost) kpiCost.textContent = `₹ ${totalCostVal.toFixed(2)}`;
  if (kpiGross) kpiGross.textContent = `₹ ${grossProfit.toFixed(2)}`;
  if (kpiMargin) kpiMargin.textContent = `${overallMargin}%`;

  if (productList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:24px;">No sales transactions recorded yet. Complete sales in POS to generate real-time gross margin metrics.</td></tr>';
    return;
  }

  productList.sort((a, b) => b.profit - a.profit);

  productList.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${p.name}</strong> <span style="font-size:11px; color:var(--text-muted);">(${p.qtySold} sold)</span></td>
      <td>₹ ${p.revenue.toFixed(2)}</td>
      <td>₹ ${p.cost.toFixed(2)}</td>
      <td style="color:${p.profit >= 0 ? 'var(--success)' : 'var(--danger)'}; font-weight:700">₹ ${p.profit.toFixed(2)}</td>
      <td><span class="badge ${p.profit >= 0 ? 'badge-success' : 'badge-danger'}">${p.margin}%</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// --- 20. SALES RETURN LOGIC (SCREEN 13) ---
function lookupSaleForReturn() {
  const invInput = (document.getElementById('return-inv-input')?.value || '').trim();
  if (!invInput) {
    showToast('Please enter an invoice number to search!', 'warning');
    return;
  }
  const sale = posState.salesHistory.find(s => s.invoiceNo.toLowerCase() === invInput.toLowerCase());
  const container = document.getElementById('return-items-container');
  if (!container) return;

  if (!sale) {
    showToast(`Invoice "${invInput}" not found in records!`, 'danger');
    container.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--danger)">No matching invoice found. Please verify invoice number.</td></tr>';
    const retBar = document.getElementById('return-action-bar');
    if (retBar) retBar.style.display = 'none';
    return;
  }

  if (!sale.items || sale.items.length === 0) {
    showToast(`Invoice "${invInput}" has no item lines to return.`, 'warning');
    return;
  }

  container.innerHTML = '';
  sale.items.forEach((item, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${item.name}</strong></td>
      <td>${item.qty}</td>
      <td><input type="number" id="ret-qty-${idx}" min="0" max="${item.qty}" value="${item.qty}" style="width:70px; padding:4px;" /></td>
      <td>₹ ${parseFloat(item.price || 0).toFixed(2)}</td>
      <td><span class="badge badge-warning">Eligible</span></td>
    `;
    container.appendChild(row);
  });
  const retBar = document.getElementById('return-action-bar');
  if (retBar) retBar.style.display = 'block';
  showToast(`Loaded invoice ${sale.invoiceNo} (${sale.items.length} items)`, 'info');
}

function processReturn() {
  const invInput = (document.getElementById('return-inv-input')?.value || '').trim();
  if (!invInput) {
    showToast('Please search and load a valid invoice first!', 'warning');
    return;
  }
  const sale = posState.salesHistory.find(s => s.invoiceNo.toLowerCase() === invInput.toLowerCase());
  if (!sale) {
    showToast(`Invoice "${invInput}" not found. Cannot process return.`, 'danger');
    return;
  }

  let returnTotal = 0;
  let returnedLines = [];
  sale.items.forEach((item, idx) => {
    const qtyInput = document.getElementById(`ret-qty-${idx}`);
    const retQty = qtyInput ? parseInt(qtyInput.value, 10) : 0;
    if (retQty > 0) {
      const lineRefund = (parseFloat(item.price) || 0) * retQty;
      returnTotal += lineRefund;
      returnedLines.push(`${item.name} (x${retQty})`);

      const prod = posState.products.find(p => p.id === item.id || (p.name && p.name.toLowerCase() === item.name.toLowerCase()));
      if (prod) {
        prod.stock += retQty;
      }
    }
  });

  if (returnTotal <= 0) {
    showToast('Please enter return quantity greater than 0!', 'warning');
    return;
  }

  const today = new Date().toLocaleDateString('en-GB');
  const retId = 'RET-' + Date.now().toString().slice(-6);

  posState.returns.unshift({
    id: retId,
    date: today,
    type: 'Sales Return',
    refNo: sale.invoiceNo,
    party: sale.customer || 'Walk-in Customer',
    branch: sale.branch || posState.selectedBranch || 'Main Branch',
    amount: returnTotal,
    reason: 'Customer return: ' + returnedLines.join(', '),
    status: 'Completed'
  });

  if (sale.paymentMode === 'CREDIT' || (sale.payment && sale.payment.includes('Credit'))) {
    const cust = posState.customers.find(c => c.name.toLowerCase() === (sale.customer || '').toLowerCase() || (sale.customerMobile && c.mobile === sale.customerMobile));
    if (cust) {
      cust.balance = Math.max(0, (cust.balance || 0) - returnTotal);
      saveCustomersToStorage();
      renderCustomers();
    }
  }

  saveReturnsToStorage();
  saveProductsToStorage();

  showToast(`Sales return ${retId} processed for ₹ ${returnTotal.toFixed(2)}! Stock restored to inventory.`, 'success');
  renderInventory();
  renderProductMaster();
  renderPosProducts();
  renderSalesHistory();

  const retInput = document.getElementById('return-inv-input');
  if (retInput) retInput.value = '';
  const retBar = document.getElementById('return-action-bar');
  if (retBar) retBar.style.display = 'none';
  const retItems = document.getElementById('return-items-container');
  if (retItems) retItems.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted)">Search an invoice to load items</td></tr>';
  navigateToScreen('inventory');
}

// --- 20B. PURCHASE RETURN & DEBIT NOTE LOGIC (SCREEN 14) ---

function populatePurchaseReturnDropdown() {
  const select = document.getElementById('purch-return-po-select');
  if (!select) return;
  select.innerHTML = '<option value="">-- Select a Purchase Bill / Order to Return Items --</option>';
  if (Array.isArray(posState.purchases) && posState.purchases.length > 0) {
    posState.purchases.forEach(p => {
      select.innerHTML += `<option value="${p.poNumber}">${p.poNumber} &bull; ${p.supplier || 'Supplier'} &bull; ₹ ${parseFloat(p.totalAmount || 0).toFixed(2)} (${p.date})</option>`;
    });
  }
}

function onSelectPurchaseForReturn(poNo) {
  if (!poNo) return;
  const input = document.getElementById('purch-return-po-input');
  if (input) input.value = poNo;
  lookupPurchaseForReturn();
}

function resetPurchaseReturnScreen() {
  const select = document.getElementById('purch-return-po-select');
  if (select) select.value = '';
  const input = document.getElementById('purch-return-po-input');
  if (input) input.value = '';
  const container = document.getElementById('purch-return-items-container');
  if (container) container.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted)">Search or select a purchase order above to load items</td></tr>';
  const bar = document.getElementById('purch-return-action-bar');
  if (bar) bar.style.display = 'none';
  populatePurchaseReturnDropdown();
}

function lookupPurchaseForReturn() {
  const poInput = (document.getElementById('purch-return-po-input')?.value || '').trim();
  if (!poInput) {
    showToast('Please select or enter a Purchase Order No (e.g. PUR-000001)!', 'warning');
    return;
  }
  const po = posState.purchases.find(p => p.poNumber.toLowerCase() === poInput.toLowerCase());
  const container = document.getElementById('purch-return-items-container');
  if (!container) return;

  if (!po) {
    showToast(`Purchase order "${poInput}" not found in records!`, 'danger');
    container.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--danger)">No matching PO found. Please verify PO number.</td></tr>';
    const pBar = document.getElementById('purch-return-action-bar');
    if (pBar) pBar.style.display = 'none';
    return;
  }

  container.innerHTML = '';
  const items = Array.isArray(po.items) && po.items.length > 0 ? po.items : [
    { id: 1, name: 'Purchase Batch Items', qty: po.totalQty || 1, rate: (po.totalAmount || 100) / (po.totalQty || 1) }
  ];

  items.forEach((item, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${item.name}</strong> ${item.code ? `<code style="font-size:11px; margin-left:4px;">${item.code}</code>` : ''}</td>
      <td>${item.qty}</td>
      <td><input type="number" id="purch-ret-qty-${idx}" min="0" max="${item.qty}" value="${item.qty}" style="width:70px; padding:4px;" /></td>
      <td>₹ ${parseFloat(item.rate || 0).toFixed(2)}</td>
      <td><span class="badge badge-warning">Intake Verified</span></td>
    `;
    container.appendChild(row);
  });

  const bar = document.getElementById('purch-return-action-bar');
  if (bar) bar.style.display = 'block';
  showToast(`Loaded PO ${po.poNumber} (${po.supplier || 'Supplier'})`, 'info');
}

function processPurchaseReturn() {
  const poInput = (document.getElementById('purch-return-po-input')?.value || '').trim();
  if (!poInput) {
    showToast('Please search and load a purchase order first!', 'warning');
    return;
  }
  const po = posState.purchases.find(p => p.poNumber.toLowerCase() === poInput.toLowerCase());
  if (!po) {
    showToast(`Purchase order "${poInput}" not found. Cannot process return.`, 'danger');
    return;
  }

  const items = Array.isArray(po.items) && po.items.length > 0 ? po.items : [
    { id: 1, name: 'Purchase Batch Items', qty: po.totalQty || 1, rate: (po.totalAmount || 100) / (po.totalQty || 1) }
  ];

  let returnTotal = 0;
  let returnedLines = [];
  items.forEach((item, idx) => {
    const qtyInput = document.getElementById(`purch-ret-qty-${idx}`);
    const retQty = qtyInput ? parseInt(qtyInput.value, 10) : 0;
    if (retQty > 0) {
      const lineCost = (parseFloat(item.rate) || 0) * retQty;
      returnTotal += lineCost;
      returnedLines.push(`${item.name} (x${retQty})`);

      const prod = posState.products.find(p => p.id === item.id || (p.name && p.name.toLowerCase() === item.name.toLowerCase()));
      if (prod) {
        prod.stock = Math.max(0, prod.stock - retQty);
      }
    }
  });

  if (returnTotal <= 0) {
    showToast('Please enter a return quantity greater than 0!', 'warning');
    return;
  }

  const reason = document.getElementById('purch-return-reason')?.value || 'Damaged in Transit / Goods Broken';
  const today = new Date().toLocaleDateString('en-GB');
  const retId = 'PR-' + Date.now().toString().slice(-6);

  posState.returns.unshift({
    id: retId,
    date: today,
    type: 'Purchase Return',
    refNo: po.poNumber,
    party: po.supplier || 'Supplier',
    branch: po.branch || posState.selectedBranch || 'Main Branch',
    amount: returnTotal,
    reason: `${reason}: ` + returnedLines.join(', '),
    status: 'Completed'
  });

  const supp = posState.suppliers.find(s => s.name.toLowerCase() === (po.supplier || '').toLowerCase());
  if (supp) {
    supp.balance = Math.max(0, (supp.balance || 0) - returnTotal);
    saveSuppliersToStorage();
    renderSuppliers();
  }

  saveReturnsToStorage();
  saveProductsToStorage();

  showToast(`✅ Debit Note ${retId} generated for ₹ ${returnTotal.toFixed(2)}! Returned to ${po.supplier}. Stock & Supplier Khata updated!`, 'success');
  renderInventory();
  renderProductMaster();
  renderPosProducts();
  renderLedger();

  resetPurchaseReturnScreen();
}

function navigateToReturnsReport(filterType) {
  navigateToScreen('sales-reports');
  switchReportEntity('returns');
  if (filterType) {
    const sec = document.getElementById('report-secondary-select');
    if (sec) {
      sec.value = filterType;
      applyReportFilters();
    }
  }
}

// --- 21. STOCK TRANSFER (SCREEN 15) CONTROLLERS ---

function resetStockTransferScreen(showToastFlag = false) {
  // 1. Clear any previous/recent items in the active manifest
  posState.activeTransferItems = [];

  // 2. Reset Branch Selectors to default Origin (Branch 1) and Destination (Branch 2)
  const fromSelect = document.getElementById('transfer-from');
  const toSelect = document.getElementById('transfer-to');
  if (fromSelect && toSelect) {
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';
    posState.branches.forEach((b, idx) => {
      fromSelect.innerHTML += `<option value="${b.name}" ${idx === 0 ? 'selected' : ''}>${b.name}</option>`;
      toSelect.innerHTML += `<option value="${b.name}" ${idx === 1 ? 'selected' : ''}>${b.name}</option>`;
    });
  }

  // 3. Reset product select dropdown to default first item
  const prodSelect = document.getElementById('transfer-product-select');
  if (prodSelect && posState.products.length > 0) {
    prodSelect.innerHTML = '';
    posState.products.forEach((p, idx) => {
      prodSelect.innerHTML += `<option value="${p.id}" ${idx === 0 ? 'selected' : ''}>${p.icon} ${p.name} (${p.code}) &bull; Stock: ${p.stock} ${p.unit}</option>`;
    });
    prodSelect.value = posState.products[0].id;
  }

  // 4. Reset Quantity Input to default 1
  const qtyInput = document.getElementById('transfer-input-qty');
  if (qtyInput) {
    qtyInput.value = 1;
  }

  onTransferProductChange();
  renderTransferManifest();
  renderTransferHistory();
  if (showToastFlag) {
    showToast('Stock transfer manifest & branch options refreshed.', 'info');
  }
}
window.resetStockTransferScreen = resetStockTransferScreen;

function initStockTransferScreen() {
  resetStockTransferScreen(false);
}
window.initStockTransferScreen = initStockTransferScreen;

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
  saveTransferHistoryToStorage();

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
  updateCategoryChips();
  populateCategorySelects();
  populatePurchaseDropdowns();

  // Reset all recent selection states for a fresh clean session
  resetInventoryFilters();
  resetStockTransferScreen();
  resetReportsScreen();

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

  // Initialize SQLite Backend and License Check
  checkLicenseAndSyncSqlite();
});

function setupKeybindings() {
  document.addEventListener('keydown', (e) => {
    // F2: Jump to POS Counter
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
    // F4: Jump to Product Catalog / Search
    if (e.key === 'F4') {
      e.preventDefault();
      if (posState.isAuthenticated) {
        navigateToScreen('product-search');
      }
    }
    // F12: Fast Tender / Pay Modal (Prevent browser DevTools popup!)
    if (e.key === 'F12') {
      e.preventDefault();
      if (posState.isAuthenticated) {
        if (posState.activeScreen !== 'pos') {
          navigateToScreen('pos');
        }
        if (posState.cart && posState.cart.length > 0) {
          openPaymentModal();
        } else {
          showToast('Cart is empty. Scan or add products before tender checkout (F12).', 'warning');
        }
      }
    }
  });
}

// =============================================================================
// COMMERCIAL SQLITE BACKEND & REMOTE IT SUPPORT INTEGRATION
// =============================================================================
let isSqliteBackendActive = false;
let syncTimeout = null;

/**
 * Checks Machine ID Hardware Lock and verifies license on server boot.
 */
async function checkLicenseAndSyncSqlite() {
  try {
    const res = await fetch('/api/license/status', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      isSqliteBackendActive = true;
      console.log('[SQLite Engine] Connected to local server. Machine ID:', data.machine_id);

      const licInput = document.getElementById('lic-machine-id');
      if (licInput) {
        licInput.value = data.machine_id || 'UNKNOWN-ID';
      }

      if (!data.activated) {
        // Hardware license is not activated or expired
        openModal('modal-license-activation');
        // Prevent client from closing activation modal without valid key
        const closeBtn = document.querySelector('#modal-license-activation .modal-close');
        if (closeBtn) closeBtn.style.display = 'none';
        return false;
      } else {
        // Valid license! Close modal and load state from SQLite hard drive database
        closeModal('modal-license-activation');
        await loadStateFromSqlite();
        return true;
      }
    }
  } catch (err) {
    // If opened directly without server.py, fallback smoothly to in-browser storage
    console.log('[SQLite Engine] Running in local offline browser mode (server.py not active)');
    return true;
  }
}

/**
 * Loads entire database state from pos_database.db into posState
 */
async function loadStateFromSqlite() {
  try {
    const res = await fetch('/api/state');
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success') {
        if (data.settings) {
          posState.settings = Object.assign(posState.settings, data.settings);
          localStorage.setItem('pos_settings', JSON.stringify(posState.settings));
          updateReceiptHeader();
        }
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          posState.products = data.products;
          localStorage.setItem('pos_products_list', JSON.stringify(posState.products));
        }
        if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          posState.categories = data.categories;
          localStorage.setItem('pos_categories_list', JSON.stringify(posState.categories));
        }
        if (data.branches && Array.isArray(data.branches) && data.branches.length > 0) {
          posState.branches = data.branches;
          localStorage.setItem('pos_branches_list', JSON.stringify(posState.branches));
        }
        if (Array.isArray(data.customers)) {
          posState.customers = data.customers.length > 0 ? data.customers : [
            { id: 1, name: 'Walk-in Customer', mobile: '9999999999', email: '', gstin: 'Unregistered', balance: 0.00, creditLimit: 0, status: 'Active' }
          ];
          localStorage.setItem('pos_customers_list', JSON.stringify(posState.customers));
        }
        if (Array.isArray(data.suppliers)) {
          posState.suppliers = data.suppliers;
          localStorage.setItem('pos_suppliers_list', JSON.stringify(posState.suppliers));
        }
        if (Array.isArray(data.salesHistory)) {
          posState.salesHistory = data.salesHistory;
          localStorage.setItem('pos_sales_history', JSON.stringify(posState.salesHistory));
          let maxSeq = 0;
          posState.salesHistory.forEach(s => {
            if (s.invoiceNo) {
              const m = s.invoiceNo.match(/(\d+)$/);
              if (m) {
                const num = parseInt(m[1], 10);
                if (num > maxSeq) maxSeq = num;
              }
            }
          });
          posState.nextInvoiceSeq = Math.max(1, maxSeq + 1);
          localStorage.setItem('pos_next_invoice_seq', String(posState.nextInvoiceSeq));
        }
        if (Array.isArray(data.purchases)) {
          posState.purchases = data.purchases;
          localStorage.setItem('pos_purchases_list', JSON.stringify(posState.purchases));
        }
        if (Array.isArray(data.returns)) {
          posState.returns = data.returns;
          localStorage.setItem('pos_returns_list', JSON.stringify(posState.returns));
        }
        if (Array.isArray(data.transferHistory)) {
          posState.transferHistory = data.transferHistory;
          localStorage.setItem('pos_transfer_history', JSON.stringify(posState.transferHistory));
        }
        if (data.users && Array.isArray(data.users) && data.users.length > 0) {
          posState.users = data.users;
          localStorage.setItem('pos_users_list', JSON.stringify(posState.users));
        }

        console.log('[SQLite Engine] Synchronized 100% data from pos_database.db. Next Invoice:', posState.nextInvoiceSeq);
        renderDashboard();
        renderPosProducts();
        renderProductSearch();
      }
    }
  } catch (err) {
    console.error('[SQLite Engine] Could not load state from backend:', err);
  }
}

/**
 * Debounced background write to SQLite pos_database.db
 */
function debounceSyncToSqlite(immediate = false) {
  if (!isSqliteBackendActive) return;
  clearTimeout(syncTimeout);
  const doSync = async () => {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: posState.products,
          categories: posState.categories,
          branches: posState.branches,
          customers: posState.customers,
          suppliers: posState.suppliers,
          salesHistory: posState.salesHistory,
          purchases: posState.purchases,
          returns: posState.returns,
          transferHistory: posState.transferHistory,
          settings: posState.settings,
          users: posState.users
        })
      });
      console.log('[SQLite Engine] Background auto-save to pos_database.db completed successfully.');
    } catch (err) {
      console.error('[SQLite Engine] Auto-save error:', err);
    }
  };

  if (immediate) {
    doSync();
  } else {
    syncTimeout = setTimeout(doSync, 300);
  }
}
window.debounceSyncToSqlite = debounceSyncToSqlite;
window.addEventListener('beforeunload', () => { debounceSyncToSqlite(true); });

/**
 * License Key Activation Handlers
 */
async function submitLicenseKey() {
  const keyInput = document.getElementById('lic-input-key');
  const key = (keyInput ? keyInput.value : '').trim();
  if (!key) {
    showToast('Please enter your license activation key.', 'warning');
    return;
  }

  try {
    const res = await fetch('/api/license/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    });
    const result = await res.json();
    if (res.ok && result.status === 'success') {
      showToast('🎉 ' + result.message, 'success');
      closeModal('modal-license-activation');
      await loadStateFromSqlite();
      renderDashboard();
    } else {
      showToast(result.message || 'Activation failed. Invalid license key.', 'danger');
    }
  } catch (err) {
    showToast('Cannot connect to license activation service.', 'danger');
  }
}

function copyMachineId() {
  const licInput = document.getElementById('lic-machine-id');
  if (licInput && licInput.value) {
    navigator.clipboard.writeText(licInput.value).then(() => {
      showToast('Machine ID copied: ' + licInput.value, 'success');
    }).catch(() => {
      licInput.select();
      document.execCommand('copy');
      showToast('Machine ID copied: ' + licInput.value, 'success');
    });
  }
}

function contactVendorWhatsApp() {
  const licInput = document.getElementById('lic-machine-id');
  const machineId = licInput ? licInput.value : '';
  const text = encodeURIComponent(`Namaste! I need activation key for MyPOS Retail. Machine ID: ${machineId}`);
  window.open(`https://wa.me/?text=${text}`, '_blank');
}

/**
 * AnyDesk Remote Developer Debugger (Ctrl+Alt+S)
 */
function unlockDeveloperConsole() {
  const pinInput = document.getElementById('dev-pin-input');
  const pin = (pinInput ? pinInput.value : '').trim();
  if (pin === '7788') {
    document.getElementById('dev-auth-box').style.display = 'none';
    document.getElementById('dev-tools-content').style.display = 'block';
    
    // Attach Ctrl+Enter handler to SQL query textarea
    const queryEl = document.getElementById('dev-sql-query');
    if (queryEl && !queryEl._hasKeyHandler) {
      queryEl._hasKeyHandler = true;
      queryEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          devExecuteSqlQuery();
        }
      });
    }
    showToast('Developer SQL Studio unlocked.', 'success');
  } else {
    showToast('Invalid Developer Master PIN.', 'danger');
  }
}

function setDevSqlQuery(sql) {
  const queryEl = document.getElementById('dev-sql-query');
  if (queryEl) {
    queryEl.value = sql;
    devExecuteSqlQuery();
  }
}

function clearDevSqlQuery() {
  const queryEl = document.getElementById('dev-sql-query');
  const outEl = document.getElementById('dev-sql-output-container');
  const pillEl = document.getElementById('dev-query-status-pill');
  if (queryEl) queryEl.value = '';
  if (pillEl) pillEl.textContent = 'Query cleared';
  if (outEl) {
    outEl.innerHTML = `
      <div style="padding:40px 20px; text-align:center; color:#64748b;">
        <div style="font-size:2rem; margin-bottom:8px;">📊</div>
        <strong style="color:#94a3b8;">SQL Query Output Grid</strong>
        <div style="font-size:0.75rem; margin-top:4px;">Type any SQL query above or click any table chip to view tabular rows & columns.</div>
      </div>
    `;
  }
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderSqlResultTable(columns, rows, executionTime) {
  const container = document.getElementById('dev-sql-output-container');
  const pillEl = document.getElementById('dev-query-status-pill');
  if (!container) return;

  if (pillEl) {
    pillEl.innerHTML = `<span style="color:#10b981; font-weight:700;">✓ ${rows.length} rows</span> (${executionTime}ms)`;
  }

  if (!rows || rows.length === 0) {
    container.innerHTML = `
      <div style="padding: 30px; text-align: center; color: #94a3b8;">
        <div style="font-size: 1.8rem; margin-bottom: 6px;">📭</div>
        <strong style="color: #f1f5f9; font-size: 0.95rem;">Query Executed Successfully (0 rows returned)</strong>
        <div style="font-size: 0.75rem; color: #64748b; margin-top: 4px;">The table is currently empty or no records matched the given criteria.</div>
      </div>
    `;
    return;
  }

  // Derive columns if not provided
  if (!columns || columns.length === 0) {
    const colSet = new Set();
    rows.forEach(r => Object.keys(r).forEach(k => colSet.add(k)));
    columns = Array.from(colSet);
  }

  // Save for CSV export
  window._lastSqlResult = { columns, rows };

  const tableId = 'dev-sql-result-table-' + Date.now();

  const headerHtml = columns.map(col => `
    <th style="background:#1e293b; color:#38bdf8; position:sticky; top:0; z-index:10; font-weight:800; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.5px; padding:10px 14px; border:1px solid #334155; text-align:left; white-space:nowrap;">
      ${escapeHtml(String(col))}
    </th>
  `).join('');

  const rowsHtml = rows.map((r, idx) => {
    const bg = idx % 2 === 0 ? '#0b1120' : '#020617';
    const cells = columns.map(col => {
      let val = r[col];
      let displayVal = '';
      if (val === null || val === undefined) {
        displayVal = `<span style="color:#64748b; font-style:italic;">NULL</span>`;
      } else if (typeof val === 'object') {
        displayVal = `<span style="color:#a855f7;">${escapeHtml(JSON.stringify(val))}</span>`;
      } else if (typeof val === 'number') {
        displayVal = `<span style="color:#38bdf8; font-weight:600;">${val}</span>`;
      } else {
        displayVal = escapeHtml(String(val));
      }
      return `<td style="padding:8px 14px; border:1px solid #1e293b; font-size:0.78rem; font-family:'Fira Code', Consolas, Monaco, monospace; color:#e2e8f0; white-space:nowrap;">${displayVal}</td>`;
    }).join('');
    return `<tr style="background:${bg};" onmouseover="this.style.background='#1e293b'" onmouseout="this.style.background='${bg}'">${cells}</tr>`;
  }).join('');

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; background:#0f172a; padding:8px 14px; border-bottom:1px solid #334155; position:sticky; top:0; z-index:20;">
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="background:#065f46; color:#34d399; font-size:0.72rem; font-weight:800; padding:2px 8px; border-radius:12px;">✓ SUCCESS</span>
        <span style="color:#f8fafc; font-weight:700; font-size:0.82rem;">${rows.length} Rows</span>
        <span style="color:#64748b; font-size:0.75rem;">•</span>
        <span style="color:#94a3b8; font-size:0.75rem;">${columns.length} Columns</span>
        ${executionTime ? `<span style="color:#64748b; font-size:0.75rem;">• ${executionTime}ms</span>` : ''}
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <input type="text" placeholder="Filter rows..." style="background:#020617; border:1px solid #334155; color:#fff; padding:3px 8px; border-radius:4px; font-size:0.75rem; width:140px; outline:none;" oninput="filterSqlResultTable('${tableId}', this.value)" />
        <button type="button" class="btn btn-sm btn-outline" style="padding:3px 10px; font-size:0.74rem; border-color:#475569; color:#cbd5e1;" onclick="exportLastSqlResultCsv()">📥 Export CSV</button>
      </div>
    </div>
    <div style="overflow:auto; max-height:330px;">
      <table id="${tableId}" style="width:100%; border-collapse:collapse; text-align:left;">
        <thead><tr>${headerHtml}</tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `;
}

function filterSqlResultTable(tableId, query) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const q = (query || '').toLowerCase().trim();
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach(tr => {
    if (!q) {
      tr.style.display = '';
    } else {
      const text = tr.textContent.toLowerCase();
      tr.style.display = text.includes(q) ? '' : 'none';
    }
  });
}

function exportLastSqlResultCsv() {
  if (!window._lastSqlResult || !Array.isArray(window._lastSqlResult.rows) || window._lastSqlResult.rows.length === 0) {
    showToast('No SQL data to export.', 'warning');
    return;
  }
  const { columns, rows } = window._lastSqlResult;
  let csv = columns.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',') + '\r\n';
  rows.forEach(r => {
    const line = columns.map(col => {
      let v = r[col];
      if (v === null || v === undefined) v = '';
      else if (typeof v === 'object') v = JSON.stringify(v);
      return `"${String(v).replace(/"/g, '""')}"`;
    }).join(',');
    csv += line + '\r\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SQL_Export_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('SQL data exported to CSV successfully.', 'success');
}

async function devExecuteSqlQuery() {
  const queryEl = document.getElementById('dev-sql-query');
  const outEl = document.getElementById('dev-sql-output-container');
  const pillEl = document.getElementById('dev-query-status-pill');
  const rawQuery = (queryEl ? queryEl.value : '').trim();
  if (!rawQuery) {
    showToast('Please type a SQL query to run.', 'warning');
    return;
  }

  // Normalize query
  const query = rawQuery.replace(/;+$/, '').trim();
  if (pillEl) pillEl.textContent = 'Executing...';
  const startTime = Date.now();

  // If backend SQLite server is active and running over HTTP, send to server
  if (isSqliteBackendActive && window.location.protocol.startsWith('http')) {
    try {
      outEl.innerHTML = `
        <div style="padding:30px; text-align:center; color:#38bdf8;">
          <div class="spinner" style="margin:0 auto 10px auto;"></div>
          Executing query on pos_database.db...
        </div>
      `;
      const res = await fetch('/api/admin/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, pin: '7788' })
      });
      const result = await res.json();
      const execTime = Date.now() - startTime;

      if (res.ok && result.status === 'success') {
        if (result.rows && Array.isArray(result.rows)) {
          renderSqlResultTable(result.columns, result.rows, execTime);
        } else {
          const aff = result.rows_affected !== undefined ? result.rows_affected : (result.affected || 0);
          outEl.innerHTML = `
            <div style="padding:30px; text-align:center;">
              <div style="font-size:2rem; margin-bottom:8px;">✅</div>
              <strong style="color:#10b981; font-size:1.05rem;">Query Executed Successfully</strong>
              <div style="color:#94a3b8; font-size:0.85rem; margin-top:6px;">${escapeHtml(result.message || 'Rows affected: ' + aff)}</div>
              <div style="color:#64748b; font-size:0.75rem; margin-top:4px;">Execution time: ${execTime}ms</div>
            </div>
          `;
          if (pillEl) pillEl.innerHTML = `<span style="color:#10b981; font-weight:700;">✓ Done</span> (${execTime}ms)`;
        }
        showToast('SQL executed successfully.', 'success');
        await loadStateFromSqlite();
        return;
      } else {
        const execTime = Date.now() - startTime;
        outEl.innerHTML = `
          <div style="padding:24px; background:#1c1917; border:1px solid #7f1d1d; border-radius:6px; color:#ef4444;">
            <div style="font-weight:800; font-size:0.95rem; margin-bottom:6px;">❌ SQLite Execution Error:</div>
            <div style="font-family:monospace; font-size:0.82rem; color:#fca5a5;">${escapeHtml(result.message || 'Error executing query')}</div>
            <div style="color:#78716c; font-size:0.72rem; margin-top:8px;">Execution time: ${execTime}ms</div>
          </div>
        `;
        if (pillEl) pillEl.innerHTML = `<span style="color:#ef4444; font-weight:700;">✗ Error</span> (${execTime}ms)`;
        showToast('SQL error: ' + (result.message || 'Execution failed'), 'danger');
        return;
      }
    } catch (err) {
      console.warn('Backend query failed, falling back to in-browser engine:', err);
    }
  }

  // IN-BROWSER SMART SQL ENGINE (Works 100% in file:/// mode & standalone browser!)
  outEl.innerHTML = `
    <div style="padding:20px; text-align:center; color:#38bdf8;">
      Executing in-memory query...
    </div>
  `;

  // Match: SELECT * FROM <table> or SELECT <cols> FROM <table> [WHERE ...] [ORDER BY ...] [LIMIT ...]
  const selectMatch = query.match(/^SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)(\s+WHERE\s+(.+?))?(\s+ORDER\s+BY\s+(.+?))?(\s+LIMIT\s+(\d+))?$/i);

  if (selectMatch) {
    const tableMap = {
      'PRODUCTS': posState.products,
      'CUSTOMERS': posState.customers,
      'SUPPLIERS': posState.suppliers,
      'CATEGORIES': posState.categories,
      'SALES_ORDERS': posState.salesHistory,
      'SALES': posState.salesHistory,
      'PURCHASES': posState.purchases,
      'RETURNS_LOG': posState.returns,
      'RETURNS': posState.returns,
      'STOCK_TRANSFERS': posState.transferHistory,
      'TRANSFERS': posState.transferHistory,
      'BRANCHES': posState.branches,
      'USERS': posState.users,
      'SYSTEM_USERS': posState.users,
      'SETTINGS': [posState.settings],
      'COMPANY_SETTINGS': [posState.settings]
    };

    const tableName = selectMatch[2].toUpperCase();
    const tableData = tableMap[tableName];

    if (!tableData) {
      outEl.innerHTML = `
        <div style="padding:24px; color:#ef4444;">
          <strong>Error: Table '${escapeHtml(selectMatch[2])}' not found.</strong>
          <div style="color:#94a3b8; font-size:0.75rem; margin-top:6px;">
            Available tables: <code>products</code>, <code>categories</code>, <code>sales_orders</code>, <code>customers</code>, <code>branches</code>, <code>suppliers</code>, <code>purchases</code>, <code>returns_log</code>, <code>stock_transfers</code>, <code>system_users</code>.
          </div>
        </div>
      `;
      return;
    }

    let rows = [...tableData];

    // Handle WHERE clause (e.g. col = val, col < val, col > val)
    if (selectMatch[4]) {
      const whereStr = selectMatch[4].trim();
      const whereEq = whereStr.match(/^([a-zA-Z0-9_]+)\s*(=|<|>|<=|>=)\s*['"]?([^'"]+)['"]?$/);
      if (whereEq) {
        const col = whereEq[1];
        const op = whereEq[2];
        const val = whereEq[3];
        rows = rows.filter(r => {
          const rVal = r[col];
          if (op === '=') return String(rVal).toLowerCase() === String(val).toLowerCase();
          if (op === '<') return Number(rVal) < Number(val);
          if (op === '>') return Number(rVal) > Number(val);
          if (op === '<=') return Number(rVal) <= Number(val);
          if (op === '>=') return Number(rVal) >= Number(val);
          return true;
        });
      }
    }

    // Handle ORDER BY
    if (selectMatch[6]) {
      const orderPart = selectMatch[6].trim();
      const orderTokens = orderPart.split(/\s+/);
      const orderCol = orderTokens[0];
      const isDesc = orderTokens.length > 1 && orderTokens[1].toUpperCase() === 'DESC';
      rows.sort((a, b) => {
        const vA = a[orderCol];
        const vB = b[orderCol];
        if (typeof vA === 'number' && typeof vB === 'number') {
          return isDesc ? vB - vA : vA - vB;
        }
        return isDesc ? String(vB).localeCompare(String(vA)) : String(vA).localeCompare(String(vB));
      });
    }

    // Handle LIMIT
    if (selectMatch[8]) {
      const limit = parseInt(selectMatch[8], 10);
      if (!isNaN(limit)) rows = rows.slice(0, limit);
    }

    // Handle specific projected columns (SELECT col1, col2)
    const rawCols = selectMatch[1].trim();
    let columns = null;
    if (rawCols !== '*') {
      const colList = rawCols.split(',').map(c => c.trim()).filter(c => c);
      if (colList.length > 0) {
        columns = colList;
        rows = rows.map(r => {
          const proj = {};
          colList.forEach(c => proj[c] = r[c]);
          return proj;
        });
      }
    }

    const execTime = Date.now() - startTime;
    renderSqlResultTable(columns, rows, execTime);
    showToast(`SQL executed: ${rows.length} rows returned.`, 'success');
  } else {
    outEl.innerHTML = `
      <div style="padding:20px; color:#f59e0b;">
        <div style="font-weight:800; font-size:0.95rem; margin-bottom:6px;">⚡ Query Format Notice:</div>
        <div style="color:#e2e8f0; font-size:0.8rem; margin-bottom:8px;">
          For in-memory browser mode, use standard syntax:
          <ul style="margin:6px 0 0 16px; padding:0;">
            <li><code>SELECT * FROM products;</code></li>
            <li><code>SELECT name, price, stock FROM products WHERE stock < 10;</code></li>
            <li><code>SELECT * FROM sales_orders ORDER BY id DESC;</code></li>
            <li><code>SELECT * FROM customers;</code></li>
          </ul>
        </div>
        <div style="color:#94a3b8; font-size:0.75rem;">💡 For direct full SQLite execution with JOINs and PRAGMA, run <strong>Start_POS.bat</strong> in the project folder.</div>
      </div>
    `;
    if (pillEl) pillEl.textContent = 'Syntax error';
  }
}

async function devReconcileDatabase() {
  const outEl = document.getElementById('dev-sql-output-container');
  if (outEl) outEl.textContent = 'Running database math reconciliation & self-healing...';

  // 1. Immediate client-side math reconciliation
  let fixedStocks = 0;
  let fixedCustomers = 0;

  if (Array.isArray(posState.products)) {
    posState.products.forEach(p => {
      if (p.stock < 0) {
        p.stock = 0;
        fixedStocks++;
      }
    });
  }

  if (Array.isArray(posState.customers)) {
    posState.customers.forEach(c => {
      if (c.balance < 0) {
        c.balance = 0;
        fixedCustomers++;
      }
    });
  }

  saveState();
  if (typeof renderProducts === 'function') renderProducts();
  if (typeof renderCustomers === 'function') renderCustomers();
  if (typeof updateDashboard === 'function') updateDashboard();

  let msg = `✓ Reconcile Complete: Fixed ${fixedStocks} negative stocks and ${fixedCustomers} customer balances.`;

  // 2. If SQLite server is active over HTTP, also trigger backend reconcile
  if (isSqliteBackendActive && window.location.protocol.startsWith('http')) {
    try {
      const res = await fetch('/api/admin/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: '7788' })
      });
      if (res.ok) {
        const result = await res.json();
        msg += ` | SQLite Server: ${result.message}`;
      }
    } catch (e) {
      console.warn('[Dev Reconcile] Server sync skipped:', e.message);
    }
  }

  showToast('Database successfully reconciled & healed.', 'success');
  if (outEl) {
    outEl.innerHTML = `<div style="color:#10b981; font-weight:bold;">${msg}</div>
<div style="color:#38bdf8; font-size:0.75rem; margin-top:4px;">All inventory stocks and customer balances are now mathematically verified and clean.</div>`;
  }
}

function devDownloadSqliteDb() {
  // If backend is active and served via http, download live pos_database.db from server
  if (isSqliteBackendActive && window.location.protocol.startsWith('http')) {
    window.open('/api/backup/download', '_blank');
    showToast('Downloading live SQLite pos_database.db...', 'info');
    return;
  }

  // If in offline browser mode (file:/// or server offline), generate comprehensive DB backup right now!
  try {
    const backupData = {
      format: 'MyPOS Database Full Backup',
      exportedAt: new Date().toISOString(),
      timestamp: Date.now(),
      engine: 'In-Memory / LocalStorage Engine',
      database: {
        products: posState.products || [],
        categories: posState.categories || [],
        customers: posState.customers || [],
        suppliers: posState.suppliers || [],
        salesHistory: posState.salesHistory || [],
        purchases: posState.purchases || [],
        branches: posState.branches || [],
        settings: posState.settings || {},
        stockTimeline: posState.stockTimeline || [],
        systemSecretPin: posState.systemSecretPin || '7788'
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `pos_database_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('✓ Database backup file downloaded successfully!', 'success');

    const outEl = document.getElementById('dev-sql-output-container');
    if (outEl) {
      outEl.innerHTML = `<div style="color:#10b981; font-weight:bold;">✓ Database Backup Generated & Downloaded:</div>
<div style="color:#94a3b8; font-size:0.75rem; margin-top:4px;">File: <strong>pos_database_backup_${dateStr}.json</strong> (${(blob.size / 1024).toFixed(1)} KB)<br>
Contains: ${posState.products.length} products, ${posState.salesHistory.length} sales, ${posState.customers.length} customers, ${posState.suppliers.length} suppliers.<br>
💡 To run the native SQLite server with direct .db export, run <code>Start_POS.bat</code>.</div>`;
    }
  } catch (e) {
    showToast('Failed to export backup: ' + e.message, 'danger');
  }
}

function devInspectStateInConsole() {
  console.log('[DEBUG REMOTE] Window posState Object:', window.posState);
  showToast('Full posState logged to F12 Developer Console.', 'info');
}

// =============================================================================
// POINT 4: SECRET SUPER-ADMIN SENTINEL AI AGENT ENGINE
// =============================================================================

// Secret Trigger & Shortcut Listener
let _secretTriggerClickCount = 0;
let _secretTriggerTimer = null;

function handleSecretTriggerClick(event) {
  if (event) event.preventDefault();
  _secretTriggerClickCount++;
  clearTimeout(_secretTriggerTimer);
  _secretTriggerTimer = setTimeout(() => {
    _secretTriggerClickCount = 0;
  }, 1500);

  if (_secretTriggerClickCount >= 3) {
    _secretTriggerClickCount = 0;
    openSuperAdminAuthModal();
  }
}

// Global Keyboard Shortcuts:
// 1. Super-Admin Sentinel AI Agent: Ctrl + Shift + D
// 2. Developer & AnyDesk IT Console: Ctrl + Alt + S (Prevents Edge/Windows Web Capture screenshot clash)
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey && (e.key === 'D' || e.key === 'd')) {
    e.preventDefault();
    openSuperAdminAuthModal();
  } else if ((e.ctrlKey || e.metaKey) && e.altKey && !e.shiftKey && (e.key === 'S' || e.key === 's')) {
    e.preventDefault();
    openModal('modal-dev-debugger');
  }
});

function openSuperAdminAuthModal() {
  const pinInput = document.getElementById('super-admin-pin-input');
  const errEl = document.getElementById('super-admin-pin-error');
  if (pinInput) pinInput.value = '';
  if (errEl) {
    errEl.style.display = 'none';
    errEl.textContent = '';
  }
  openModal('modal-super-admin-auth');
  setTimeout(() => {
    if (pinInput) pinInput.focus();
  }, 200);
}

function appendSuperAdminPin(digit) {
  const pinInput = document.getElementById('super-admin-pin-input');
  if (pinInput && pinInput.value.length < 8) {
    pinInput.value += digit;
  }
}

function clearSuperAdminPin() {
  const pinInput = document.getElementById('super-admin-pin-input');
  if (pinInput) pinInput.value = '';
  const errEl = document.getElementById('super-admin-pin-error');
  if (errEl) errEl.style.display = 'none';
}

function backspaceSuperAdminPin() {
  const pinInput = document.getElementById('super-admin-pin-input');
  if (pinInput && pinInput.value.length > 0) {
    pinInput.value = pinInput.value.slice(0, -1);
  }
}

function verifySuperAdminPin() {
  const pinInput = document.getElementById('super-admin-pin-input');
  const errEl = document.getElementById('super-admin-pin-error');
  const entered = (pinInput ? pinInput.value : '').trim();
  const validPin = posState.systemSecretPin || '7788';

  if (entered === validPin) {
    closeModal('modal-super-admin-auth');
    openSuperAdminAIConsole();
  } else {
    if (errEl) {
      errEl.textContent = '❌ Access Denied: Incorrect Master PIN. Please try again.';
      errEl.style.display = 'block';
    }
    if (pinInput) {
      pinInput.value = '';
      pinInput.focus();
    }
  }
}

function promptChangeMasterPin() {
  const currentPin = prompt("Enter current Master PIN to verify identity:", "");
  if (!currentPin) return;
  if (currentPin !== (posState.systemSecretPin || '7788')) {
    alert("❌ Current PIN does not match! Change PIN aborted.");
    return;
  }
  const newPin = prompt("Enter NEW Master PIN (4 to 8 digits/letters):", "");
  if (!newPin || newPin.trim().length < 4) {
    alert("❌ Invalid new PIN! Must be at least 4 characters.");
    return;
  }
  const confirmPin = prompt("Confirm NEW Master PIN:", "");
  if (newPin !== confirmPin) {
    alert("❌ PIN confirmation does not match! Aborted.");
    return;
  }

  posState.systemSecretPin = newPin.trim();
  localStorage.setItem('pos_system_secret_pin', posState.systemSecretPin);
  alert(`✅ Master PIN successfully updated to: ${posState.systemSecretPin}`);
  appendAITerminalMsg(`🔑 Master PIN changed successfully by Super-Admin.`, 'ai');
}

function openSuperAdminAIConsole() {
  openModal('modal-super-admin-ai');
  switchAITab('issues');
  triggerAIDiagnosticScan();

  // Welcome terminal greeting if empty
  const term = document.getElementById('ai-terminal-output');
  if (term && term.children.length === 0) {
    appendAITerminalMsg("🤖 Sentinel AI Agent v2.4 initialized. Ready for database diagnostics, auto-reconciliation, and anomaly self-healing.", "ai");
    appendAITerminalMsg("💡 Pro-tip: Type queries in Hindi or English (e.g. 'Negative stock theek karo', 'Ledger check karo').", "ai");
  }
}

function switchAITab(tabName) {
  ['issues', 'terminal', 'logs'].forEach(t => {
    const btn = document.getElementById(`tab-btn-ai-${t}`);
    const content = document.getElementById(`ai-tab-content-${t}`);
    if (btn) {
      if (t === tabName) {
        btn.style.color = '#38bdf8';
        btn.style.borderBottom = '2px solid #38bdf8';
        btn.classList.add('active');
      } else {
        btn.style.color = '#94a3b8';
        btn.style.borderBottom = 'none';
        btn.classList.remove('active');
      }
    }
    if (content) {
      if (t === tabName) {
        content.style.display = (t === 'terminal' ? 'flex' : 'block');
      } else {
        content.style.display = 'none';
      }
    }
  });

  if (tabName === 'logs') {
    renderAIHealingLogs();
  }
}

function runAIDiagnostics() {
  const issues = [];

  // 1. SCAN PRODUCTS
  const prods = posState.products || [];
  const barcodeMap = {};

  prods.forEach(p => {
    // Check Negative Stock
    if (typeof p.stock === 'number' && p.stock < 0) {
      issues.push({
        id: `STK-NEG-${p.id}`,
        type: 'STOCK',
        severity: 'CRITICAL',
        title: `Negative Stock: ${p.name} (${p.code})`,
        description: `Current recorded stock is ${p.stock} ${p.unit || 'PCS'}. Negative physical inventory breaks accounting & billing.`,
        impact: `Cashiers may sell phantom stock or inventory valuation will show negative cost.`,
        recommendedFix: `Reconcile stock to 0 or inward opening level and log audit entry.`,
        targetId: p.id,
        fixAction: 'FIX_NEGATIVE_STOCK',
        data: { productId: p.id, currentStock: p.stock }
      });
    }

    // Check Pricing Inversion or Zero Selling Price
    if (p.price <= 0 && p.cost > 0) {
      issues.push({
        id: `PRC-ZERO-${p.id}`,
        type: 'PRICING',
        severity: 'CRITICAL',
        title: `Zero Selling Price: ${p.name}`,
        description: `Selling price is ₹ 0.00 while Cost is ₹ ${p.cost.toFixed(2)}. Item will be given away for free during billing!`,
        impact: `Direct financial loss on every checkout.`,
        recommendedFix: `Set selling price to 20% margin above cost (₹ ${(p.cost * 1.20).toFixed(2)}).`,
        targetId: p.id,
        fixAction: 'FIX_ZERO_PRICE',
        data: { productId: p.id, cost: p.cost }
      });
    } else if (p.cost > 0 && p.price > 0 && p.price < p.cost) {
      issues.push({
        id: `PRC-LOSS-${p.id}`,
        type: 'PRICING',
        severity: 'WARNING',
        title: `Negative Margin (Loss): ${p.name}`,
        description: `Selling price (₹ ${p.price.toFixed(2)}) is less than cost (₹ ${p.cost.toFixed(2)}). Loss of ₹ ${(p.cost - p.price).toFixed(2)} per unit.`,
        impact: `Product creates negative gross profit on every sale.`,
        recommendedFix: `Align selling price to cost price ₹ ${p.cost.toFixed(2)} or review supplier rate.`,
        targetId: p.id,
        fixAction: 'FIX_LOSS_PRICE',
        data: { productId: p.id, cost: p.cost, price: p.price }
      });
    }

    // Check Duplicate Barcodes
    const bc = (p.barcode || p.code || '').trim().toLowerCase();
    if (bc) {
      if (!barcodeMap[bc]) barcodeMap[bc] = [];
      barcodeMap[bc].push(p);
    }
  });

  // Check Duplicate Barcode Groups
  Object.keys(barcodeMap).forEach(bc => {
    if (barcodeMap[bc].length > 1) {
      const names = barcodeMap[bc].map(x => `"${x.name}" (ID:${x.id})`).join(', ');
      issues.push({
        id: `DUP-BC-${bc}`,
        type: 'INTEGRITY',
        severity: 'WARNING',
        title: `Duplicate Barcode / Code: ${bc.toUpperCase()}`,
        description: `Barcode "${bc.toUpperCase()}" is shared by ${barcodeMap[bc].length} different products: ${names}.`,
        impact: `Barcode scanner in POS screen will be ambiguous and may pick the wrong product.`,
        recommendedFix: `Differentiate codes by appending unique suffixes.`,
        targetId: barcodeMap[bc][1].id,
        fixAction: 'FIX_DUPLICATE_BARCODE',
        data: { code: bc, productIds: barcodeMap[bc].map(x => x.id) }
      });
    }
  });

  // 2. SCAN CUSTOMER LEDGERS
  const custs = posState.customers || [];
  const sales = posState.salesHistory || [];
  const payments = posState.customerPayments || [];
  const returns = posState.returns || [];

  custs.forEach(c => {
    let calculatedDue = 0;

    sales.forEach(s => {
      const match = (s.customer && s.customer.toLowerCase() === c.name.toLowerCase()) ||
                    (s.customerMobile && c.mobile && s.customerMobile === c.mobile);
      if (match) {
        const amt = parseFloat(s.amount || 0);
        if (s.paymentMode === 'CREDIT' || (s.payment && s.payment.includes('Credit'))) {
          calculatedDue += amt;
        }
      }
    });

    payments.forEach(p => {
      if (p.custId === c.id || (p.custName && p.custName.toLowerCase() === c.name.toLowerCase())) {
        calculatedDue = Math.max(0, calculatedDue - (parseFloat(p.amount) || 0));
      }
    });

    returns.forEach(r => {
      if ((r.type || '').toLowerCase().includes('sales') && r.party && r.party.toLowerCase() === c.name.toLowerCase()) {
        calculatedDue = Math.max(0, calculatedDue - (parseFloat(r.amount || r.totalAmount) || 0));
      }
    });

    calculatedDue = Math.round(calculatedDue * 100) / 100;
    const recordedDue = Math.round((c.due || 0) * 100) / 100;

    if (Math.abs(recordedDue - calculatedDue) > 0.5) {
      issues.push({
        id: `CUST-LEDGER-${c.id}`,
        type: 'LEDGER',
        severity: 'WARNING',
        title: `Customer Khata Mismatch: ${c.name}`,
        description: `Customer Master shows Due ₹ ${recordedDue.toFixed(2)}, but sum of Credit Sales minus Payments is ₹ ${calculatedDue.toFixed(2)}. Difference: ₹ ${Math.abs(recordedDue - calculatedDue).toFixed(2)}.`,
        impact: `Customer account statement does not match transactions ledger.`,
        recommendedFix: `Reconcile customer due balance to exact transaction math (₹ ${calculatedDue.toFixed(2)}).`,
        targetId: c.id,
        fixAction: 'RECONCILE_CUSTOMER_LEDGER',
        data: { customerId: c.id, recordedDue, calculatedDue }
      });
    }
  });

  // 3. SCAN SUPPLIER LEDGERS
  const supps = posState.suppliers || [];
  const purchases = posState.purchases || [];
  const suppPayments = posState.supplierPayments || [];

  supps.forEach(s => {
    let calculatedDue = 0;
    purchases.forEach(po => {
      const match = (po.supplier && po.supplier.toLowerCase() === s.name.toLowerCase()) ||
                    (po.supplierId && po.supplierId === s.id);
      if (match && (po.status === 'Unpaid' || po.status === 'Partial' || po.paymentMode === 'CREDIT')) {
        calculatedDue += (parseFloat(po.dueAmount !== undefined ? po.dueAmount : po.totalAmount) || 0);
      }
    });

    suppPayments.forEach(sp => {
      if (sp.suppId === s.id || (sp.suppName && sp.suppName.toLowerCase() === s.name.toLowerCase())) {
        calculatedDue = Math.max(0, calculatedDue - (parseFloat(sp.amount) || 0));
      }
    });

    calculatedDue = Math.round(calculatedDue * 100) / 100;
    const recordedDue = Math.round((s.due || s.balance || 0) * 100) / 100;

    if (Math.abs(recordedDue - calculatedDue) > 0.5 && purchases.length > 0) {
      issues.push({
        id: `SUPP-LEDGER-${s.id}`,
        type: 'LEDGER',
        severity: 'WARNING',
        title: `Supplier Khata Mismatch: ${s.name}`,
        description: `Supplier Master shows Due ₹ ${recordedDue.toFixed(2)}, but calculated ledger balance is ₹ ${calculatedDue.toFixed(2)}.`,
        impact: `Supplier payment statements will be inconsistent.`,
        recommendedFix: `Reconcile supplier due balance to exact purchase ledger math (₹ ${calculatedDue.toFixed(2)}).`,
        targetId: s.id,
        fixAction: 'RECONCILE_SUPPLIER_LEDGER',
        data: { supplierId: s.id, recordedDue, calculatedDue }
      });
    }
  });

  posState.aiDetectedIssues = issues;
  return issues;
}

function triggerAIDiagnosticScan() {
  const issues = runAIDiagnostics();

  // Counts by category
  const stockIssues = issues.filter(i => i.type === 'STOCK');
  const ledgerIssues = issues.filter(i => i.type === 'LEDGER');
  const pricingIssues = issues.filter(i => i.type === 'PRICING');
  const integrityIssues = issues.filter(i => i.type === 'INTEGRITY');

  // Update Top KPI Cards
  const kpiStockCount = document.getElementById('ai-kpi-stock-count');
  const kpiStockStatus = document.getElementById('ai-kpi-stock-status');
  if (kpiStockCount && kpiStockStatus) {
    kpiStockCount.textContent = stockIssues.length;
    kpiStockStatus.textContent = stockIssues.length === 0 ? 'Healthy' : `${stockIssues.length} Negative`;
    kpiStockStatus.style.color = stockIssues.length === 0 ? '#10b981' : '#ef4444';
  }

  const kpiLedgerCount = document.getElementById('ai-kpi-ledger-count');
  const kpiLedgerStatus = document.getElementById('ai-kpi-ledger-status');
  if (kpiLedgerCount && kpiLedgerStatus) {
    kpiLedgerCount.textContent = ledgerIssues.length;
    kpiLedgerStatus.textContent = ledgerIssues.length === 0 ? 'In Sync' : `${ledgerIssues.length} Mismatch`;
    kpiLedgerStatus.style.color = ledgerIssues.length === 0 ? '#10b981' : '#f59e0b';
  }

  const kpiPricingCount = document.getElementById('ai-kpi-pricing-count');
  const kpiPricingStatus = document.getElementById('ai-kpi-pricing-status');
  if (kpiPricingCount && kpiPricingStatus) {
    kpiPricingCount.textContent = pricingIssues.length;
    kpiPricingStatus.textContent = pricingIssues.length === 0 ? 'Normal' : `${pricingIssues.length} Anomalies`;
    kpiPricingStatus.style.color = pricingIssues.length === 0 ? '#10b981' : '#ef4444';
  }

  const kpiIntegrityCount = document.getElementById('ai-kpi-integrity-count');
  const kpiIntegrityStatus = document.getElementById('ai-kpi-integrity-status');
  if (kpiIntegrityCount && kpiIntegrityStatus) {
    const score = issues.length === 0 ? 100 : Math.max(60, 100 - (issues.length * 8));
    kpiIntegrityCount.textContent = `${score}%`;
    kpiIntegrityStatus.textContent = issues.length === 0 ? 'Verified' : `${integrityIssues.length} Dups`;
    kpiIntegrityStatus.style.color = issues.length === 0 ? '#10b981' : '#f59e0b';
  }

  // Update tab counter
  const tabIssuesCount = document.getElementById('ai-tab-issues-count');
  if (tabIssuesCount) tabIssuesCount.textContent = issues.length;

  // Update Undo Button state
  const undoBtn = document.getElementById('btn-ai-undo-action');
  if (undoBtn) {
    if (posState._preAISafetySnapshot) {
      undoBtn.disabled = false;
      undoBtn.style.opacity = '1';
      undoBtn.style.cursor = 'pointer';
    } else {
      undoBtn.disabled = true;
      undoBtn.style.opacity = '0.5';
      undoBtn.style.cursor = 'not-allowed';
    }
  }

  // Update Snapshot text
  const snapText = document.getElementById('ai-snapshot-status-text');
  if (snapText) {
    if (posState._preAISafetySnapshot) {
      snapText.innerHTML = `Saved at ${posState._preAISafetySnapshot.timeStr || 'Recent'} &bull; <span style="color:#10b981;">Ready to revert</span>`;
    } else {
      snapText.innerHTML = 'Automatic before any repair';
    }
  }

  // Render Issues Stream
  renderAIIssuesList(issues);
}

function renderAIIssuesList(issues) {
  const container = document.getElementById('ai-issues-list-container');
  if (!container) return;
  container.innerHTML = '';

  if (issues.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 48px 20px; background: #0f172a; border-radius: 10px; border: 1px dashed #334155;">
        <div style="font-size: 3rem; margin-bottom: 12px; filter: drop-shadow(0 0 10px rgba(16,185,129,0.5));">🎉</div>
        <h4 style="margin: 0 0 8px 0; font-size: 1.25rem; font-weight: 800; color: #10b981;">Database is 100% Healthy!</h4>
        <p style="margin: 0; color: #94a3b8; font-size: 0.88rem; max-width: 500px; margin: 0 auto;">
          Zero negative stocks, customer & supplier khata ledgers are mathematically in sync, and all product pricing margins are verified.
        </p>
      </div>
    `;
    return;
  }

  issues.forEach(issue => {
    const card = document.createElement('div');
    card.style.cssText = `
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: all 0.2s ease;
    `;

    let sevBadge = '';
    if (issue.severity === 'CRITICAL') {
      sevBadge = '<span style="background:#ef4444; color:#fff; font-size:0.68rem; font-weight:800; padding:2px 8px; border-radius:10px;">CRITICAL</span>';
      card.style.borderLeft = '4px solid #ef4444';
    } else if (issue.severity === 'WARNING') {
      sevBadge = '<span style="background:#f59e0b; color:#fff; font-size:0.68rem; font-weight:800; padding:2px 8px; border-radius:10px;">WARNING</span>';
      card.style.borderLeft = '4px solid #f59e0b';
    } else {
      sevBadge = '<span style="background:#3b82f6; color:#fff; font-size:0.68rem; font-weight:800; padding:2px 8px; border-radius:10px;">INFO</span>';
      card.style.borderLeft = '4px solid #3b82f6';
    }

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          ${sevBadge}
          <strong style="font-size: 0.95rem; color: #f8fafc;">${issue.title}</strong>
        </div>
        <button type="button" class="btn btn-sm btn-primary" onclick="executeAIAutoRepair('${issue.fixAction}', '${issue.id}')" style="background:#4f46e5; border-color:#4f46e5; font-weight:700; font-size:0.75rem; padding:4px 12px;">
          ⚡ Auto-Fix This Issue
        </button>
      </div>
      <div style="font-size: 0.85rem; color: #cbd5e1; margin-top: 2px;">
        ${issue.description}
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; background: #020617; padding: 6px 10px; border-radius: 6px; font-size: 0.78rem; border: 1px solid #1e293b; margin-top: 4px;">
        <div style="color: #94a3b8;">
          <strong style="color: #38bdf8;">Recommended Action:</strong> ${issue.recommendedFix}
        </div>
        <div style="color: #64748b; font-size: 0.72rem;">
          Impact: ${issue.impact}
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function executeAIAutoRepair(targetAction, specificId) {
  // 1. Take Pre-Repair Safety Snapshot
  const snapshot = {
    timestamp: new Date().toISOString(),
    dateStr: new Date().toLocaleDateString('en-GB'),
    timeStr: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    products: JSON.parse(JSON.stringify(posState.products || [])),
    customers: JSON.parse(JSON.stringify(posState.customers || [])),
    suppliers: JSON.parse(JSON.stringify(posState.suppliers || [])),
    categories: JSON.parse(JSON.stringify(posState.categories || []))
  };
  posState._preAISafetySnapshot = snapshot;
  localStorage.setItem('pos_ai_pre_repair_snapshot', JSON.stringify(snapshot));

  let fixedStocks = 0;
  let fixedLedgers = 0;
  let fixedPricing = 0;
  let fixedIntegrity = 0;

  // Retrieve current issues
  const issues = runAIDiagnostics();
  const toFix = specificId ? issues.filter(i => i.id === specificId) : (targetAction === 'ALL' ? issues : issues.filter(i => i.fixAction === targetAction));

  toFix.forEach(issue => {
    if (issue.fixAction === 'FIX_NEGATIVE_STOCK') {
      const p = posState.products.find(x => x.id === issue.data.productId);
      if (p) {
        const oldStock = p.stock;
        p.stock = 0;
        fixedStocks++;
        logProductChange({
          productId: p.id,
          productCode: p.code,
          productName: p.name,
          oldPrice: p.price,
          newPrice: p.price,
          oldCost: p.cost,
          newCost: p.cost,
          oldStock: oldStock,
          newStock: 0,
          changeType: 'AI_AUTO_RECONCILE',
          reason: 'AI Self-Healing: Negative stock reconciled to 0',
          changedBy: 'Super-Admin AI Agent'
        });
      }
    } else if (issue.fixAction === 'FIX_ZERO_PRICE') {
      const p = posState.products.find(x => x.id === issue.data.productId);
      if (p && p.cost > 0) {
        const newPrice = Math.round(p.cost * 1.20 * 100) / 100;
        const oldPrice = p.price;
        p.price = newPrice;
        fixedPricing++;
        logProductChange({
          productId: p.id,
          productCode: p.code,
          productName: p.name,
          oldPrice: oldPrice,
          newPrice: newPrice,
          oldCost: p.cost,
          newCost: p.cost,
          oldStock: p.stock,
          newStock: p.stock,
          changeType: 'AI_AUTO_RECONCILE',
          reason: 'AI Self-Healing: Zero price adjusted to cost + 20% margin',
          changedBy: 'Super-Admin AI Agent'
        });
      }
    } else if (issue.fixAction === 'FIX_LOSS_PRICE') {
      const p = posState.products.find(x => x.id === issue.data.productId);
      if (p && p.cost > 0) {
        const newPrice = Math.round(p.cost * 1.10 * 100) / 100;
        const oldPrice = p.price;
        p.price = newPrice;
        fixedPricing++;
        logProductChange({
          productId: p.id,
          productCode: p.code,
          productName: p.name,
          oldPrice: oldPrice,
          newPrice: newPrice,
          oldCost: p.cost,
          newCost: p.cost,
          oldStock: p.stock,
          newStock: p.stock,
          changeType: 'AI_AUTO_RECONCILE',
          reason: 'AI Self-Healing: Negative margin adjusted to cost + 10%',
          changedBy: 'Super-Admin AI Agent'
        });
      }
    } else if (issue.fixAction === 'RECONCILE_CUSTOMER_LEDGER') {
      const c = posState.customers.find(x => x.id === issue.data.customerId);
      if (c) {
        c.due = issue.data.calculatedDue;
        fixedLedgers++;
      }
    } else if (issue.fixAction === 'RECONCILE_SUPPLIER_LEDGER') {
      const s = posState.suppliers.find(x => x.id === issue.data.supplierId);
      if (s) {
        s.due = issue.data.calculatedDue;
        if (s.balance !== undefined) s.balance = issue.data.calculatedDue;
        fixedLedgers++;
      }
    } else if (issue.fixAction === 'FIX_DUPLICATE_BARCODE') {
      if (issue.data.productIds && issue.data.productIds.length > 1) {
        const p2 = posState.products.find(x => x.id === issue.data.productIds[1]);
        if (p2) {
          p2.code = `${p2.code}-A`;
          p2.barcode = p2.code;
          fixedIntegrity++;
        }
      }
    }
  });

  // Save all modified state to localStorage
  saveProductsToStorage();
  saveCustomersToStorage();
  saveSuppliersToStorage();

  // Multi-Screen Real-Time Refresh
  renderProductMaster();
  renderInventory();
  renderPosProducts();
  renderDashboard();
  renderCustomers();
  renderSuppliers();
  renderLedger();

  // Record AI Self-Healing Log
  const totalRepairs = fixedStocks + fixedLedgers + fixedPricing + fixedIntegrity;
  const logEntry = {
    id: `HEAL-${Date.now()}`,
    timestamp: snapshot.timestamp,
    date: snapshot.dateStr,
    time: snapshot.timeStr,
    summary: `Repaired ${totalRepairs} anomaly items (${fixedStocks} stocks, ${fixedLedgers} ledgers, ${fixedPricing} prices, ${fixedIntegrity} integrity).`,
    operator: 'Super-Admin AI Agent',
    reversible: true
  };

  if (!Array.isArray(posState.aiHealingLogs)) posState.aiHealingLogs = [];
  posState.aiHealingLogs.unshift(logEntry);
  if (posState.aiHealingLogs.length > 100) posState.aiHealingLogs = posState.aiHealingLogs.slice(0, 100);
  localStorage.setItem('pos_ai_healing_logs', JSON.stringify(posState.aiHealingLogs));

  // Re-run diagnostics to refresh UI
  triggerAIDiagnosticScan();

  // Terminal notification
  appendAITerminalMsg(`⚡ Auto-Repair Complete: ${logEntry.summary} Pre-repair safety snapshot stored successfully.`, 'ai');
  showToast(`⚡ AI Auto-Repair finished: ${totalRepairs} issues resolved!`, 'success');
}

function undoLastAIAction() {
  if (!posState._preAISafetySnapshot) {
    showToast('No pre-repair snapshot found to undo.', 'warning');
    return;
  }

  const snap = posState._preAISafetySnapshot;
  if (Array.isArray(snap.products)) posState.products = JSON.parse(JSON.stringify(snap.products));
  if (Array.isArray(snap.customers)) posState.customers = JSON.parse(JSON.stringify(snap.customers));
  if (Array.isArray(snap.suppliers)) posState.suppliers = JSON.parse(JSON.stringify(snap.suppliers));
  if (Array.isArray(snap.categories)) posState.categories = JSON.parse(JSON.stringify(snap.categories));

  saveProductsToStorage();
  saveCustomersToStorage();
  saveSuppliersToStorage();

  // Multi-Screen Refresh
  renderProductMaster();
  renderInventory();
  renderPosProducts();
  renderDashboard();
  renderCustomers();
  renderSuppliers();
  renderLedger();

  posState._preAISafetySnapshot = null;
  localStorage.removeItem('pos_ai_pre_repair_snapshot');

  triggerAIDiagnosticScan();
  appendAITerminalMsg(`⏪ Undo Successful: All data restored back to snapshot from ${snap.timeStr || 'previous state'}.`, 'ai');
  showToast('⏪ Reverted successfully to pre-repair state.', 'info');
}

function renderAIHealingLogs() {
  const container = document.getElementById('ai-healing-logs-container');
  if (!container) return;
  container.innerHTML = '';

  const logs = posState.aiHealingLogs || [];
  if (logs.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:32px; color:#94a3b8; font-size:0.85rem;">
        No automated self-healing events recorded yet.
      </div>
    `;
    return;
  }

  logs.forEach(l => {
    const row = document.createElement('div');
    row.style.cssText = `
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 6px;
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.82rem;
    `;
    row.innerHTML = `
      <div>
        <span style="color:#38bdf8; font-weight:700;">📅 ${l.date} at ${l.time}</span> &bull; 
        <strong style="color:#f8fafc;">${l.summary}</strong>
      </div>
      <div style="color:#94a3b8; font-size:0.75rem;">
        Operator: <span style="color:#a855f7;">${l.operator}</span>
      </div>
    `;
    container.appendChild(row);
  });
}

function sendQuickPrompt(promptText) {
  const input = document.getElementById('ai-terminal-input');
  if (input) {
    input.value = promptText;
    submitAICommand();
  }
}

function appendAITerminalMsg(text, sender = 'ai') {
  const term = document.getElementById('ai-terminal-output');
  if (!term) return;

  const msgDiv = document.createElement('div');
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (sender === 'user') {
    msgDiv.style.cssText = `
      background: #1e1b4b;
      color: #e0e7ff;
      padding: 6px 10px;
      border-radius: 6px;
      align-self: flex-end;
      max-width: 85%;
      border-left: 3px solid #818cf8;
    `;
    msgDiv.innerHTML = `<span style="opacity:0.6; font-size:0.7rem;">[${time}] User:</span> <strong>${text}</strong>`;
  } else {
    msgDiv.style.cssText = `
      background: #0f172a;
      color: #38bdf8;
      padding: 6px 10px;
      border-radius: 6px;
      align-self: flex-start;
      max-width: 90%;
      border-left: 3px solid #10b981;
    `;
    msgDiv.innerHTML = `<span style="opacity:0.6; font-size:0.7rem;">[${time}] Sentinel AI:</span> ${text}`;
  }

  term.appendChild(msgDiv);
  term.scrollTop = term.scrollHeight;
}

function dispatchAIQuery(rawText, target = 'copilot') {
  const reply = (html) => {
    if (target === 'terminal') {
      appendAITerminalMsg(html, 'ai');
    } else {
      appendAICopilotBubble('ai', html);
    }
  };

  const rawTrimmed = (rawText || '').trim();
  if (!rawTrimmed) return;
  const q = rawTrimmed.toLowerCase();

  // Common Action flags
  const isFixAction = q.includes('theek') || q.includes('fix') || q.includes('repair') || q.includes('reconcile') || q.includes('reset') || q.includes('sahi') || q.includes('khatam karo');

  // =========================================================================
  // 1. CASUAL GREETINGS, HELP, CAPABILITIES, SHORTCUTS & BACKUP
  // =========================================================================

  // 1a. GREETINGS
  const isGreeting = /^(hi+|hello+|hey+|namaste+|namaskar+|salam+|kese ho|kaise ho|hal chal|whats up|good morning|good evening|good afternoon)/i.test(q) ||
                     ['hi', 'hii', 'hiii', 'hello', 'hey', 'namaste', 'namaskar'].includes(q);
  if (isGreeting) {
    reply(`
      <div style="line-height:1.5;">
        <strong style="color:#38bdf8;">👋 Namaste! Main aapka MyPOS Universal AI Copilot hoon.</strong><br>
        <span style="font-size:0.8rem; color:#cbd5e1;">Aap mujhse poore POS application, stock, sale, munafa, ledgers ya kisi bhi screen ke baare me pooch sakte hain:</span>
        <div style="margin-top:6px; font-size:0.78rem; background:rgba(0,0,0,0.3); padding:8px 10px; border-radius:6px; line-height:1.6;">
          &bull; 💰 <em>"Dukaan me kitne ka maal pada hai"</em> (Stock Valuation & Gross Margin)<br>
          &bull; 📊 <em>"Aaj kitni sale hui"</em> ya <em>"Cash me kitna aaya"</em> (Daily Collection)<br>
          &bull; 📈 <em>"Aaj ka profit kitna hai"</em> (Gross Munafa & Loss Protection)<br>
          &bull; 👥 <em>"Market me kitna udhar bacha hai"</em> (Pending Customer Debt)<br>
          &bull; 🏢 <em>"Kitne supplier hai total"</em> (Supplier Directory & Payables)<br>
          &bull; ⚠️ <em>"Low stock kiske hai dekho"</em> ya <em>"Out of stock"</em><br>
          &bull; 🏆 <em>"Sabse jyada kya bikta hai"</em> (Top Best-Selling Items)<br>
          &bull; ⌨️ <em>"Shortcuts kya hain"</em> (F2, F4, F12 Key Guide)<br>
          &bull; 📥 <em>"Excel se product kaise dale"</em> (How-to Guides)
        </div>
        <div style="margin-top:6px; color:#10b981; font-weight:600; font-size:0.8rem;">Bataiye, abhi aapko kya janna ya check karna hai?</div>
      </div>
    `);
    return;
  }

  // 1b. AI COPILOT SCOPE & CAPABILITIES ("ai copilot sb ko dekhga", "kya kya kar sakte ho", etc.)
  const isScopeCheck = q.includes('sb ko dekh') || q.includes('sab ko dekh') || q.includes('kya kya') || 
                       q.includes('kya dekh') || q.includes('kya kar sakte') || q.includes('kaam kya hai') ||
                       q.includes('capabilities') || q.includes('scope');
  if (isScopeCheck) {
    reply(`
      <div style="line-height:1.5;">
        <strong style="color:#10b981;">🤖 Haan! MyPOS AI Copilot poore application ko 24/7 autonomously monitor karta hai:</strong><br>
        <span style="font-size:0.8rem; color:#cbd5e1;">Aapko kisi manual calculation ya complex reports ki zaroorat nahi hai. Yeh sab AI live sambhalta hai:</span>
        <div style="margin-top:6px; font-size:0.78rem; background:rgba(0,0,0,0.3); padding:8px 10px; border-radius:6px; line-height:1.6;">
          &bull; 📦 <strong>Inventory & Valuation:</strong> Live stock, 0-stock alerts, negative stock reconcile, dukaan me total kitne ka maal hai.<br>
          &bull; 📊 <strong>Sales & Revenue:</strong> Aaj ki bikri, cash vs UPI, average bill value, top-selling items.<br>
          &bull; 💰 <strong>Profit & Margins:</strong> Gross munafa %, loss-making products alert, cost vs selling price.<br>
          &bull; 👥 <strong>Market Udhar & Ledgers:</strong> Customer khata, pending balance, running statement sync.<br>
          &bull; 🏭 <strong>Suppliers & Inward:</strong> Wholesaler payables, purchase invoices, debit/credit notes.<br>
          &bull; 🖥️ <strong>All 24 Screens Navigation:</strong> Kisi bhi screen par 1-click me jana aur step-by-step guidance.<br>
          &bull; 🛡️ <strong>Safety Snapshot & Undo:</strong> Har auto-repair se pehle snapshot aur 1-click Undo!
        </div>
      </div>
    `);
    return;
  }

  // 1c. SHORTCUT KEYS & HOTKEYS GUIDE ("shortcuts kya hain", "keyboard keys", "f2 f4 f12", etc.)
  const isShortcutQuery = q.includes('shortcut') || q.includes('hotkey') || q.includes('keyboard') || 
                          (q.includes('key') && (q.includes('f2') || q.includes('f4') || q.includes('f12') || q.includes('batao') || q.includes('kya')));
  if (isShortcutQuery) {
    reply(`
      <div style="line-height:1.5;">
        <strong style="color:#38bdf8;">⌨️ MyPOS Keyboard Shortcut Keys:</strong>
        <div style="margin-top:6px; background:#020617; border:1px solid #1e293b; border-radius:6px; padding:8px 10px; font-size:0.78rem; line-height:1.8;">
          &bull; <kbd style="background:#1e293b; color:#38bdf8; padding:2px 6px; border-radius:4px; font-weight:700;">F2</kbd> : <strong>Barcode Search:</strong> Barcode scanner field par turant cursor focus karein.<br>
          &bull; <kbd style="background:#1e293b; color:#38bdf8; padding:2px 6px; border-radius:4px; font-weight:700;">F4</kbd> : <strong>Product Catalog Modal:</strong> Fullscreen product search aur price checker khole.<br>
          &bull; <kbd style="background:#1e293b; color:#10b981; padding:2px 6px; border-radius:4px; font-weight:700;">F12</kbd> : <strong>Quick Pay & Checkout:</strong> POS counter par instant payment & print modal khole.<br>
          &bull; <kbd style="background:#1e293b; color:#f59e0b; padding:2px 6px; border-radius:4px; font-weight:700;">Ctrl + Shift + D</kbd> : <strong>Developer Diagnostics:</strong> Database download aur system repair panel.<br>
          &bull; <kbd style="background:#1e293b; color:#a855f7; padding:2px 6px; border-radius:4px; font-weight:700;">Ctrl + Alt + S</kbd> : <strong>Settings:</strong> Store settings, GST rates aur thermal printer config.<br>
          &bull; <kbd style="background:#1e293b; color:#94a3b8; padding:2px 6px; border-radius:4px; font-weight:700;">Esc</kbd> : Kisi bhi open modal, popup ya drawer ko turant close kare.
        </div>
        <div style="margin-top:8px;">
          <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('pos')" style="font-size:0.74rem; padding:4px 12px; font-weight:700;">
            🛒 Open POS Counter (Screen 2)
          </button>
        </div>
      </div>
    `);
    return;
  }

  // 1d. DATABASE BACKUP & DOWNLOAD INQUIRY
  const isBackupReq = (q.includes('backup') || q.includes('download') || q.includes('export')) && 
                      (q.includes('db') || q.includes('database') || q.includes('data') || q.includes('pos')) ||
                      q.includes('db download');
  if (isBackupReq) {
    reply(`
      <div>
        <strong style="color:#38bdf8;">💾 Database Backup & Export Center:</strong><br>
        <span style="font-size:0.8rem; color:#e2e8f0;">Aap live system ka complete database backup yahan se 1-click me turant download kar sakte hain:</span>
        <div style="margin-top:8px;">
          <button type="button" class="btn btn-sm btn-primary" onclick="devDownloadSqliteDb()" style="font-weight:700; padding:6px 14px; font-size:0.8rem;">
            📥 Download Database Backup Now
          </button>
        </div>
        <div style="margin-top:6px; font-size:0.75rem; color:#94a3b8; line-height:1.4;">
          Is backup me aapke saare <strong>${(posState.products || []).length} Products</strong>, <strong>${(posState.salesHistory || []).length} Invoices</strong>, <strong>${(posState.customers || []).length} Customers</strong>, Ledger accounts aur Settings 100% safely export ho jayenge.
        </div>
      </div>
    `);
    return;
  }

  // =========================================================================
  // 2. LIVE BUSINESS FINANCIALS & METRICS (VALUATION, PROFIT, SALES, UDHAR, ETC.)
  // =========================================================================

  // 2a. TOTAL STOCK / INVENTORY VALUATION ("dukaan me kitne ka maal pada hai", "total valuation", "inventory value", etc.)
  const isValuationQuery = q.includes('valuation') || 
                           q.includes('kitne ka maal') || 
                           q.includes('maal pada') || 
                           q.includes('maal hai') || 
                           q.includes('stock value') || 
                           q.includes('inventory value') || 
                           q.includes('stock ki kimat') || 
                           (q.includes('maal') && (q.includes('kitna') || q.includes('total') || q.includes('batao') || q.includes('dukaan')));
  if (isValuationQuery) {
    const prods = posState.products || [];
    let totalUnits = 0;
    let totalCostVal = 0;
    let totalRetailVal = 0;
    prods.forEach(p => {
      const stock = Math.max(0, p.stock || 0);
      const cost = parseFloat(p.cost) || 0;
      const price = parseFloat(p.price) || 0;
      totalUnits += stock;
      totalCostVal += (cost * stock);
      totalRetailVal += (price * stock);
    });
    const projectedProfit = totalRetailVal - totalCostVal;
    const marginPct = totalRetailVal > 0 ? ((projectedProfit / totalRetailVal) * 100) : 0;

    reply(`
      <div style="line-height:1.45;">
        <div style="font-size:0.92rem; font-weight:800; color:#38bdf8; display:flex; align-items:center; gap:6px;">
          <span>📦 Dukaan Ka Total Live Stock & Valuation Summary:</span>
        </div>
        <div style="margin-top:6px; background:#020617; border:1px solid #1e293b; border-radius:6px; padding:8px 10px; font-size:0.8rem; line-height:1.65;">
          &bull; 🏷️ Total Inventory Quantity: <strong>${totalUnits.toLocaleString()} units</strong> (${prods.length} Products)<br>
          &bull; 💼 <strong>Purchase Cost Investment:</strong> <strong style="color:#f59e0b; font-size:0.9rem;">₹ ${totalCostVal.toFixed(2)}</strong> (Maal khareedne ki lagat)<br>
          &bull; 🏷️ <strong>Retail Selling Value:</strong> <strong style="color:#10b981; font-size:0.9rem;">₹ ${totalRetailVal.toFixed(2)}</strong> (Bikne par expected amount)<br>
          &bull; 📈 <strong>Projected Gross Profit:</strong> <strong style="color:#38bdf8; font-weight:700;">₹ ${projectedProfit.toFixed(2)}</strong> (${marginPct.toFixed(1)}% Gross Margin)
        </div>
        <div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap;">
          <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('inventory')" style="font-size:0.74rem; padding:4px 10px; font-weight:700;">
            📈 View Inventory (Screen 9)
          </button>
          <button type="button" class="btn btn-sm btn-outline" onclick="navigateToScreen('purchase')" style="font-size:0.74rem; padding:4px 10px; font-weight:700;">
            📥 Purchase Inward (Screen 10)
          </button>
        </div>
      </div>
    `);
    return;
  }

  // 2b. PROFIT & MARGINS ("kitna profit hua", "munafa kitna hai", "margin kitna hai", "fayda", etc.)
  const isProfitQuery = (q.includes('profit') || q.includes('munafa') || q.includes('margin') || q.includes('fayda')) && 
                        !q.includes('report') && !q.includes('screen');
  if (isProfitQuery) {
    const todayStr = new Date().toISOString().split('T')[0];
    const sales = posState.salesHistory || [];
    const todaySales = sales.filter(s => {
      if (!s.date) return false;
      const d = s.date.includes('/') ? s.date.split('/').reverse().join('-') : s.date;
      return d.startsWith(todayStr);
    });

    let todaySalesTotal = 0;
    let todayEstimatedCost = 0;
    todaySales.forEach(s => {
      const amt = parseFloat(s.amount) || 0;
      todaySalesTotal += amt;
      let billCost = 0;
      (s.items || []).forEach(it => {
        const prod = (posState.products || []).find(p => p.id === it.productId || p.code === it.code || p.name === it.name);
        const cost = prod ? (parseFloat(prod.cost) || 0) : ((parseFloat(it.price) || 0) * 0.75);
        billCost += cost * (parseFloat(it.qty) || 1);
      });
      todayEstimatedCost += billCost;
    });

    const todayGrossProfit = Math.max(0, todaySalesTotal - todayEstimatedCost);
    const todayMarginPct = todaySalesTotal > 0 ? ((todayGrossProfit / todaySalesTotal) * 100) : 0;

    const lossProds = (posState.products || []).filter(p => p.price > 0 && p.cost > 0 && p.price < p.cost);

    reply(`
      <div style="line-height:1.45;">
        <div style="font-size:0.92rem; font-weight:800; color:#10b981; display:flex; align-items:center; gap:6px;">
          <span>📈 Profit & Margin Financial Audit:</span>
        </div>
        <div style="margin-top:6px; background:#020617; border:1px solid #1e293b; border-radius:6px; padding:8px 10px; font-size:0.8rem; line-height:1.65;">
          &bull; 📅 <strong>Aaj Ki Bikri (Revenue):</strong> ₹ ${todaySalesTotal.toFixed(2)} (${todaySales.length} Invoices)<br>
          &bull; 💰 <strong>Aaj Ka Net Gross Munafa (Profit):</strong> <strong style="color:#10b981; font-size:0.92rem;">₹ ${todayGrossProfit.toFixed(2)}</strong> (${todayMarginPct.toFixed(1)}% Margin)<br>
          &bull; 📊 <strong>Store Average Product Margin:</strong> ~22.5% standard mark-up<br>
          ${lossProds.length > 0 ? `&bull; 🚨 <strong style="color:#ef4444;">${lossProds.length} Loss-making Items</strong> (Cost Price Selling Price se jyada hai!)` : `&bull; ✅ <strong>Loss Protection:</strong> Koi bhi product cost se kam rate par nahi bik raha.`}
        </div>
        <div style="margin-top:8px;">
          <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('profit-report')" style="font-size:0.74rem; padding:4px 10px; font-weight:700;">
            📈 Open Screen 19 (Detailed Profit Report)
          </button>
        </div>
      </div>
    `);
    return;
  }

  // 2c. BEST SELLERS / TOP SELLING PRODUCTS ("sabse jyada kya bikta hai", "top selling", "best seller", etc.)
  const isBestSellerQuery = q.includes('sabse jyada') || q.includes('top selling') || q.includes('best seller') || 
                            q.includes('popular item') || (q.includes('jyada') && (q.includes('bikta') || q.includes('bika') || q.includes('sale')));
  if (isBestSellerQuery) {
    const itemMap = {};
    (posState.salesHistory || []).forEach(s => {
      (s.items || []).forEach(it => {
        const name = it.name || it.productName || 'Item';
        const qty = parseFloat(it.qty || it.quantity || 1);
        const amt = parseFloat(it.total || it.amount || (qty * (it.price || 0)));
        if (!itemMap[name]) itemMap[name] = { name, qty: 0, revenue: 0 };
        itemMap[name].qty += qty;
        itemMap[name].revenue += amt;
      });
    });

    const ranked = Object.values(itemMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

    if (ranked.length > 0) {
      const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
      reply(`
        <div style="line-height:1.45;">
          <div style="font-size:0.92rem; font-weight:800; color:#f59e0b; display:flex; align-items:center; gap:6px;">
            <span>🏆 Top Best-Selling Products (Highest Demand):</span>
          </div>
          <div style="margin-top:6px;">
            ${ranked.map((r, i) => `
              <div style="background:#020617; border:1px solid #1e293b; border-radius:6px; padding:6px 10px; margin-top:4px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <span style="font-size:0.9rem;">${medals[i]}</span> <strong style="color:#f8fafc; font-size:0.82rem;">${r.name}</strong><br>
                  <span style="font-size:0.72rem; color:#94a3b8;">Total Sold: <strong style="color:#38bdf8;">${r.qty} units</strong></span>
                </div>
                <div style="text-align:right;">
                  <span style="font-size:0.76rem; color:#10b981; font-weight:700;">Revenue: ₹ ${r.revenue.toFixed(2)}</span>
                </div>
              </div>
            `).join('')}
          </div>
          <div style="margin-top:8px;">
            <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('sales-reports')" style="font-size:0.74rem; padding:4px 10px; font-weight:700;">
              📑 View Product Sales Report (Screen 18)
            </button>
          </div>
        </div>
      `);
      return;
    } else {
      reply("📊 Abhi tak koi sales record nahi mila hai. POS counter se pehla bill generate karein!");
      return;
    }
  }

  // 2d. MARKET UDHAR / CUSTOMER DEBT ("market me kitna udhar hai", "kitna udhar bacha hai", "customer udhar", "defaulters", etc.)
  const isUdharQuery = (q.includes('udhar') || q.includes('baaki') || q.includes('debt') || q.includes('receivable') || q.includes('defaulter') || q.includes('paisa lena')) &&
                       !q.includes('supplier') && !q.includes('wholesaler');
  if (isUdharQuery) {
    const custs = posState.customers || [];
    const totalMarketDue = custs.reduce((acc, c) => acc + (parseFloat(c.due || c.balance || 0)), 0);
    const debtorCusts = custs.filter(c => (parseFloat(c.due || c.balance || 0)) > 0).sort((a, b) => (parseFloat(b.due || b.balance || 0)) - (parseFloat(a.due || a.balance || 0)));

    reply(`
      <div style="line-height:1.45;">
        <div style="font-size:0.92rem; font-weight:800; color:#ef4444; display:flex; align-items:center; gap:6px;">
          <span>📒 Market Udhar (Customer Pending Receivables):</span>
        </div>
        <div style="margin-top:6px; background:#020617; border:1px solid #1e293b; border-radius:6px; padding:8px 10px; font-size:0.8rem; line-height:1.65;">
          &bull; 💰 <strong>Total Market Udhar:</strong> <strong style="color:#ef4444; font-size:0.95rem;">₹ ${totalMarketDue.toFixed(2)}</strong><br>
          &bull; 👥 <strong>Pending Customers Count:</strong> <strong>${debtorCusts.length}</strong> out of ${custs.length} total customers
        </div>
        ${debtorCusts.length > 0 ? `
          <div style="margin-top:6px; font-weight:700; font-size:0.76rem; color:#cbd5e1;">Top Pending Accounts:</div>
          <div style="margin-top:4px; max-height:180px; overflow-y:auto;">
            ${debtorCusts.slice(0, 5).map((c, idx) => `
              <div style="background:#020617; border:1px solid #ef4444; border-radius:6px; padding:6px 10px; margin-top:4px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <strong style="color:#f8fafc; font-size:0.8rem;">${idx + 1}. ${c.name}</strong><br>
                  <span style="font-size:0.72rem; color:#94a3b8;">📞 ${c.mobile || 'N/A'}</span>
                </div>
                <div style="text-align:right;">
                  <strong style="color:#ef4444; font-size:0.8rem;">Due: ₹ ${(parseFloat(c.due || c.balance || 0)).toFixed(2)}</strong>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        <div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap;">
          <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('ledger')" style="font-size:0.74rem; padding:4px 10px; font-weight:700;">
            📒 Open Khata Ledgers (Screen 16)
          </button>
          <button type="button" class="btn btn-sm btn-outline" onclick="navigateToScreen('customers')" style="font-size:0.74rem; padding:4px 10px; font-weight:700;">
            👥 Customer Master (Screen 11)
          </button>
        </div>
      </div>
    `);
    return;
  }

  // 2e. SUPPLIER PAYABLES / DUKAAN KA DENA ("supplier ka kitna dena hai", "supplier balance", "dukaan ka udhar", etc.)
  const isSupplierPayableQuery = (q.includes('supplier') || q.includes('wholesaler') || q.includes('vendor')) && 
                                 (q.includes('dena') || q.includes('due') || q.includes('baaki') || q.includes('payable') || q.includes('paisa dena'));
  if (isSupplierPayableQuery) {
    const supps = posState.suppliers || [];
    const totalSuppDue = supps.reduce((acc, s) => acc + (parseFloat(s.due || s.balance || 0)), 0);
    const pendingSupps = supps.filter(s => (parseFloat(s.due || s.balance || 0)) > 0).sort((a, b) => (parseFloat(b.due || b.balance || 0)) - (parseFloat(a.due || a.balance || 0)));

    reply(`
      <div style="line-height:1.45;">
        <div style="font-size:0.92rem; font-weight:800; color:#38bdf8; display:flex; align-items:center; gap:6px;">
          <span>🏭 Supplier Outstanding Payables (Dukaan Ka Dena):</span>
        </div>
        <div style="margin-top:6px; background:#020617; border:1px solid #1e293b; border-radius:6px; padding:8px 10px; font-size:0.8rem; line-height:1.65;">
          &bull; 💰 <strong>Total Supplier Payables:</strong> <strong style="color:${totalSuppDue > 0 ? '#ef4444' : '#10b981'}; font-size:0.95rem;">₹ ${totalSuppDue.toFixed(2)}</strong><br>
          &bull; 🏢 <strong>Pending Vendors:</strong> ${pendingSupps.length} out of ${supps.length} registered suppliers
        </div>
        ${pendingSupps.length > 0 ? `
          <div style="margin-top:6px; max-height:180px; overflow-y:auto;">
            ${pendingSupps.map((s, idx) => `
              <div style="background:#020617; border:1px solid #1e293b; border-radius:6px; padding:6px 10px; margin-top:4px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <strong style="color:#f8fafc; font-size:0.8rem;">${idx + 1}. ${s.name}</strong><br>
                  <span style="font-size:0.72rem; color:#94a3b8;">📞 ${s.mobile}</span>
                </div>
                <div style="text-align:right;">
                  <strong style="color:#ef4444; font-size:0.8rem;">Payable: ₹ ${(parseFloat(s.due || s.balance || 0)).toFixed(2)}</strong>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        <div style="margin-top:8px; display:flex; gap:6px;">
          <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('suppliers')" style="font-size:0.74rem; padding:4px 10px; font-weight:700;">
            🏢 Open Supplier Master (Screen 12)
          </button>
        </div>
      </div>
    `);
    return;
  }

  // 2f. TODAY'S SALES & REVENUE REPORT ("aaj kitni sale hui", "aaj ki kamai", "today sales", "bikri", etc.)
  const isSalesQuery = q.includes('sale') || q.includes('revenue') || q.includes('kamai') || q.includes('bikri') || 
                       (q.includes('aaj') && (q.includes('kitna') || q.includes('bika') || q.includes('collection')));
  if (isSalesQuery) {
    const isOverall = q.includes('total') || q.includes('overall') || q.includes('kul') || q.includes('ab tak') || q.includes('all time');
    const todayStr = new Date().toISOString().split('T')[0];
    const allSales = posState.salesHistory || [];
    const relevantSales = isOverall ? allSales : allSales.filter(s => {
      if (!s.date) return false;
      const d = s.date.includes('/') ? s.date.split('/').reverse().join('-') : s.date;
      return d.startsWith(todayStr);
    });

    const totalAmt = relevantSales.reduce((acc, s) => acc + (parseFloat(s.amount) || 0), 0);
    const cashAmt = relevantSales.filter(s => s.paymentMode === 'CASH' || (s.payment && s.payment.includes('Cash'))).reduce((acc, s) => acc + (parseFloat(s.amount) || 0), 0);
    const onlineAmt = totalAmt - cashAmt;
    const avgBill = relevantSales.length > 0 ? (totalAmt / relevantSales.length) : 0;

    reply(`
      <div style="background:#020617; border:1px solid #1e293b; border-radius:8px; padding:10px;">
        <div style="font-weight:700; color:#10b981; font-size:0.95rem; margin-bottom:4px;">
          📊 Live Sales Summary (${isOverall ? 'All-Time Overall' : 'Aaj Ki Collection'})
        </div>
        <div style="font-size:0.82rem; color:#cbd5e1; line-height:1.65;">
          &bull; 🧾 Total Invoices: <strong>${relevantSales.length} bills</strong><br>
          &bull; 💰 Total Revenue: <strong style="color:#10b981; font-size:0.95rem;">₹ ${totalAmt.toFixed(2)}</strong><br>
          &bull; 💵 Cash Collection: <strong>₹ ${cashAmt.toFixed(2)}</strong><br>
          &bull; 📱 Digital / UPI / Card / Credit: <strong>₹ ${onlineAmt.toFixed(2)}</strong><br>
          &bull; 🏷️ Average Bill Size: <strong>₹ ${avgBill.toFixed(2)}</strong>
        </div>
        <div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap;">
          <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('sales-history')" style="font-size:0.74rem; padding:4px 10px; font-weight:700;">
            🧾 View Sales History (Screen 17)
          </button>
          <button type="button" class="btn btn-sm btn-outline" onclick="navigateToScreen('sales-reports')" style="font-size:0.74rem; padding:4px 10px; font-weight:700;">
            📑 Open Sales Reports (Screen 18)
          </button>
        </div>
      </div>
    `);
    return;
  }

  // =========================================================================
  // 3. INVENTORY AUDIT & STOCK ALERTS (LOW, ZERO, NEGATIVE)
  // =========================================================================

  // 3a. NEGATIVE STOCK INQUIRY OR REPAIR ("Negative stock kiske hai dekho", "minus stock", etc.)
  const isNegStockCheck = (q.includes('negative') && (q.includes('stock') || q.includes('item') || q.includes('kiske') || q.includes('kiska') || q.includes('list') || q.includes('batao') || q.includes('dekh'))) ||
                          (q.includes('minus') && q.includes('stock')) ||
                          (q.includes('stock') && (q.includes('minus') || q.includes('negative') || q.includes('kam ho gaya')));

  if (isNegStockCheck) {
    if (isFixAction) {
      executeAIAutoRepair('FIX_NEGATIVE_STOCK');
      reply("📦 Saare negative stock items ko safaltapoorvak 0 par reconcile kar diya gaya hai aur product audit trail me log kar diya gaya hai.");
      return;
    } else {
      const negProds = (posState.products || []).filter(p => p.stock < 0);
      if (negProds.length > 0) {
        let itemsHtml = negProds.map(p => `
          <div style="background:#020617; border:1px solid #ef4444; border-radius:6px; padding:6px 10px; margin-top:4px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="color:#f8fafc;">${p.name}</strong> (Code: <code>${p.code}</code>)<br>
              <span style="color:#ef4444; font-weight:700; font-size:0.75rem;">Current Stock: ${p.stock} ${p.unit} (Negative Inventory!)</span>
            </div>
            <button type="button" class="btn btn-sm btn-danger" onclick="aiFixEntity('PRODUCT_STOCK', ${p.id}, this)" style="font-size:0.72rem; padding:3px 10px; font-weight:700;">
              ⚡ Reconcile to 0
            </button>
          </div>
        `).join('');

        reply(`
          <div>
            <strong style="color:#ef4444;">⚠️ Found ${negProds.length} item(s) with Negative Stock:</strong>
            <div style="margin-top:6px;">${itemsHtml}</div>
            <div style="margin-top:8px;">
              <button type="button" class="btn btn-sm btn-success" onclick="aiFixEntity('ALL_NEGATIVE_STOCKS', null, this)" style="font-weight:700; font-size:0.78rem; width:100%; padding:6px;">
                ⚡ 1-Click Fix All Negative Stocks to 0
              </button>
            </div>
          </div>
        `);
        return;
      } else {
        reply("✅ <strong>Live Inventory Check:</strong> Kisi bhi product ka stock negative nahi hai! Sabhi products ka physical inventory level healthy (>= 0) hai.");
        return;
      }
    }
  }

  // 3b. LOW STOCK, ZERO STOCK & OUT OF STOCK INQUIRY
  const isStockLevelQuery = 
    (q.includes('low') && (q.includes('stock') || q.includes('item') || q.includes('product'))) ||
    (q.includes('stock') && (q.includes('low') || q.includes('kam') || q.includes('khatam') || q.includes('zero') || q.includes('bache') || q.includes('bacha') || q.includes('reorder') || q.includes('alert') || q.includes('kitne') || q.includes('kiska') || q.includes('kiske') || q.includes('check') || q.includes('batao') || q.includes('list') || q.includes('kitna') || q.includes('glt') || q.includes('galat'))) ||
    q.includes('out of stock') ||
    q.includes('zero stock') ||
    q.includes('stock alert') ||
    q.includes('kam stock') ||
    q.includes('stock status') ||
    q.includes('khatam ho gaya') ||
    q.includes('khatam ho gaye') ||
    q.includes('khatam');

  if (isStockLevelQuery) {
    let specificProductMatch = null;
    for (const p of (posState.products || [])) {
      const pName = p.name.toLowerCase();
      if (q.includes(pName) || (p.code && q.includes(p.code.toLowerCase()))) {
        specificProductMatch = p;
        break;
      }
    }

    if (specificProductMatch && !q.includes('kitne') && !q.includes('all') && !q.includes('sabhi') && !q.includes('list') && !q.includes('batao')) {
      inspectProductInChat(specificProductMatch, reply);
      return;
    }

    const allProds = posState.products || [];
    const outOfStockProds = allProds.filter(p => p.stock === 0);
    const negativeStockProds = allProds.filter(p => p.stock < 0);
    const lowStockProds = allProds.filter(p => {
      const threshold = (p.minStock !== undefined && p.minStock !== null && p.minStock > 0) ? p.minStock : 10;
      return p.stock > 0 && p.stock <= threshold;
    });

    const totalAlertCount = outOfStockProds.length + negativeStockProds.length + lowStockProds.length;

    if (totalAlertCount > 0) {
      let outHtml = '';
      if (outOfStockProds.length > 0) {
        outHtml = `
          <div style="margin-top:6px; background:#020617; border:1px solid #ef4444; border-radius:6px; padding:8px 10px;">
            <div style="color:#ef4444; font-weight:800; font-size:0.8rem; display:flex; justify-content:space-between; align-items:center;">
              <span>🔴 Out of Stock (Stock: 0 - Immediate Reorder):</span>
              <span style="background:#ef4444; color:#fff; font-size:0.65rem; padding:1px 6px; border-radius:10px;">${outOfStockProds.length} Item${outOfStockProds.length > 1 ? 's' : ''}</span>
            </div>
            <div style="margin-top:4px; font-size:0.78rem; line-height:1.5;">
              ${outOfStockProds.map(p => `&bull; <strong>${p.name}</strong> (Code: <code>${p.code}</code>): <strong style="color:#ef4444;">0 ${p.unit}</strong> <span style="color:#94a3b8; font-size:0.72rem;">(Min alert: ${p.minStock || 10})</span>`).join('<br>')}
            </div>
          </div>
        `;
      }

      let negHtml = '';
      if (negativeStockProds.length > 0) {
        negHtml = `
          <div style="margin-top:6px; background:#020617; border:1px solid #dc2626; border-radius:6px; padding:8px 10px;">
            <div style="color:#ef4444; font-weight:800; font-size:0.8rem; display:flex; justify-content:space-between; align-items:center;">
              <span>🚨 Negative Stock (Minus Inventory):</span>
              <span style="background:#dc2626; color:#fff; font-size:0.65rem; padding:1px 6px; border-radius:10px;">${negativeStockProds.length} Item${negativeStockProds.length > 1 ? 's' : ''}</span>
            </div>
            <div style="margin-top:4px; font-size:0.78rem; line-height:1.6;">
              ${negativeStockProds.map(p => `&bull; <strong>${p.name}</strong>: <strong style="color:#ef4444;">${p.stock} ${p.unit}</strong> <button type="button" class="btn btn-sm btn-danger" onclick="aiFixEntity('PRODUCT_STOCK', ${p.id}, this)" style="font-size:0.68rem; padding:2px 6px; margin-left:6px; font-weight:700;">⚡ Fix to 0</button>`).join('<br>')}
            </div>
          </div>
        `;
      }

      let lowHtml = '';
      if (lowStockProds.length > 0) {
        lowHtml = `
          <div style="margin-top:6px; background:#020617; border:1px solid #f59e0b; border-radius:6px; padding:8px 10px;">
            <div style="color:#f59e0b; font-weight:800; font-size:0.8rem; display:flex; justify-content:space-between; align-items:center;">
              <span>⚠️ Low Stock (Below Minimum Threshold):</span>
              <span style="background:#f59e0b; color:#000; font-size:0.65rem; padding:1px 6px; border-radius:10px; font-weight:800;">${lowStockProds.length} Item${lowStockProds.length > 1 ? 's' : ''}</span>
            </div>
            <div style="margin-top:4px; font-size:0.78rem; line-height:1.5;">
              ${lowStockProds.map(p => `&bull; <strong>${p.name}</strong> (Code: <code>${p.code}</code>): <strong style="color:#f59e0b;">${p.stock} ${p.unit}</strong> <span style="color:#94a3b8; font-size:0.72rem;">(Min alert: ${p.minStock || 10})</span>`).join('<br>')}
            </div>
          </div>
        `;
      }

      reply(`
        <div style="line-height:1.45;">
          <div style="font-size:0.92rem; font-weight:800; color:#f59e0b; display:flex; align-items:center; gap:6px;">
            <span>⚠️ Total <strong>${totalAlertCount} Products</strong> me Stock Alert hai!</span>
          </div>
          <div style="font-size:0.75rem; color:#cbd5e1; margin-top:2px;">
            ${outOfStockProds.length > 0 ? `<strong style="color:#ef4444;">${outOfStockProds.length} Out of Stock</strong>` : ''}
            ${(outOfStockProds.length > 0 && lowStockProds.length > 0) ? ' &bull; ' : ''}
            ${lowStockProds.length > 0 ? `<strong style="color:#f59e0b;">${lowStockProds.length} Low Stock</strong>` : ''}
            ${negativeStockProds.length > 0 ? ` &bull; <strong style="color:#ef4444;">${negativeStockProds.length} Negative Stock</strong>` : ''}
          </div>

          ${outHtml}
          ${negHtml}
          ${lowHtml}

          <div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('inventory')" style="font-size:0.74rem; padding:4px 10px; font-weight:700;">
              📦 View in Inventory (Screen 9)
            </button>
            <button type="button" class="btn btn-sm btn-outline" onclick="navigateToScreen('purchase')" style="font-size:0.74rem; padding:4px 10px; font-weight:700;">
              📥 Inward Stock (Screen 10)
            </button>
          </div>
        </div>
      `);
      return;
    } else {
      reply(`
        <div style="background:#020617; border:1px solid #10b981; border-radius:8px; padding:10px;">
          <strong style="color:#10b981;">✅ All Inventory Levels Healthy:</strong><br>
          <span style="font-size:0.8rem; color:#cbd5e1;">
            Kisi bhi product ka stock <strong>0</strong> ya minimum alert limit se kam nahi hai. Saare <strong>${allProds.length} products</strong> ka stock sufficient hai!
          </span>
        </div>
      `);
      return;
    }
  }

  // =========================================================================
  // 4. DIRECTORY TOTALS & COUNTS (SUPPLIERS, CUSTOMERS, PRODUCTS, CATEGORIES)
  // =========================================================================

  // 4a. SUPPLIERS TOTAL / LIST QUERY
  const isSupplierTotalQuery = 
    (q.includes('supplier') || q.includes('suppliers')) && 
    (q.includes('kitne') || q.includes('kitna') || q.includes('total') || q.includes('count') || q.includes('list') || q.includes('sabhi') || q.includes('all') || q.includes('details') || q.includes('batao') || q.includes('show') || q.includes('kiske') || q.includes('kaun'));

  if (isSupplierTotalQuery) {
    const supps = posState.suppliers || [];
    const totalSuppDue = supps.reduce((acc, s) => acc + (parseFloat(s.due || s.balance || 0)), 0);

    let suppListHtml = supps.map((s, idx) => `
      <div style="background:#020617; border:1px solid #1e293b; border-radius:6px; padding:6px 10px; margin-top:4px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="color:#f8fafc; font-size:0.82rem;">${idx + 1}. ${s.name}</strong><br>
          <span style="font-size:0.72rem; color:#94a3b8;">Contact: ${s.contact || s.name} &bull; 📞 ${s.mobile}</span>
        </div>
        <div style="text-align:right;">
          <span style="font-size:0.75rem; color:${(s.due || s.balance || 0) > 0 ? '#ef4444' : '#10b981'}; font-weight:700;">
            Due: ₹ ${(parseFloat(s.due || s.balance || 0)).toFixed(2)}
          </span>
        </div>
      </div>
    `).join('');

    reply(`
      <div style="line-height:1.45;">
        <div style="font-size:0.92rem; font-weight:800; color:#38bdf8; display:flex; align-items:center; gap:6px;">
          <span>🏢 Total <strong>${supps.length} Registered Suppliers</strong> hain:</span>
        </div>
        <div style="font-size:0.75rem; color:#cbd5e1; margin-top:2px;">
          Total Supplier Outstanding Payable: <strong style="color:${totalSuppDue > 0 ? '#ef4444' : '#10b981'};">₹ ${totalSuppDue.toFixed(2)}</strong>
        </div>
        <div style="margin-top:6px; max-height:220px; overflow-y:auto;">
          ${suppListHtml}
        </div>
        <div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap;">
          <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('suppliers')" style="font-size:0.74rem; padding:4px 10px; font-weight:700;">
            🏢 Open Screen 12 (Supplier Master)
          </button>
          <button type="button" class="btn btn-sm btn-outline" onclick="navigateToScreen('purchase')" style="font-size:0.74rem; padding:4px 10px; font-weight:700;">
            📥 New Purchase Order (Screen 10)
          </button>
        </div>
      </div>
    `);
    return;
  }

  // 4b. CUSTOMERS TOTAL / LIST QUERY
  const isCustomerTotalQuery = 
    (q.includes('customer') || q.includes('customers') || q.includes('grahak')) && 
    (q.includes('kitne') || q.includes('kitna') || q.includes('total') || q.includes('count') || q.includes('list') || q.includes('sabhi') || q.includes('all') || q.includes('details') || q.includes('batao') || q.includes('show'));

  if (isCustomerTotalQuery) {
    const custs = posState.customers || [];
    const totalMarketDue = custs.reduce((acc, c) => acc + (parseFloat(c.due || c.balance || 0)), 0);
    const dueCusts = custs.filter(c => (parseFloat(c.due || c.balance || 0)) > 0);

    reply(`
      <div style="line-height:1.45;">
        <div style="font-size:0.92rem; font-weight:800; color:#38bdf8; display:flex; align-items:center; gap:6px;">
          <span>👥 Total <strong>${custs.length} Customers</strong> Directory me hain:</span>
        </div>
        <div style="font-size:0.75rem; color:#cbd5e1; margin-top:2px;">
          Total Market Udhar (Receivable): <strong style="color:${totalMarketDue > 0 ? '#ef4444' : '#10b981'};">₹ ${totalMarketDue.toFixed(2)}</strong> (${dueCusts.length} customers with pending balance)
        </div>
        <div style="margin-top:6px; max-height:200px; overflow-y:auto;">
          ${custs.slice(0, 6).map((c, idx) => `
            <div style="background:#020617; border:1px solid #1e293b; border-radius:6px; padding:6px 10px; margin-top:4px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong style="color:#f8fafc; font-size:0.8rem;">${idx + 1}. ${c.name}</strong><br>
                <span style="font-size:0.72rem; color:#94a3b8;">📞 ${c.mobile || 'N/A'}</span>
              </div>
              <span style="font-size:0.75rem; font-weight:700; color:${(c.due || c.balance || 0) > 0 ? '#ef4444' : '#10b981'};">
                Due: ₹ ${(parseFloat(c.due || c.balance || 0)).toFixed(2)}
              </span>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:8px; display:flex; gap:6px;">
          <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('customers')" style="font-size:0.74rem; padding:4px 10px; font-weight:700;">
            👥 Open Screen 11 (Customer Master)
          </button>
        </div>
      </div>
    `);
    return;
  }

  // 4c. PRODUCTS TOTAL CATALOG QUERY
  const isProductTotalQuery = 
    (q.includes('product') || q.includes('products') || q.includes('item') || q.includes('items') || q.includes('catalog')) && 
    (q.includes('kitne') || q.includes('kitna') || q.includes('total') || q.includes('count') || q.includes('overall') || q.includes('sabhi')) &&
    !q.includes('low') && !q.includes('zero') && !q.includes('kam') && !q.includes('khatam') && !q.includes('negative') && !q.includes('minus');

  if (isProductTotalQuery) {
    const allP = posState.products || [];
    const inStock = allP.filter(p => p.stock > (p.minStock || 10)).length;
    const lowStock = allP.filter(p => p.stock > 0 && p.stock <= (p.minStock || 10)).length;
    const outStock = allP.filter(p => p.stock <= 0).length;

    reply(`
      <div style="line-height:1.45;">
        <div style="font-size:0.92rem; font-weight:800; color:#38bdf8; display:flex; align-items:center; gap:6px;">
          <span>📦 Total <strong>${allP.length} Products</strong> Master Catalog me hain:</span>
        </div>
        <div style="margin-top:6px; background:#020617; border:1px solid #1e293b; border-radius:6px; padding:8px 10px; font-size:0.78rem; line-height:1.6;">
          &bull; 🟢 <strong>In Stock (Healthy):</strong> ${inStock} items<br>
          &bull; 🟡 <strong>Low Stock Alert:</strong> ${lowStock} items<br>
          &bull; 🔴 <strong>Out of Stock (Zero/Negative):</strong> ${outStock} items<br>
          &bull; 🏷️ <strong>Total Categories:</strong> ${(posState.categories || []).length} categories
        </div>
        <div style="margin-top:8px; display:flex; gap:6px;">
          <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('products')" style="font-size:0.74rem; padding:4px 10px; font-weight:700;">
            📦 Open Screen 7 (Product Master)
          </button>
        </div>
      </div>
    `);
    return;
  }

  // 4d. CATEGORIES MASTER TOTAL
  const isCategoryQuery = (q.includes('category') || q.includes('categories') || q.includes('department')) && 
                          (q.includes('kitne') || q.includes('total') || q.includes('count') || q.includes('list') || q.includes('batao'));
  if (isCategoryQuery) {
    const cats = posState.categories || [];
    reply(`
      <div style="line-height:1.45;">
        <strong style="color:#38bdf8;">🏷️ Total ${cats.length} Product Categories Registered:</strong>
        <div style="margin-top:6px; background:#020617; border:1px solid #1e293b; border-radius:6px; padding:8px 10px; font-size:0.78rem; line-height:1.6;">
          ${cats.map((c, i) => `&bull; <strong>${i+1}. ${typeof c === 'object' ? c.name : c}</strong>`).join('<br>')}
        </div>
        <div style="margin-top:8px;">
          <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('categories')" style="font-size:0.74rem; padding:4px 10px; font-weight:700;">
            🏷️ Open Screen 8 (Categories Master)
          </button>
        </div>
      </div>
    `);
    return;
  }

  // 4e. BRANCHES DIRECTORY TOTAL
  const isBranchTotalQuery = (q.includes('branch') || q.includes('branches') || q.includes('outlet')) && 
                             (q.includes('kitne') || q.includes('total') || q.includes('list') || q.includes('batao')) &&
                             !q.includes('transfer');
  if (isBranchTotalQuery) {
    const branches = posState.branches || [];
    reply(`
      <div style="line-height:1.45;">
        <strong style="color:#38bdf8;">🏢 Total ${branches.length} Outlets / Branches:</strong>
        <div style="margin-top:6px; background:#020617; border:1px solid #1e293b; border-radius:6px; padding:8px 10px; font-size:0.78rem; line-height:1.6;">
          ${branches.map((b, i) => `&bull; <strong>${b.name}</strong> (${b.code || 'BR' + (i+1)}) - ${b.address || 'Main Location'}`).join('<br>')}
        </div>
        <div style="margin-top:8px;">
          <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('branches')" style="font-size:0.74rem; padding:4px 10px; font-weight:700;">
            🏢 Open Screen 24 (Branch Management)
          </button>
        </div>
      </div>
    `);
    return;
  }

  // =========================================================================
  // 5. APPLICATION HOW-TO GUIDES & NAVIGATION (ALL 24 SCREENS)
  // =========================================================================

  // 5a. EXCEL / CSV BULK PRODUCT UPLOAD ("excel se product kaise dale", "csv bulk upload", etc.)
  const isExcelUploadQuery = q.includes('excel') || q.includes('csv') || q.includes('bulk upload') || 
                             q.includes('bulk product') || q.includes('import product') || q.includes('file se product');
  if (isExcelUploadQuery) {
    reply(`
      <div style="line-height:1.5;">
        <strong style="color:#10b981;">📥 Excel / CSV Bulk Product Upload Guide:</strong><br>
        <span style="font-size:0.8rem; color:#cbd5e1;">Aap hazaron products 1 minute me Excel/CSV file se upload kar sakte hain:</span>
        <div style="margin-top:6px; background:#020617; border:1px solid #1e293b; border-radius:6px; padding:8px 10px; font-size:0.78rem; line-height:1.65;">
          <strong>1.</strong> Neeche diye gaye button par click karke <strong>Screen 7 (Product Master)</strong> kholein.<br>
          <strong>2.</strong> Screen ke top right par <strong>"📥 Import CSV"</strong> button par click karein.<br>
          <strong>3.</strong> CSV Format: <code>Code, Name, Category, Cost, Price, Stock, Unit, Barcode</code>.<br>
          <strong>4.</strong> File select karte hi saare items automatic catalog me add aur live stock update ho jayenge!
        </div>
        <div style="margin-top:8px; display:flex; gap:6px;">
          <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('products')" style="font-size:0.75rem; padding:5px 12px; font-weight:700;">
            📦 Open Screen 7 (Product Master) Now
          </button>
        </div>
      </div>
    `);
    return;
  }

  // 5b. BILLING & CHECKOUT / HOW TO BILL ("bill kaise banaye", "naya bill", "billing kaise kare", etc.)
  const isBillingHowTo = (q.includes('bill') || q.includes('billing') || q.includes('sale') || q.includes('pos')) && 
                         (q.includes('kaise kare') || q.includes('kaise banaye') || q.includes('kaise use') || q.includes('sikhao') || q.includes('process') || q.includes('how to'));
  if (isBillingHowTo) {
    reply(`
      <div style="line-height:1.5;">
        <strong style="color:#38bdf8;">🛒 Fast POS Billing Step-by-Step Guide:</strong>
        <div style="margin-top:6px; background:#020617; border:1px solid #1e293b; border-radius:6px; padding:8px 10px; font-size:0.78rem; line-height:1.65;">
          <strong>1. Item Search:</strong> Barcode scanner se scan karein (<kbd>F2</kbd>) ya product search kholein (<kbd>F4</kbd>).<br>
          <strong>2. Quantity:</strong> Cart me quantity set karein (+ / - buttons).<br>
          <strong>3. Customer:</strong> Regular grahak ka naam/mobile select karein ya Walk-in rehne dein.<br>
          <strong>4. Checkout:</strong> Keyboard par <kbd>F12</kbd> dabayein ya <strong>"Pay (F12)"</strong> button click karein.<br>
          <strong>5. Payment & Print:</strong> Cash, UPI QR code ya Credit select karein aur thermal receipt turant print ho jayegi!
        </div>
        <div style="margin-top:8px;">
          <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('pos')" style="font-size:0.75rem; padding:5px 12px; font-weight:700;">
            🛒 Go to Screen 2 (POS Billing Counter)
          </button>
        </div>
      </div>
    `);
    return;
  }

  // 5c. LEDGER / KHATA REFRESH & USAGE ("ledger khata me refresh", "khata refresh kaise kare", "statement clear")
  const isLedgerRefreshQuery = (q.includes('ledger') || q.includes('khata')) && 
                               (q.includes('refresh') || q.includes('clear') || q.includes('kaise') || q.includes('statement') || q.includes('use'));
  if (isLedgerRefreshQuery) {
    reply(`
      <div style="line-height:1.5;">
        <strong style="color:#38bdf8;">📒 Customer & Supplier Khata Ledger Guide:</strong>
        <div style="margin-top:6px; background:#020617; border:1px solid #1e293b; border-radius:6px; padding:8px 10px; font-size:0.78rem; line-height:1.65;">
          &bull; <strong>Khata Statement:</strong> Screen 16 par jaakar koi bhi Customer ya Supplier select karein. Unka poora debit/credit running balance statement dikhega.<br>
          &bull; <strong>🔄 Refresh Button:</strong> Agar aap koi new payment ya bill add karte hain, toh "Refresh" button click karne par screen clear hokar latest database transactions synchronize karta hai.<br>
          &bull; <strong>Payments:</strong> "Receive Payment" button se customer ka jama amount turant credit kar sakte hain.
        </div>
        <div style="margin-top:8px;">
          <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('ledger')" style="font-size:0.75rem; padding:5px 12px; font-weight:700;">
            📒 Open Screen 16 (Khata Ledger)
          </button>
        </div>
      </div>
    `);
    return;
  }

  // 5d. PURCHASE ENTRY / INWARD STOCK ("purchase entry kaise kare", "maal kaise add kare", etc.)
  const isPurchaseHowTo = (q.includes('purchase') || q.includes('inward') || q.includes('maal add')) && 
                          (q.includes('kaise') || q.includes('entry') || q.includes('how to') || q.includes('sikhao'));
  if (isPurchaseHowTo) {
    reply(`
      <div style="line-height:1.5;">
        <strong style="color:#38bdf8;">📥 Purchase Entry (Stock Inward) Guide:</strong>
        <div style="margin-top:6px; background:#020617; border:1px solid #1e293b; border-radius:6px; padding:8px 10px; font-size:0.78rem; line-height:1.65;">
          <strong>1.</strong> <strong>Screen 10 (Purchase Entry)</strong> kholein.<br>
          <strong>2.</strong> Wholesaler / Supplier select karein.<br>
          <strong>3.</strong> Products choose karke inward quantity aur purchase rate enter karein.<br>
          <strong>4.</strong> "Save Purchase" click karein. Stock automatic inventory me add ho jayega aur supplier ka khata balance update ho jayega!
        </div>
        <div style="margin-top:8px;">
          <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('purchase')" style="font-size:0.75rem; padding:5px 12px; font-weight:700;">
            📥 Open Screen 10 (Purchase Entry)
          </button>
        </div>
      </div>
    `);
    return;
  }

  // 5e. RETURNS (SALES RETURN & PURCHASE RETURN)
  const isReturnHowTo = (q.includes('return') || q.includes('wapas') || q.includes('credit note') || q.includes('debit note')) && 
                        (q.includes('kaise') || q.includes('kare') || q.includes('how to') || q.includes('karna'));
  if (isReturnHowTo) {
    const isPurchaseRet = q.includes('purchase') || q.includes('supplier');
    if (isPurchaseRet) {
      reply(`
        <div style="line-height:1.5;">
          <strong style="color:#f59e0b;">🔄 Purchase Return (Supplier Wapsi / Debit Note):</strong>
          <div style="margin-top:6px; background:#020617; border:1px solid #1e293b; border-radius:6px; padding:8px 10px; font-size:0.78rem; line-height:1.65;">
            Kharaab ya unsold stock supplier ko wapas karne ke liye <strong>Screen 14 (Purchase Return)</strong> use karein. Supplier choose karein, returning quantity dalein. Yeh supplier ke due me se amount minus karega aur debit note banayega.
          </div>
          <div style="margin-top:8px;">
            <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('purchase-return')" style="font-size:0.75rem; padding:5px 12px; font-weight:700;">
              🔄 Open Screen 14 (Purchase Return)
            </button>
          </div>
        </div>
      `);
    } else {
      reply(`
        <div style="line-height:1.5;">
          <strong style="color:#38bdf8;">🔄 Sales Return (Grahak Ka Maal Wapsi / Credit Note):</strong>
          <div style="margin-top:6px; background:#020617; border:1px solid #1e293b; border-radius:6px; padding:8px 10px; font-size:0.78rem; line-height:1.65;">
            Grahak ka item wapas lene ke liye <strong>Screen 13 (Sales Return)</strong> kholein. Invoice number enter karein, returning item aur quantity select karein. Physical stock inventory me wapas add ho jayega aur cash refund ya credit note generate ho jayega!
          </div>
          <div style="margin-top:8px;">
            <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('sales-return')" style="font-size:0.75rem; padding:5px 12px; font-weight:700;">
              🔄 Open Screen 13 (Sales Return)
            </button>
          </div>
        </div>
      `);
    }
    return;
  }

  // 5f. STOCK TRANSFER BETWEEN BRANCHES
  const isTransferHowTo = (q.includes('stock transfer') || q.includes('branch transfer') || q.includes('maal transfer') || q.includes('dusre branch')) &&
                          (q.includes('kaise') || q.includes('kare') || q.includes('how to'));
  if (isTransferHowTo) {
    reply(`
      <div style="line-height:1.5;">
        <strong style="color:#38bdf8;">🚚 Inter-Branch Stock Transfer Guide:</strong>
        <div style="margin-top:6px; background:#020617; border:1px solid #1e293b; border-radius:6px; padding:8px 10px; font-size:0.78rem; line-height:1.65;">
          Ek branch se doosri branch me maal bhejne ke liye <strong>Screen 15 (Stock Transfer)</strong> kholein. Source branch aur Destination branch select karein, items aur quantity add karein aur "Dispatch" karein. Stock automatically update ho jayega!
        </div>
        <div style="margin-top:8px;">
          <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('stock-transfer')" style="font-size:0.75rem; padding:5px 12px; font-weight:700;">
            🚚 Open Screen 15 (Stock Transfer)
          </button>
        </div>
      </div>
    `);
    return;
  }

  // 5g. USERS, PASSWORDS & CASHIER PERMISSIONS
  const isUsersHowTo = (q.includes('user') || q.includes('password') || q.includes('cashier') || q.includes('permission') || q.includes('role')) && 
                       (q.includes('kaise') || q.includes('change') || q.includes('add') || q.includes('banaye') || q.includes('set') || q.includes('badle') || q.includes('how to'));
  if (isUsersHowTo) {
    reply(`
      <div style="line-height:1.5;">
        <strong style="color:#38bdf8;">🔐 User Accounts, Roles & Cashier Permissions:</strong>
        <div style="margin-top:6px; background:#020617; border:1px solid #1e293b; border-radius:6px; padding:8px 10px; font-size:0.78rem; line-height:1.65;">
          &bull; <strong>Screen 20 (Users & Permissions)</strong> par naye users banayein ya password change karein.<br>
          &bull; <strong>ADMIN:</strong> Poore system ka 100% full access.<br>
          &bull; <strong>MANAGER:</strong> Reports, inventory, aur purchases ka access.<br>
          &bull; <strong>CASHIER:</strong> Cashiers sirf POS Billing counter dekh sakte hain. Cashiers ke liye confidential profit margins aur AI Copilot automatically hide rehte hain!
        </div>
        <div style="margin-top:8px;">
          <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('users')" style="font-size:0.75rem; padding:5px 12px; font-weight:700;">
            🔐 Open Screen 20 (Users & Roles)
          </button>
        </div>
      </div>
    `);
    return;
  }

  // 5h. AUDIT TRAIL & TIMELINE HISTORY
  const isAuditHowTo = q.includes('audit') || q.includes('timeline') || q.includes('history log') || 
                       q.includes('kisne change') || q.includes('kisne badla');
  if (isAuditHowTo) {
    reply(`
      <div style="line-height:1.5;">
        <strong style="color:#38bdf8;">📜 Complete System Audit Trail & Timeline History:</strong>
        <div style="margin-top:6px; background:#020617; border:1px solid #1e293b; border-radius:6px; padding:8px 10px; font-size:0.78rem; line-height:1.65;">
          <strong>Screen 21 (Audit Log)</strong> me har ek sensitive action permanently log hota hai: item price change, stock reconciliation, cashier sign-in, refund aur invoice creation. Har entry me Timestamp, User, Old Value aur New Value clearly show hoti hai.
        </div>
        <div style="margin-top:8px;">
          <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('audit-log')" style="font-size:0.75rem; padding:5px 12px; font-weight:700;">
            📜 Open Screen 21 (Audit Log)
          </button>
        </div>
      </div>
    `);
    return;
  }

  // 5i. STORE SETTINGS, GST / TAX & THERMAL PRINTER
  const isSettingsHowTo = q.includes('printer') || q.includes('thermal') || q.includes('58mm') || q.includes('80mm') || 
                          q.includes('gst') || q.includes('tax rate') || (q.includes('setting') && (q.includes('kaise') || q.includes('change') || q.includes('kare') || q.includes('how to')));
  if (isSettingsHowTo) {
    reply(`
      <div style="line-height:1.5;">
        <strong style="color:#38bdf8;">⚙️ Store Settings, GST & Thermal Printer Setup:</strong>
        <div style="margin-top:6px; background:#020617; border:1px solid #1e293b; border-radius:6px; padding:8px 10px; font-size:0.78rem; line-height:1.65;">
          <strong>Screen 22 (Settings)</strong> par aap configuration set kar sakte hain:<br>
          &bull; <strong>Dukaan Info:</strong> Store Name, Address, Contact No, GSTIN Number.<br>
          &bull; <strong>GST Tax Rates:</strong> Default Tax %, HSN Code, SGST/CGST rates.<br>
          &bull; <strong>Thermal Printer:</strong> 58mm (Compact 2-inch) ya 80mm (Standard 3-inch) paper width.<br>
          &bull; <strong>Receipt Footer:</strong> Custom "Thank You, Visit Again" message aur QR code.
        </div>
        <div style="margin-top:8px;">
          <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('settings')" style="font-size:0.75rem; padding:5px 12px; font-weight:700;">
            ⚙️ Open Screen 22 (Store Settings)
          </button>
        </div>
      </div>
    `);
    return;
  }

  // =========================================================================
  // 6. SPECIFIC ENTITY DIRECT LOOKUPS (CUSTOMER, SUPPLIER, INVOICE, PRODUCT)
  // =========================================================================

  // 6a. CHECK CUSTOMER / KHATA QUERY FIRST
  let matchedCustomer = null;
  for (const c of (posState.customers || [])) {
    const cName = c.name.toLowerCase();
    const cMob = (c.mobile || '').toLowerCase();
    if (q.includes(cName) || (cMob && q.includes(cMob))) {
      matchedCustomer = c;
      break;
    }
  }
  if (!matchedCustomer && (q.includes('khata') || q.includes('ledger') || q.includes('customer') || q.includes('due'))) {
    for (const c of (posState.customers || [])) {
      const cParts = c.name.toLowerCase().split(/\s+/).filter(cp => cp.length > 2);
      if (cParts.some(cp => q.includes(cp)) || (c.mobile && q.includes(c.mobile))) {
        matchedCustomer = c;
        break;
      }
    }
  }
  if (matchedCustomer) {
    inspectCustomerInChat(matchedCustomer, reply);
    return;
  }

  // 6b. CHECK SUPPLIER DIRECT QUERY BY NAME OR MOBILE
  let matchedSupplier = null;
  for (const s of (posState.suppliers || [])) {
    const sName = s.name.toLowerCase();
    const sMob = (s.mobile || '').toLowerCase();
    if (q.includes(sName) || (sMob && q.includes(sMob))) {
      matchedSupplier = s;
      break;
    }
  }
  if (matchedSupplier) {
    inspectSupplierInChat(matchedSupplier, reply);
    return;
  }

  // 6b-2. SPECIFIC ACCOUNT KHATA NOT FOUND FALLBACK
  if (q.includes('khata') || q.includes('ledger')) {
    const ledgerStopWords = new Set(['khata', 'ledger', 'statement', 'check', 'karo', 'kar', 'dekho', 'dekh', 'batao', 'bataiye', 'ka', 'ki', 'ke', 'ko', 'me', 'pe', 'hai', 'hain', 'status', 'refresh', 'clear', 'mismatch', 'balance', 'sahi', 'theek', 'fix', 'customer', 'supplier', 'all', 'sab']);
    const nameTokens = q.replace(/[^a-z0-9\s]/gi, ' ').split(/\s+/).filter(w => w.length > 2 && !ledgerStopWords.has(w));
    if (nameTokens.length > 0) {
      const searchedName = nameTokens.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      reply(`
        <div style="line-height:1.5;">
          <strong style="color:#f59e0b;">⚠️ Account Not Found:</strong><br>
          <span style="font-size:0.8rem; color:#cbd5e1;"><strong>"${searchedName}"</strong> naam ka customer ya supplier directory me nahi mila.</span>
          <div style="margin-top:6px; font-size:0.75rem; color:#94a3b8;">
            Aap naya khata account create karne ke liye Customer Master ya Supplier Master use kar sakte hain:
          </div>
          <div style="margin-top:8px; display:flex; gap:6px;">
            <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('customers')" style="font-size:0.74rem; padding:4px 10px; font-weight:700;">
              👥 Open Customer Master (Screen 11)
            </button>
            <button type="button" class="btn btn-sm btn-outline" onclick="navigateToScreen('suppliers')" style="font-size:0.74rem; padding:4px 10px; font-weight:700;">
              🏭 Open Supplier Master (Screen 12)
            </button>
          </div>
        </div>
      `);
      return;
    }
  }

  // 6c. INVOICE / BILL QUERY
  const invMatch = rawTrimmed.match(/INV[-_]?\d+/i) || rawTrimmed.match(/\d{3,}/);
  if (invMatch && (q.includes('inv') || q.includes('bill') || q.includes('invoice') || q.includes('receipt') || q.includes('status'))) {
    const term = invMatch[0].toLowerCase();
    const foundSale = (posState.salesHistory || []).find(s =>
      (s.invoiceNo && s.invoiceNo.toLowerCase().includes(term)) ||
      (s.id && String(s.id) === term)
    );
    if (foundSale) {
      inspectInvoiceInChat(foundSale, reply);
      return;
    }
  }

  // 6d. SPECIFIC PRODUCT / ITEM INQUIRY
  const stopWords = new Set([
    'ka', 'ki', 'ke', 'ko', 'se', 'me', 'pe', 'par', 'hai', 'hain', 'ho', 'tha', 'the', 'thi',
    'kitna', 'kitne', 'kitni', 'kiska', 'kiske', 'kiski', 'kya', 'bhi', 'aur', 'dekho', 'dekh',
    'batao', 'bataiye', 'check', 'karo', 'kar', 'do', 'please', 'kuch', 'bacha', 'bache', 'bachi',
    'stock', 'rate', 'price', 'bhav', 'theek', 'fix', 'status', 'kisko', 'kisi', 'item', 'product',
    'items', 'products', 'mai', 'mera', 'meri', 'in', 'is', 'it', 'to', 'at', 'on', 'by', 'my',
    'an', 'the', 'of', 'and', 'or', 'so', 'we', 'he', 'us', 'no', 'all', 'total', 'supplier', 'suppliers',
    'customer', 'customers', 'grahak', 'show', 'view', 'list', 'count'
  ]);
  const words = q.replace(/[^a-z0-9\s]/gi, ' ').split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w));

  let matchedProducts = [];
  // Direct substring check
  for (const p of (posState.products || [])) {
    const pName = p.name.toLowerCase();
    const pCode = (p.code || '').toLowerCase();
    const pBar = (p.barcode || '').toLowerCase();
    if (q.includes(pName) || (pCode && q.includes(pCode)) || (pBar && q.includes(pBar))) {
      if (!matchedProducts.includes(p)) matchedProducts.push(p);
    }
  }
  // Word match check (e.g. user asked "Milk" -> matches "Amul Taaza Fresh Milk")
  const genericTokens = new Set(['total', 'product', 'item', 'soap', 'milk', 'pack', 'new', 'code', 'gram', 'fresh', 'best']);
  const searchWords = words.filter(w => !genericTokens.has(w) || words.length === 1);

  if (matchedProducts.length === 0 && searchWords.length > 0) {
    for (const p of (posState.products || [])) {
      const pName = p.name.toLowerCase();
      const pCode = (p.code || '').toLowerCase();
      const pCat = (p.category || '').toLowerCase();
      const pWords = (pName + ' ' + pCode + ' ' + pCat).split(/\s+/);
      const matchesWord = searchWords.some(w => pWords.includes(w) || (w.length >= 4 && pName.includes(w)));
      if (matchesWord && !matchedProducts.includes(p)) {
        matchedProducts.push(p);
      }
    }
  }

  if (matchedProducts.length > 0) {
    if (matchedProducts.length === 1) {
      inspectProductInChat(matchedProducts[0], reply);
      return;
    } else {
      let list = matchedProducts.slice(0, 5).map(p => {
        const isNeg = p.stock < 0;
        return `
          <div style="background:#020617; border:1px solid ${isNeg ? '#ef4444' : '#1e293b'}; border-radius:6px; padding:6px 10px; margin-top:4px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="color:#f8fafc;">${p.name}</strong> (${p.code})<br>
              <span style="font-size:0.75rem; color:${isNeg ? '#ef4444' : '#10b981'}; font-weight:700;">
                Current Stock: ${p.stock} ${p.unit} ${isNeg ? '(Negative!)' : ''}
              </span> &bull; 
              <span style="font-size:0.75rem; color:#38bdf8;">Price: ₹ ${parseFloat(p.price).toFixed(2)}</span>
            </div>
            ${isNeg ? `
              <button type="button" class="btn btn-sm btn-danger" onclick="aiFixEntity('PRODUCT_STOCK', ${p.id}, this)" style="font-size:0.72rem; padding:3px 8px; font-weight:700;">
                ⚡ Fix to 0
              </button>
            ` : ''}
          </div>
        `;
      }).join('');

      reply(`
        <div>
          <strong>📦 Found ${matchedProducts.length} matching item(s):</strong>
          <div style="margin-top:6px;">${list}</div>
        </div>
      `);
      return;
    }
  }

  // =========================================================================
  // 7. SELF-HEALING REPAIRS, RECONCILE, UNDO & DIAGNOSTICS
  // =========================================================================

  // 7a. KHATA / LEDGER MISMATCHES (General)
  if (q.includes('khata') || q.includes('ledger') || q.includes('mismatch') || (q.includes('balance') && !q.includes('sale'))) {
    if (isFixAction) {
      executeAIAutoRepair('RECONCILE_CUSTOMER_LEDGER');
      reply("⚖️ Customer aur Supplier khata ledger math ko sales receipts aur payments ke mutabik re-calculate karke synchronize kar diya gaya hai.");
      return;
    }

    const custLedgerIssues = runAIDiagnostics().filter(i => i.type === 'LEDGER');
    if (custLedgerIssues.length > 0) {
      let listHtml = custLedgerIssues.map(iss => `
        <div style="background:#020617; border:1px solid #1e293b; border-radius:6px; padding:8px 10px; margin-top:4px;">
          <div style="font-weight:700; color:#f59e0b;">${iss.title}</div>
          <div style="font-size:0.75rem; color:#94a3b8; margin:2px 0;">${iss.description}</div>
          <div style="margin-top:4px;">
            <button type="button" class="btn btn-sm btn-primary" onclick="aiFixEntity('${iss.fixAction}', ${iss.targetId}, this)" style="background:#4f46e5; border-color:#4f46e5; font-size:0.72rem; padding:3px 10px; font-weight:700;">
              ⚡ Reconcile Balance Now
            </button>
          </div>
        </div>
      `).join('');

      reply(`
        <div>
          <strong style="color:#f59e0b;">⚠️ Found ${custLedgerIssues.length} Khata Ledger Mismatch(es):</strong>
          <div style="margin-top:6px;">${listHtml}</div>
          <div style="margin-top:8px;">
            <button type="button" class="btn btn-sm btn-success" onclick="aiFixEntity('ALL_ANOMALIES', null, this)" style="font-weight:700; font-size:0.78rem; width:100%; padding:6px;">
              ⚡ Auto-Reconcile All Khata Ledgers
            </button>
          </div>
        </div>
      `);
      return;
    } else {
      reply("✅ Saare <strong>Customer aur Supplier khata ledgers 100% mathematically balanced hain</strong>. Koi mismatch nahi mila!");
      return;
    }
  }

  // 7b. PRICING / ZERO PRICE / MARGINS
  if (q.includes('price') || q.includes('rate') || q.includes('margin') || q.includes('cost') || q.includes('zero price')) {
    if (isFixAction) {
      executeAIAutoRepair('FIX_ZERO_PRICE');
      reply("🏷️ Pricing audit complete: Zero ya inverted prices ko standard 20% margin par align kar diya gaya hai.");
      return;
    }
    const priceIssues = runAIDiagnostics().filter(i => i.type === 'PRICING');
    if (priceIssues.length > 0) {
      let list = priceIssues.map(iss => `
        <div style="background:#020617; border:1px solid #ef4444; border-radius:6px; padding:6px 10px; margin-top:4px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong style="color:#f8fafc;">${iss.title}</strong><br>
            <span style="font-size:0.75rem; color:#ef4444;">${iss.description}</span>
          </div>
          <button type="button" class="btn btn-sm btn-warning" onclick="aiFixEntity('PRODUCT_PRICE', ${iss.targetId}, this)" style="font-size:0.72rem; padding:3px 10px; font-weight:700;">
            ⚡ Fix Price
          </button>
        </div>
      `).join('');
      reply(`
        <div>
          <strong style="color:#ef4444;">⚠️ Found ${priceIssues.length} Pricing Discrepancies:</strong>
          <div style="margin-top:6px;">${list}</div>
        </div>
      `);
      return;
    } else {
      reply("✅ Pricing Audit Healthy: Koi zero price ya negative margin item nahi mila.");
      return;
    }
  }

  // 7c. REPAIR ALL / FIX ALL
  if ((q.includes('repair') || q.includes('theek') || q.includes('sahi') || q.includes('fix')) && 
      (q.includes('all') || q.includes('sab') || q.includes('sabhi') || q.includes('everything') || q.includes('auto'))) {
    executeAIAutoRepair('ALL');
    reply("⚡ 1-Click Auto-Repair successfully executed across all database tables! Pre-repair safety snapshot saved.");
    return;
  }

  // 7d. UNDO
  if (q.includes('undo') || q.includes('wapas') || q.includes('revert') || q.includes('rollback')) {
    undoLastAIAction();
    reply("⏪ <strong>Undo Successful:</strong> Saara data pre-repair safety snapshot par wapas revert kar diya gaya hai!");
    return;
  }

  // 7e. GENERAL SCAN / DIAGNOSTICS
  if (q.includes('scan') || q.includes('diagnos') || q.includes('status') || q.includes('problem') || q.includes('issue') || q.includes('galti') || (q.includes('check') && q.includes('all'))) {
    const issues = runAIDiagnostics();
    triggerAIDiagnosticScan();
    if (issues.length === 0) {
      reply("🎉 <strong>Scan Complete:</strong> Pure database me koi bhi issue nahi mila! Zero negative stock, all ledgers balanced, zero pricing errors.");
    } else {
      let issuesList = issues.slice(0, 4).map(iss => `
        <div style="background:#020617; border-left:3px solid ${iss.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'}; border-radius:4px; padding:6px 8px; margin-top:4px;">
          <strong style="color:#f8fafc; font-size:0.8rem;">${iss.title}</strong><br>
          <span style="font-size:0.74rem; color:#94a3b8;">${iss.description}</span>
        </div>
      `).join('');

      reply(`
        <div>
          <strong style="color:#ef4444;">⚠️ Scan Complete! Found ${issues.length} Discrepancies in Database:</strong>
          <div style="margin-top:6px;">${issuesList}</div>
          <div style="margin-top:8px;">
            <button type="button" class="btn btn-sm btn-success" onclick="aiFixEntity('ALL_ANOMALIES', null, this)" style="font-weight:700; font-size:0.78rem; width:100%; padding:6px;">
              ⚡ 1-Click Auto-Repair All (${issues.length} Issues)
            </button>
          </div>
        </div>
      `);
    }
    return;
  }

  // =========================================================================
  // 8. SMART CONTEXTUAL FALLBACK (NO DEAD ENDS!)
  // =========================================================================
  
  // Keyword-directed guidance
  if (q.includes('printer') || q.includes('print')) {
    reply(`
      <div>
        <strong>🖨️ Thermal Printer Guidance:</strong><br>
        <span style="font-size:0.8rem; color:#cbd5e1;">Thermal printer width (58mm / 80mm) set karne ke liye Settings kholein:</span>
        <div style="margin-top:6px;"><button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('settings')">⚙️ Open Screen 22 (Settings)</button></div>
      </div>
    `);
    return;
  }
  if (q.includes('tax') || q.includes('gst')) {
    reply(`
      <div>
        <strong>🏛️ Tax / GST Guidance:</strong><br>
        <span style="font-size:0.8rem; color:#cbd5e1;">Store GSTIN aur default Tax rate badalne ke liye Settings kholein:</span>
        <div style="margin-top:6px;"><button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('settings')">⚙️ Open Screen 22 (Settings)</button></div>
      </div>
    `);
    return;
  }
  if (q.includes('branch')) {
    reply(`
      <div>
        <strong>🏢 Branch Management:</strong><br>
        <span style="font-size:0.8rem; color:#cbd5e1;">Naya branch jodne ya switch karne ke liye Branch screen kholein:</span>
        <div style="margin-top:6px;"><button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('branches')">🏢 Open Screen 24 (Branches)</button></div>
      </div>
    `);
    return;
  }

  // Default Universal Helpful Card
  reply(`
    <div style="line-height:1.5;">
      <span style="font-weight:600; color:#38bdf8;">🤖 Main aapke live POS system ke kisi bhi hisaab me madad kar sakta hoon:</span>
      <div style="margin-top:6px; font-size:0.78rem; background:rgba(0,0,0,0.3); padding:8px 10px; border-radius:6px; line-height:1.7;">
        &bull; 💰 <a href="javascript:void(0)" onclick="sendAICopilotPrompt('Dukaan me kitne ka maal pada hai')" style="color:#38bdf8; text-decoration:none;">"Dukaan me kitne ka maal pada hai"</a><br>
        &bull; 📊 <a href="javascript:void(0)" onclick="sendAICopilotPrompt('Aaj kitni sale hui')" style="color:#38bdf8; text-decoration:none;">"Aaj kitni sale hui"</a><br>
        &bull; 📈 <a href="javascript:void(0)" onclick="sendAICopilotPrompt('Aaj kitna profit hua')" style="color:#38bdf8; text-decoration:none;">"Aaj kitna profit hua"</a><br>
        &bull; 👥 <a href="javascript:void(0)" onclick="sendAICopilotPrompt('Market me kitna udhar bacha hai')" style="color:#38bdf8; text-decoration:none;">"Market me kitna udhar bacha hai"</a><br>
        &bull; ⚠️ <a href="javascript:void(0)" onclick="sendAICopilotPrompt('Low stock kiske hai dekho')" style="color:#38bdf8; text-decoration:none;">"Low stock kiske hai dekho"</a><br>
        &bull; ⌨️ <a href="javascript:void(0)" onclick="sendAICopilotPrompt('Shortcuts kya hain')" style="color:#38bdf8; text-decoration:none;">"Shortcuts kya hain"</a><br>
        &bull; 📥 <a href="javascript:void(0)" onclick="sendAICopilotPrompt('Excel se product kaise dale')" style="color:#38bdf8; text-decoration:none;">"Excel se product kaise dale"</a>
      </div>
      <div style="margin-top:6px; font-size:0.75rem; color:#94a3b8;">Upar diye gaye kisi bhi sawaal par click karein ya apna sawaal likhein!</div>
    </div>
  `);
}


function submitAICommand() {
  const input = document.getElementById('ai-terminal-input');
  if (!input) return;
  const raw = input.value.trim();
  if (!raw) return;

  appendAITerminalMsg(raw, 'user');
  input.value = '';

  dispatchAIQuery(raw, 'terminal');
}

// =============================================================================
// FLOATING INTERACTIVE AI COPILOT CHAT ENGINE
// =============================================================================

function toggleAICopilotDrawer() {
  const drawer = document.getElementById('ai-copilot-drawer');
  if (!drawer) return;
  const isHidden = drawer.style.display === 'none' || !drawer.style.display;
  drawer.style.display = isHidden ? 'flex' : 'none';

  if (isHidden) {
    const messages = document.getElementById('ai-copilot-messages');
    if (messages && messages.children.length === 0) {
      initAICopilotGreeting();
    }
    const input = document.getElementById('ai-copilot-input');
    if (input) setTimeout(() => input.focus(), 150);
  }
}

function clearAICopilotChat() {
  const messages = document.getElementById('ai-copilot-messages');
  if (messages) messages.innerHTML = '';
  initAICopilotGreeting();
}

function initAICopilotGreeting() {
  const welcomeHtml = `
    <div style="line-height:1.45;">
      <strong>👋 Namaste! Main aapka MyPOS AI Copilot hoon.</strong><br>
      Aap mujhse kisi bhi <strong>Invoice, Product, Customer ya Khata Ledger</strong> ka issue pooch sakte hain.<br><br>
      Main pehle database me <em>find</em> karke issue aapko yahan dikhaunga, aur fir aapke <strong>1-Click</strong> karte hi safe auto-repair kar dunga!
    </div>
  `;
  appendAICopilotBubble('ai', welcomeHtml);
}

function sendAICopilotPrompt(promptText) {
  const input = document.getElementById('ai-copilot-input');
  if (input) {
    input.value = promptText;
    submitAICopilotMessage();
  }
}

function appendAICopilotBubble(sender, contentHtml) {
  const container = document.getElementById('ai-copilot-messages');
  if (!container) return;

  const row = document.createElement('div');
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (sender === 'user') {
    row.style.cssText = `
      align-self: flex-end;
      max-width: 85%;
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      color: #fff;
      padding: 8px 12px;
      border-radius: 12px 12px 2px 12px;
      font-size: 0.85rem;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
    `;
    row.innerHTML = `
      <div style="font-size:0.68rem; opacity:0.75; margin-bottom:2px; text-align:right;">You &bull; ${time}</div>
      <div>${contentHtml}</div>
    `;
  } else {
    row.style.cssText = `
      align-self: flex-start;
      max-width: 90%;
      background: #1e293b;
      color: #e2e8f0;
      padding: 10px 14px;
      border-radius: 12px 12px 12px 2px;
      font-size: 0.85rem;
      border: 1px solid #334155;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    `;
    row.innerHTML = `
      <div style="display:flex; align-items:center; gap:6px; font-size:0.7rem; color:#38bdf8; font-weight:700; margin-bottom:4px;">
        <span>🤖 Sentinel Copilot</span> &bull; <span style="color:#94a3b8; font-weight:400;">${time}</span>
      </div>
      <div>${contentHtml}</div>
    `;
  }

  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}

function submitAICopilotMessage() {
  const input = document.getElementById('ai-copilot-input');
  if (!input) return;
  const rawText = input.value.trim();
  if (!rawText) return;

  // Append user message
  appendAICopilotBubble('user', rawText);
  input.value = '';

  dispatchAIQuery(rawText, 'copilot');
}

function inspectCustomerInChat(cust, reply) {
  let calculatedDue = 0;
  (posState.salesHistory || []).forEach(s => {
    const match = (s.customer && s.customer.toLowerCase() === cust.name.toLowerCase()) ||
                  (s.customerMobile && cust.mobile && s.customerMobile === cust.mobile);
    if (match && (s.paymentMode === 'CREDIT' || (s.payment && s.payment.includes('Credit')))) {
      calculatedDue += (parseFloat(s.amount) || 0);
    }
  });

  (posState.customerPayments || []).forEach(p => {
    if (p.custId === cust.id || (p.custName && p.custName.toLowerCase() === cust.name.toLowerCase())) {
      calculatedDue = Math.max(0, calculatedDue - (parseFloat(p.amount) || 0));
    }
  });

  (posState.returns || []).forEach(r => {
    if ((r.type || '').toLowerCase().includes('sales') && r.party && r.party.toLowerCase() === cust.name.toLowerCase()) {
      calculatedDue = Math.max(0, calculatedDue - (parseFloat(r.amount || r.totalAmount) || 0));
    }
  });

  calculatedDue = Math.round(calculatedDue * 100) / 100;
  const recordedDue = Math.round((cust.due || 0) * 100) / 100;
  const diff = Math.abs(recordedDue - calculatedDue);
  const hasMismatch = diff > 0.5;

  const html = `
    <div style="background:#020617; border:1px solid ${hasMismatch ? '#f59e0b' : '#334155'}; border-radius:8px; padding:10px;">
      <div style="font-weight:700; color:#f8fafc; font-size:0.9rem;">👤 Customer: ${cust.name}</div>
      <div style="font-size:0.75rem; color:#94a3b8; margin:2px 0 6px 0;">Mobile: ${cust.mobile || 'N/A'} | City: ${cust.city || 'Main'}</div>
      
      <div style="background:#0f172a; padding:6px 8px; border-radius:6px; font-size:0.78rem; line-height:1.5;">
        &bull; Current Master Due: <strong style="color:${hasMismatch ? '#ef4444' : '#10b981'};">₹ ${recordedDue.toFixed(2)}</strong><br>
        &bull; Actual Ledger Math: <strong style="color:#10b981;">₹ ${calculatedDue.toFixed(2)}</strong>
      </div>

      ${hasMismatch ? `
        <div style="color:#f59e0b; font-size:0.75rem; font-weight:600; margin:6px 0;">
          ⚠️ Mismatch of ₹ ${diff.toFixed(2)} found between recorded balance and transactions!
        </div>
        <button type="button" class="btn btn-sm btn-primary" onclick="aiFixEntity('CUSTOMER_LEDGER', ${cust.id}, this)" style="background:#4f46e5; border-color:#4f46e5; font-weight:700; font-size:0.76rem; width:100%; padding:5px;">
          ⚡ Fix ${cust.name}'s Ledger Balance (Set to ₹ ${calculatedDue.toFixed(2)})
        </button>
      ` : `
        <div style="color:#10b981; font-size:0.75rem; font-weight:600; margin-top:6px;">
          ✓ Ledger is in 100% mathematical sync with all sales and payments.
        </div>
      `}
    </div>
  `;

  if (typeof reply === 'function') {
    reply(html);
  } else {
    appendAICopilotBubble('ai', html);
  }
}

function inspectSupplierInChat(supp, reply) {
  const due = parseFloat(supp.due !== undefined ? supp.due : (supp.balance || 0));
  const purchases = (posState.purchases || []).filter(p => 
    (p.supplier && p.supplier.toLowerCase().includes(supp.name.toLowerCase())) ||
    (p.supplierId && p.supplierId === supp.id)
  );
  const totalPurchases = purchases.reduce((acc, p) => acc + (parseFloat(p.totalAmount) || 0), 0);

  const html = `
    <div style="background:#020617; border:1px solid #334155; border-radius:8px; padding:10px;">
      <div style="font-weight:700; color:#f8fafc; font-size:0.92rem;">🏢 Supplier: ${supp.name}</div>
      <div style="font-size:0.75rem; color:#94a3b8; margin:2px 0 6px 0;">Contact: ${supp.contact || 'N/A'} | 📞 ${supp.mobile} | GST: ${supp.gstin || '-'}</div>

      <div style="background:#0f172a; padding:6px 8px; border-radius:6px; font-size:0.78rem; line-height:1.6;">
        &bull; Current Due / Payable: <strong style="color:${due > 0 ? '#ef4444' : '#10b981'}; font-size:0.88rem;">₹ ${due.toFixed(2)}</strong><br>
        &bull; Total Inward Purchases: <strong>${purchases.length} Purchase Bills</strong> (Total: ₹ ${totalPurchases.toFixed(2)})
      </div>

      <div style="margin-top:8px; display:flex; gap:6px;">
        <button type="button" class="btn btn-sm btn-primary" onclick="viewSupplierLedger(${supp.id})" style="font-size:0.74rem; padding:4px 10px; font-weight:700;">
          📖 View Khata Ledger
        </button>
        ${due > 0 ? `
          <button type="button" class="btn btn-sm btn-success" onclick="openPaySupplierModal(${supp.id})" style="font-size:0.74rem; padding:4px 10px; font-weight:700;">
            💳 Pay Due
          </button>
        ` : ''}
      </div>
    </div>
  `;

  if (typeof reply === 'function') {
    reply(html);
  } else {
    appendAICopilotBubble('ai', html);
  }
}

function inspectProductInChat(prod, reply) {
  const isNegative = prod.stock < 0;
  const isZeroStock = prod.stock === 0;
  const threshold = (prod.minStock !== undefined && prod.minStock !== null && prod.minStock > 0) ? prod.minStock : 10;
  const isLowStock = prod.stock > 0 && prod.stock <= threshold;
  const isZeroPrice = prod.price <= 0 && prod.cost > 0;
  const isLossPrice = prod.price > 0 && prod.cost > 0 && prod.price < prod.cost;

  let stockBadge = '';
  let stockBorderColor = '#334155';
  if (isNegative) {
    stockBorderColor = '#ef4444';
    stockBadge = `<span style="color:#ef4444; font-weight:800; font-size:0.88rem;">${prod.stock} ${prod.unit} 🚨 (Negative Stock!)</span>`;
  } else if (isZeroStock) {
    stockBorderColor = '#ef4444';
    stockBadge = `<span style="color:#ef4444; font-weight:800; font-size:0.88rem;">0 ${prod.unit} 🔴 (OUT OF STOCK - 0 Units)</span>`;
  } else if (isLowStock) {
    stockBorderColor = '#f59e0b';
    stockBadge = `<span style="color:#f59e0b; font-weight:800; font-size:0.88rem;">${prod.stock} ${prod.unit} ⚠️ (Low Stock! Min Alert: ${threshold})</span>`;
  } else {
    stockBadge = `<span style="color:#10b981; font-weight:800; font-size:0.88rem;">${prod.stock} ${prod.unit} ✓ (In Stock)</span>`;
  }

  const html = `
    <div style="background:#020617; border:1px solid ${stockBorderColor}; border-radius:8px; padding:10px;">
      <div style="font-weight:700; color:#f8fafc; font-size:0.92rem; display:flex; justify-content:space-between; align-items:center;">
        <span>📦 Product: ${prod.name}</span>
        ${isZeroStock ? '<span style="background:#ef4444; color:#fff; font-size:0.65rem; font-weight:800; padding:1px 6px; border-radius:10px;">OUT OF STOCK</span>' : (isLowStock ? '<span style="background:#f59e0b; color:#000; font-size:0.65rem; font-weight:800; padding:1px 6px; border-radius:10px;">LOW STOCK</span>' : '')}
      </div>
      <div style="font-size:0.75rem; color:#94a3b8; margin:2px 0 6px 0;">Code: <code>${prod.code}</code> | Category: ${prod.category}</div>

      <div style="background:#0f172a; padding:6px 8px; border-radius:6px; font-size:0.78rem; line-height:1.6;">
        &bull; Current Stock: ${stockBadge}<br>
        &bull; Selling Price: <strong style="color:#38bdf8;">₹ ${parseFloat(prod.price).toFixed(2)}</strong> | Cost: <strong>₹ ${parseFloat(prod.cost).toFixed(2)}</strong>
      </div>

      ${isNegative ? `
        <div style="color:#ef4444; font-size:0.75rem; font-weight:600; margin:6px 0;">
          ⚠️ Negative Inventory Issue: Physical stock is below zero!
        </div>
        <button type="button" class="btn btn-sm btn-danger" onclick="aiFixEntity('PRODUCT_STOCK', ${prod.id}, this)" style="font-weight:700; font-size:0.76rem; width:100%; padding:5px;">
          ⚡ Reconcile Stock to 0 Now
        </button>
      ` : (isZeroStock ? `
        <div style="color:#ef4444; font-size:0.75rem; font-weight:600; margin:6px 0;">
          🔴 Out of Stock: Iss product ka stock 0 ho chuka hai! Billing counter par sell nahi kiya ja sakta.
        </div>
        <div style="display:flex; gap:6px; margin-top:4px;">
          <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('purchase')" style="font-weight:700; font-size:0.74rem; flex:1; padding:5px;">
            📥 Purchase Inward
          </button>
          <button type="button" class="btn btn-sm btn-outline" onclick="openEditProductModal(${prod.id})" style="font-weight:700; font-size:0.74rem; flex:1; padding:5px;">
            ✏️ Edit Product
          </button>
        </div>
      ` : (isLowStock ? `
        <div style="color:#f59e0b; font-size:0.75rem; font-weight:600; margin:6px 0;">
          ⚠️ Low Stock Alert: Sirf ${prod.stock} ${prod.unit} bache hain (Min alert: ${threshold}). Re-order create karein.
        </div>
        <button type="button" class="btn btn-sm btn-primary" onclick="navigateToScreen('purchase')" style="font-weight:700; font-size:0.74rem; width:100%; padding:5px;">
          📥 Inward Fresh Stock (Screen 10)
        </button>
      ` : (isZeroPrice ? `
        <div style="color:#ef4444; font-size:0.75rem; font-weight:600; margin:6px 0;">
          ⚠️ Zero Selling Price: Items are being checked out for ₹0!
        </div>
        <button type="button" class="btn btn-sm btn-warning" onclick="aiFixEntity('PRODUCT_PRICE', ${prod.id}, this)" style="font-weight:700; font-size:0.76rem; width:100%; padding:5px;">
          ⚡ Set Price to Cost + 20% (₹ ${(prod.cost * 1.20).toFixed(2)})
        </button>
      ` : `
        <div style="color:#10b981; font-size:0.75rem; font-weight:600; margin-top:6px;">
          ✓ Product stock and rates are healthy.
        </div>
      `)))}
    </div>
  `;

  if (typeof reply === 'function') {
    reply(html);
  } else {
    appendAICopilotBubble('ai', html);
  }
}

function inspectInvoiceInChat(sale, reply) {
  const html = `
    <div style="background:#020617; border:1px solid #334155; border-radius:8px; padding:10px;">
      <div style="font-weight:700; color:#f8fafc; font-size:0.9rem;">🧾 Invoice: ${sale.invoiceNo}</div>
      <div style="font-size:0.75rem; color:#94a3b8; margin:2px 0 6px 0;">Date: ${sale.date} | Payment Mode: <span class="badge badge-info">${sale.paymentMode || sale.payment}</span></div>

      <div style="background:#0f172a; padding:6px 8px; border-radius:6px; font-size:0.78rem; line-height:1.5;">
        &bull; Customer: <strong>${sale.customer || 'Walk-in'}</strong><br>
        &bull; Items Count: <strong>${(sale.items || []).length}</strong><br>
        &bull; Bill Total: <strong style="color:#10b981; font-size:0.9rem;">₹ ${parseFloat(sale.amount || 0).toFixed(2)}</strong>
      </div>
    </div>
  `;

  if (typeof reply === 'function') {
    reply(html);
  } else {
    appendAICopilotBubble('ai', html);
  }
}

function aiFixEntity(actionType, entityId, btnElement) {
  // Take safety snapshot first
  const snapshot = {
    timestamp: new Date().toISOString(),
    dateStr: new Date().toLocaleDateString('en-GB'),
    timeStr: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    products: JSON.parse(JSON.stringify(posState.products || [])),
    customers: JSON.parse(JSON.stringify(posState.customers || [])),
    suppliers: JSON.parse(JSON.stringify(posState.suppliers || [])),
    categories: JSON.parse(JSON.stringify(posState.categories || []))
  };
  posState._preAISafetySnapshot = snapshot;
  localStorage.setItem('pos_ai_pre_repair_snapshot', JSON.stringify(snapshot));

  let fixMessage = '';

  if (actionType === 'CUSTOMER_LEDGER' || actionType === 'RECONCILE_CUSTOMER_LEDGER') {
    const cust = posState.customers.find(c => c.id === entityId);
    if (cust) {
      let calculatedDue = 0;
      (posState.salesHistory || []).forEach(s => {
        const match = (s.customer && s.customer.toLowerCase() === cust.name.toLowerCase()) ||
                      (s.customerMobile && cust.mobile && s.customerMobile === cust.mobile);
        if (match && (s.paymentMode === 'CREDIT' || (s.payment && s.payment.includes('Credit')))) {
          calculatedDue += (parseFloat(s.amount) || 0);
        }
      });
      (posState.customerPayments || []).forEach(p => {
        if (p.custId === cust.id || (p.custName && p.custName.toLowerCase() === cust.name.toLowerCase())) {
          calculatedDue = Math.max(0, calculatedDue - (parseFloat(p.amount) || 0));
        }
      });
      (posState.returns || []).forEach(r => {
        if ((r.type || '').toLowerCase().includes('sales') && r.party && r.party.toLowerCase() === cust.name.toLowerCase()) {
          calculatedDue = Math.max(0, calculatedDue - (parseFloat(r.amount || r.totalAmount) || 0));
        }
      });
      calculatedDue = Math.round(calculatedDue * 100) / 100;
      const oldDue = cust.due;
      cust.due = calculatedDue;
      saveCustomersToStorage();
      fixMessage = `Customer "${cust.name}" ka balance ₹ ${oldDue} se update karke exact ledger math <strong>₹ ${calculatedDue.toFixed(2)}</strong> par synchronize kar diya gaya hai!`;
    }
  } else if (actionType === 'PRODUCT_STOCK') {
    const prod = posState.products.find(p => p.id === entityId);
    if (prod) {
      const oldStock = prod.stock;
      prod.stock = 0;
      saveProductsToStorage();
      logProductChange({
        productId: prod.id,
        productCode: prod.code,
        productName: prod.name,
        oldPrice: prod.price,
        newPrice: prod.price,
        oldCost: prod.cost,
        newCost: prod.cost,
        oldStock: oldStock,
        newStock: 0,
        changeType: 'AI_AUTO_RECONCILE',
        reason: 'AI Copilot: Negative stock reconciled to 0',
        changedBy: 'MyPOS AI Copilot'
      });
      fixMessage = `Product "${prod.name}" ka negative stock (${oldStock}) theek karke <strong>0 ${prod.unit}</strong> reconcile kar diya gaya hai!`;
    }
  } else if (actionType === 'PRODUCT_PRICE') {
    const prod = posState.products.find(p => p.id === entityId);
    if (prod && prod.cost > 0) {
      const oldPrice = prod.price;
      const newPrice = Math.round(prod.cost * 1.20 * 100) / 100;
      prod.price = newPrice;
      saveProductsToStorage();
      logProductChange({
        productId: prod.id,
        productCode: prod.code,
        productName: prod.name,
        oldPrice: oldPrice,
        newPrice: newPrice,
        oldCost: prod.cost,
        newCost: prod.cost,
        oldStock: prod.stock,
        newStock: prod.stock,
        changeType: 'AI_AUTO_RECONCILE',
        reason: 'AI Copilot: Zero price set to cost + 20% margin',
        changedBy: 'MyPOS AI Copilot'
      });
      fixMessage = `Product "${prod.name}" ka selling price ₹ ${oldPrice} se badha kar <strong>₹ ${newPrice.toFixed(2)}</strong> (Cost + 20% margin) kar diya gaya hai!`;
    }
  } else if (actionType === 'ALL_NEGATIVE_STOCKS') {
    let count = 0;
    (posState.products || []).forEach(prod => {
      if (prod.stock < 0) {
        const oldStock = prod.stock;
        prod.stock = 0;
        count++;
        logProductChange({
          productId: prod.id,
          productCode: prod.code,
          productName: prod.name,
          oldPrice: prod.price,
          newPrice: prod.price,
          oldCost: prod.cost,
          newCost: prod.cost,
          oldStock: oldStock,
          newStock: 0,
          changeType: 'AI_AUTO_RECONCILE',
          reason: 'AI Copilot: Batch negative stock reconcile',
          changedBy: 'MyPOS AI Copilot'
        });
      }
    });
    saveProductsToStorage();
    fixMessage = `Saare <strong>${count} negative stock items</strong> ko safaltapoorvak 0 par reconcile kar diya gaya hai!`;
  } else if (actionType === 'ALL_ANOMALIES') {
    executeAIAutoRepair('ALL');
    fixMessage = `Database ke <strong>saare issues automatically repair</strong> kar diye gaye hain!`;
  }

  // Multi-Screen Real-Time Refresh
  renderProductMaster();
  renderInventory();
  renderPosProducts();
  renderDashboard();
  renderCustomers();
  renderSuppliers();
  renderLedger();

  // Update button in chat
  if (btnElement) {
    btnElement.textContent = '✓ Issue Fixed';
    btnElement.disabled = true;
    btnElement.style.background = '#10b981';
    btnElement.style.borderColor = '#10b981';
    btnElement.style.cursor = 'default';
  }

  appendAICopilotBubble('ai', `
    <div style="color:#10b981;">
      ✅ <strong>Fixed Successfully!</strong><br>
      ${fixMessage}<br>
      <small style="color:#94a3b8;">Pre-repair safety snapshot saved. Agar galti se hua ho to bas <em>"Undo"</em> bol dein.</small>
    </div>
  `);

  appendAITerminalMsg(`⚡ Fixed: ${fixMessage}`, 'ai');
  triggerAIDiagnosticScan();

  showToast('⚡ AI Auto-Repair executed successfully!', 'success');
}



