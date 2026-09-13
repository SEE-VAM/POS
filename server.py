"""
=============================================================================
MYPOS COMMERCIAL SERVER & SQLITE DATABASE ENGINE
Pure Python Standard Library (Zero pip install dependencies required)
Features:
- Hardware Machine ID Lock (Motherboard UUID + CPU + MAC)
- Cryptographic HMAC-SHA256 License Verification
- Full SQLite Database Persistence (pos_database.db)
- Automatic Daily Backups (backups/ folder)
- REST APIs for Data Sync & Developer Debugging (Ctrl+Shift+D)
- Built-in HTTP Static File Server (localhost:8080)
=============================================================================
"""

import http.server
import socketserver
import sqlite3
import json
import hashlib
import hmac
import uuid
import platform
import os
import sys
import subprocess
import shutil
import datetime
import webbrowser
import urllib.parse

PORT = 8080
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pos_database.db')
BACKUP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backups')
LICENSE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'license.key')
STATIC_DIR = os.path.dirname(os.path.abspath(__file__))

# Secret developer salt - KEEP THIS PRIVATE (Used to sign hardware license keys)
SECRET_SALT = b"MYPOS_SECURE_RETAIL_ENTERPRISE_KEYGEN_SALT_2026"
MASTER_DEV_PIN = "7788"

# =============================================================================
# 1. HARDWARE MACHINE FINGERPRINT ENGINE
# =============================================================================
def get_machine_hardware_id():
    """Generates a stable, unique Hardware ID for the client's PC."""
    system_info = [
        platform.node(),
        platform.machine(),
        platform.processor()
    ]
    # On Windows, retrieve Motherboard UUID via wmic or PowerShell
    if platform.system() == 'Windows':
        try:
            cmd = 'powershell -NoProfile -Command "(Get-CimInstance Win32_ComputerSystemProduct).UUID"'
            res = subprocess.check_output(cmd, shell=True, text=True, stderr=subprocess.DEVNULL).strip()
            if res and len(res) > 8:
                system_info.append(res)
        except Exception:
            pass

    # Include MAC address
    system_info.append(str(uuid.getnode()))

    raw_signature = "##".join(system_info).encode('utf-8')
    digest = hashlib.sha256(raw_signature).hexdigest().upper()
    # Format as clean 16-character code: MYPOS-XXXX-XXXX-XXXX
    return f"MYPOS-{digest[0:4]}-{digest[4:8]}-{digest[8:12]}"

def verify_license_key(machine_id, license_key):
    """Cryptographically verifies if the license key belongs to this machine ID."""
    if not license_key or not isinstance(license_key, str):
        return False, "Empty key"
    
    parts = license_key.strip().split('-')
    # Expected format: LIC-<YEAR>-<SIG>-<TYPE> (e.g. LIC-2026-A1B2C3D4-LIFETIME)
    if len(parts) != 4 or parts[0] != 'LIC':
        return False, "Invalid key format"
    
    year_str, sig_str, lic_type = parts[1], parts[2], parts[3]
    payload = f"{machine_id}:{year_str}:{lic_type}".encode('utf-8')
    expected_sig = hmac.new(SECRET_SALT, payload, hashlib.sha256).hexdigest().upper()[:8]

    if sig_str != expected_sig:
        return False, "Invalid signature for this Machine ID"

    # Check expiry if applicable
    if lic_type == '1YEAR':
        try:
            valid_year = int(year_str)
            current_year = datetime.datetime.now().year
            if current_year > valid_year:
                return False, f"License expired at the end of {valid_year}"
        except Exception:
            return False, "Invalid license date"

    return True, lic_type

def get_current_license_status():
    machine_id = get_machine_hardware_id()
    if not os.path.exists(LICENSE_FILE):
        return {"activated": False, "machine_id": machine_id, "type": "NONE", "expiry": "Not Activated"}

    try:
        with open(LICENSE_FILE, 'r', encoding='utf-8') as f:
            saved_key = f.read().strip()
        is_valid, info = verify_license_key(machine_id, saved_key)
        if is_valid:
            return {"activated": True, "machine_id": machine_id, "type": info, "expiry": "Active (Permanent)" if info == 'LIFETIME' else f"Active (Until {saved_key.split('-')[1]})"}
        else:
            return {"activated": False, "machine_id": machine_id, "type": "INVALID", "expiry": info}
    except Exception as e:
        return {"activated": False, "machine_id": machine_id, "type": "ERROR", "expiry": str(e)}

# =============================================================================
# 2. SQLITE DATABASE INITIALIZATION & AUTO-BACKUP
# =============================================================================
def init_sqlite_db():
    """Creates tables if they don't exist and seeds default data."""
    os.makedirs(BACKUP_DIR, exist_ok=True)
    
    # Auto daily backup
    today_str = datetime.date.today().isoformat()
    backup_file = os.path.join(BACKUP_DIR, f"backup_{today_str}.db")
    if os.path.exists(DB_FILE) and not os.path.exists(backup_file):
        try:
            shutil.copy2(DB_FILE, backup_file)
            print(f"[Auto-Backup] Created daily safety backup: {backup_file}")
        except Exception as err:
            print(f"[Auto-Backup Error] {err}")

    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    # App Store Settings
    c.execute("""
    CREATE TABLE IF NOT EXISTS company_settings (
        id INTEGER PRIMARY KEY,
        store_name TEXT,
        legal_name TEXT,
        gstin TEXT,
        address TEXT,
        phone TEXT,
        invoice_prefix TEXT,
        currency TEXT,
        allow_negative_stock INTEGER DEFAULT 0
    )
    """)

    # Products Master
    c.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        code TEXT UNIQUE,
        name TEXT,
        category TEXT,
        price REAL,
        cost REAL,
        stock INTEGER,
        min_stock INTEGER,
        unit TEXT,
        tax REAL,
        icon TEXT,
        barcode TEXT
    )
    """)

    # Categories
    c.execute("""
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE,
        description TEXT,
        status TEXT DEFAULT 'Active'
    )
    """)

    # Branches
    c.execute("""
    CREATE TABLE IF NOT EXISTS branches (
        id INTEGER PRIMARY KEY,
        code TEXT UNIQUE,
        name TEXT,
        address TEXT,
        phone TEXT,
        status TEXT DEFAULT 'Active'
    )
    """)

    # Customers
    c.execute("""
    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY,
        name TEXT,
        mobile TEXT,
        email TEXT,
        gstin TEXT,
        balance REAL DEFAULT 0.0,
        credit_limit REAL DEFAULT 2000.0,
        status TEXT DEFAULT 'Active'
    )
    """)

    # Suppliers
    c.execute("""
    CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY,
        name TEXT,
        contact TEXT,
        mobile TEXT,
        email TEXT,
        gstin TEXT,
        balance REAL DEFAULT 0.0,
        status TEXT DEFAULT 'Active'
    )
    """)

    # Invoices / Sales Orders
    c.execute("""
    CREATE TABLE IF NOT EXISTS sales_orders (
        id INTEGER PRIMARY KEY,
        invoice_no TEXT UNIQUE,
        date TEXT,
        customer TEXT,
        customer_mobile TEXT,
        branch TEXT,
        cashier TEXT,
        amount REAL,
        payment TEXT,
        payment_mode TEXT,
        items_json TEXT
    )
    """)

    # Purchases
    c.execute("""
    CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY,
        po_number TEXT UNIQUE,
        date TEXT,
        supplier TEXT,
        branch TEXT,
        items_count INTEGER,
        total_qty INTEGER,
        total_amount REAL,
        status TEXT DEFAULT 'Received'
    )
    """)

    # Returns
    c.execute("""
    CREATE TABLE IF NOT EXISTS returns_log (
        id TEXT PRIMARY KEY,
        date TEXT,
        type TEXT,
        ref_no TEXT,
        party TEXT,
        branch TEXT,
        amount REAL,
        reason TEXT,
        status TEXT DEFAULT 'Completed'
    )
    """)

    # Stock Transfers
    c.execute("""
    CREATE TABLE IF NOT EXISTS stock_transfers (
        id TEXT PRIMARY KEY,
        date TEXT,
        from_branch TEXT,
        to_branch TEXT,
        total_qty INTEGER,
        status TEXT DEFAULT 'Completed',
        items_json TEXT
    )
    """)

    # System Users & Passwords
    c.execute("""
    CREATE TABLE IF NOT EXISTS system_users (
        id INTEGER PRIMARY KEY,
        name TEXT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT,
        branch TEXT,
        status TEXT DEFAULT 'Active'
    )
    """)

    conn.commit()

    # Seed Default Records if Database is brand new
    c.execute("SELECT COUNT(*) FROM company_settings")
    if c.fetchone()[0] == 0:
        c.execute("""
        INSERT INTO company_settings (id, store_name, legal_name, gstin, address, phone, invoice_prefix, currency, allow_negative_stock)
        VALUES (1, 'ABC Retail Store', 'ABC Supermarkets India Pvt Ltd', '07ABCDE1234F1Z5', 'Shop No. 12, Green Park, New Delhi - 110016', '+91 98765 43210', 'INV', '₹', 0)
        """)

    c.execute("SELECT COUNT(*) FROM system_users")
    if c.fetchone()[0] == 0:
        c.executemany("""
        INSERT INTO system_users (id, name, username, password, role, branch, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, [
            (1, 'System Administrator', 'admin', 'password123', 'ADMIN', 'All Branches', 'Active'),
            (2, 'Store Manager', 'manager', 'password123', 'MANAGER', 'Main Branch', 'Active'),
            (3, 'Cashier One', 'cashier1', 'password123', 'CASHIER', 'Main Branch', 'Active'),
            (4, 'Cashier Two', 'cashier2', 'password123', 'CASHIER', 'Branch 2 - Noida', 'Active')
        ])

    c.execute("SELECT COUNT(*) FROM branches")
    if c.fetchone()[0] == 0:
        c.executemany("""
        INSERT INTO branches (id, code, name, address, phone, status)
        VALUES (?, ?, ?, ?, ?, ?)
        """, [
            (1, 'B001', 'Main Branch', 'Shop No. 12, Green Park, New Delhi', '+91 98765 43210', 'Active'),
            (2, 'B002', 'Branch 2 - Noida Sector 62', 'Plot 45, Sector 62, Noida, UP', '+91 98765 43211', 'Active'),
            (3, 'B003', 'Branch 3 - Gurgaon Express', 'DLF Phase 3, Gurgaon, Haryana', '+91 98765 43212', 'Active')
        ])

    c.execute("SELECT COUNT(*) FROM categories")
    if c.fetchone()[0] == 0:
        c.executemany("""
        INSERT INTO categories (id, name, description, status)
        VALUES (?, ?, ?, ?)
        """, [
            (1, 'Dairy', 'Milk & Dairy Products', 'Active'),
            (2, 'Bakery', 'Bread, Cakes, Pastries', 'Active'),
            (3, 'Snacks', 'Chips, Biscuits, Namkeen', 'Active'),
            (4, 'Beverages', 'Soft Drinks, Juices', 'Active'),
            (5, 'Food', 'Instant Food, Spices', 'Active'),
            (6, 'Household', 'Home Care, Cleaning', 'Active'),
            (7, 'Personal Care', 'Cosmetics, Hygiene', 'Active')
        ])

    c.execute("SELECT COUNT(*) FROM products")
    if c.fetchone()[0] == 0:
        c.executemany("""
        INSERT INTO products (id, code, name, category, price, cost, stock, min_stock, unit, tax, icon, barcode)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, [
            (1, 'P001', 'Milk', 'Dairy', 52.00, 42.00, 45, 10, 'Ltr', 0, '🥛', '890100100001'),
            (2, 'P002', 'Bread', 'Bakery', 35.00, 25.00, 32, 10, 'Pkt', 0, '🍞', '890100100002'),
            (3, 'P003', 'Biscuits', 'Snacks', 20.00, 14.00, 56, 10, 'Pkt', 18, '🍪', '890100100003'),
            (4, 'P004', 'Orange Juice', 'Beverages', 85.00, 65.00, 18, 5, 'Btl', 12, '🧃', '890100100004'),
            (5, 'P005', 'Noodles', 'Food', 15.00, 10.00, 70, 15, 'Pkt', 5, '🍜', '890100100005'),
            (6, 'P006', 'Detergent Powder', 'Household', 110.00, 85.00, 24, 5, 'Kg', 18, '🧼', '890100100006'),
            (7, 'P007', 'Cooking Oil', 'Food', 120.00, 95.00, 30, 8, 'Ltr', 5, '🛢️', '890100100007'),
            (8, 'P008', 'Basmati Rice', 'Food', 60.00, 45.00, 50, 10, 'Kg', 0, '🌾', '890100100008')
        ])

    c.execute("SELECT COUNT(*) FROM customers")
    if c.fetchone()[0] == 0:
        c.executemany("""
        INSERT INTO customers (id, name, mobile, email, gstin, balance, credit_limit, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, [
            (1, 'Walk-in Customer', '9999999999', '', 'Unregistered', 0.00, 0, 'Active'),
            (2, 'Rohit Sharma', '9876543210', 'rohit@gmail.com', '07ABCDE1234F1Z5', 0.00, 10000, 'Active'),
            (3, 'Priya Singh', '9811122334', 'priya@gmail.com', '07ABCDE1234F1Z6', 320.00, 5000, 'Active')
        ])

    conn.commit()
    conn.close()
    print("[SQLite DB] Initialized and verified pos_database.db successfully.")

# =============================================================================
# 3. HTTP REQUEST HANDLER WITH REST APIS & DEVELOPER REMOTE DEBUGGER
# =============================================================================
class MyPOSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # 1. License Check Endpoint
        if path == '/api/license/status':
            status = get_current_license_status()
            self._send_json(status)
            return

        # 2. Database Full State Load Endpoint
        elif path == '/api/state':
            try:
                conn = sqlite3.connect(DB_FILE)
                conn.row_factory = sqlite3.Row
                c = conn.cursor()

                # Settings
                c.execute("SELECT * FROM company_settings WHERE id = 1")
                s_row = c.fetchone()
                settings = dict(s_row) if s_row else {}
                settings['storeName'] = settings.get('store_name', 'ABC Retail Store')
                settings['legalName'] = settings.get('legal_name', 'ABC Supermarkets')
                settings['invoicePrefix'] = settings.get('invoice_prefix', 'INV')
                settings['allowNegativeStock'] = bool(settings.get('allow_negative_stock', 0))

                # Products
                c.execute("SELECT * FROM products ORDER BY id ASC")
                products = []
                for p in c.fetchall():
                    d = dict(p)
                    d['minStock'] = d.pop('min_stock', 5)
                    products.append(d)

                # Categories
                c.execute("SELECT * FROM categories ORDER BY id ASC")
                categories = []
                for cat in c.fetchall():
                    d = dict(cat)
                    d['desc'] = d.pop('description', '')
                    categories.append(d)

                # Branches
                c.execute("SELECT * FROM branches ORDER BY id ASC")
                branches = [dict(b) for b in c.fetchall()]

                # Customers
                c.execute("SELECT * FROM customers ORDER BY id ASC")
                customers = []
                for cust in c.fetchall():
                    d = dict(cust)
                    d['creditLimit'] = d.pop('credit_limit', 0)
                    customers.append(d)

                # Suppliers
                c.execute("SELECT * FROM suppliers ORDER BY id ASC")
                suppliers = [dict(s) for s in c.fetchall()]

                # Sales Orders
                c.execute("SELECT * FROM sales_orders ORDER BY id DESC")
                sales_history = []
                for row in c.fetchall():
                    d = dict(row)
                    d['invoiceNo'] = d.pop('invoice_no', '')
                    d['customerMobile'] = d.pop('customer_mobile', '')
                    d['paymentMode'] = d.pop('payment_mode', '')
                    try:
                        d['items'] = json.loads(d.pop('items_json', '[]'))
                    except Exception:
                        d['items'] = []
                    sales_history.append(d)

                # Users
                c.execute("SELECT * FROM system_users ORDER BY id ASC")
                users = [dict(u) for u in c.fetchall()]

                # Purchases
                c.execute("SELECT * FROM purchases ORDER BY id DESC")
                purchases = []
                for row in c.fetchall():
                    d = dict(row)
                    d['poNumber'] = d.pop('po_number', '')
                    d['itemsCount'] = d.pop('items_count', 0)
                    d['totalQty'] = d.pop('total_qty', 0)
                    d['totalAmount'] = d.pop('total_amount', 0)
                    purchases.append(d)

                # Returns
                c.execute("SELECT * FROM returns_log ORDER BY date DESC")
                returns = [dict(r) for r in c.fetchall()]

                # Transfers
                c.execute("SELECT * FROM stock_transfers ORDER BY date DESC")
                transfers = []
                for row in c.fetchall():
                    d = dict(row)
                    d['from'] = d.pop('from_branch', '')
                    d['to'] = d.pop('to_branch', '')
                    d['totalQty'] = d.pop('total_qty', 0)
                    try:
                        d['items'] = json.loads(d.pop('items_json', '[]'))
                    except Exception:
                        d['items'] = []
                    transfers.append(d)

                conn.close()

                payload = {
                    "status": "success",
                    "license": get_current_license_status(),
                    "settings": settings,
                    "products": products,
                    "categories": categories,
                    "branches": branches,
                    "customers": customers,
                    "suppliers": suppliers,
                    "salesHistory": sales_history,
                    "purchases": purchases,
                    "returns": returns,
                    "transferHistory": transfers,
                    "users": users
                }
                self._send_json(payload)
                return
            except Exception as e:
                self._send_json({"status": "error", "message": str(e)}, status=500)
                return

        # 3. 1-Click Database Download Endpoint for WhatsApp Support
        elif path == '/api/backup/download':
            if not os.path.exists(DB_FILE):
                self._send_json({"error": "Database file not found"}, status=404)
                return
            with open(DB_FILE, 'rb') as f:
                data = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'application/x-sqlite3')
            self.send_header('Content-Disposition', f'attachment; filename="pos_backup_{datetime.date.today().isoformat()}.db"')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(length) if length > 0 else b'{}'
        
        try:
            body = json.loads(post_data.decode('utf-8'))
        except Exception:
            body = {}

        # 1. License Activation Endpoint
        if path == '/api/license/activate':
            key = body.get('key', '').strip()
            machine_id = get_machine_hardware_id()
            is_valid, info = verify_license_key(machine_id, key)
            if is_valid:
                with open(LICENSE_FILE, 'w', encoding='utf-8') as f:
                    f.write(key)
                self._send_json({"status": "success", "message": f"License successfully activated! ({info})", "license": get_current_license_status()})
            else:
                self._send_json({"status": "error", "message": f"Activation failed: {info}"}, status=400)
            return

        # 2. Synchronize Entire State to SQLite
        elif path == '/api/sync':
            try:
                conn = sqlite3.connect(DB_FILE)
                c = conn.cursor()

                # Sync Products
                if 'products' in body and isinstance(body['products'], list):
                    for p in body['products']:
                        c.execute("""
                        INSERT INTO products (id, code, name, category, price, cost, stock, min_stock, unit, tax, icon, barcode)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            code=excluded.code, name=excluded.name, category=excluded.category,
                            price=excluded.price, cost=excluded.cost, stock=excluded.stock,
                            min_stock=excluded.min_stock, unit=excluded.unit, tax=excluded.tax,
                            icon=excluded.icon, barcode=excluded.barcode
                        """, (
                            p.get('id'), p.get('code'), p.get('name'), p.get('category'),
                            float(p.get('price', 0)), float(p.get('cost', 0)),
                            int(p.get('stock', 0)), int(p.get('minStock', 5)),
                            p.get('unit', 'Pkt'), float(p.get('tax', 0)),
                            p.get('icon', '📦'), p.get('barcode', '')
                        ))

                # Sync Sales History
                if 'salesHistory' in body and isinstance(body['salesHistory'], list):
                    for s in body['salesHistory']:
                        c.execute("""
                        INSERT INTO sales_orders (id, invoice_no, date, customer, customer_mobile, branch, cashier, amount, payment, payment_mode, items_json)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            amount=excluded.amount, payment=excluded.payment, payment_mode=excluded.payment_mode
                        """, (
                            s.get('id'), s.get('invoiceNo'), s.get('date'),
                            s.get('customer'), s.get('customerMobile'), s.get('branch'),
                            s.get('cashier'), float(s.get('amount', 0)),
                            s.get('payment'), s.get('paymentMode'),
                            json.dumps(s.get('items', []))
                        ))

                # Sync Customers
                if 'customers' in body and isinstance(body['customers'], list):
                    for cust in body['customers']:
                        c.execute("""
                        INSERT INTO customers (id, name, mobile, email, gstin, balance, credit_limit, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            name=excluded.name, mobile=excluded.mobile, email=excluded.email,
                            gstin=excluded.gstin, balance=excluded.balance, credit_limit=excluded.credit_limit,
                            status=excluded.status
                        """, (
                            cust.get('id'), cust.get('name'), cust.get('mobile'),
                            cust.get('email', ''), cust.get('gstin', ''),
                            float(cust.get('balance', 0)), float(cust.get('creditLimit', 2000)),
                            cust.get('status', 'Active')
                        ))

                # Sync Settings
                if 'settings' in body and isinstance(body['settings'], dict):
                    st = body['settings']
                    c.execute("""
                    UPDATE company_settings SET
                        store_name=?, legal_name=?, gstin=?, address=?, phone=?,
                        invoice_prefix=?, currency=?, allow_negative_stock=?
                    WHERE id = 1
                    """, (
                        st.get('storeName', 'ABC Retail Store'), st.get('legalName', ''),
                        st.get('gstin', ''), st.get('address', ''), st.get('phone', ''),
                        st.get('invoicePrefix', 'INV'), st.get('currency', '₹'),
                        1 if st.get('allowNegativeStock') else 0
                    ))

                # Sync Stock Transfers
                if 'transferHistory' in body and isinstance(body['transferHistory'], list):
                    for trf in body['transferHistory']:
                        c.execute("""
                        INSERT INTO stock_transfers (id, date, from_branch, to_branch, total_qty, status, items_json)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET status=excluded.status
                        """, (
                            trf.get('id'), trf.get('date'), trf.get('from'),
                            trf.get('to'), int(trf.get('totalQty', 0)),
                            trf.get('status', 'Completed'), json.dumps(trf.get('items', []))
                        ))

                # Sync Branches
                if 'branches' in body and isinstance(body['branches'], list):
                    for b in body['branches']:
                        c.execute("""
                        INSERT INTO branches (id, code, name, address, phone, status)
                        VALUES (?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            code=excluded.code, name=excluded.name, address=excluded.address,
                            phone=excluded.phone, status=excluded.status
                        """, (
                            b.get('id'), b.get('code'), b.get('name'),
                            b.get('address', ''), b.get('phone', ''), b.get('status', 'Active')
                        ))
                    existing_b_ids = [b.get('id') for b in body['branches'] if b.get('id')]
                    if existing_b_ids:
                        placeholders = ','.join('?' * len(existing_b_ids))
                        c.execute(f"DELETE FROM branches WHERE id NOT IN ({placeholders}) AND id != 1", existing_b_ids)

                # Sync Categories
                if 'categories' in body and isinstance(body['categories'], list):
                    for cat in body['categories']:
                        if isinstance(cat, dict):
                            c.execute("""
                            INSERT INTO categories (id, name, description, status)
                            VALUES (?, ?, ?, ?)
                            ON CONFLICT(id) DO UPDATE SET
                                name=excluded.name, description=excluded.description, status=excluded.status
                            """, (
                                cat.get('id'), cat.get('name'), cat.get('desc', cat.get('description', '')), cat.get('status', 'Active')
                            ))
                        elif isinstance(cat, str):
                            c.execute("INSERT OR IGNORE INTO categories (name, status) VALUES (?, 'Active')", (cat,))

                # Sync Suppliers
                if 'suppliers' in body and isinstance(body['suppliers'], list):
                    for s in body['suppliers']:
                        c.execute("""
                        INSERT INTO suppliers (id, name, contact, mobile, email, gstin, balance, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            name=excluded.name, contact=excluded.contact, mobile=excluded.mobile,
                            email=excluded.email, gstin=excluded.gstin, balance=excluded.balance, status=excluded.status
                        """, (
                            s.get('id'), s.get('name'), s.get('contact', ''), s.get('mobile', ''),
                            s.get('email', ''), s.get('gstin', ''), float(s.get('due', s.get('balance', 0))), s.get('status', 'Active')
                        ))

                # Sync Users
                if 'users' in body and isinstance(body['users'], list):
                    for u in body['users']:
                        c.execute("""
                        INSERT INTO system_users (id, name, username, password, role, branch, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            name=excluded.name, username=excluded.username, password=excluded.password,
                            role=excluded.role, branch=excluded.branch, status=excluded.status
                        """, (
                            u.get('id'), u.get('name'), u.get('username'), u.get('password', 'password123'),
                            u.get('role', 'CASHIER'), u.get('branch', 'Main Branch'), u.get('status', 'Active')
                        ))

                # Sync Purchases
                if 'purchases' in body and isinstance(body['purchases'], list):
                    for pur in body['purchases']:
                        c.execute("""
                        INSERT INTO purchases (id, po_number, date, supplier, branch, items_count, total_qty, total_amount, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            supplier=excluded.supplier, total_qty=excluded.total_qty, total_amount=excluded.total_amount, status=excluded.status
                        """, (
                            pur.get('id'), pur.get('poNumber', pur.get('po_number')), pur.get('date'),
                            pur.get('supplier'), pur.get('branch', 'Main Branch'), int(pur.get('itemsCount', 0)),
                            int(pur.get('totalQty', 0)), float(pur.get('totalAmount', 0)), pur.get('status', 'Received')
                        ))

                # Sync Returns
                if 'returns' in body and isinstance(body['returns'], list):
                    for r in body['returns']:
                        c.execute("""
                        INSERT INTO returns_log (id, date, type, ref_no, party, branch, amount, reason, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET status=excluded.status
                        """, (
                            str(r.get('id')), r.get('date'), r.get('type'), r.get('refNo', r.get('ref_no')),
                            r.get('party'), r.get('branch', 'Main Branch'), float(r.get('amount', 0)),
                            r.get('reason', ''), r.get('status', 'Completed')
                        ))

                conn.commit()
                conn.close()
                self._send_json({"status": "success", "message": "State synced to SQLite successfully."})
                return
            except Exception as err:
                self._send_json({"status": "error", "message": str(err)}, status=500)
                return

        # 3. Secret Remote Developer Console & SQL Query Runner (Ctrl+Shift+D)
        elif path == '/api/admin/query':
            pin = body.get('pin', '')
            query = body.get('query', '').strip()
            if pin != MASTER_DEV_PIN:
                self._send_json({"status": "error", "message": "Access Denied: Invalid Master PIN"}, status=403)
                return

            try:
                conn = sqlite3.connect(DB_FILE)
                conn.row_factory = sqlite3.Row
                c = conn.cursor()
                c.execute(query)
                if query.upper().startswith('SELECT') or query.upper().startswith('PRAGMA'):
                    rows = [dict(r) for r in c.fetchall()]
                    conn.close()
                    self._send_json({"status": "success", "rows": rows, "count": len(rows)})
                else:
                    affected = c.rowcount
                    conn.commit()
                    conn.close()
                    self._send_json({"status": "success", "message": f"Query executed successfully ({affected} rows affected)."})
            except Exception as e:
                self._send_json({"status": "error", "message": str(e)}, status=400)
            return

        # 4. Master Data Reconcile & Self-Healing Endpoint
        elif path == '/api/admin/reconcile':
            pin = body.get('pin', '')
            if pin != MASTER_DEV_PIN:
                self._send_json({"status": "error", "message": "Access Denied: Invalid Master PIN"}, status=403)
                return
            
            try:
                conn = sqlite3.connect(DB_FILE)
                c = conn.cursor()
                # Ensure no negative stock if not allowed
                c.execute("UPDATE products SET stock = 0 WHERE stock < 0")
                # Fix customer balances
                c.execute("UPDATE customers SET balance = 0 WHERE balance < 0")
                conn.commit()
                conn.close()
                self._send_json({"status": "success", "message": "Database reconciled and self-healed successfully."})
            except Exception as err:
                self._send_json({"status": "error", "message": str(err)}, status=500)
            return

        # 5. Store Reset Endpoint (Client Clean State & Testing Reset)
        elif path == '/api/admin/reset_store':
            action = body.get('action', 'sales_only')
            try:
                conn = sqlite3.connect(DB_FILE)
                c = conn.cursor()
                if action == 'full_clean':
                    c.execute("DELETE FROM sales_orders")
                    c.execute("DELETE FROM purchases")
                    c.execute("DELETE FROM returns_log")
                    c.execute("DELETE FROM stock_transfers")
                    c.execute("DELETE FROM suppliers")
                    c.execute("DELETE FROM customers WHERE id > 1")
                    c.execute("UPDATE products SET stock = 50")
                elif action == 'sales_only':
                    c.execute("DELETE FROM sales_orders")
                    c.execute("DELETE FROM returns_log WHERE type = 'Sales Return'")
                conn.commit()
                conn.close()
                self._send_json({"status": "success", "message": f"SQLite database reset ({action}) successfully."})
            except Exception as e:
                self._send_json({"status": "error", "message": str(e)}, status=500)
            return

        super().do_POST()

# =============================================================================
# 4. SERVER RUNNER WITH AUTO BROWSER LAUNCH
# =============================================================================
def start_server():
    global PORT
    init_sqlite_db()
    machine_id = get_machine_hardware_id()
    status = get_current_license_status()

    # Try standard ports in case 8080 is temporarily busy
    httpd = None
    candidate_ports = [8080, 8081, 8082, 8888, 9000]
    for p in candidate_ports:
        try:
            socketserver.TCPServer.allow_reuse_address = True
            httpd = socketserver.TCPServer(("", p), MyPOSRequestHandler)
            PORT = p
            break
        except OSError:
            continue

    if not httpd:
        print("[!] Warning: Could not bind to standard local ports. Opening standalone file...")
        try:
            webbrowser.open(os.path.join(STATIC_DIR, "index.html"))
        except Exception:
            pass
        return

    print("=" * 70)
    print("      MYPOS COMMERCIAL RETAIL SERVER (STANDALONE ENGINE)      ")
    print("=" * 70)
    print(f"[*] Computer Machine ID : {machine_id}")
    print(f"[*] License Status      : {'ACTIVATED (' + status.get('type') + ')' if status.get('activated') else 'UNACTIVATED (Activation Required)'}")
    print(f"[*] SQLite Database     : {DB_FILE}")
    print(f"[*] Local Web Address   : http://localhost:{PORT}")
    print("=" * 70)
    print("[*] Launching MyPOS in your browser...")
    print("[*] Press Ctrl+C in this window to stop the server.")

    # Open browser automatically after 1 second
    def open_browser():
        try:
            webbrowser.open(f"http://localhost:{PORT}/")
        except Exception:
            try:
                webbrowser.open(os.path.join(STATIC_DIR, "index.html"))
            except Exception:
                pass

    import threading
    threading.Timer(1.0, open_browser).start()

    with httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[!] Shutting down MyPOS server cleanly.")
            httpd.server_close()

if __name__ == '__main__':
    start_server()
