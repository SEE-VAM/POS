# 🛒 BrainShop Commercial Retail POS & Inventory ERP

<p align="center">
  <img src="brainshop_logo_transparent.png" alt="BrainShop Logo" width="180" />
</p>

<p align="center">
  <strong>High-Speed, Production-Ready Retail Point of Sale (POS) and Enterprise Inventory Management ERP</strong><br>
  <em>Built for Supermarkets, Grocery Stores, Pharmacies, Hardware, Apparel & Multi-Branch Retail Chains</em>
</p>

---

## 📌 Executive Summary

**BrainShop POS** is a lightweight, zero-dependency commercial billing, inventory, and customer khata management ERP designed to eliminate monthly recurring SaaS software fees. It runs 100% offline on the retailer's local machine, ensuring ultra-fast checkout speeds, complete data privacy, and zero reliance on cloud outages or internet downtime.

Equipped with an **Anti-Piracy Hardware Fingerprint Lock**, BrainShop allows software vendors and IT professionals to sell, deploy, and manage commercial retail licenses tied cryptographically to a client machine's Motherboard UUID, CPU, and MAC address.

---

## ✨ Key Features & Enterprise Modules

### ⚡ 1. High-Speed POS Billing Terminal
- **Instant Barcode Scanning:** Automatic item lookup, auto-add to cart, and sound/visual confirmation on scan.
- **Cart & Pricing Engine:** Real-time calculation of subtotal, itemized CGST/SGST/IGST tax breakdowns, discounts, and round-offs.
- **Order Suspension (Hold / Draft Orders):** Pause active customer transactions and retrieve them later without losing item counts.
- **Dual Printing Engine:**
  - **80mm Thermal Receipt:** Optimized for rapid thermal roll printers (ESC/POS compatible).
  - **A4 Full Invoice:** Professional corporate tax invoice format with company logo and signature block.
  - **One-Click Exports:** Instant print preview, PDF export, and WhatsApp/Email invoice sharing.

### 💳 2. Omnichannel Digital Payments & UPI
- **Dynamic NPCI UPI QR Codes:** Auto-generates standard UPI payment QR codes with dynamic invoice amount and store name.
- **Multiple Tender Modes:** Cash, Credit/Debit Card (with Last-4 entry), UPI, and Split/Mixed Tender.
- **Credit Ledger (Khata / Udhaar):** Sell on credit directly to registered customers with automated credit limit enforcement.

### 📦 3. Inventory Control & Multi-Branch Stock Transfers
- **Master Product Catalog:** Supports 108+ commercial item categories, SKU/barcodes, cost price, selling price, minimum reorder thresholds, and custom units (kg, pcs, ltr, pkts).
- **Automated Low-Stock Alerts:** Real-time badge indicators and low-stock dashboard notifications.
- **Audit Logs:** Immutable audit history tracking price modifications, stock adjustments, and timestamps.
- **Inter-Branch Stock Transfers:** Dispatch and receive stock between headquarters and branch locations with auto-reconciliation.

### 👥 4. Party Management (Customers & Suppliers)
- **Customer Khata Management:** Running account balance, total credit limits, payment history, and one-click statement export.
- **Supplier Directory & Accounts Payable:** Track purchase orders, invoices, payment due dates, and supplier balance ledgers.

### 🛡️ 5. 14-Module Granular Role-Based Security (RBAC)
- **Three Core Roles Out-of-the-Box:** Admin (Full Access), Manager (Store & Inventory), Cashier (POS & Sales only).
- **Module Permissions Grid:** Configure access across 14 independent screens and features in Settings.

### 📊 6. Analytics & Business Intelligence Dashboard
- **Live KPIs:** Today's gross revenue, monthly turnover, gross margin %, net profit, transaction count, and average order value (AOV).
- **Top Product & Category Insights:** Visual breakdown of bestselling items and margin contributors.
- **Comprehensive Sales History:** Filter by date range, cashier, payment mode, or invoice sequence with instant sales return processing.

---

## 🔒 Anti-Piracy Hardware Lock & Key Generator

BrainShop features an enterprise-grade hardware lock engine that binds the software installation to the physical machine using Motherboard UUID, CPU, and MAC address.

```
Example Client Machine ID: BRAINSHOP-7B29-4A1C-99E3
```

### 🔑 Generating Client License Keys
Software vendors generate cryptographic HMAC-SHA256 signed activation keys using the built-in generator tools:

1. **Browser 1-Click GUI:** Double-click `Generate_Key.html` (runs in any browser, zero terminal needed).
2. **Terminal Interactive CLI:** Run `python generate_license.py` or double-click `Generate_Key.bat`.

#### Subscription Plans Supported:
| Plan Choice | Duration | Key Format Example |
| :--- | :--- | :--- |
| **1-Year Annual Plan** | 365 Days | `LIC-20270920-A1B2C3D4-1YEAR` |
| **6-Month Plan** | 180 Days | `LIC-20270320-E5F6A7B8-6MONTH` |
| **3-Month Plan** | 90 Days | `LIC-20261220-C9D0E1F2-3MONTH` |
| **15-Day Free Trial** | 15 Days | `LIC-20261005-A3B4C5D6-15DAYS` |

> **Developer Emergency Master PIN:** In case of vendor debugging, entering PIN `7788` unlocks the system instantly without needing a license file.

---

## 🏗️ System Architecture & Tech Stack

```
BrainShop Retail Application
│
├── Frontend Layer (Browser UI)
│   ├── index.html                  # 24 Responsive Enterprise POS Screens
│   ├── app.js                      # Business Logic, State Machine & Offline Storage
│   ├── styles.css                  # UI Design System, CSS Grid & Modal Styles
│   ├── pos_theme_style.css         # Specialized Thermal Print & Theme Styling
│   └── qrcode.min.js               # Client-Side NPCI UPI QR Generator
│
├── Backend Service Layer (Python)
│   ├── server.py                   # Multi-Threaded HTTP & SQLite REST Engine (Port 8080)
│   ├── generate_license.py         # Hardware License Generator CLI
│   ├── keygen.py                   # Cryptographic Keygen Logic & Signature Engine
│   └── deactivate_license.py       # Client License Deactivation & Reset Tool
│
└── Data & Persistence Layer
    ├── pos_database.db             # Embedded Production SQLite Database
    ├── license.key                 # Client Hardware License Signature File
    └── backups/                    # Automated Daily Database Backups (.db)
```

- **Backend Dependencies:** `0` (Zero). Uses only the Python Standard Library (`http.server`, `sqlite3`, `hashlib`, `hmac`, `socketserver`, `subprocess`, `uuid`).
- **Network Requirements:** `0` (100% Offline-Capable). Operates strictly on `http://localhost:8080`.
- **Database:** SQLite3 with foreign keys, cascading integrity, and automatic migration engine.

---

## 🚀 Quick Start Guide

### Prerequisites
- Any standard PC or POS terminal running **Windows 10/11**, **Linux**, or **macOS**.
- Standard **Python 3.8+** installed (check 'Add Python to PATH' during install).

### Starting the Application
1. **Windows 1-Click Launch:**
   Double-click **`Start_POS.bat`**.
2. **Terminal / Linux / macOS Launch:**
   ```bash
   python server.py
   ```
3. The server starts at `http://localhost:8080` and opens your default browser automatically.

### Default Login Credentials
- **Username:** `admin`
- **Password:** `password123`

---

## 📦 Deploying to New Clients (`BrainShop_Fresh_Setup`)

When delivering the software to a new retail client, distribute **only** the 10 clean runtime files (no `.db` or `.key` files):

```
📁 Client_Installation_Package/
├── Start_POS.bat
├── server.py
├── index.html
├── app.js
├── styles.css
├── pos_theme_style.css
├── qrcode.min.js
├── brainshop_logo.png
├── brainshop_logo_transparent.png
└── pos_login_bg.jpg
```

When the client launches `Start_POS.bat` for the first time:
1. The hardware lock screen prompts them with their unique **Machine ID**.
2. They send the ID to you to receive their activation license key.
3. Once activated, the system initializes a **100% pristine, fresh store** (0 products, 0 bills, starting at `INV-0000001`).

---

## ⌨️ Cashier Keyboard Shortcuts Cheat Sheet

| Shortcut Key | Function / Action |
| :--- | :--- |
| **`F1`** | Navigate to POS / New Sale Screen |
| **`F2`** | Navigate to Product Master & Search |
| **`F3`** | Focus Barcode / Search Input |
| **`F4`** | Complete Cash Payment |
| **`F7`** | Open Hold / Suspended Orders Modal |
| **`F8`** | Suspend Current Order to Draft |
| **`F9`** | Open Digital UPI QR Code Modal |
| **`F10`** | Complete Sale & Print Receipt |
| **`Esc`** | Close Open Modal / Cancel Action |

---

## 🛡️ License & Commercial Rights

Copyright © 2026 BrainShop Retail Systems. All Rights Reserved.  
Commercial deployment and license key generation restricted to authorized vendors.
