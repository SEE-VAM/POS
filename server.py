"""
=============================================================================
BRAINSHOP COMMERCIAL SERVER & SQLITE DATABASE ENGINE
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
import urllib.request
import re

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
    # Format as clean 16-character code: BRAINSHOP-XXXX-XXXX-XXXX
    return f"BRAINSHOP-{digest[0:4]}-{digest[4:8]}-{digest[8:12]}"

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
def get_db_connection(row_factory=False):
    conn = sqlite3.connect(DB_FILE)
    conn.execute("PRAGMA foreign_keys = ON")
    if row_factory:
        conn.row_factory = sqlite3.Row
    return conn

def get_gateway_settings():
    """Retrieves automated WhatsApp & SMS Cloud Gateway configuration from SQLite."""
    try:
        conn = get_db_connection(row_factory=True)
        c = conn.cursor()
        c.execute("SELECT whatsapp_provider, whatsapp_instance_id, whatsapp_token, custom_webhook_url, auto_dispatch_on_sale FROM company_settings WHERE id = 1")
        row = c.fetchone()
        conn.close()
        if row:
            return {
                "provider": row['whatsapp_provider'] or 'ultramsg',
                "instanceId": row['whatsapp_instance_id'] or '',
                "token": row['whatsapp_token'] or '',
                "customUrl": row['custom_webhook_url'] or '',
                "autoDispatch": bool(row['auto_dispatch_on_sale'])
            }
    except Exception:
        pass
    return {"provider": "ultramsg", "instanceId": "", "token": "", "customUrl": "", "autoDispatch": True}

def dispatch_cloud_message(provider, instance_id, token, custom_url, mobile, message, sms_text, channel='whatsapp'):
    """
    Sends automated WhatsApp / SMS via Cloud Gateway without requiring WhatsApp login on counter PC.
    Zero external dependencies - uses pure Python standard library urllib.request!
    """
    clean_mobile = re.sub(r'\D', '', str(mobile))
    if len(clean_mobile) > 10:
        clean_mobile = clean_mobile[-10:]
    full_mobile_91 = "91" + clean_mobile

    if provider == 'demo':
        print(f"[DEMO GATEWAY] Zero-login simulated {channel.upper()} dispatched to +91 {clean_mobile}")
        return True, f"Delivered in Demo Mode to +91 {clean_mobile} (Simulated)"

    if provider == 'ultramsg':
        if not instance_id or not token:
            return False, "UltraMsg Instance ID and Token not yet configured in Settings."
        try:
            url = f"https://api.ultramsg.com/{instance_id}/messages/chat"
            params = urllib.parse.urlencode({
                "token": token,
                "to": f"+{full_mobile_91}",
                "body": message
            }).encode('utf-8')
            req = urllib.request.Request(url, data=params, headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "BrainShop-POS/1.0"
            })
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                if data.get('sent') == 'true' or data.get('id'):
                    return True, f"Delivered via UltraMsg Cloud (Message ID: {data.get('id', 'OK')})"
                return True, f"Delivered via UltraMsg Cloud"
        except Exception as e:
            return False, f"UltraMsg dispatch error: {str(e)}"

    elif provider == 'greenapi':
        if not instance_id or not token:
            return False, "GreenAPI Instance ID and Token not yet configured in Settings."
        try:
            url = f"https://api.green-api.com/waInstance{instance_id}/sendMessage/{token}"
            payload = json.dumps({
                "chatId": f"{full_mobile_91}@c.us",
                "message": message
            }).encode('utf-8')
            req = urllib.request.Request(url, data=payload, headers={
                "Content-Type": "application/json",
                "User-Agent": "BrainShop-POS/1.0"
            })
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                return True, f"Delivered via GreenAPI Cloud (Message ID: {data.get('idMessage', 'OK')})"
        except Exception as e:
            return False, f"GreenAPI dispatch error: {str(e)}"

    elif provider == 'fast2sms':
        if not token:
            return False, "Fast2SMS API Key not yet configured in Settings."
        try:
            # Route 'q' is Quick transactional SMS that delivers to any Indian mobile number
            url = "https://www.fast2sms.com/dev/bulkV2"
            payload = json.dumps({
                "route": "q",
                "message": sms_text or message,
                "language": "english",
                "flash": 0,
                "numbers": clean_mobile
            }).encode('utf-8')
            req = urllib.request.Request(url, data=payload, headers={
                "authorization": token,
                "Content-Type": "application/json",
                "User-Agent": "BrainShop-POS/1.0"
            })
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                if data.get('return'):
                    return True, "Delivered via Fast2SMS Direct Mobile SMS"
                err_msg = data.get('message', 'Failed')
                if isinstance(err_msg, list) and len(err_msg) > 0:
                    err_msg = err_msg[0]
                return False, f"Fast2SMS error: {err_msg}"
        except Exception as e:
            # Fallback to GET request for Fast2SMS
            try:
                get_url = f"https://www.fast2sms.com/dev/bulkV2?authorization={urllib.parse.quote(token)}&route=q&message={urllib.parse.quote(sms_text or message)}&language=english&flash=0&numbers={clean_mobile}"
                req_get = urllib.request.Request(get_url, headers={"User-Agent": "BrainShop-POS/1.0"})
                with urllib.request.urlopen(req_get, timeout=10) as resp_get:
                    data_get = json.loads(resp_get.read().decode('utf-8'))
                    if data_get.get('return'):
                        return True, "Delivered via Fast2SMS Direct Mobile SMS"
                    return False, f"Fast2SMS error: {data_get.get('message', 'Failed')}"
            except Exception as e2:
                return False, f"Fast2SMS error: {str(e)}"

    elif provider == 'custom':
        if not custom_url:
            return False, "Custom Webhook URL not provided in Settings."
        try:
            payload = json.dumps({
                "to": full_mobile_91,
                "mobile": clean_mobile,
                "message": message,
                "smsText": sms_text,
                "token": token
            }).encode('utf-8')
            req = urllib.request.Request(custom_url, data=payload, headers={
                "Content-Type": "application/json",
                "User-Agent": "BrainShop-POS/1.0"
            })
            with urllib.request.urlopen(req, timeout=10) as resp:
                return True, "Delivered via Custom Webhook"
        except Exception as e:
            return False, f"Custom Webhook error: {str(e)}"

    return False, "Gateway provider is set to browser direct mode."

def migrate_database_schema(conn):
    """
    Enterprise Schema Migration:
    Guarantees explicit Primary Keys, Foreign Keys, company_code, branch_code,
    and indexes across all tables with 100% zero data loss preservation.
    """
    c = conn.cursor()
    conn.execute("PRAGMA foreign_keys = OFF") # Temporarily disable during table recreate

    # Check branches for name -> code mapping
    branch_map = {'Main Branch': 'B001', 'Branch 2 - Noida Sector 62': 'B002', 'Branch 3 - Gurgaon Express': 'B003'}
    try:
        c.execute("SELECT code, name FROM branches")
        for r in c.fetchall():
            if r[0] and r[1]:
                branch_map[r[1].strip()] = r[0].strip()
    except Exception:
        pass

    # 1. company_settings
    try:
        c.execute("PRAGMA table_info(company_settings)")
        cols = [r[1] for r in c.fetchall()]
        if not cols:
            c.execute("""
            CREATE TABLE company_settings (
                id INTEGER PRIMARY KEY,
                company_code TEXT UNIQUE NOT NULL DEFAULT 'COMP001',
                store_name TEXT NOT NULL,
                legal_name TEXT,
                gstin TEXT,
                address TEXT,
                phone TEXT,
                invoice_prefix TEXT DEFAULT 'INV',
                currency TEXT DEFAULT '₹',
                allow_negative_stock INTEGER DEFAULT 0
            )
            """)
        elif 'company_code' not in cols:
            c.execute("ALTER TABLE company_settings RENAME TO _old_company_settings")
            c.execute("""
            CREATE TABLE company_settings (
                id INTEGER PRIMARY KEY,
                company_code TEXT UNIQUE NOT NULL DEFAULT 'COMP001',
                store_name TEXT NOT NULL,
                legal_name TEXT,
                gstin TEXT,
                address TEXT,
                phone TEXT,
                invoice_prefix TEXT DEFAULT 'INV',
                currency TEXT DEFAULT '₹',
                allow_negative_stock INTEGER DEFAULT 0
            )
            """)
            c.execute("""
            INSERT INTO company_settings (id, company_code, store_name, legal_name, gstin, address, phone, invoice_prefix, currency, allow_negative_stock)
            SELECT id, 'COMP001', store_name, legal_name, gstin, address, phone, invoice_prefix, currency, allow_negative_stock
            FROM _old_company_settings
            """)
            c.execute("DROP TABLE _old_company_settings")
        # Automated WhatsApp / SMS Gateway columns migration
        c.execute("PRAGMA table_info(company_settings)")
        gw_cols = [r[1] for r in c.fetchall()]
        if 'whatsapp_provider' not in gw_cols:
            c.execute("ALTER TABLE company_settings ADD COLUMN whatsapp_provider TEXT DEFAULT 'ultramsg'")
        if 'whatsapp_instance_id' not in gw_cols:
            c.execute("ALTER TABLE company_settings ADD COLUMN whatsapp_instance_id TEXT DEFAULT ''")
        if 'whatsapp_token' not in gw_cols:
            c.execute("ALTER TABLE company_settings ADD COLUMN whatsapp_token TEXT DEFAULT ''")
        if 'custom_webhook_url' not in gw_cols:
            c.execute("ALTER TABLE company_settings ADD COLUMN custom_webhook_url TEXT DEFAULT ''")
        if 'auto_dispatch_on_sale' not in gw_cols:
            c.execute("ALTER TABLE company_settings ADD COLUMN auto_dispatch_on_sale INTEGER DEFAULT 1")
    except Exception as e:
        print(f"[Migration Warning company_settings] {e}")

    # Ensure default company_settings row exists
    c.execute("SELECT COUNT(*) FROM company_settings")
    if c.fetchone()[0] == 0:
        c.execute("""
        INSERT INTO company_settings (id, company_code, store_name, legal_name, gstin, address, phone, invoice_prefix, currency, allow_negative_stock)
        VALUES (1, 'COMP001', 'ABC Retail Store', 'ABC Supermarkets India Pvt Ltd', '07ABCDE1234F1Z5', 'Shop No. 12, Green Park, New Delhi - 110016', '+91 98765 43210', 'INV', '₹', 0)
        """)

    # 2. branches
    try:
        c.execute("PRAGMA table_info(branches)")
        cols = [r[1] for r in c.fetchall()]
        if not cols:
            c.execute("""
            CREATE TABLE branches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL DEFAULT 'COMP001',
                code TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                address TEXT,
                phone TEXT,
                status TEXT DEFAULT 'Active',
                FOREIGN KEY (company_code) REFERENCES company_settings(company_code) ON UPDATE CASCADE ON DELETE RESTRICT
            )
            """)
        elif 'company_code' not in cols:
            c.execute("ALTER TABLE branches RENAME TO _old_branches")
            c.execute("""
            CREATE TABLE branches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL DEFAULT 'COMP001',
                code TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                address TEXT,
                phone TEXT,
                status TEXT DEFAULT 'Active',
                FOREIGN KEY (company_code) REFERENCES company_settings(company_code) ON UPDATE CASCADE ON DELETE RESTRICT
            )
            """)
            c.execute("""
            INSERT INTO branches (id, company_code, code, name, address, phone, status)
            SELECT id, 'COMP001', code, name, address, phone, status
            FROM _old_branches
            """)
            c.execute("DROP TABLE _old_branches")
            print("[Migration] Upgraded branches with company_code FK.")
    except Exception as e:
        print(f"[Migration Warning branches] {e}")

    c.execute("SELECT COUNT(*) FROM branches")
    if c.fetchone()[0] == 0:
        c.executemany("""
        INSERT INTO branches (id, company_code, code, name, address, phone, status)
        VALUES (?, 'COMP001', ?, ?, ?, ?, ?)
        """, [
            (1, 'B001', 'Main Branch', 'Shop No. 12, Green Park, New Delhi', '+91 98765 43210', 'Active'),
            (2, 'B002', 'Branch 2 - Noida Sector 62', 'Plot 45, Sector 62, Noida, UP', '+91 98765 43211', 'Active'),
            (3, 'B003', 'Branch 3 - Gurgaon Express', 'DLF Phase 3, Gurgaon, Haryana', '+91 98765 43212', 'Active')
        ])

    # Refresh branch map
    c.execute("SELECT code, name FROM branches")
    for r in c.fetchall():
        if r[0] and r[1]:
            branch_map[r[1].strip()] = r[0].strip()

    # 3. categories
    try:
        c.execute("PRAGMA table_info(categories)")
        cols = [r[1] for r in c.fetchall()]
        if not cols:
            c.execute("""
            CREATE TABLE categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL DEFAULT 'COMP001',
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'Active',
                FOREIGN KEY (company_code) REFERENCES company_settings(company_code) ON UPDATE CASCADE ON DELETE RESTRICT
            )
            """)
        elif 'company_code' not in cols:
            c.execute("ALTER TABLE categories RENAME TO _old_categories")
            c.execute("""
            CREATE TABLE categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL DEFAULT 'COMP001',
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                status TEXT DEFAULT 'Active',
                FOREIGN KEY (company_code) REFERENCES company_settings(company_code) ON UPDATE CASCADE ON DELETE RESTRICT
            )
            """)
            c.execute("""
            INSERT INTO categories (id, company_code, name, description, status)
            SELECT id, 'COMP001', name, description, status
            FROM _old_categories
            """)
            c.execute("DROP TABLE _old_categories")
            print("[Migration] Upgraded categories with company_code FK.")
    except Exception as e:
        print(f"[Migration Warning categories] {e}")

    # 4. system_users
    try:
        c.execute("PRAGMA table_info(system_users)")
        cols = [r[1] for r in c.fetchall()]
        if not cols:
            c.execute("""
            CREATE TABLE system_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL DEFAULT 'COMP001',
                branch_code TEXT DEFAULT 'B001',
                name TEXT NOT NULL,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                branch TEXT DEFAULT 'Main Branch',
                status TEXT DEFAULT 'Active',
                FOREIGN KEY (company_code) REFERENCES company_settings(company_code) ON UPDATE CASCADE ON DELETE RESTRICT,
                FOREIGN KEY (branch_code) REFERENCES branches(code) ON UPDATE CASCADE ON DELETE RESTRICT
            )
            """)
        elif 'company_code' not in cols or 'branch_code' not in cols:
            c.execute("ALTER TABLE system_users RENAME TO _old_system_users")
            c.execute("""
            CREATE TABLE system_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL DEFAULT 'COMP001',
                branch_code TEXT DEFAULT 'B001',
                name TEXT NOT NULL,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                branch TEXT DEFAULT 'Main Branch',
                status TEXT DEFAULT 'Active',
                FOREIGN KEY (company_code) REFERENCES company_settings(company_code) ON UPDATE CASCADE ON DELETE RESTRICT,
                FOREIGN KEY (branch_code) REFERENCES branches(code) ON UPDATE CASCADE ON DELETE RESTRICT
            )
            """)
            c.execute("SELECT id, name, username, password, role, branch, status FROM _old_system_users")
            for r in c.fetchall():
                u_id, u_name, u_user, u_pass, u_role, u_branch, u_stat = r
                b_code = branch_map.get((u_branch or '').strip(), 'B001')
                c.execute("""
                INSERT INTO system_users (id, company_code, branch_code, name, username, password, role, branch, status)
                VALUES (?, 'COMP001', ?, ?, ?, ?, ?, ?, ?)
                """, (u_id, b_code, u_name, u_user, u_pass, u_role, u_branch or 'Main Branch', u_stat))
            c.execute("DROP TABLE _old_system_users")
            print("[Migration] Upgraded system_users with company_code & branch_code FKs.")
    except Exception as e:
        print(f"[Migration Warning system_users] {e}")

    c.execute("SELECT COUNT(*) FROM system_users")
    if c.fetchone()[0] == 0:
        c.executemany("""
        INSERT INTO system_users (id, company_code, branch_code, name, username, password, role, branch, status)
        VALUES (?, 'COMP001', ?, ?, ?, ?, ?, ?, ?)
        """, [
            (1, 'B001', 'System Administrator', 'admin', 'password123', 'ADMIN', 'All Branches', 'Active'),
            (2, 'B001', 'Store Manager', 'manager', 'password123', 'MANAGER', 'Main Branch', 'Active'),
            (3, 'B001', 'Cashier One', 'cashier1', 'password123', 'CASHIER', 'Main Branch', 'Active'),
            (4, 'B002', 'Cashier Two', 'cashier2', 'password123', 'CASHIER', 'Branch 2 - Noida', 'Active')
        ])

    # 5. products
    try:
        c.execute("PRAGMA table_info(products)")
        cols = [r[1] for r in c.fetchall()]
        if not cols:
            c.execute("""
            CREATE TABLE products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL DEFAULT 'COMP001',
                branch_code TEXT DEFAULT 'B001',
                code TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                category TEXT,
                price REAL NOT NULL DEFAULT 0.0,
                cost REAL NOT NULL DEFAULT 0.0,
                stock INTEGER NOT NULL DEFAULT 0,
                min_stock INTEGER NOT NULL DEFAULT 5,
                unit TEXT DEFAULT 'Pkt',
                tax REAL NOT NULL DEFAULT 0.0,
                icon TEXT DEFAULT '📦',
                barcode TEXT,
                FOREIGN KEY (company_code) REFERENCES company_settings(company_code) ON UPDATE CASCADE ON DELETE RESTRICT,
                FOREIGN KEY (branch_code) REFERENCES branches(code) ON UPDATE CASCADE ON DELETE RESTRICT
            )
            """)
        elif 'company_code' not in cols or 'branch_code' not in cols:
            c.execute("ALTER TABLE products RENAME TO _old_products")
            c.execute("""
            CREATE TABLE products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL DEFAULT 'COMP001',
                branch_code TEXT DEFAULT 'B001',
                code TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                category TEXT,
                price REAL NOT NULL DEFAULT 0.0,
                cost REAL NOT NULL DEFAULT 0.0,
                stock INTEGER NOT NULL DEFAULT 0,
                min_stock INTEGER NOT NULL DEFAULT 5,
                unit TEXT DEFAULT 'Pkt',
                tax REAL NOT NULL DEFAULT 0.0,
                icon TEXT DEFAULT '📦',
                barcode TEXT,
                FOREIGN KEY (company_code) REFERENCES company_settings(company_code) ON UPDATE CASCADE ON DELETE RESTRICT,
                FOREIGN KEY (branch_code) REFERENCES branches(code) ON UPDATE CASCADE ON DELETE RESTRICT
            )
            """)
            c.execute("""
            INSERT INTO products (id, company_code, branch_code, code, name, category, price, cost, stock, min_stock, unit, tax, icon, barcode)
            SELECT id, 'COMP001', 'B001', code, name, category, price, cost, stock, min_stock, unit, tax, icon, barcode
            FROM _old_products
            """)
            c.execute("DROP TABLE _old_products")
            print("[Migration] Upgraded products with company_code & branch_code FKs.")
    except Exception as e:
        print(f"[Migration Warning products] {e}")

    # 6. customers
    try:
        c.execute("PRAGMA table_info(customers)")
        cols = [r[1] for r in c.fetchall()]
        if not cols:
            c.execute("""
            CREATE TABLE customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL DEFAULT 'COMP001',
                branch_code TEXT DEFAULT 'B001',
                name TEXT NOT NULL,
                mobile TEXT,
                email TEXT,
                gstin TEXT,
                balance REAL DEFAULT 0.0,
                credit_limit REAL DEFAULT 2000.0,
                status TEXT DEFAULT 'Active',
                FOREIGN KEY (company_code) REFERENCES company_settings(company_code) ON UPDATE CASCADE ON DELETE RESTRICT,
                FOREIGN KEY (branch_code) REFERENCES branches(code) ON UPDATE CASCADE ON DELETE RESTRICT
            )
            """)
        elif 'company_code' not in cols or 'branch_code' not in cols:
            c.execute("ALTER TABLE customers RENAME TO _old_customers")
            c.execute("""
            CREATE TABLE customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL DEFAULT 'COMP001',
                branch_code TEXT DEFAULT 'B001',
                name TEXT NOT NULL,
                mobile TEXT,
                email TEXT,
                gstin TEXT,
                balance REAL DEFAULT 0.0,
                credit_limit REAL DEFAULT 2000.0,
                status TEXT DEFAULT 'Active',
                FOREIGN KEY (company_code) REFERENCES company_settings(company_code) ON UPDATE CASCADE ON DELETE RESTRICT,
                FOREIGN KEY (branch_code) REFERENCES branches(code) ON UPDATE CASCADE ON DELETE RESTRICT
            )
            """)
            c.execute("""
            INSERT INTO customers (id, company_code, branch_code, name, mobile, email, gstin, balance, credit_limit, status)
            SELECT id, 'COMP001', 'B001', name, mobile, email, gstin, balance, credit_limit, status
            FROM _old_customers
            """)
            c.execute("DROP TABLE _old_customers")
            print("[Migration] Upgraded customers with company_code & branch_code FKs.")
    except Exception as e:
        print(f"[Migration Warning customers] {e}")

    # 7. suppliers
    try:
        c.execute("PRAGMA table_info(suppliers)")
        cols = [r[1] for r in c.fetchall()]
        if not cols:
            c.execute("""
            CREATE TABLE suppliers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL DEFAULT 'COMP001',
                branch_code TEXT DEFAULT 'B001',
                name TEXT NOT NULL,
                contact TEXT,
                mobile TEXT,
                email TEXT,
                gstin TEXT,
                balance REAL DEFAULT 0.0,
                status TEXT DEFAULT 'Active',
                FOREIGN KEY (company_code) REFERENCES company_settings(company_code) ON UPDATE CASCADE ON DELETE RESTRICT,
                FOREIGN KEY (branch_code) REFERENCES branches(code) ON UPDATE CASCADE ON DELETE RESTRICT
            )
            """)
        elif 'company_code' not in cols or 'branch_code' not in cols:
            c.execute("ALTER TABLE suppliers RENAME TO _old_suppliers")
            c.execute("""
            CREATE TABLE suppliers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL DEFAULT 'COMP001',
                branch_code TEXT DEFAULT 'B001',
                name TEXT NOT NULL,
                contact TEXT,
                mobile TEXT,
                email TEXT,
                gstin TEXT,
                balance REAL DEFAULT 0.0,
                status TEXT DEFAULT 'Active',
                FOREIGN KEY (company_code) REFERENCES company_settings(company_code) ON UPDATE CASCADE ON DELETE RESTRICT,
                FOREIGN KEY (branch_code) REFERENCES branches(code) ON UPDATE CASCADE ON DELETE RESTRICT
            )
            """)
            c.execute("""
            INSERT INTO suppliers (id, company_code, branch_code, name, contact, mobile, email, gstin, balance, status)
            SELECT id, 'COMP001', 'B001', name, contact, mobile, email, gstin, balance, status
            FROM _old_suppliers
            """)
            c.execute("DROP TABLE _old_suppliers")
            print("[Migration] Upgraded suppliers with company_code & branch_code FKs.")
    except Exception as e:
        print(f"[Migration Warning suppliers] {e}")

    # 8. sales_orders
    try:
        c.execute("PRAGMA table_info(sales_orders)")
        cols = [r[1] for r in c.fetchall()]
        if not cols:
            c.execute("""
            CREATE TABLE sales_orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL DEFAULT 'COMP001',
                branch_code TEXT NOT NULL DEFAULT 'B001',
                invoice_no TEXT UNIQUE NOT NULL,
                date TEXT NOT NULL,
                customer TEXT,
                customer_mobile TEXT,
                branch TEXT,
                cashier TEXT,
                amount REAL NOT NULL DEFAULT 0.0,
                payment TEXT,
                payment_mode TEXT,
                items_json TEXT,
                FOREIGN KEY (company_code) REFERENCES company_settings(company_code) ON UPDATE CASCADE ON DELETE RESTRICT,
                FOREIGN KEY (branch_code) REFERENCES branches(code) ON UPDATE CASCADE ON DELETE RESTRICT
            )
            """)
        elif 'company_code' not in cols or 'branch_code' not in cols:
            c.execute("ALTER TABLE sales_orders RENAME TO _old_sales_orders")
            c.execute("""
            CREATE TABLE sales_orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL DEFAULT 'COMP001',
                branch_code TEXT NOT NULL DEFAULT 'B001',
                invoice_no TEXT UNIQUE NOT NULL,
                date TEXT NOT NULL,
                customer TEXT,
                customer_mobile TEXT,
                branch TEXT,
                cashier TEXT,
                amount REAL NOT NULL DEFAULT 0.0,
                payment TEXT,
                payment_mode TEXT,
                items_json TEXT,
                FOREIGN KEY (company_code) REFERENCES company_settings(company_code) ON UPDATE CASCADE ON DELETE RESTRICT,
                FOREIGN KEY (branch_code) REFERENCES branches(code) ON UPDATE CASCADE ON DELETE RESTRICT
            )
            """)
            c.execute("SELECT id, invoice_no, date, customer, customer_mobile, branch, cashier, amount, payment, payment_mode, items_json FROM _old_sales_orders")
            for r in c.fetchall():
                s_id, inv, dt, cust, cust_mob, br, csh, amt, pay, pay_m, itms = r
                b_c = branch_map.get((br or '').strip(), 'B001')
                c.execute("""
                INSERT INTO sales_orders (id, company_code, branch_code, invoice_no, date, customer, customer_mobile, branch, cashier, amount, payment, payment_mode, items_json)
                VALUES (?, 'COMP001', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (s_id, b_c, inv, dt, cust, cust_mob, br, csh, amt, pay, pay_m, itms))
            c.execute("DROP TABLE _old_sales_orders")
            print("[Migration] Upgraded sales_orders with company_code & branch_code FKs.")
    except Exception as e:
        print(f"[Migration Warning sales_orders] {e}")

    # 9. purchases
    try:
        c.execute("PRAGMA table_info(purchases)")
        cols = [r[1] for r in c.fetchall()]
        if not cols:
            c.execute("""
            CREATE TABLE purchases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL DEFAULT 'COMP001',
                branch_code TEXT NOT NULL DEFAULT 'B001',
                po_number TEXT UNIQUE NOT NULL,
                date TEXT NOT NULL,
                supplier TEXT,
                branch TEXT,
                items_count INTEGER DEFAULT 0,
                total_qty INTEGER DEFAULT 0,
                total_amount REAL DEFAULT 0.0,
                status TEXT DEFAULT 'Received',
                FOREIGN KEY (company_code) REFERENCES company_settings(company_code) ON UPDATE CASCADE ON DELETE RESTRICT,
                FOREIGN KEY (branch_code) REFERENCES branches(code) ON UPDATE CASCADE ON DELETE RESTRICT
            )
            """)
        elif 'company_code' not in cols or 'branch_code' not in cols:
            c.execute("ALTER TABLE purchases RENAME TO _old_purchases")
            c.execute("""
            CREATE TABLE purchases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_code TEXT NOT NULL DEFAULT 'COMP001',
                branch_code TEXT NOT NULL DEFAULT 'B001',
                po_number TEXT UNIQUE NOT NULL,
                date TEXT NOT NULL,
                supplier TEXT,
                branch TEXT,
                items_count INTEGER DEFAULT 0,
                total_qty INTEGER DEFAULT 0,
                total_amount REAL DEFAULT 0.0,
                status TEXT DEFAULT 'Received',
                FOREIGN KEY (company_code) REFERENCES company_settings(company_code) ON UPDATE CASCADE ON DELETE RESTRICT,
                FOREIGN KEY (branch_code) REFERENCES branches(code) ON UPDATE CASCADE ON DELETE RESTRICT
            )
            """)
            c.execute("SELECT id, po_number, date, supplier, branch, items_count, total_qty, total_amount, status FROM _old_purchases")
            for r in c.fetchall():
                p_id, po, dt, supp, br, itm_cnt, t_qty, t_amt, stat = r
                b_c = branch_map.get((br or '').strip(), 'B001')
                c.execute("""
                INSERT INTO purchases (id, company_code, branch_code, po_number, date, supplier, branch, items_count, total_qty, total_amount, status)
                VALUES (?, 'COMP001', ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (p_id, b_c, po, dt, supp, br, itm_cnt, t_qty, t_amt, stat))
            c.execute("DROP TABLE _old_purchases")
            print("[Migration] Upgraded purchases with company_code & branch_code FKs.")
    except Exception as e:
        print(f"[Migration Warning purchases] {e}")

    # 10. returns_log
    try:
        c.execute("PRAGMA table_info(returns_log)")
        cols = [r[1] for r in c.fetchall()]
        if not cols:
            c.execute("""
            CREATE TABLE returns_log (
                id TEXT PRIMARY KEY,
                company_code TEXT NOT NULL DEFAULT 'COMP001',
                branch_code TEXT NOT NULL DEFAULT 'B001',
                date TEXT NOT NULL,
                type TEXT,
                ref_no TEXT,
                party TEXT,
                branch TEXT,
                amount REAL DEFAULT 0.0,
                reason TEXT,
                status TEXT DEFAULT 'Completed',
                FOREIGN KEY (company_code) REFERENCES company_settings(company_code) ON UPDATE CASCADE ON DELETE RESTRICT,
                FOREIGN KEY (branch_code) REFERENCES branches(code) ON UPDATE CASCADE ON DELETE RESTRICT
            )
            """)
        elif 'company_code' not in cols or 'branch_code' not in cols:
            c.execute("ALTER TABLE returns_log RENAME TO _old_returns_log")
            c.execute("""
            CREATE TABLE returns_log (
                id TEXT PRIMARY KEY,
                company_code TEXT NOT NULL DEFAULT 'COMP001',
                branch_code TEXT NOT NULL DEFAULT 'B001',
                date TEXT NOT NULL,
                type TEXT,
                ref_no TEXT,
                party TEXT,
                branch TEXT,
                amount REAL DEFAULT 0.0,
                reason TEXT,
                status TEXT DEFAULT 'Completed',
                FOREIGN KEY (company_code) REFERENCES company_settings(company_code) ON UPDATE CASCADE ON DELETE RESTRICT,
                FOREIGN KEY (branch_code) REFERENCES branches(code) ON UPDATE CASCADE ON DELETE RESTRICT
            )
            """)
            c.execute("SELECT id, date, type, ref_no, party, branch, amount, reason, status FROM _old_returns_log")
            for r in c.fetchall():
                r_id, dt, tp, ref, pty, br, amt, rsn, stat = r
                b_c = branch_map.get((br or '').strip(), 'B001')
                c.execute("""
                INSERT INTO returns_log (id, company_code, branch_code, date, type, ref_no, party, branch, amount, reason, status)
                VALUES (?, 'COMP001', ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (r_id, b_c, dt, tp, ref, pty, br, amt, rsn, stat))
            c.execute("DROP TABLE _old_returns_log")
            print("[Migration] Upgraded returns_log with company_code & branch_code FKs.")
    except Exception as e:
        print(f"[Migration Warning returns_log] {e}")

    # 11. stock_transfers
    try:
        c.execute("PRAGMA table_info(stock_transfers)")
        cols = [r[1] for r in c.fetchall()]
        if not cols:
            c.execute("""
            CREATE TABLE stock_transfers (
                id TEXT PRIMARY KEY,
                company_code TEXT NOT NULL DEFAULT 'COMP001',
                from_branch_code TEXT NOT NULL DEFAULT 'B001',
                to_branch_code TEXT NOT NULL DEFAULT 'B002',
                date TEXT NOT NULL,
                from_branch TEXT,
                to_branch TEXT,
                total_qty INTEGER DEFAULT 0,
                status TEXT DEFAULT 'Completed',
                items_json TEXT,
                FOREIGN KEY (company_code) REFERENCES company_settings(company_code) ON UPDATE CASCADE ON DELETE RESTRICT,
                FOREIGN KEY (from_branch_code) REFERENCES branches(code) ON UPDATE CASCADE ON DELETE RESTRICT,
                FOREIGN KEY (to_branch_code) REFERENCES branches(code) ON UPDATE CASCADE ON DELETE RESTRICT
            )
            """)
        elif 'company_code' not in cols or 'from_branch_code' not in cols:
            c.execute("ALTER TABLE stock_transfers RENAME TO _old_stock_transfers")
            c.execute("""
            CREATE TABLE stock_transfers (
                id TEXT PRIMARY KEY,
                company_code TEXT NOT NULL DEFAULT 'COMP001',
                from_branch_code TEXT NOT NULL DEFAULT 'B001',
                to_branch_code TEXT NOT NULL DEFAULT 'B002',
                date TEXT NOT NULL,
                from_branch TEXT,
                to_branch TEXT,
                total_qty INTEGER DEFAULT 0,
                status TEXT DEFAULT 'Completed',
                items_json TEXT,
                FOREIGN KEY (company_code) REFERENCES company_settings(company_code) ON UPDATE CASCADE ON DELETE RESTRICT,
                FOREIGN KEY (from_branch_code) REFERENCES branches(code) ON UPDATE CASCADE ON DELETE RESTRICT,
                FOREIGN KEY (to_branch_code) REFERENCES branches(code) ON UPDATE CASCADE ON DELETE RESTRICT
            )
            """)
            c.execute("SELECT id, date, from_branch, to_branch, total_qty, status, items_json FROM _old_stock_transfers")
            for r in c.fetchall():
                t_id, dt, fb, tb, t_qty, stat, itms = r
                fb_c = branch_map.get((fb or '').strip(), 'B001')
                tb_c = branch_map.get((tb or '').strip(), 'B002')
                c.execute("""
                INSERT INTO stock_transfers (id, company_code, from_branch_code, to_branch_code, date, from_branch, to_branch, total_qty, status, items_json)
                VALUES (?, 'COMP001', ?, ?, ?, ?, ?, ?, ?, ?)
                """, (t_id, fb_c, tb_c, dt, fb, tb, t_qty, stat, itms))
            c.execute("DROP TABLE _old_stock_transfers")
            print("[Migration] Upgraded stock_transfers with company_code & from/to branch_code FKs.")
    except Exception as e:
        print(f"[Migration Warning stock_transfers] {e}")

    # Build High-Performance Multi-Branch Composite Indexes
    c.execute("CREATE INDEX IF NOT EXISTS idx_sales_company_branch ON sales_orders(company_code, branch_code)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_purchases_company_branch ON purchases(company_code, branch_code)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_returns_company_branch ON returns_log(company_code, branch_code)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_transfers_company ON stock_transfers(company_code, from_branch_code, to_branch_code)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_users_company_branch ON system_users(company_code, branch_code)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_products_company_branch ON products(company_code, branch_code)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_customers_company_branch ON customers(company_code, branch_code)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_suppliers_company_branch ON suppliers(company_code, branch_code)")

    conn.commit()
    conn.execute("PRAGMA foreign_keys = ON")

def init_sqlite_db():
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
    
    # Auto daily backup
    today_str = datetime.date.today().isoformat()
    backup_file = os.path.join(BACKUP_DIR, f"backup_{today_str}.db")
    if os.path.exists(DB_FILE) and not os.path.exists(backup_file):
        try:
            shutil.copy2(DB_FILE, backup_file)
            print(f"[Auto-Backup] Created daily safety backup: {backup_file}")
        except Exception as err:
            print(f"[Auto-Backup Error] {err}")

    conn = get_db_connection()
    migrate_database_schema(conn)

    c = conn.cursor()

    # Seed Default Records if Database is brand new
    c.execute("SELECT COUNT(*) FROM company_settings")
    if c.fetchone()[0] == 0:
        c.execute("""
        INSERT INTO company_settings (id, company_code, store_name, legal_name, gstin, address, phone, invoice_prefix, currency, allow_negative_stock)
        VALUES (1, 'COMP001', 'ABC Retail Store', 'ABC Supermarkets India Pvt Ltd', '07ABCDE1234F1Z5', 'Shop No. 12, Green Park, New Delhi - 110016', '+91 98765 43210', 'INV', '₹', 0)
        """)

    c.execute("SELECT COUNT(*) FROM branches")
    if c.fetchone()[0] == 0:
        c.executemany("""
        INSERT INTO branches (id, company_code, code, name, address, phone, status)
        VALUES (?, 'COMP001', ?, ?, ?, ?, ?)
        """, [
            (1, 'B001', 'Main Branch', 'Shop No. 12, Green Park, New Delhi', '+91 98765 43210', 'Active'),
            (2, 'B002', 'Branch 2 - Noida Sector 62', 'Plot 45, Sector 62, Noida, UP', '+91 98765 43211', 'Active'),
            (3, 'B003', 'Branch 3 - Gurgaon Express', 'DLF Phase 3, Gurgaon, Haryana', '+91 98765 43212', 'Active')
        ])

    c.execute("SELECT COUNT(*) FROM categories")
    if c.fetchone()[0] == 0:
        c.executemany("""
        INSERT INTO categories (id, company_code, name, description, status)
        VALUES (?, 'COMP001', ?, ?, ?)
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
        INSERT INTO products (id, company_code, branch_code, code, name, category, price, cost, stock, min_stock, unit, tax, icon, barcode)
        VALUES (?, 'COMP001', 'B001', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

    # Auto-seed from 100_Sample_Products_for_Testing.csv if available and count < 10
    c.execute("SELECT COUNT(*) FROM products")
    if c.fetchone()[0] < 10:
        csv_path = os.path.join(STATIC_DIR, '100_Sample_Products_for_Testing.csv')
        if os.path.exists(csv_path):
            try:
                import csv
                with open(csv_path, mode='r', encoding='utf-8-sig') as f:
                    rdr = csv.reader(f)
                    rows = [r for r in rdr if any(cell.strip() for cell in r)]
                if len(rows) > 1:
                    c.execute("SELECT MAX(id) FROM products")
                    mid = c.fetchone()[0] or 0
                    for r in rows[1:]:
                        name = r[0].strip()
                        code = r[1].strip()
                        cat = r[2].strip()
                        unit = r[3].strip()
                        cost = float(r[4].strip())
                        price = float(r[5].strip())
                        stock = int(r[6].strip())
                        min_stock = int(r[7].strip())
                        tax = float(r[8].strip())
                        c.execute("INSERT INTO categories (company_code, name, description, status) VALUES ('COMP001', ?, ?, 'Active') ON CONFLICT(name) DO NOTHING", (cat, f"{cat} Products"))
                        mid += 1
                        c.execute("""
                        INSERT INTO products (id, company_code, branch_code, code, name, category, price, cost, stock, min_stock, unit, tax, icon, barcode)
                        VALUES (?, 'COMP001', 'B001', ?, ?, ?, ?, ?, ?, ?, ?, ?, '📦', ?)
                        ON CONFLICT(code) DO NOTHING
                        """, (mid, code, name, cat, price, cost, stock, min_stock, unit, tax, code))
                    print(f"[SQLite DB] Seeded bulk products from CSV successfully.")
            except Exception as e:
                print(f"[SQLite DB CSV Seed Warning] {e}")

    c.execute("SELECT COUNT(*) FROM customers")
    if c.fetchone()[0] == 0:
        c.executemany("""
        INSERT INTO customers (id, company_code, branch_code, name, mobile, email, gstin, balance, credit_limit, status)
        VALUES (?, 'COMP001', 'B001', ?, ?, ?, ?, ?, ?, ?)
        """, [
            (1, 'Walk-in Customer', '9999999999', '', 'Unregistered', 0.00, 0, 'Active'),
            (2, 'Rohit Sharma', '9876543210', 'rohit@gmail.com', '07ABCDE1234F1Z5', 0.00, 10000, 'Active'),
            (3, 'Priya Singh', '9811122334', 'priya@gmail.com', '07ABCDE1234F1Z6', 320.00, 5000, 'Active')
        ])

    conn.commit()
    conn.close()
    print("[SQLite DB] Initialized, migrated, and verified relational pos_database.db successfully.")

# =============================================================================
# 3. HTTP REQUEST HANDLER WITH REST APIS & DEVELOPER REMOTE DEBUGGER
# =============================================================================
class BrainShopRequestHandler(http.server.SimpleHTTPRequestHandler):
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
                conn = get_db_connection(row_factory=True)
                c = conn.cursor()

                # Settings
                c.execute("SELECT * FROM company_settings WHERE id = 1")
                s_row = c.fetchone()
                settings = dict(s_row) if s_row else {}
                settings['companyCode'] = settings.get('company_code', 'COMP001')
                settings['storeName'] = settings.get('store_name', 'ABC Retail Store')
                settings['legalName'] = settings.get('legal_name', 'ABC Supermarkets')
                settings['invoicePrefix'] = settings.get('invoice_prefix', 'INV')
                settings['allowNegativeStock'] = bool(settings.get('allow_negative_stock', 0))
                settings['whatsappProvider'] = settings.get('whatsapp_provider') or 'demo'
                settings['whatsappInstanceId'] = settings.get('whatsapp_instance_id', '')
                settings['whatsappToken'] = settings.get('whatsapp_token', '')
                settings['customWebhookUrl'] = settings.get('custom_webhook_url', '')
                settings['autoDispatchOnSale'] = bool(settings.get('auto_dispatch_on_sale', 1))

                # Products
                c.execute("SELECT * FROM products ORDER BY id ASC")
                products = []
                for p in c.fetchall():
                    d = dict(p)
                    d['companyCode'] = d.get('company_code', 'COMP001')
                    d['branchCode'] = d.get('branch_code', 'B001')
                    d['minStock'] = d.pop('min_stock', 5)
                    products.append(d)

                # Categories
                c.execute("SELECT * FROM categories ORDER BY id ASC")
                categories = []
                for cat in c.fetchall():
                    d = dict(cat)
                    d['companyCode'] = d.get('company_code', 'COMP001')
                    d['desc'] = d.pop('description', '')
                    categories.append(d)

                # Branches
                c.execute("SELECT * FROM branches ORDER BY id ASC")
                branches = []
                for b in c.fetchall():
                    d = dict(b)
                    d['companyCode'] = d.get('company_code', 'COMP001')
                    branches.append(d)

                # Customers
                c.execute("SELECT * FROM customers ORDER BY id ASC")
                customers = []
                for cust in c.fetchall():
                    d = dict(cust)
                    d['companyCode'] = d.get('company_code', 'COMP001')
                    d['branchCode'] = d.get('branch_code', 'B001')
                    d['creditLimit'] = d.pop('credit_limit', 0)
                    customers.append(d)

                # Suppliers
                c.execute("SELECT * FROM suppliers ORDER BY id ASC")
                suppliers = []
                for s in c.fetchall():
                    d = dict(s)
                    d['companyCode'] = d.get('company_code', 'COMP001')
                    d['branchCode'] = d.get('branch_code', 'B001')
                    suppliers.append(d)

                # Sales Orders
                c.execute("SELECT * FROM sales_orders ORDER BY id DESC")
                sales_history = []
                for row in c.fetchall():
                    d = dict(row)
                    d['companyCode'] = d.get('company_code', 'COMP001')
                    d['branchCode'] = d.get('branch_code', 'B001')
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
                users = []
                for u in c.fetchall():
                    d = dict(u)
                    d['companyCode'] = d.get('company_code', 'COMP001')
                    d['branchCode'] = d.get('branch_code', 'B001')
                    users.append(d)

                # Purchases
                c.execute("SELECT * FROM purchases ORDER BY id DESC")
                purchases = []
                for row in c.fetchall():
                    d = dict(row)
                    d['companyCode'] = d.get('company_code', 'COMP001')
                    d['branchCode'] = d.get('branch_code', 'B001')
                    d['poNumber'] = d.pop('po_number', '')
                    d['itemsCount'] = d.pop('items_count', 0)
                    d['totalQty'] = d.pop('total_qty', 0)
                    d['totalAmount'] = d.pop('total_amount', 0)
                    purchases.append(d)

                # Returns
                c.execute("SELECT * FROM returns_log ORDER BY date DESC")
                returns = []
                for r in c.fetchall():
                    d = dict(r)
                    d['companyCode'] = d.get('company_code', 'COMP001')
                    d['branchCode'] = d.get('branch_code', 'B001')
                    returns.append(d)

                # Transfers
                c.execute("SELECT * FROM stock_transfers ORDER BY date DESC")
                transfers = []
                for row in c.fetchall():
                    d = dict(row)
                    d['companyCode'] = d.get('company_code', 'COMP001')
                    d['fromBranchCode'] = d.get('from_branch_code', 'B001')
                    d['toBranchCode'] = d.get('to_branch_code', 'B002')
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
            except Exception as err:
                self._send_json({"status": "error", "message": str(err)}, status=500)
                return

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

        elif path == '/api/gateway/settings':
            st = get_gateway_settings()
            self._send_json({"status": "success", "settings": st})
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
                conn = get_db_connection()
                c = conn.cursor()

                # Sync Settings
                if 'settings' in body and isinstance(body['settings'], dict):
                    st = body['settings']
                    comp_code = str(st.get('companyCode', st.get('company_code', 'COMP001'))).strip() or 'COMP001'
                    c.execute("""
                    INSERT INTO company_settings (id, company_code, store_name, legal_name, gstin, address, phone, invoice_prefix, currency, allow_negative_stock)
                    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        company_code=excluded.company_code, store_name=excluded.store_name,
                        legal_name=excluded.legal_name, gstin=excluded.gstin,
                        address=excluded.address, phone=excluded.phone,
                        invoice_prefix=excluded.invoice_prefix, currency=excluded.currency,
                        allow_negative_stock=excluded.allow_negative_stock
                    """, (
                        comp_code,
                        st.get('storeName', 'ABC Retail Store'), st.get('legalName', ''),
                        st.get('gstin', ''), st.get('address', ''), st.get('phone', ''),
                        st.get('invoicePrefix', 'INV'), st.get('currency', '₹'),
                        1 if st.get('allowNegativeStock') else 0
                    ))

                # Sync Branches
                if 'branches' in body and isinstance(body['branches'], list):
                    for b in body['branches']:
                        c_code = str(b.get('companyCode', b.get('company_code', 'COMP001'))).strip() or 'COMP001'
                        b_code = str(b.get('code', '')).strip()
                        if not b_code:
                            continue
                        c.execute("""
                        INSERT INTO branches (id, company_code, code, name, address, phone, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            company_code=excluded.company_code, code=excluded.code,
                            name=excluded.name, address=excluded.address,
                            phone=excluded.phone, status=excluded.status
                        """, (
                            b.get('id'), c_code, b_code, b.get('name'),
                            b.get('address', ''), b.get('phone', ''), b.get('status', 'Active')
                        ))
                    existing_b_ids = [b.get('id') for b in body['branches'] if b.get('id')]
                    if existing_b_ids:
                        placeholders = ','.join('?' * len(existing_b_ids))
                        c.execute(f"DELETE FROM branches WHERE id NOT IN ({placeholders}) AND id != 1", existing_b_ids)

                # Sync Categories
                if 'categories' in body and isinstance(body['categories'], list):
                    for cat in body['categories']:
                        try:
                            if isinstance(cat, dict):
                                cat_name = str(cat.get('name', '')).strip()
                                cat_comp = str(cat.get('companyCode', cat.get('company_code', 'COMP001'))).strip() or 'COMP001'
                                if cat_name:
                                    c.execute("""
                                    INSERT INTO categories (company_code, name, description, status)
                                    VALUES (?, ?, ?, ?)
                                    ON CONFLICT(name) DO UPDATE SET
                                        company_code=excluded.company_code,
                                        description=excluded.description, status=excluded.status
                                    """, (
                                        cat_comp, cat_name, cat.get('desc', cat.get('description', '')), cat.get('status', 'Active')
                                    ))
                            elif isinstance(cat, str) and cat.strip():
                                c.execute("INSERT OR IGNORE INTO categories (company_code, name, status) VALUES ('COMP001', ?, 'Active')", (cat.strip(),))
                        except Exception as cat_err:
                            print(f"[Category Sync Warning] {cat_err}")

                # Sync Products
                if 'products' in body and isinstance(body['products'], list):
                    for p in body['products']:
                        try:
                            code = str(p.get('code', '')).strip()
                            if not code:
                                continue
                            comp_c = str(p.get('companyCode', p.get('company_code', 'COMP001'))).strip() or 'COMP001'
                            br_c = str(p.get('branchCode', p.get('branch_code', 'B001'))).strip() or 'B001'
                            c.execute("SELECT id FROM products WHERE code = ?", (code,))
                            row_c = c.fetchone()
                            if row_c:
                                c.execute("""
                                UPDATE products SET
                                    company_code=?, branch_code=?, name=?, category=?, price=?, cost=?,
                                    stock=?, min_stock=?, unit=?, tax=?, icon=?, barcode=?
                                WHERE code = ?
                                """, (
                                    comp_c, br_c,
                                    p.get('name'), p.get('category'),
                                    float(p.get('price', 0)), float(p.get('cost', 0)),
                                    int(p.get('stock', 0)), int(p.get('minStock', 5)),
                                    p.get('unit', 'Pkt'), float(p.get('tax', 0)),
                                    p.get('icon', '📦'), p.get('barcode', code),
                                    code
                                ))
                            else:
                                p_id = p.get('id')
                                if p_id is not None:
                                    c.execute("SELECT id FROM products WHERE id = ?", (p_id,))
                                    if c.fetchone():
                                        p_id = None
                                if p_id is not None:
                                    c.execute("""
                                    INSERT INTO products (id, company_code, branch_code, code, name, category, price, cost, stock, min_stock, unit, tax, icon, barcode)
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                    """, (
                                        p_id, comp_c, br_c, code, p.get('name'), p.get('category'),
                                        float(p.get('price', 0)), float(p.get('cost', 0)),
                                        int(p.get('stock', 0)), int(p.get('minStock', 5)),
                                        p.get('unit', 'Pkt'), float(p.get('tax', 0)),
                                        p.get('icon', '📦'), p.get('barcode', code)
                                    ))
                                else:
                                    c.execute("""
                                    INSERT INTO products (company_code, branch_code, code, name, category, price, cost, stock, min_stock, unit, tax, icon, barcode)
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                    """, (
                                        comp_c, br_c, code, p.get('name'), p.get('category'),
                                        float(p.get('price', 0)), float(p.get('cost', 0)),
                                        int(p.get('stock', 0)), int(p.get('minStock', 5)),
                                        p.get('unit', 'Pkt'), float(p.get('tax', 0)),
                                        p.get('icon', '📦'), p.get('barcode', code)
                                    ))
                        except Exception as p_err:
                            print(f"[Product Sync Warning] {p_err}")

                # Sync Sales History
                if 'salesHistory' in body and isinstance(body['salesHistory'], list):
                    for s in body['salesHistory']:
                        comp_c = str(s.get('companyCode', s.get('company_code', 'COMP001'))).strip() or 'COMP001'
                        br_c = str(s.get('branchCode', s.get('branch_code', 'B001'))).strip() or 'B001'
                        c.execute("""
                        INSERT INTO sales_orders (id, company_code, branch_code, invoice_no, date, customer, customer_mobile, branch, cashier, amount, payment, payment_mode, items_json)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            company_code=excluded.company_code, branch_code=excluded.branch_code,
                            amount=excluded.amount, payment=excluded.payment, payment_mode=excluded.payment_mode
                        """, (
                            s.get('id'), comp_c, br_c, s.get('invoiceNo'), s.get('date'),
                            s.get('customer'), s.get('customerMobile'), s.get('branch'),
                            s.get('cashier'), float(s.get('amount', 0)),
                            s.get('payment'), s.get('paymentMode'),
                            json.dumps(s.get('items', []))
                        ))

                # Sync Customers
                if 'customers' in body and isinstance(body['customers'], list):
                    for cust in body['customers']:
                        comp_c = str(cust.get('companyCode', cust.get('company_code', 'COMP001'))).strip() or 'COMP001'
                        br_c = str(cust.get('branchCode', cust.get('branch_code', 'B001'))).strip() or 'B001'
                        c.execute("""
                        INSERT INTO customers (id, company_code, branch_code, name, mobile, email, gstin, balance, credit_limit, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            company_code=excluded.company_code, branch_code=excluded.branch_code,
                            name=excluded.name, mobile=excluded.mobile, email=excluded.email,
                            gstin=excluded.gstin, balance=excluded.balance, credit_limit=excluded.credit_limit,
                            status=excluded.status
                        """, (
                            cust.get('id'), comp_c, br_c, cust.get('name'), cust.get('mobile'),
                            cust.get('email', ''), cust.get('gstin', ''),
                            float(cust.get('balance', 0)), float(cust.get('creditLimit', 2000)),
                            cust.get('status', 'Active')
                        ))

                # Sync Suppliers
                if 'suppliers' in body and isinstance(body['suppliers'], list):
                    for s in body['suppliers']:
                        comp_c = str(s.get('companyCode', s.get('company_code', 'COMP001'))).strip() or 'COMP001'
                        br_c = str(s.get('branchCode', s.get('branch_code', 'B001'))).strip() or 'B001'
                        c.execute("""
                        INSERT INTO suppliers (id, company_code, branch_code, name, contact, mobile, email, gstin, balance, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            company_code=excluded.company_code, branch_code=excluded.branch_code,
                            name=excluded.name, contact=excluded.contact, mobile=excluded.mobile,
                            email=excluded.email, gstin=excluded.gstin, balance=excluded.balance, status=excluded.status
                        """, (
                            s.get('id'), comp_c, br_c, s.get('name'), s.get('contact', ''), s.get('mobile', ''),
                            s.get('email', ''), s.get('gstin', ''), float(s.get('due', s.get('balance', 0))), s.get('status', 'Active')
                        ))

                # Sync Users
                if 'users' in body and isinstance(body['users'], list):
                    for u in body['users']:
                        comp_c = str(u.get('companyCode', u.get('company_code', 'COMP001'))).strip() or 'COMP001'
                        br_c = str(u.get('branchCode', u.get('branch_code', 'B001'))).strip() or 'B001'
                        c.execute("""
                        INSERT INTO system_users (id, company_code, branch_code, name, username, password, role, branch, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            company_code=excluded.company_code, branch_code=excluded.branch_code,
                            name=excluded.name, username=excluded.username, password=excluded.password,
                            role=excluded.role, branch=excluded.branch, status=excluded.status
                        """, (
                            u.get('id'), comp_c, br_c, u.get('name'), u.get('username'), u.get('password', 'password123'),
                            u.get('role', 'CASHIER'), u.get('branch', 'Main Branch'), u.get('status', 'Active')
                        ))

                # Sync Purchases
                if 'purchases' in body and isinstance(body['purchases'], list):
                    for pur in body['purchases']:
                        comp_c = str(pur.get('companyCode', pur.get('company_code', 'COMP001'))).strip() or 'COMP001'
                        br_c = str(pur.get('branchCode', pur.get('branch_code', 'B001'))).strip() or 'B001'
                        c.execute("""
                        INSERT INTO purchases (id, company_code, branch_code, po_number, date, supplier, branch, items_count, total_qty, total_amount, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            company_code=excluded.company_code, branch_code=excluded.branch_code,
                            supplier=excluded.supplier, total_qty=excluded.total_qty, total_amount=excluded.total_amount, status=excluded.status
                        """, (
                            pur.get('id'), comp_c, br_c, pur.get('poNumber', pur.get('po_number')), pur.get('date'),
                            pur.get('supplier'), pur.get('branch', 'Main Branch'), int(pur.get('itemsCount', 0)),
                            int(pur.get('totalQty', 0)), float(pur.get('totalAmount', 0)), pur.get('status', 'Received')
                        ))

                # Sync Returns
                if 'returns' in body and isinstance(body['returns'], list):
                    for r in body['returns']:
                        comp_c = str(r.get('companyCode', r.get('company_code', 'COMP001'))).strip() or 'COMP001'
                        br_c = str(r.get('branchCode', r.get('branch_code', 'B001'))).strip() or 'B001'
                        c.execute("""
                        INSERT INTO returns_log (id, company_code, branch_code, date, type, ref_no, party, branch, amount, reason, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            company_code=excluded.company_code, branch_code=excluded.branch_code,
                            status=excluded.status
                        """, (
                            str(r.get('id')), comp_c, br_c, r.get('date'), r.get('type'), r.get('refNo', r.get('ref_no')),
                            r.get('party'), r.get('branch', 'Main Branch'), float(r.get('amount', 0)),
                            r.get('reason', ''), r.get('status', 'Completed')
                        ))

                # Sync Stock Transfers
                if 'transferHistory' in body and isinstance(body['transferHistory'], list):
                    for trf in body['transferHistory']:
                        comp_c = str(trf.get('companyCode', trf.get('company_code', 'COMP001'))).strip() or 'COMP001'
                        fb_c = str(trf.get('fromBranchCode', trf.get('from_branch_code', 'B001'))).strip() or 'B001'
                        tb_c = str(trf.get('toBranchCode', trf.get('to_branch_code', 'B002'))).strip() or 'B002'
                        c.execute("""
                        INSERT INTO stock_transfers (id, company_code, from_branch_code, to_branch_code, date, from_branch, to_branch, total_qty, status, items_json)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            company_code=excluded.company_code, from_branch_code=excluded.from_branch_code,
                            to_branch_code=excluded.to_branch_code, status=excluded.status
                        """, (
                            trf.get('id'), comp_c, fb_c, tb_c, trf.get('date'), trf.get('from'),
                            trf.get('to'), int(trf.get('totalQty', 0)),
                            trf.get('status', 'Completed'), json.dumps(trf.get('items', []))
                        ))

                conn.commit()
                conn.close()
                self._send_json({"status": "success", "message": "Relational state synced to SQLite with FKs and branch codes successfully."})
                return
            except Exception as err:
                self._send_json({"status": "error", "message": str(err)}, status=500)
                return

        elif path == '/api/admin/query':
            pin = body.get('pin', '')
            query = body.get('query', '').strip()
            if pin != MASTER_DEV_PIN:
                self._send_json({"status": "error", "message": "Access Denied: Invalid Master PIN"}, status=403)
                return

            try:
                conn = get_db_connection(row_factory=True)
                c = conn.cursor()
                c.execute(query)
                if c.description:
                    columns = [col[0] for col in c.description]
                    rows = [dict(r) for r in c.fetchall()]
                    conn.close()
                    self._send_json({"status": "success", "columns": columns, "rows": rows, "count": len(rows)})
                else:
                    affected = c.rowcount
                    conn.commit()
                    conn.close()
                    self._send_json({"status": "success", "message": f"Query executed successfully ({affected} rows affected).", "rows_affected": affected})
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
                conn = get_db_connection()
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
                conn = get_db_connection()
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
        # 6. Automated Digital Receipt Dispatch Endpoint (Zero-Login WhatsApp / SMS)
        elif path == '/api/dispatch/digital_receipt':
            mobile = str(body.get('mobile', '')).strip()
            message = str(body.get('message', '')).strip()
            sms_text = str(body.get('smsText', '')).strip() or message
            channel = str(body.get('channel', 'whatsapp')).strip()

            clean_digits = re.sub(r'\D', '', mobile)
            if len(clean_digits) > 10:
                clean_digits = clean_digits[-10:]

            if len(clean_digits) != 10:
                self._send_json({"status": "error", "message": "Invalid 10-digit mobile number"}, status=400)
                return

            gw = get_gateway_settings()
            provider = body.get('provider') or gw.get('provider', 'demo')
            instance_id = body.get('instanceId') or gw.get('instanceId', '')
            token = body.get('token') or gw.get('token', '')
            custom_url = body.get('customUrl') or gw.get('customUrl', '')

            # If user has not configured gateway credentials yet
            if provider in ('ultramsg', 'greenapi') and (not instance_id or not token):
                self._send_json({
                    "status": "fallback_needed",
                    "delivered": False,
                    "provider": provider,
                    "mobile": clean_digits,
                    "message": f"Cloud {provider.capitalize()} API key not configured yet in Settings. Please add Instance ID & Token in Settings -> WhatsApp Gateway."
                })
                return
            elif provider == 'fast2sms' and not token:
                self._send_json({
                    "status": "fallback_needed",
                    "delivered": False,
                    "provider": provider,
                    "mobile": clean_digits,
                    "message": "Fast2SMS API key not configured yet in Settings."
                })
                return
            elif provider == 'browser':
                self._send_json({
                    "status": "fallback_needed",
                    "delivered": False,
                    "provider": "browser",
                    "mobile": clean_digits,
                    "message": "Gateway configured for Browser Direct Mode."
                })
                return

            success, info = dispatch_cloud_message(
                provider=provider,
                instance_id=instance_id,
                token=token,
                custom_url=custom_url,
                mobile=clean_digits,
                message=message,
                sms_text=sms_text,
                channel=channel
            )

            if success:
                self._send_json({
                    "status": "success",
                    "delivered": True,
                    "provider": provider,
                    "mobile": clean_digits,
                    "message": info
                })
            else:
                self._send_json({
                    "status": "fallback_needed",
                    "delivered": False,
                    "provider": provider,
                    "mobile": clean_digits,
                    "message": info
                })
            return

        # 7. Gateway Settings Update Endpoint
        elif path == '/api/gateway/settings':
            provider = str(body.get('provider', 'ultramsg')).strip()
            instance_id = str(body.get('instanceId', '')).strip()
            token = str(body.get('token', '')).strip()
            custom_url = str(body.get('customUrl', '')).strip()
            auto_dispatch = 1 if body.get('autoDispatch', True) else 0

            try:
                conn = get_db_connection()
                c = conn.cursor()
                c.execute("""
                UPDATE company_settings SET
                    whatsapp_provider = ?,
                    whatsapp_instance_id = ?,
                    whatsapp_token = ?,
                    custom_webhook_url = ?,
                    auto_dispatch_on_sale = ?
                WHERE id = 1
                """, (provider, instance_id, token, custom_url, auto_dispatch))
                conn.commit()
                conn.close()
                self._send_json({"status": "success", "message": "WhatsApp / SMS Cloud Gateway settings saved successfully."})
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
            httpd = socketserver.TCPServer(("", p), BrainShopRequestHandler)
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
    print("      BRAINSHOP COMMERCIAL RETAIL SERVER (STANDALONE ENGINE)      ")
    print("=" * 70)
    print(f"[*] Computer Machine ID : {machine_id}")
    print(f"[*] License Status      : {'ACTIVATED (' + status.get('type') + ')' if status.get('activated') else 'UNACTIVATED (Activation Required)'}")
    print(f"[*] SQLite Database     : {DB_FILE}")
    print(f"[*] Local Web Address   : http://localhost:{PORT}")
    print("=" * 70)
    print("[*] Launching BrainShop in your browser...")
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
            print("\n[!] Shutting down BrainShop server cleanly.")
            httpd.server_close()

if __name__ == '__main__':
    start_server()
