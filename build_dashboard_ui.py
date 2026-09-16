import os

base_dir = r"c:\Users\sshin\OneDrive\Desktop\POS  PROJECT"

# Build unified CSS, HTML, JS
css = """<style>
:root {
  --pri: #1e40af; --pri-hov: #1d4ed8; --sec: #0f172a; --bg: #f1f5f9;
  --side-bg: #1e293b; --side-txt: #94a3b8; --side-act: #3b82f6;
  --succ: #10b981; --dang: #ef4444; --card-bg: #ffffff; --border: #e2e8f0;
}
* { box-sizing: border-box; }
.app-wrap { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: var(--sec); margin: -16px; background: var(--bg); min-height: 100vh; display: flex; flex-direction: column; }
/* Topbar */
.app-topbar { display: flex; justify-content: space-between; align-items: center; height: 50px; padding: 0 16px; background: #fff; border-bottom: 1px solid var(--border); }
.top-brand { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.15rem; color: var(--pri); }
.top-store { font-size: 0.8rem; color: #64748b; font-weight: normal; }
.screen-switcher { display: flex; align-items: center; gap: 6px; background: #eff6ff; padding: 4px 10px; border-radius: 6px; border: 1px solid #bfdbfe; font-size: 0.78rem; font-weight: 700; color: var(--pri); }
.screen-switcher select { padding: 3px 6px; font-size: 0.78rem; border-radius: 4px; border: 1px solid #93c5fd; font-weight: 600; outline: none; }
.top-user { display: flex; align-items: center; gap: 10px; font-size: 0.8rem; }
.user-pill { background: var(--pri); color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: 700; }
.btn-logout { background: transparent; border: 1px solid #fecaca; color: var(--dang); padding: 3px 8px; border-radius: 4px; cursor: pointer; font-size: 0.75rem; }

/* Main Container: Sidebar + Content */
.main-container { display: flex; flex: 1; height: calc(100vh - 50px); overflow: hidden; }
.app-sidebar { width: 220px; background: var(--side-bg); color: var(--side-txt); display: flex; flex-direction: column; overflow-y: auto; flex-shrink: 0; }
.nav-list { list-style: none; padding: 10px 0; margin: 0; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 18px; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: 0.15s; border-left: 3px solid transparent; }
.nav-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
.nav-item.active { background: #2563eb; color: #fff; font-weight: 700; border-left-color: #60a5fa; }
.nav-icon { font-size: 1.1rem; width: 20px; text-align: center; }

/* Content Views */
.content-canvas { flex: 1; padding: 16px; overflow-y: auto; }
.view-sec { display: none; }
.view-sec.active { display: block; }

/* Dashboard Styles (Image 2) */
.kpi-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 16px; }
.kpi-card { background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.kpi-title { font-size: 0.78rem; font-weight: 600; color: #64748b; margin-bottom: 6px; }
.kpi-val { font-size: 1.5rem; font-weight: 800; color: var(--sec); margin-bottom: 4px; }
.kpi-sub { font-size: 0.75rem; font-weight: 600; }
.kpi-sub.up { color: var(--succ); }
.kpi-sub.neutral { color: #64748b; }

.dash-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
.panel { background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.panel-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.panel-title { font-size: 0.95rem; font-weight: 700; color: var(--sec); }
.badge { font-size: 0.7rem; padding: 2px 8px; border-radius: 12px; background: #e0f2fe; color: #0284c7; font-weight: 700; }
.btn-grp button { padding: 4px 10px; font-size: 0.75rem; border: 1px solid var(--border); background: #fff; cursor: pointer; border-radius: 4px; margin-left: 4px; font-weight: 600; }
.btn-grp button.active { background: var(--pri); color: #fff; border-color: var(--pri); }

/* SVG Smooth Area Chart */
.chart-wrap { height: 180px; width: 100%; position: relative; margin-bottom: 8px; }
.chart-foot { display: flex; justify-content: space-between; border-top: 1px dashed var(--border); padding-top: 10px; margin-top: 10px; font-size: 0.78rem; color: #64748b; }
.chart-foot strong { color: var(--sec); font-weight: 700; }

/* Top Selling Table */
.top-tbl { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.top-tbl th { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--border); color: #64748b; font-size: 0.75rem; text-transform: uppercase; }
.top-tbl td { padding: 8px; border-bottom: 1px solid #f8fafc; }

/* POS Layout (Image 1) */
.pos-layout { display: grid; grid-template-columns: 1fr 340px; gap: 16px; height: calc(100vh - 84px); }
.pos-cat-panel { background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 14px; overflow: hidden; display: flex; flex-direction: column; }
.pos-bar { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
.pos-sel, .pos-inp { padding: 7px 10px; font-size: 0.82rem; border: 1px solid var(--border); border-radius: 6px; outline: none; }
.pos-inp { flex: 1; min-width: 180px; }
.pos-btn { padding: 6px 12px; border-radius: 6px; font-size: 0.82rem; font-weight: 600; cursor: pointer; border: 1px solid transparent; }
.btn-out { background: #fff; border-color: #cbd5e1; color: #334155; }
.btn-pri { background: var(--pri); color: #fff; }
.btn-grn { background: var(--succ); color: #fff; font-size: 0.95rem; font-weight: 700; width: 100%; padding: 9px; }

.pos-chips { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 12px; }
.pos-chip { padding: 5px 14px; border-radius: 20px; background: #f8fafc; border: 1px solid var(--border); font-size: 0.78rem; font-weight: 600; color: #475569; cursor: pointer; white-space: nowrap; }
.pos-chip.active { background: var(--pri); color: #fff; border-color: var(--pri); }

.pos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; overflow-y: auto; padding: 2px; }
.pos-card { background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 8px; text-align: center; cursor: pointer; transition: 0.15s; }
.pos-card:hover { border-color: var(--pri); transform: translateY(-2px); box-shadow: 0 4px 8px rgba(30,64,175,0.1); }
.pos-card-icon { font-size: 1.8rem; height: 36px; display: flex; align-items: center; justify-content: center; }
.pos-card-name { font-size: 0.82rem; font-weight: 700; margin: 3px 0; }
.pos-card-price { font-size: 0.88rem; font-weight: 800; color: var(--pri); }
.pos-card-stock { font-size: 0.68rem; color: #64748b; }

.pos-cart { background: #fff; border: 1px solid var(--border); border-radius: 8px; display: flex; flex-direction: column; }
.cart-hd { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-bottom: 1px solid var(--border); font-weight: 700; font-size: 0.9rem; }
.cart-cust { padding: 8px 12px; background: #f8fafc; border-bottom: 1px solid var(--border); display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.cart-cust input { padding: 5px 8px; font-size: 0.78rem; border: 1px solid var(--border); border-radius: 4px; width: 100%; }
.cart-body { flex: 1; overflow-y: auto; padding: 8px 12px; min-height: 180px; }
.cart-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #f8fafc; font-size: 0.8rem; }
.cart-row-name { flex: 1; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 6px; }
.cart-row-ctrl { display: flex; align-items: center; gap: 4px; }
.qty-b { width: 20px; height: 20px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer; font-weight: bold; border-radius: 3px; font-size: 0.8rem; }
.del-b { background: transparent; border: none; color: var(--dang); cursor: pointer; font-size: 0.85rem; padding: 0 4px; }
.cart-sum { padding: 10px 14px; background: #f8fafc; border-top: 1px solid var(--border); font-size: 0.8rem; }
.sum-row { display: flex; justify-content: space-between; margin-bottom: 4px; color: #64748b; }
.sum-tot { display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 800; color: var(--sec); border-top: 1px solid #cbd5e1; padding-top: 6px; margin-top: 4px; }
.cart-acts { padding: 10px 14px; display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 6px; border-top: 1px solid var(--border); }
</style>"""

html = """
<div class="app-wrap">
  <!-- TOP APPLICATION BAR -->
  <header class="app-topbar">
    <div class="top-brand">
      <span>🛒 BrainShop</span>
      <span class="top-store">ABC Retail Store &bull; Main Branch</span>
    </div>
    <div class="screen-switcher">
      <label>SWITCH SCREEN:</label>
      <select id="quick-screen" onchange="navTo(this.value)">
        <option value="dashboard" selected>2. Dashboard</option>
        <option value="pos">3. POS / New Sale</option>
        <option value="inventory">9. Inventory / Stock</option>
        <option value="reports">18. Sales Reports</option>
      </select>
    </div>
    <div class="top-user">
      <span>Active User: <strong id="u-lbl">manager (MANAGER)</strong></span>
      <span class="user-pill">MANAGER</span>
      <button type="button" class="btn-logout" onclick="alert('Session logged out.')">Logout</button>
    </div>
  </header>

  <div class="main-container">
    <!-- LEFT SIDEBAR -->
    <aside class="app-sidebar">
      <ul class="nav-list">
        <li class="nav-item active" data-v="dashboard" onclick="navTo('dashboard')"><span class="nav-icon">📊</span> <span>Dashboard</span></li>
        <li class="nav-item" data-v="pos" onclick="navTo('pos')"><span class="nav-icon">🛒</span> <span>POS / Billing</span></li>
        <li class="nav-item" data-v="inventory" onclick="navTo('inventory')"><span class="nav-icon">📦</span> <span>Products & Stock</span></li>
        <li class="nav-item" data-v="reports" onclick="navTo('reports')"><span class="nav-icon">📑</span> <span>Reports</span></li>
        <li class="nav-item" data-v="users" onclick="alert('Module active in full deployment')"><span class="nav-icon">👥</span> <span>Customers & Users</span></li>
        <li class="nav-item" data-v="settings" onclick="alert('Settings configured')"><span class="nav-icon">⚙️</span> <span>Settings</span></li>
      </ul>
    </aside>

    <!-- CONTENT CANVAS -->
    <main class="content-canvas">
      
      <!-- SCREEN 2: DASHBOARD (IMAGE 2) -->
      <section id="view-dashboard" class="view-sec active">
        <!-- 5 Top KPI Cards -->
        <div class="kpi-row">
          <div class="kpi-card">
            <div class="kpi-title">Today Sales</div>
            <div class="kpi-val">₹ 58.00</div>
            <div class="kpi-sub up">1 order today</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Today Profit</div>
            <div class="kpi-val" style="color:var(--succ)">₹ 13.00</div>
            <div class="kpi-sub up">Margin: 22.4%</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Total Sales</div>
            <div class="kpi-val">₹ 1,951.56</div>
            <div class="kpi-sub up">All-time revenue</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Total Bills</div>
            <div class="kpi-val">10</div>
            <div class="kpi-sub neutral">Invoices processed</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Low Stock Items</div>
            <div class="kpi-val" style="color:var(--succ)">0</div>
            <div class="kpi-sub up">All stock levels healthy</div>
          </div>
        </div>

        <div class="dash-grid">
          <!-- Sales Overview Chart -->
          <div class="panel">
            <div class="panel-hd">
              <div>
                <span class="panel-title">Sales Overview</span>
                <span class="badge" style="margin-left:6px;">7 Days</span>
              </div>
              <div class="btn-grp">
                <button type="button" onclick="setPeriod('Today', this)">Today</button>
                <button type="button" class="active" onclick="setPeriod('7 Days', this)">7 Days</button>
                <button type="button" onclick="setPeriod('30 Days', this)">30 Days</button>
              </div>
            </div>
            <!-- SVG Curve Area Chart -->
            <div class="chart-wrap">
              <svg width="100%" height="100%" viewBox="0 0 600 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>
                <!-- Grid Lines -->
                <line x1="40" y1="30" x2="580" y2="30" stroke="#f1f5f9" stroke-dasharray="4"/>
                <line x1="40" y1="70" x2="580" y2="70" stroke="#f1f5f9" stroke-dasharray="4"/>
                <line x1="40" y1="110" x2="580" y2="110" stroke="#f1f5f9" stroke-dasharray="4"/>
                <line x1="40" y1="140" x2="580" y2="140" stroke="#e2e8f0"/>
                
                <!-- Y-Axis Labels -->
                <text x="35" y="34" font-size="10" fill="#94a3b8" text-anchor="end">₹1.1k</text>
                <text x="35" y="74" font-size="10" fill="#94a3b8" text-anchor="end">₹700</text>
                <text x="35" y="114" font-size="10" fill="#94a3b8" text-anchor="end">₹350</text>
                <text x="35" y="144" font-size="10" fill="#94a3b8" text-anchor="end">₹0</text>

                <!-- Area Fill -->
                <path d="M 60,140 L 60,140 Q 110,140 145,140 T 230,125 T 315,75 T 400,105 T 485,30 T 560,132 L 560,140 Z" fill="url(#areaGrad)"/>
                <!-- Curved Stroke -->
                <path d="M 60,140 Q 110,140 145,140 T 230,125 T 315,75 T 400,105 T 485,30 T 560,132" fill="none" stroke="#2563eb" stroke-width="3"/>
                
                <!-- Circles and Badges -->
                <circle cx="60" cy="140" r="4" fill="#2563eb" stroke="#fff" stroke-width="2"/>
                <circle cx="145" cy="140" r="4" fill="#2563eb" stroke="#fff" stroke-width="2"/>
                
                <circle cx="230" cy="125" r="5" fill="#2563eb" stroke="#fff" stroke-width="2"/>
                <text x="230" y="115" font-size="11" font-weight="700" fill="#0f172a" text-anchor="middle">₹120</text>
                
                <circle cx="315" cy="75" r="5" fill="#2563eb" stroke="#fff" stroke-width="2"/>
                <text x="315" y="65" font-size="11" font-weight="700" fill="#0f172a" text-anchor="middle">₹540</text>

                <circle cx="400" cy="105" r="5" fill="#2563eb" stroke="#fff" stroke-width="2"/>
                <text x="400" y="95" font-size="11" font-weight="700" fill="#0f172a" text-anchor="middle">₹320</text>

                <circle cx="485" cy="30" r="6" fill="#2563eb" stroke="#fff" stroke-width="2"/>
                <text x="485" y="20" font-size="11" font-weight="800" fill="#2563eb" text-anchor="middle">₹914</text>

                <circle cx="560" cy="132" r="5" fill="#2563eb" stroke="#fff" stroke-width="2"/>
                <text x="560" y="122" font-size="11" font-weight="700" fill="#0f172a" text-anchor="middle">₹58</text>

                <!-- X Axis Labels -->
                <text x="60" y="156" font-size="10" fill="#94a3b8" text-anchor="middle">Sat</text>
                <text x="145" y="156" font-size="10" fill="#94a3b8" text-anchor="middle">Sun</text>
                <text x="230" y="156" font-size="10" fill="#94a3b8" text-anchor="middle">Mon</text>
                <text x="315" y="156" font-size="10" fill="#94a3b8" text-anchor="middle">Tue</text>
                <text x="400" y="156" font-size="10" fill="#94a3b8" text-anchor="middle">Wed</text>
                <text x="485" y="156" font-size="10" fill="#94a3b8" text-anchor="middle">Thu</text>
                <text x="560" y="156" font-size="10" fill="#94a3b8" text-anchor="middle">Fri</text>
              </svg>
            </div>
            <div class="chart-foot">
              <span>Period Revenue: <strong>₹ 1,951.56</strong></span>
              <span>Total Invoices: <strong>10</strong></span>
              <span>Avg Ticket: <strong>₹ 195.16</strong></span>
            </div>
          </div>

          <!-- Top Selling Products -->
          <div class="panel">
            <div class="panel-hd">
              <span class="panel-title">Top Selling Products</span>
              <span style="font-size:0.75rem; color:#64748b;">Live Sales</span>
            </div>
            <table class="top-tbl">
              <thead><tr><th>Product</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Revenue</th></tr></thead>
              <tbody>
                <tr><td>🍪 Biscuits</td><td style="text-align:center; font-weight:700;">11</td><td style="text-align:right; font-weight:700;">₹ 220.00</td></tr>
                <tr><td>📦 Tata Salt</td><td style="text-align:center; font-weight:700;">10</td><td style="text-align:right; font-weight:700;">₹ 100.00</td></tr>
                <tr><td>🍚 Rice</td><td style="text-align:center; font-weight:700;">10</td><td style="text-align:right; font-weight:700;">₹ 600.00</td></tr>
                <tr><td>🍾 Cooking Oil</td><td style="text-align:center; font-weight:700;">4</td><td style="text-align:right; font-weight:700;">₹ 480.00</td></tr>
                <tr><td>🍪 Biscuits (Extra)</td><td style="text-align:center; font-weight:700;">3</td><td style="text-align:right; font-weight:700;">₹ 60.00</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- SCREEN 3: POS / BILLING (IMAGE 1) -->
      <section id="view-pos" class="view-sec">
        <div class="pos-layout">
          <div class="pos-cat-panel">
            <div class="pos-bar">
              <select id="sel-c" class="pos-sel" onchange="onCustChg()"><option value="walkin">Walk-in (9999999999)</option><option value="anand" selected>Anand (7589445644)</option></select>
              <button type="button" class="pos-btn btn-out" onclick="onNewCust()">+ New</button>
              <input type="text" id="p-srch" class="pos-inp" placeholder="Scan / Search Product (F2)" oninput="posDraw()" />
              <button type="button" class="pos-btn btn-pri" onclick="setCat('ALL', this)">Browse (F4)</button>
            </div>
            <div class="pos-chips">
              <button type="button" class="pos-chip active" onclick="setCat('ALL', this)">All Products</button>
              <button type="button" class="pos-chip" onclick="setCat('Dairy', this)">Dairy</button>
              <button type="button" class="pos-chip" onclick="setCat('Bakery', this)">Bakery</button>
              <button type="button" class="pos-chip" onclick="setCat('Snacks', this)">Snacks</button>
              <button type="button" class="pos-chip" onclick="setCat('Beverages', this)">Beverages</button>
              <button type="button" class="pos-chip" onclick="setCat('Food', this)">Food</button>
              <button type="button" class="pos-chip" onclick="setCat('Household', this)">Household</button>
            </div>
            <div class="pos-grid" id="pos-grid"></div>
          </div>
          <div class="pos-cart">
            <div class="cart-hd"><span>Current Cart (<span id="c-cnt">0</span>)</span><button type="button" class="pos-btn btn-out" style="padding:2px 8px; font-size:0.75rem;" onclick="clrCart()">Clear</button></div>
            <div class="cart-cust">
              <input type="text" id="c-name" placeholder="Customer Name" value="Anand" />
              <input type="tel" id="c-phone" placeholder="Mobile No" value="7589445644" />
            </div>
            <div class="cart-body" id="c-items"><div style="text-align:center; padding:30px 10px; color:#94a3b8;">Cart is empty</div></div>
            <div class="cart-sum">
              <div class="sum-row"><span>Sub Total:</span><span id="s-sub">Rs. 0.00</span></div>
              <div class="sum-row"><span>GST (Est 5%):</span><span id="s-gst">Rs. 0.00</span></div>
              <div class="sum-tot"><span>Total:</span><span id="s-tot">Rs. 0.00</span></div>
            </div>
            <div class="cart-acts">
              <button type="button" class="pos-btn btn-out" onclick="alert('Saved on Hold')">Hold</button>
              <button type="button" class="pos-btn btn-out" onclick="clrCart()">Draft</button>
              <button type="button" class="pos-btn btn-grn" onclick="doPay()">Pay (F12)</button>
            </div>
          </div>
        </div>
      </section>

      <!-- SCREEN 9: INVENTORY -->
      <section id="view-inventory" class="view-sec">
        <div class="panel">
          <div class="panel-hd"><span class="panel-title">📦 Product Master & Live Inventory</span><button type="button" class="pos-btn btn-pri" onclick="navTo('pos')">+ New Sale</button></div>
          <table class="top-tbl">
            <thead><tr><th>SKU</th><th>Product Name</th><th>Category</th><th>Selling Rate</th><th>Stock Available</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td>SKU-001</td><td>Milk (1 Ltr)</td><td>Dairy</td><td>₹ 52.00</td><td>43 Units</td><td><span class="badge" style="background:#dcfce7; color:#15803d;">IN STOCK</span></td></tr>
              <tr><td>SKU-002</td><td>Bread (Packet)</td><td>Bakery</td><td>₹ 35.00</td><td>30 Units</td><td><span class="badge" style="background:#dcfce7; color:#15803d;">IN STOCK</span></td></tr>
              <tr><td>SKU-003</td><td>Biscuits (200g)</td><td>Snacks</td><td>₹ 20.00</td><td>53 Units</td><td><span class="badge" style="background:#dcfce7; color:#15803d;">IN STOCK</span></td></tr>
              <tr><td>SKU-004</td><td>Maggi (70g)</td><td>Food</td><td>₹ 15.00</td><td>39 Units</td><td><span class="badge" style="background:#dcfce7; color:#15803d;">IN STOCK</span></td></tr>
              <tr><td>SKU-005</td><td>Soft Drink (500ml)</td><td>Beverages</td><td>₹ 45.00</td><td>25 Units</td><td><span class="badge" style="background:#dcfce7; color:#15803d;">IN STOCK</span></td></tr>
              <tr><td>SKU-006</td><td>Chips (Wafers)</td><td>Snacks</td><td>₹ 25.00</td><td>33 Units</td><td><span class="badge" style="background:#dcfce7; color:#15803d;">IN STOCK</span></td></tr>
              <tr><td>SKU-007</td><td>Cooking Oil (1 Ltr)</td><td>Household</td><td>₹ 120.00</td><td>20 Units</td><td><span class="badge" style="background:#dcfce7; color:#15803d;">IN STOCK</span></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- SCREEN 18: REPORTS -->
      <section id="view-reports" class="view-sec">
        <div class="panel">
          <div class="panel-hd"><span class="panel-title">📑 Sales & Financial Analytics Report</span><button type="button" class="pos-btn btn-out" onclick="alert('Exported Report CSV successfully!')">📥 Export CSV</button></div>
          <div style="display:flex; gap:10px; margin-bottom:14px;">
            <div class="kpi-card" style="flex:1;"><div class="kpi-title">Gross Revenue</div><div class="kpi-val">₹ 1,951.56</div></div>
            <div class="kpi-card" style="flex:1;"><div class="kpi-title">Total Cost</div><div class="kpi-val">₹ 1,120.00</div></div>
            <div class="kpi-card" style="flex:1;"><div class="kpi-title">Net Profit</div><div class="kpi-val" style="color:var(--succ);">₹ 831.56</div></div>
          </div>
        </div>
      </section>

    </main>
  </div>
</div>"""

js = """<script>
var PRODS = [
  { id: 1, n: "Milk", c: "Dairy", p: 52, s: 43, icon: "🥛" },
  { id: 2, n: "Bread", c: "Bakery", p: 35, s: 30, icon: "🍞" },
  { id: 3, n: "Biscuits", c: "Snacks", p: 20, s: 53, icon: "🍪" },
  { id: 4, n: "Maggi", c: "Food", p: 15, s: 39, icon: "🍜" },
  { id: 5, n: "Soft Drink", c: "Beverages", p: 45, s: 25, icon: "🥤" },
  { id: 6, n: "Chips", c: "Snacks", p: 25, s: 33, icon: "🍟" },
  { id: 7, n: "Cooking Oil", c: "Household", p: 120, s: 20, icon: "🍾" },
  { id: 8, n: "Basmati Rice", c: "Food", p: 60, s: 50, icon: "🍚" },
  { id: 9, n: "Tata Salt", c: "Household", p: 10, s: 10, icon: "📦" }
];
var curCat = "ALL", cart = [];

function navTo(scrId) {
  document.querySelectorAll(".view-sec").forEach(function(s){ s.classList.remove("active"); });
  var target = document.getElementById("view-" + scrId);
  if(target) target.classList.add("active");
  document.querySelectorAll(".nav-item").forEach(function(n){
    n.classList.toggle("active", n.getAttribute("data-v") === scrId);
  });
  var q = document.getElementById("quick-screen");
  if(q) q.value = scrId;
  if(scrId === 'pos') { posDraw(); drawCart(); }
}

function posDraw() {
  var g = document.getElementById("pos-grid"); if(!g) return;
  var q = (document.getElementById("p-srch") ? document.getElementById("p-srch").value : "").toLowerCase().trim();
  g.innerHTML = "";
  var list = PRODS.filter(function(x) {
    return (curCat === "ALL" || x.c.toLowerCase() === curCat.toLowerCase()) && (!q || x.n.toLowerCase().indexOf(q) > -1);
  });
  list.forEach(function(item) {
    var d = document.createElement("div");
    d.className = "pos-card";
    d.onclick = function() { addC(item.id); };
    d.innerHTML = '<div class="pos-card-icon">' + item.icon + '</div><div class="pos-card-name">' + item.n + '</div><div class="pos-card-price">Rs. ' + item.p.toFixed(2) + '</div><div class="pos-card-stock">Stock: ' + item.s + '</div>';
    g.appendChild(d);
  });
}

function setCat(c, el) {
  curCat = c;
  document.querySelectorAll(".pos-chip").forEach(function(x){ x.classList.remove("active"); });
  if(el) el.classList.add("active");
  posDraw();
}

function addC(id) {
  var itm = cart.find(function(x){ return x.id === id; });
  if(itm) itm.q++;
  else { var p = PRODS.find(function(x){ return x.id === id; }); if(p) cart.push({ id: p.id, n: p.n, p: p.p, q: 1 }); }
  drawCart();
}

function chgQ(id, d) {
  var itm = cart.find(function(x){ return x.id === id; });
  if(!itm) return;
  itm.q += d;
  if(itm.q <= 0) cart = cart.filter(function(x){ return x.id !== id; });
  drawCart();
}

function clrCart() { cart = []; drawCart(); }

function drawCart() {
  var el = document.getElementById("c-items"); if(!el) return;
  var cnt = 0, sub = 0;
  cart.forEach(function(x){ cnt += x.q; sub += x.q * x.p; });
  var gst = sub * 0.05, tot = sub + gst;
  document.getElementById("c-cnt").textContent = cnt;
  document.getElementById("s-sub").textContent = "Rs. " + sub.toFixed(2);
  document.getElementById("s-gst").textContent = "Rs. " + gst.toFixed(2);
  document.getElementById("s-tot").textContent = "Rs. " + tot.toFixed(2);
  if(!cart.length) { el.innerHTML = '<div style="text-align:center; padding:30px 10px; color:#94a3b8;">Cart is empty</div>'; return; }
  var h = "";
  cart.forEach(function(x){
    h += '<div class="cart-row"><div class="cart-row-name">' + x.n + '</div><div class="cart-row-ctrl"><button class="qty-b" onclick="chgQ(' + x.id + ',-1)">-</button><b>' + x.q + '</b><button class="qty-b" onclick="chgQ(' + x.id + ',1)">+</button></div><div style="font-weight:700; width:55px; text-align:right;">Rs. ' + (x.q*x.p).toFixed(2) + '</div><button class="del-b" onclick="chgQ(' + x.id + ',-999)">&times;</button></div>';
  });
  el.innerHTML = h;
}

function doPay() {
  if(!cart.length) { alert("Cart is empty!"); return; }
  var t = document.getElementById("s-tot").textContent;
  var c = document.getElementById("c-name").value || "Customer";
  alert("Payment Successful!\\nTotal: " + t + "\\nCustomer: " + c + "\\nInvoice Generated Successfully.");
  clrCart();
}

function onCustChg() {
  var s = document.getElementById("sel-c");
  if(s.value === "anand") { document.getElementById("c-name").value = "Anand"; document.getElementById("c-phone").value = "7589445644"; }
  else { document.getElementById("c-name").value = "Walk-in"; document.getElementById("c-phone").value = "9999999999"; }
}

function onNewCust() {
  var n = prompt("Customer Name:");
  if(n) { document.getElementById("c-name").value = n; var p = prompt("Mobile No:"); if(p) document.getElementById("c-phone").value = p; }
}

function setPeriod(p, btn) {
  document.querySelectorAll(".btn-grp button").forEach(function(b){ b.classList.remove("active"); });
  if(btn) btn.classList.add("active");
}

window.addEventListener("keydown", function(e) {
  if(e.key === "F2") { e.preventDefault(); var el = document.getElementById("p-srch"); if(el) el.focus(); }
  else if(e.key === "F12") { e.preventDefault(); doPay(); }
});
</script>"""

full_code = css + "\n" + html + "\n" + js

p1 = os.path.join(base_dir, "Apex", "APEX_DASHBOARD_AND_POS_FULL_UI.html")
p2 = os.path.join(base_dir, "APEX_DASHBOARD_AND_POS_FULL_UI.html")

with open(p1, "w", encoding="utf-8") as f:
    f.write(full_code)

with open(p2, "w", encoding="utf-8") as f:
    f.write(full_code)

print("SUCCESS! Generated APEX_DASHBOARD_AND_POS_FULL_UI.html")
print("Total size in bytes:", len(full_code))
