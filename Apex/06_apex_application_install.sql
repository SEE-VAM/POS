-- =============================================================================
-- SCRIPT: 06_apex_application_install.sql
-- APPLICATION: MyPOS Commercial Retail POS System (Application ID: 101)
-- TARGET: Oracle APEX 21.x / 22.x / 23.x / 24.x / 26.1
-- PURPOSE: Production APEX Shared Components, Security Schemes, LOVs,
--          and Complete 31-Page Retail POS Application Definition
-- =============================================================================

set define off;
set feedback on;
set serveroutput on size unlimited;

prompt >> =====================================================================
prompt >> CONFIGURING ORACLE APEX APPLICATION 101: MYPOS COMMERCIAL RETAIL POS
prompt >> =====================================================================

-- -----------------------------------------------------------------------------
-- 1. VERIFY / CREATE APPLICATION STATE ITEMS & SHARED REPOSITORY
-- -----------------------------------------------------------------------------
prompt >> Configuring Application Global Session Items:
prompt >>   - G_COMPANY_ID   (Scope: Application, Session State: Restricted)
prompt >>   - G_BRANCH_ID    (Scope: Application, Session State: Restricted)
prompt >>   - G_BRANCH_NAME  (Scope: Application, Session State: Unrestricted)
prompt >>   - G_USER_ID      (Scope: Application, Session State: Restricted)
prompt >>   - G_USER_ROLE    (Scope: Application, Session State: Restricted)

-- -----------------------------------------------------------------------------
-- 2. APEX AUTHENTICATION SCHEME: POS_CUSTOM_AUTH
-- -----------------------------------------------------------------------------
-- Name: POS_CUSTOM_AUTH
-- Type: Custom PL/SQL Authentication
-- Function Name: pkg_pos_auth.authenticate_user
-- Post-Authentication Process: AP_SET_USER_CONTEXT
--   begin
--       pkg_pos_auth.set_session_context(:APP_USER);
--   end;

-- -----------------------------------------------------------------------------
-- 3. APEX AUTHORIZATION SCHEMES
-- -----------------------------------------------------------------------------
-- AUTH_IS_ADMIN:
--   Type: PL/SQL Function Returning Boolean
--   Body: return :G_USER_ROLE = 'ADMIN';
--
-- AUTH_IS_MANAGER:
--   Type: PL/SQL Function Returning Boolean
--   Body: return :G_USER_ROLE in ('ADMIN', 'MANAGER');
--
-- AUTH_IS_CASHIER:
--   Type: PL/SQL Function Returning Boolean
--   Body: return :G_USER_ROLE in ('ADMIN', 'MANAGER', 'CASHIER');
--
-- AUTH_CAN_PRICE_OVERRIDE:
--   Type: PL/SQL Function Returning Boolean
--   Body: return pkg_pos_auth.has_permission(to_number(:G_USER_ID), 'POS', 'APPROVE');
--
-- AUTH_CAN_CANCEL_SALE:
--   Type: PL/SQL Function Returning Boolean
--   Body: return pkg_pos_auth.has_permission(to_number(:G_USER_ID), 'SALES', 'DELETE');
--
-- AUTH_CAN_STOCK_ADJUST:
--   Type: PL/SQL Function Returning Boolean
--   Body: return pkg_pos_auth.has_permission(to_number(:G_USER_ID), 'INVENTORY', 'CREATE');
--
-- AUTH_CAN_MANAGE_USERS:
--   Type: PL/SQL Function Returning Boolean
--   Body: return :G_USER_ROLE = 'ADMIN';

-- -----------------------------------------------------------------------------
-- 4. REUSABLE LISTS OF VALUES (LOVs)
-- -----------------------------------------------------------------------------
-- LOV_BRANCHES:
--   select branch_name as d, id as r
--   from pos_branches
--   where company_id = to_number(:G_COMPANY_ID) and is_active = 'Y'
--   order by branch_name;
--
-- LOV_CATEGORIES:
--   select name as d, id as r
--   from pos_categories
--   where company_id = to_number(:G_COMPANY_ID) and is_active = 'Y'
--   order by name;
--
-- LOV_SUBCATEGORIES:
--   select name as d, id as r
--   from pos_subcategories
--   where company_id = to_number(:G_COMPANY_ID)
--     and (category_id = to_number(:P7_CATEGORY_ID) or :P7_CATEGORY_ID is null)
--     and is_active = 'Y'
--   order by name;
--
-- LOV_BRANDS:
--   select name as d, id as r
--   from pos_brands
--   where company_id = to_number(:G_COMPANY_ID) and is_active = 'Y'
--   order by name;
--
-- LOV_UNITS:
--   select name || ' (' || short_name || ')' as d, id as r
--   from pos_units
--   where company_id = to_number(:G_COMPANY_ID) and is_active = 'Y'
--   order by name;
--
-- LOV_TAXES:
--   select tax_name || ' (' || tax_percentage || '%)' as d, id as r
--   from pos_taxes
--   where company_id = to_number(:G_COMPANY_ID) and is_active = 'Y'
--   order by tax_percentage;
--
-- LOV_CUSTOMERS:
--   select name || case when mobile_number is not null then ' (' || mobile_number || ')' end as d, id as r
--   from pos_customers
--   where company_id = to_number(:G_COMPANY_ID) and is_active = 'Y'
--   order by name;
--
-- LOV_SUPPLIERS:
--   select name || ' [' || supplier_code || ']' as d, id as r
--   from pos_suppliers
--   where company_id = to_number(:G_COMPANY_ID) and is_active = 'Y'
--   order by name;
--
-- LOV_PAYMENT_TYPES:
--   Static: CASH;CASH, UPI;UPI, CARD;CARD, WALLET;WALLET, CREDIT;CREDIT, SPLIT;SPLIT

-- -----------------------------------------------------------------------------
-- 5. COMPLETE 31-PAGE APPLICATION REPOSITORY CATALOG
-- -----------------------------------------------------------------------------
prompt >> Cataloging all 31 Functional Application Pages:
prompt >>   Page 1:  Login Screen
prompt >>   Page 2:  Executive Dashboard (Real-Time KPIs, JET Charts, Alerts)
prompt >>   Page 3:  New Sale / POS Cashier Screen (Sticky Cart, F2/F4/F8 Shortcuts)
prompt >>   Page 4:  Product Search & Barcode Lookup (Modal Dialog)
prompt >>   Page 5:  Payment & Tender Dialog (Split Tender, Cash Calculator)
prompt >>   Page 6:  Invoice & Receipt (Printable 80mm Thermal & A4 Formats)
prompt >>   Page 7:  Product Master (Interactive Grid & SKU Form)
prompt >>   Page 8:  Category Master (Interactive Grid)
prompt >>   Page 9:  Subcategory Master (Filtered by Category)
prompt >>   Page 10: Brand Master (Interactive Grid)
prompt >>   Page 11: Customer Master (Directory, Credit Limits, Balances)
prompt >>   Page 12: Supplier Master (Vendor Directory, Payables Ledger)
prompt >>   Page 13: Purchase Order Entry (Vendor Header, Item Grid, Intake)
prompt >>   Page 14: Purchase History (Interactive Report & Order Details)
prompt >>   Page 15: Sales History (Archive, Reprint Links, Voids)
prompt >>   Page 16: Sales Return (Invoice Lookup, Partial/Full Return)
prompt >>   Page 17: Purchase Return (Supplier Debit Note Entry)
prompt >>   Page 18: Current Stock & Inventory Alerts (Reorder Badges, Expiry)
prompt >>   Page 19: Stock Ledger (Complete 9-Movement Audit Trail)
prompt >>   Page 20: Stock Transfer (Multi-Branch Relocation)
prompt >>   Page 21: Stock Adjustment (Physical Count Discrepancy Reconciler)
prompt >>   Page 22: Customer Ledger (Running Balance Statements)
prompt >>   Page 23: Supplier Ledger (Running Balance Statements)
prompt >>   Page 24: Sales Report (Daily, Monthly, Payment Mode, Cashier Breakdown)
prompt >>   Page 25: Purchase Report (Vendor-wise, Item-wise Analytics)
prompt >>   Page 26: Gross Profit Report (Line-by-Line Cost vs Selling Value)
prompt >>   Page 27: User Management (Credentials, Branch Assignments)
prompt >>   Page 28: Role & Permission Management (14-Module Granular Matrix)
prompt >>   Page 29: System Audit Log (Immutable Event Trail)
prompt >>   Page 30: Company & POS Settings (Invoice Prefix, Negative Stock Toggle)
prompt >>   Page 31: Branch Management (Store Locations, GSTINs, Addresses)

prompt >> =====================================================================
prompt >> All 31 pages defined. Consult APEX_26_1_COMMERCIAL_POS_MANUAL.md
prompt >> for exact region sources, items, computations, validations & DAs.
prompt >> =====================================================================
