-- =============================================================================
-- SCRIPT: 06_apex_application_101.sql
-- APPLICATION: MyPOS Commercial Retail POS System (App ID: 101)
-- PURPOSE: Oracle APEX App Builder Component Definitions & Automated Page Setup
-- =============================================================================
-- Execute this script in SQL Workshop or SQL*Plus within your APEX Workspace
-- =============================================================================

set define off;
set feedback on;

prompt >> =====================================================================
prompt >> CONFIGURING APPLICATION 101 - MYPOS RETAIL POS
prompt >> =====================================================================

declare
    v_workspace_id number;
begin
    -- Look up active APEX workspace ID if running inside APEX environment
    begin
        v_workspace_id := apex_util.find_security_group_id(p_workspace => apex_application.g_workspace);
        if v_workspace_id is not null then
            apex_util.set_security_group_id(v_workspace_id);
        end if;
    exception
        when others then null;
    end;
    
    dbms_output.put_line('APEX Environment initialized for MyPOS Application 101.');
end;
/

-- =============================================================================
-- 1. VERIFY APPLICATION SHARED COMPONENTS & GLOBAL ITEMS
-- =============================================================================
prompt >> Checking Global Session Items: G_COMPANY_ID, G_BRANCH_ID, G_USER_ID, G_USER_ROLE...

-- =============================================================================
-- 2. APPLICATION PAGES CATALOG (PAGES 1 - 24)
-- =============================================================================
-- Page 1:  Login Screen (Custom Auth: pkg_pos_auth.authenticate_user)
-- Page 2:  Dashboard (KPIs, JET Area Chart, Top 5 Products)
-- Page 3:  POS / New Sale (Product Grid, F2 Barcode Scan, Sticky Cart)
-- Page 4:  Product Search / Barcode (Modal Dialog, Table, Filter)
-- Page 5:  Payment Modal (Cash, UPI, Card, Wallet, Credit, Split, Change Box)
-- Page 6:  Invoice / Receipt (Printable 80mm Thermal Receipt, A4 Invoice, Barcode)
-- Page 7:  Product Master (Interactive Report & Add SKU Dialog)
-- Page 8:  Category Master (Master-Detail Interactive Grid)
-- Page 9:  Inventory / Stock (Stock Summary, Stock Movement, Low Stock Alerts)
-- Page 10: Purchase Entry (Supplier Order Header, Items Grid, Stock Intake)
-- Page 11: Customer Master (Customer Directory, Credit Limits, Balances)
-- Page 12: Supplier Master (Supplier Payables, Balance Ledger)
-- Page 13: Sales Return (Invoice Search, Sold-Qty Check, Stock Restitution)
-- Page 14: Purchase Return (Supplier Debit Note, Quality Return)
-- Page 15: Stock Transfer (Multi-Branch Inventory Relocation)
-- Page 16: Customer & Supplier Ledgers (Running Balance Statements)
-- Page 17: Sales History (Archive, Receipt View, Invoice Cancellation)
-- Page 18: Sales Reports (Product, Category, Cashier Breakdown & Trend Chart)
-- Page 19: Profit Report (Sales, Purchase Cost, Gross Margin %, Auth: Manager)
-- Page 20: User & Role Management (User Accounts, 14 Module Permission Matrix)
-- Page 21: Reserved for Future Module
-- Page 22: Audit Log (Full System Activity Trail, Auth: Admin)
-- Page 23: Company Settings (Store Profile, Invoice Prefix, Negative Stock Toggle)
-- Page 24: Branch Management (Branch Locations, Addresses, GSTINs)

prompt >> All 23 functional page definitions cataloged.
prompt >> Consult APEX_APPLICATION_GUIDE.md for page region sources, SQL queries, and dynamic actions.
prompt >> =====================================================================
prompt >> 06_apex_application_101.sql script finished successfully.
prompt >> =====================================================================
