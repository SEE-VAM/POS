-- =============================================================================
-- SCRIPT: 04_pos_sample_data.sql
-- PURPOSE: Realistic Commercial Demo Master and Transaction Data for APEX POS
-- =============================================================================

-- 1. Company
insert into pos_companies (
    id, company_name, legal_name, gstin, pan, address, phone_number, email, is_active, row_version,
    created_on, created_by, updated_on, updated_by
) values (
    1, 'ABC Retail Store', 'ABC Supermarkets India Pvt Ltd', '07ABCDE1234F1Z5', 'ABCDE1234F',
    'Shop No. 12, Green Park, New Delhi - 110016', '+91 98765 43210', 'contact@abcretail.com', 'Y', 1,
    sysdate, 'SYSTEM', sysdate, 'SYSTEM'
);

-- 2. Branches
insert into pos_branches (
    id, company_id, branch_code, branch_name, gstin, address, phone_number, email, is_active, row_version,
    created_on, created_by, updated_on, updated_by
) values (
    1, 1, 'B001', 'Main Branch', '07ABCDE1234F1Z5', 'Shop No. 12, Green Park, New Delhi', '+91 98765 43210', 'main@abcretail.com', 'Y', 1,
    sysdate, 'SYSTEM', sysdate, 'SYSTEM'
);

insert into pos_branches (
    id, company_id, branch_code, branch_name, gstin, address, phone_number, email, is_active, row_version,
    created_on, created_by, updated_on, updated_by
) values (
    2, 1, 'B002', 'Branch 2 - Noida Sector 62', '09ABCDE1234F1Z8', 'Plot 45, Sector 62, Noida, UP', '+91 98765 43211', 'noida@abcretail.com', 'Y', 1,
    sysdate, 'SYSTEM', sysdate, 'SYSTEM'
);

insert into pos_branches (
    id, company_id, branch_code, branch_name, gstin, address, phone_number, email, is_active, row_version,
    created_on, created_by, updated_on, updated_by
) values (
    3, 1, 'B003', 'Branch 3 - Gurgaon Express', '06ABCDE1234F1Z9', 'DLF Phase 3, Gurgaon, Haryana', '+91 98765 43212', 'gurgaon@abcretail.com', 'Y', 1,
    sysdate, 'SYSTEM', sysdate, 'SYSTEM'
);

-- 3. Roles
insert into pos_roles (id, role_name, description, row_version, created_on, created_by, updated_on, updated_by)
values (1, 'ADMIN', 'System Administrator with full access across companies and branches', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

insert into pos_roles (id, role_name, description, row_version, created_on, created_by, updated_on, updated_by)
values (2, 'MANAGER', 'Store Manager with branch-level approvals, purchases, and reporting rights', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

insert into pos_roles (id, role_name, description, row_version, created_on, created_by, updated_on, updated_by)
values (3, 'CASHIER', 'POS Cashier restricted to billing, customer lookup, and sales returns', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

-- 4. Permissions
insert into pos_permissions (id, permission_code, description, row_version, created_on, created_by, updated_on, updated_by)
values (1, 'DASHBOARD', 'View executive KPIs and visual charts', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_permissions (id, permission_code, description, row_version, created_on, created_by, updated_on, updated_by)
values (2, 'POS', 'Access POS billing screen and process checkouts', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_permissions (id, permission_code, description, row_version, created_on, created_by, updated_on, updated_by)
values (3, 'PRODUCTS', 'Manage product catalog and barcodes', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_permissions (id, permission_code, description, row_version, created_on, created_by, updated_on, updated_by)
values (4, 'INVENTORY', 'View stock balances, batch expiry, and movement history', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_permissions (id, permission_code, description, row_version, created_on, created_by, updated_on, updated_by)
values (5, 'PURCHASE', 'Create purchase orders and record supplier bills', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_permissions (id, permission_code, description, row_version, created_on, created_by, updated_on, updated_by)
values (6, 'SALES', 'View sales invoices, history, and receipts', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_permissions (id, permission_code, description, row_version, created_on, created_by, updated_on, updated_by)
values (7, 'RETURNS', 'Process sales returns and purchase returns', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_permissions (id, permission_code, description, row_version, created_on, created_by, updated_on, updated_by)
values (8, 'TRANSFERS', 'Perform branch stock transfers', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_permissions (id, permission_code, description, row_version, created_on, created_by, updated_on, updated_by)
values (9, 'CUSTOMERS', 'Manage customer directory and ledger balances', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_permissions (id, permission_code, description, row_version, created_on, created_by, updated_on, updated_by)
values (10, 'SUPPLIERS', 'Manage supplier records and payables', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_permissions (id, permission_code, description, row_version, created_on, created_by, updated_on, updated_by)
values (11, 'REPORTS', 'Run analytical and financial profit reports', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_permissions (id, permission_code, description, row_version, created_on, created_by, updated_on, updated_by)
values (12, 'SETTINGS', 'Configure company, taxes, and POS behavior', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_permissions (id, permission_code, description, row_version, created_on, created_by, updated_on, updated_by)
values (13, 'AUDIT_LOG', 'Inspect system and security audit trail', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_permissions (id, permission_code, description, row_version, created_on, created_by, updated_on, updated_by)
values (14, 'USERS', 'Create and administer users and security roles', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

-- Role-Permission Matrix
-- ADMIN: Full Access (all 14 permissions)
begin
    for i in 1..14 loop
        insert into pos_role_permissions (role_id, permission_id, can_view, can_create, can_edit, can_delete, can_approve, row_version, created_on, created_by, updated_on, updated_by)
        values (1, i, 'Y', 'Y', 'Y', 'Y', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
    end loop;
end;
/

-- MANAGER: All except Administration (Users/Settings)
begin
    for i in 1..11 loop
        insert into pos_role_permissions (role_id, permission_id, can_view, can_create, can_edit, can_delete, can_approve, row_version, created_on, created_by, updated_on, updated_by)
        values (2, i, 'Y', 'Y', 'Y', 'N', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
    end loop;
end;
/

-- CASHIER: POS, Sales, Returns, Customers, Inventory view
insert into pos_role_permissions (role_id, permission_id, can_view, can_create, can_edit, can_delete, can_approve, row_version, created_on, created_by, updated_on, updated_by)
values (3, 2, 'Y', 'Y', 'Y', 'N', 'N', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM'); -- POS
insert into pos_role_permissions (role_id, permission_id, can_view, can_create, can_edit, can_delete, can_approve, row_version, created_on, created_by, updated_on, updated_by)
values (3, 6, 'Y', 'N', 'N', 'N', 'N', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM'); -- Sales View
insert into pos_role_permissions (role_id, permission_id, can_view, can_create, can_edit, can_delete, can_approve, row_version, created_on, created_by, updated_on, updated_by)
values (3, 7, 'Y', 'Y', 'N', 'N', 'N', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM'); -- Returns
insert into pos_role_permissions (role_id, permission_id, can_view, can_create, can_edit, can_delete, can_approve, row_version, created_on, created_by, updated_on, updated_by)
values (3, 9, 'Y', 'Y', 'Y', 'N', 'N', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM'); -- Customers
insert into pos_role_permissions (role_id, permission_id, can_view, can_create, can_edit, can_delete, can_approve, row_version, created_on, created_by, updated_on, updated_by)
values (3, 4, 'Y', 'N', 'N', 'N', 'N', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM'); -- Inventory View

-- 5. Users (Default password for all demo users is: password123)
-- Hash generated using SHA256('password123:SALT_ABC_2026')
insert into pos_users (
    id, company_id, role_id, username, password_hash, password_salt, first_name, last_name, email, phone_number, is_active, row_version,
    created_on, created_by, updated_on, updated_by
) values (
    1, 1, 1, 'admin', standard_hash('password123:SALT_ABC_2026', 'SHA256'), 'SALT_ABC_2026', 'Admin', 'User', 'admin@abcretail.com', '9876543201', 'Y', 1,
    sysdate, 'SYSTEM', sysdate, 'SYSTEM'
);

insert into pos_users (
    id, company_id, role_id, username, password_hash, password_salt, first_name, last_name, email, phone_number, is_active, row_version,
    created_on, created_by, updated_on, updated_by
) values (
    2, 1, 2, 'manager', standard_hash('password123:SALT_ABC_2026', 'SHA256'), 'SALT_ABC_2026', 'Store', 'Manager', 'manager@abcretail.com', '9876543202', 'Y', 1,
    sysdate, 'SYSTEM', sysdate, 'SYSTEM'
);

insert into pos_users (
    id, company_id, role_id, username, password_hash, password_salt, first_name, last_name, email, phone_number, is_active, row_version,
    created_on, created_by, updated_on, updated_by
) values (
    3, 1, 3, 'cashier1', standard_hash('password123:SALT_ABC_2026', 'SHA256'), 'SALT_ABC_2026', 'Cashier', 'One', 'cashier1@abcretail.com', '9876543203', 'Y', 1,
    sysdate, 'SYSTEM', sysdate, 'SYSTEM'
);

insert into pos_users (
    id, company_id, role_id, username, password_hash, password_salt, first_name, last_name, email, phone_number, is_active, row_version,
    created_on, created_by, updated_on, updated_by
) values (
    4, 1, 3, 'cashier2', standard_hash('password123:SALT_ABC_2026', 'SHA256'), 'SALT_ABC_2026', 'Cashier', 'Two', 'cashier2@abcretail.com', '9876543204', 'Y', 1,
    sysdate, 'SYSTEM', sysdate, 'SYSTEM'
);

-- User-Branch Assignments
insert into pos_user_branches (user_id, branch_id, is_default, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_user_branches (user_id, branch_id, is_default, row_version, created_on, created_by, updated_on, updated_by)
values (1, 2, 'N', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_user_branches (user_id, branch_id, is_default, row_version, created_on, created_by, updated_on, updated_by)
values (1, 3, 'N', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_user_branches (user_id, branch_id, is_default, row_version, created_on, created_by, updated_on, updated_by)
values (2, 1, 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_user_branches (user_id, branch_id, is_default, row_version, created_on, created_by, updated_on, updated_by)
values (3, 1, 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_user_branches (user_id, branch_id, is_default, row_version, created_on, created_by, updated_on, updated_by)
values (4, 2, 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

-- 6. Categories & Subcategories
insert into pos_categories (id, company_id, name, description, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 'Dairy', 'Milk & Dairy Products', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_categories (id, company_id, name, description, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (2, 1, 'Bakery', 'Bread, Cakes, Pastries', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_categories (id, company_id, name, description, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (3, 1, 'Snacks', 'Chips, Biscuits, Namkeen', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_categories (id, company_id, name, description, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (4, 1, 'Beverages', 'Soft Drinks, Juices', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_categories (id, company_id, name, description, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (5, 1, 'Food', 'Instant Food, Spices', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_categories (id, company_id, name, description, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (6, 1, 'Household', 'Home Care, Personal Care', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

insert into pos_subcategories (id, company_id, category_id, name, description, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 1, 'Fresh Milk', 'Pasteurized and Toned Milk', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_subcategories (id, company_id, category_id, name, description, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (2, 1, 2, 'Sliced Bread', 'Brown, White and Multigrain Breads', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_subcategories (id, company_id, category_id, name, description, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (3, 1, 3, 'Potato Chips', 'Crispy Flavored Chips', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_subcategories (id, company_id, category_id, name, description, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (4, 1, 4, 'Carbonated Drinks', 'Cold Drinks and Sodas', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

-- 7. Brands
insert into pos_brands (id, company_id, name, description, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 'Amul', 'The Taste of India', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_brands (id, company_id, name, description, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (2, 1, 'Britannia', 'Eat Healthy Think Better', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_brands (id, company_id, name, description, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (3, 1, 'Nestle', 'Good food, Good life', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_brands (id, company_id, name, description, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (4, 1, 'Coca Cola', 'Real Magic', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_brands (id, company_id, name, description, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (5, 1, 'Lays', 'Betcha Can''t Eat Just One', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_brands (id, company_id, name, description, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (6, 1, 'India Gate', 'Premium Basmati Rice', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

-- 8. Units
insert into pos_units (id, company_id, name, short_name, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 'Pieces', 'PC', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_units (id, company_id, name, short_name, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (2, 1, 'Kilograms', 'KG', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_units (id, company_id, name, short_name, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (3, 1, 'Packets', 'PKT', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_units (id, company_id, name, short_name, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (4, 1, 'Bottles', 'BTL', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

-- 9. Taxes
insert into pos_taxes (id, company_id, tax_name, tax_percentage, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 'GST 0%', 0.00, 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_taxes (id, company_id, tax_name, tax_percentage, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (2, 1, 'GST 5%', 5.00, 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_taxes (id, company_id, tax_name, tax_percentage, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (3, 1, 'GST 12%', 12.00, 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_taxes (id, company_id, tax_name, tax_percentage, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (4, 1, 'GST 18%', 18.00, 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

-- 10. Products (Matching exact items from Screenshot)
-- P001: Milk (Price: 52.00, Stock: 45)
insert into pos_products (
    id, company_id, product_code, name, short_name, description, category_id, subcategory_id, brand_id, unit_id,
    hsn_sac, tax_id, mrp, purchase_price, selling_price, wholesale_price, min_stock, max_stock, reorder_level,
    image_url, is_active, batch_applicable, expiry_applicable, serial_applicable, row_version,
    created_on, created_by, updated_on, updated_by
) values (
    1, 1, 'P001', 'Milk', 'Milk 1L', 'Amul Taaza Homogenised Toned Milk 1L', 1, 1, 1, 3,
    '0401', 1, 55.00, 45.00, 52.00, 48.00, 10, 100, 15,
    '#APP_FILES#img/milk.png', 'Y', 'Y', 'Y', 'N', 1,
    sysdate, 'SYSTEM', sysdate, 'SYSTEM'
);

-- P002: Bread (Price: 35.00, Stock: 32)
insert into pos_products (
    id, company_id, product_code, name, short_name, description, category_id, subcategory_id, brand_id, unit_id,
    hsn_sac, tax_id, mrp, purchase_price, selling_price, wholesale_price, min_stock, max_stock, reorder_level,
    image_url, is_active, batch_applicable, expiry_applicable, serial_applicable, row_version,
    created_on, created_by, updated_on, updated_by
) values (
    2, 1, 'P002', 'Bread', 'Bread 400g', 'Britannia Brown Bread 400g', 2, 2, 2, 3,
    '1905', 1, 40.00, 28.00, 35.00, 30.00, 10, 80, 10,
    '#APP_FILES#img/bread.png', 'Y', 'Y', 'Y', 'N', 1,
    sysdate, 'SYSTEM', sysdate, 'SYSTEM'
);

-- P003: Biscuits (Price: 20.00, Stock: 56)
insert into pos_products (
    id, company_id, product_code, name, short_name, description, category_id, subcategory_id, brand_id, unit_id,
    hsn_sac, tax_id, mrp, purchase_price, selling_price, wholesale_price, min_stock, max_stock, reorder_level,
    image_url, is_active, batch_applicable, expiry_applicable, serial_applicable, row_version,
    created_on, created_by, updated_on, updated_by
) values (
    3, 1, 'P003', 'Biscuits', 'Good Day 100g', 'Britannia Good Day Butter Cookies 100g', 3, null, 2, 3,
    '1905', 4, 25.00, 16.00, 20.00, 18.00, 10, 150, 15,
    '#APP_FILES#img/biscuits.png', 'Y', 'Y', 'Y', 'N', 1,
    sysdate, 'SYSTEM', sysdate, 'SYSTEM'
);

-- P004: Maggi (Price: 15.00, Stock: 40)
insert into pos_products (
    id, company_id, product_code, name, short_name, description, category_id, subcategory_id, brand_id, unit_id,
    hsn_sac, tax_id, mrp, purchase_price, selling_price, wholesale_price, min_stock, max_stock, reorder_level,
    image_url, is_active, batch_applicable, expiry_applicable, serial_applicable, row_version,
    created_on, created_by, updated_on, updated_by
) values (
    4, 1, 'P004', 'Maggi', 'Maggi 2-Min', 'Nestle Maggi 2-Minute Masala Noodles 70g', 5, null, 3, 3,
    '1902', 4, 16.00, 11.50, 15.00, 13.00, 10, 200, 20,
    '#APP_FILES#img/maggi.png', 'Y', 'Y', 'Y', 'N', 1,
    sysdate, 'SYSTEM', sysdate, 'SYSTEM'
);

-- P005: Soft Drink (Price: 45.00, Stock: 28)
insert into pos_products (
    id, company_id, product_code, name, short_name, description, category_id, subcategory_id, brand_id, unit_id,
    hsn_sac, tax_id, mrp, purchase_price, selling_price, wholesale_price, min_stock, max_stock, reorder_level,
    image_url, is_active, batch_applicable, expiry_applicable, serial_applicable, row_version,
    created_on, created_by, updated_on, updated_by
) values (
    5, 1, 'P005', 'Soft Drink', 'Coke 750ml', 'Coca Cola 750ml PET Bottle', 4, 4, 4, 4,
    '2202', 4, 48.00, 34.00, 45.00, 38.00, 10, 100, 15,
    '#APP_FILES#img/coke.png', 'Y', 'N', 'Y', 'N', 1,
    sysdate, 'SYSTEM', sysdate, 'SYSTEM'
);

-- P006: Chips (Price: 25.00, Stock: 35)
insert into pos_products (
    id, company_id, product_code, name, short_name, description, category_id, subcategory_id, brand_id, unit_id,
    hsn_sac, tax_id, mrp, purchase_price, selling_price, wholesale_price, min_stock, max_stock, reorder_level,
    image_url, is_active, batch_applicable, expiry_applicable, serial_applicable, row_version,
    created_on, created_by, updated_on, updated_by
) values (
    6, 1, 'P006', 'Chips', 'Lays Blue 50g', 'Lays India''s Magic Masala 50g', 3, 3, 5, 3,
    '2005', 3, 25.00, 18.00, 25.00, 20.00, 10, 120, 15,
    '#APP_FILES#img/chips.png', 'Y', 'N', 'Y', 'N', 1,
    sysdate, 'SYSTEM', sysdate, 'SYSTEM'
);

-- P007: Rice (Price: 120.00, Stock: 50)
insert into pos_products (
    id, company_id, product_code, name, short_name, description, category_id, subcategory_id, brand_id, unit_id,
    hsn_sac, tax_id, mrp, purchase_price, selling_price, wholesale_price, min_stock, max_stock, reorder_level,
    image_url, is_active, batch_applicable, expiry_applicable, serial_applicable, row_version,
    created_on, created_by, updated_on, updated_by
) values (
    7, 1, 'P007', 'Rice', 'Basmati 1KG', 'India Gate Super Basmati Rice 1KG Pouch', 5, null, 6, 2,
    '1006', 1, 140.00, 95.00, 120.00, 105.00, 5, 50, 10,
    '#APP_FILES#img/rice.png', 'Y', 'Y', 'Y', 'N', 1,
    sysdate, 'SYSTEM', sysdate, 'SYSTEM'
);

-- Barcodes
insert into pos_product_barcodes (product_id, barcode, is_primary, row_version, created_on, created_by, updated_on, updated_by)
values (1, '8901262010011', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_product_barcodes (product_id, barcode, is_primary, row_version, created_on, created_by, updated_on, updated_by)
values (2, '8901063010022', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_product_barcodes (product_id, barcode, is_primary, row_version, created_on, created_by, updated_on, updated_by)
values (3, '8901063010033', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_product_barcodes (product_id, barcode, is_primary, row_version, created_on, created_by, updated_on, updated_by)
values (4, '8901058010044', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_product_barcodes (product_id, barcode, is_primary, row_version, created_on, created_by, updated_on, updated_by)
values (5, '8901764010055', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_product_barcodes (product_id, barcode, is_primary, row_version, created_on, created_by, updated_on, updated_by)
values (6, '8901491010066', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_product_barcodes (product_id, barcode, is_primary, row_version, created_on, created_by, updated_on, updated_by)
values (7, '8901824010077', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

-- 11. Batches for Perishables
insert into pos_batches (id, company_id, branch_id, product_id, batch_number, mfg_date, expiry_date, current_stock_quantity, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 1, 1, 'MLK-2026-09A', trunc(sysdate)-2, trunc(sysdate)+5, 45, 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_batches (id, company_id, branch_id, product_id, batch_number, mfg_date, expiry_date, current_stock_quantity, row_version, created_on, created_by, updated_on, updated_by)
values (2, 1, 1, 2, 'BRD-2026-09B', trunc(sysdate)-1, trunc(sysdate)+4, 32, 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_batches (id, company_id, branch_id, product_id, batch_number, mfg_date, expiry_date, current_stock_quantity, row_version, created_on, created_by, updated_on, updated_by)
values (3, 1, 1, 3, 'BSC-2026-06C', trunc(sysdate)-60, trunc(sysdate)+180, 56, 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

-- 12. Customers (Matching Screenshot Page 11)
insert into pos_customers (id, company_id, customer_code, name, mobile_number, email, gstin, address, credit_limit, opening_balance, customer_type, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 'WALK-IN', 'Walk-In Customer', null, null, null, 'Store Counter', 0.00, 0.00, 'WALK_IN', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

insert into pos_customers (id, company_id, customer_code, name, mobile_number, email, gstin, address, credit_limit, opening_balance, customer_type, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (2, 1, 'CUST001', 'Rohit Sharma', '9876543210', 'rohit@example.com', '07ABCDE1234F1Z5', 'B-14, Green Park, New Delhi', 5000.00, 0.00, 'REGULAR', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

insert into pos_customers (id, company_id, customer_code, name, mobile_number, email, gstin, address, credit_limit, opening_balance, customer_type, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (3, 1, 'CUST002', 'Priya Singh', '9811122334', 'priya@example.com', '07ABCDE1234F1Z6', 'Flat 402, Lotus Towers, New Delhi', 10000.00, 325.00, 'REGULAR', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

insert into pos_customers (id, company_id, customer_code, name, mobile_number, email, gstin, address, credit_limit, opening_balance, customer_type, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (4, 1, 'CUST003', 'Amit Kumar', '9122334455', 'amit@example.com', null, 'C-55, Hauz Khas, New Delhi', 3000.00, 0.00, 'REGULAR', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

insert into pos_customers (id, company_id, customer_code, name, mobile_number, email, gstin, address, credit_limit, opening_balance, customer_type, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (5, 1, 'CUST004', 'Sunita Devi', '9866778899', 'sunita@example.com', null, 'D-12, South Ext, New Delhi', 5000.00, 120.00, 'REGULAR', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

insert into pos_customers (id, company_id, customer_code, name, mobile_number, email, gstin, address, credit_limit, opening_balance, customer_type, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (6, 1, 'CUST005', 'Vikram Patel', '9654321987', 'vikram@example.com', '07ABCDE1234F1Z7', 'Plot 88, Okhla Phase 2, New Delhi', 15000.00, 450.00, 'WHOLESALE', 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

-- 13. Suppliers (Matching Screenshot Page 12)
insert into pos_suppliers (id, company_id, supplier_code, name, mobile_number, email, gstin, address, opening_balance, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 'SUP001', 'ABC Distributors', '9876500001', 'orders@abcdist.com', '07ABCDE1234F1Z6', 'Godown 4, Azadpur Mandi, Delhi', 5750.00, 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

insert into pos_suppliers (id, company_id, supplier_code, name, mobile_number, email, gstin, address, opening_balance, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (2, 1, 'SUP002', 'Shree Trading', '9812345678', 'info@shreetrading.com', '07ABCDE1234F1Z8', 'Shop 10, Chandni Chowk, Delhi', 12800.00, 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

insert into pos_suppliers (id, company_id, supplier_code, name, mobile_number, email, gstin, address, opening_balance, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (3, 1, 'SUP003', 'Global Suppliers', '9122345679', 'contact@globalsupp.com', null, 'Industrial Area, Mayapuri, Delhi', 0.00, 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

insert into pos_suppliers (id, company_id, supplier_code, name, mobile_number, email, gstin, address, opening_balance, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (4, 1, 'SUP004', 'Mahesh Traders', '9888776655', 'mahesh@traders.com', '07ABCDE1234F1Z2', 'G-12, Sadar Bazar, Delhi', 3450.00, 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

insert into pos_suppliers (id, company_id, supplier_code, name, mobile_number, email, gstin, address, opening_balance, is_active, row_version, created_on, created_by, updated_on, updated_by)
values (5, 1, 'SUP005', 'KR Enterprises', '9654321987', 'kr@enterprises.com', null, 'Transport Nagar, Delhi', 7200.00, 'Y', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

-- 14. Stock Ledger: Seed Opening Inventory for Branch 1 (Matches Stock Column in UI)
-- Milk: 45, Bread: 32, Biscuits: 56, Maggi: 40, Soft Drink: 28, Chips: 35, Rice: 50
insert into pos_stock_transactions (company_id, branch_id, product_id, batch_id, transaction_type, quantity_change, unit_cost, transaction_date, reference_table, reference_id, user_id, remarks, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 1, 1, 'OPENING', 45, 45.00, systimestamp - 10, 'OPENING_BALANCE', null, 1, 'Opening Inventory', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

insert into pos_stock_transactions (company_id, branch_id, product_id, batch_id, transaction_type, quantity_change, unit_cost, transaction_date, reference_table, reference_id, user_id, remarks, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 2, 2, 'OPENING', 32, 28.00, systimestamp - 10, 'OPENING_BALANCE', null, 1, 'Opening Inventory', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

insert into pos_stock_transactions (company_id, branch_id, product_id, batch_id, transaction_type, quantity_change, unit_cost, transaction_date, reference_table, reference_id, user_id, remarks, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 3, 3, 'OPENING', 56, 16.00, systimestamp - 10, 'OPENING_BALANCE', null, 1, 'Opening Inventory', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

insert into pos_stock_transactions (company_id, branch_id, product_id, batch_id, transaction_type, quantity_change, unit_cost, transaction_date, reference_table, reference_id, user_id, remarks, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 4, null, 'OPENING', 40, 11.50, systimestamp - 10, 'OPENING_BALANCE', null, 1, 'Opening Inventory', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

insert into pos_stock_transactions (company_id, branch_id, product_id, batch_id, transaction_type, quantity_change, unit_cost, transaction_date, reference_table, reference_id, user_id, remarks, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 5, null, 'OPENING', 28, 34.00, systimestamp - 10, 'OPENING_BALANCE', null, 1, 'Opening Inventory', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

insert into pos_stock_transactions (company_id, branch_id, product_id, batch_id, transaction_type, quantity_change, unit_cost, transaction_date, reference_table, reference_id, user_id, remarks, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 6, null, 'OPENING', 35, 18.00, systimestamp - 10, 'OPENING_BALANCE', null, 1, 'Opening Inventory', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

insert into pos_stock_transactions (company_id, branch_id, product_id, batch_id, transaction_type, quantity_change, unit_cost, transaction_date, reference_table, reference_id, user_id, remarks, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 7, null, 'OPENING', 50, 95.00, systimestamp - 10, 'OPENING_BALANCE', null, 1, 'Opening Inventory', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

-- Also seed inventory for Branch 2
insert into pos_stock_transactions (company_id, branch_id, product_id, batch_id, transaction_type, quantity_change, unit_cost, transaction_date, reference_table, reference_id, user_id, remarks, row_version, created_on, created_by, updated_on, updated_by)
values (1, 2, 1, null, 'OPENING', 30, 45.00, systimestamp - 10, 'OPENING_BALANCE', null, 1, 'Branch 2 Opening Stock', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_stock_transactions (company_id, branch_id, product_id, batch_id, transaction_type, quantity_change, unit_cost, transaction_date, reference_table, reference_id, user_id, remarks, row_version, created_on, created_by, updated_on, updated_by)
values (1, 2, 2, null, 'OPENING', 25, 28.00, systimestamp - 10, 'OPENING_BALANCE', null, 1, 'Branch 2 Opening Stock', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

-- 15. Sample Historical Completed Sales (Matching Invoice No & Customers in Page 17)
-- INV-0000124 (Screenshot Page 3 & 6: Bill 1000124, 167.56, Milk x1 + Bread x2, Cashier: Admin)
insert into pos_sales (
    id, company_id, branch_id, invoice_number, invoice_date, customer_id, cashier_id,
    subtotal, item_discount_amount, bill_discount_amount, taxable_amount, tax_amount, round_off_amount, grand_total,
    status, notes, row_version, created_on, created_by, updated_on, updated_by
) values (
    124, 1, 1, 'INV-0000124', systimestamp, 1, 1,
    142.00, 0.00, 0.00, 142.00, 25.56, 0.00, 167.56,
    'COMPLETED', 'Counter Sale', 1, sysdate, 'admin', sysdate, 'admin'
);

insert into pos_sale_items (sale_id, product_id, product_name, product_code, hsn_sac, quantity, unit_price, purchase_price, discount_amount, tax_rate, tax_amount, line_total, batch_id, row_version, created_on, created_by, updated_on, updated_by)
values (124, 1, 'Milk', 'P001', '0401', 1, 52.00, 45.00, 0.00, 18.00, 9.36, 61.36, 1, 1, sysdate, 'admin', sysdate, 'admin');

insert into pos_sale_items (sale_id, product_id, product_name, product_code, hsn_sac, quantity, unit_price, purchase_price, discount_amount, tax_rate, tax_amount, line_total, batch_id, row_version, created_on, created_by, updated_on, updated_by)
values (124, 2, 'Bread', 'P002', '1905', 2, 35.00, 28.00, 0.00, 18.00, 12.60, 82.60, 2, 1, sysdate, 'admin', sysdate, 'admin');

insert into pos_payments (company_id, branch_id, sale_id, payment_type, amount_received, change_amount, transaction_ref_number, payment_date, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 124, 'CASH', 200.00, 32.44, null, systimestamp, 1, sysdate, 'admin', sysdate, 'admin');

-- Past Invoices for Sales History (Page 17)
-- INV-0000123: Rohit Sharma (₹ 850.00, Cash)
insert into pos_sales (id, company_id, branch_id, invoice_number, invoice_date, customer_id, cashier_id, subtotal, item_discount_amount, bill_discount_amount, taxable_amount, tax_amount, round_off_amount, grand_total, status, row_version, created_on, created_by, updated_on, updated_by)
values (123, 1, 1, 'INV-0000123', systimestamp - 1, 2, 1, 800.00, 0.00, 0.00, 800.00, 50.00, 0.00, 850.00, 'COMPLETED', 1, sysdate, 'admin', sysdate, 'admin');
insert into pos_payments (company_id, branch_id, sale_id, payment_type, amount_received, change_amount, transaction_ref_number, payment_date, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 123, 'CASH', 850.00, 0.00, null, systimestamp - 1, 1, sysdate, 'admin', sysdate, 'admin');

-- INV-0000122: Priya Singh (₹ 325.00, Card)
insert into pos_sales (id, company_id, branch_id, invoice_number, invoice_date, customer_id, cashier_id, subtotal, item_discount_amount, bill_discount_amount, taxable_amount, tax_amount, round_off_amount, grand_total, status, row_version, created_on, created_by, updated_on, updated_by)
values (122, 1, 1, 'INV-0000122', systimestamp - 2, 3, 1, 300.00, 0.00, 0.00, 300.00, 25.00, 0.00, 325.00, 'COMPLETED', 1, sysdate, 'admin', sysdate, 'admin');
insert into pos_payments (company_id, branch_id, sale_id, payment_type, amount_received, change_amount, transaction_ref_number, payment_date, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 122, 'CARD', 325.00, 0.00, 'TXN_CARD_9921', systimestamp - 2, 1, sysdate, 'admin', sysdate, 'admin');

-- INV-0000121: Amit Kumar (₹ 540.00, UPI)
insert into pos_sales (id, company_id, branch_id, invoice_number, invoice_date, customer_id, cashier_id, subtotal, item_discount_amount, bill_discount_amount, taxable_amount, tax_amount, round_off_amount, grand_total, status, row_version, created_on, created_by, updated_on, updated_by)
values (121, 1, 1, 'INV-0000121', systimestamp - 3, 4, 3, 500.00, 0.00, 0.00, 500.00, 40.00, 0.00, 540.00, 'COMPLETED', 1, sysdate, 'cashier1', sysdate, 'cashier1');
insert into pos_payments (company_id, branch_id, sale_id, payment_type, amount_received, change_amount, transaction_ref_number, payment_date, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 121, 'UPI', 540.00, 0.00, 'UPI_REF_44129', systimestamp - 3, 1, sysdate, 'cashier1', sysdate, 'cashier1');

-- INV-0000120: Sunita Devi (₹ 780.00, UPI)
insert into pos_sales (id, company_id, branch_id, invoice_number, invoice_date, customer_id, cashier_id, subtotal, item_discount_amount, bill_discount_amount, taxable_amount, tax_amount, round_off_amount, grand_total, status, row_version, created_on, created_by, updated_on, updated_by)
values (120, 1, 1, 'INV-0000120', systimestamp - 4, 5, 3, 720.00, 0.00, 0.00, 720.00, 60.00, 0.00, 780.00, 'COMPLETED', 1, sysdate, 'cashier1', sysdate, 'cashier1');
insert into pos_sale_items (sale_id, product_id, product_name, product_code, hsn_sac, quantity, unit_price, purchase_price, discount_amount, tax_rate, tax_amount, line_total, batch_id, row_version, created_on, created_by, updated_on, updated_by)
values (120, 1, 'Milk', 'P001', '0401', 2, 52.00, 45.00, 0.00, 5.00, 5.20, 109.20, 1, 1, sysdate, 'cashier1', sysdate, 'cashier1');
insert into pos_sale_items (sale_id, product_id, product_name, product_code, hsn_sac, quantity, unit_price, purchase_price, discount_amount, tax_rate, tax_amount, line_total, batch_id, row_version, created_on, created_by, updated_on, updated_by)
values (120, 2, 'Bread', 'P002', '1905', 1, 35.00, 28.00, 0.00, 5.00, 1.75, 36.75, 2, 1, sysdate, 'cashier1', sysdate, 'cashier1');
insert into pos_payments (company_id, branch_id, sale_id, payment_type, amount_received, change_amount, transaction_ref_number, payment_date, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 120, 'UPI', 780.00, 0.00, 'UPI_REF_88192', systimestamp - 4, 1, sysdate, 'cashier1', sysdate, 'cashier1');

-- 16. Sample Purchases (Matching Page 10 PUR-000124)
insert into pos_purchases (
    id, company_id, branch_id, supplier_id, purchase_invoice_number, purchase_date,
    subtotal, discount_amount, freight_charges, other_charges, tax_amount, total_amount, paid_amount, outstanding_amount,
    status, row_version, created_on, created_by, updated_on, updated_by
) values (
    124, 1, 1, 1, 'PUR-000124', systimestamp - 5,
    1370.00, 0.00, 0.00, 0.00, 246.60, 1616.60, 1616.60, 0.00,
    'COMPLETED', 1, sysdate, 'manager', sysdate, 'manager'
);

insert into pos_purchase_items (purchase_id, product_id, product_name, product_code, hsn_sac, quantity, purchase_rate, mrp, discount_amount, tax_rate, tax_amount, line_total, batch_id, expiry_date, row_version, created_on, created_by, updated_on, updated_by)
values (124, 1, 'Milk', 'P001', '0401', 10, 45.00, 55.00, 0.00, 18.00, 81.00, 531.00, 1, trunc(sysdate)+5, 1, sysdate, 'manager', sysdate, 'manager');
insert into pos_purchase_items (purchase_id, product_id, product_name, product_code, hsn_sac, quantity, purchase_rate, mrp, discount_amount, tax_rate, tax_amount, line_total, batch_id, expiry_date, row_version, created_on, created_by, updated_on, updated_by)
values (124, 2, 'Bread', 'P002', '1905', 20, 28.00, 40.00, 0.00, 18.00, 100.80, 660.80, 2, trunc(sysdate)+4, 1, sysdate, 'manager', sysdate, 'manager');
insert into pos_purchase_items (purchase_id, product_id, product_name, product_code, hsn_sac, quantity, purchase_rate, mrp, discount_amount, tax_rate, tax_amount, line_total, batch_id, expiry_date, row_version, created_on, created_by, updated_on, updated_by)
values (124, 3, 'Biscuits', 'P003', '1905', 25, 16.00, 25.00, 0.00, 18.00, 72.00, 472.00, 3, trunc(sysdate)+180, 1, sysdate, 'manager', sysdate, 'manager');

insert into pos_purchase_payments (company_id, branch_id, purchase_id, payment_type, amount, payment_date, transaction_ref_number, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 124, 'BANK_TRANSFER', 1616.60, systimestamp - 5, 'NEFT_9882199', 1, sysdate, 'manager', sysdate, 'manager');

-- 17. Sample Customer Ledger Entries (Matching Page 16: Rohit Sharma Ledger)
insert into pos_customer_ledger (company_id, branch_id, customer_id, transaction_date, transaction_type, reference_table, reference_id, debit_amount, credit_amount, current_balance, remarks, user_id, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 2, systimestamp - 15, 'OPENING_BALANCE', 'POS_CUSTOMERS', 2, 0.00, 0.00, 0.00, 'Opening Balance', 1, 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_customer_ledger (company_id, branch_id, customer_id, transaction_date, transaction_type, reference_table, reference_id, debit_amount, credit_amount, current_balance, remarks, user_id, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 2, systimestamp - 1, 'SALE', 'POS_SALES', 123, 850.00, 0.00, 850.00, 'Sale INV-0000123', 1, 1, sysdate, 'admin', sysdate, 'admin');
insert into pos_customer_ledger (company_id, branch_id, customer_id, transaction_date, transaction_type, reference_table, reference_id, debit_amount, credit_amount, current_balance, remarks, user_id, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 2, systimestamp - 1, 'PAYMENT', 'POS_PAYMENTS', 123, 0.00, 850.00, 0.00, 'Payment for INV-0000123', 1, 1, sysdate, 'admin', sysdate, 'admin');

-- 18. Settings
insert into pos_settings (company_id, branch_id, setting_key, setting_value, description, row_version, created_on, created_by, updated_on, updated_by)
values (1, null, 'COMPANY_NAME', 'ABC Retail Store', 'Display name on invoices and application header', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_settings (company_id, branch_id, setting_key, setting_value, description, row_version, created_on, created_by, updated_on, updated_by)
values (1, null, 'CURRENCY_SYMBOL', '₹', 'Retail currency symbol', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_settings (company_id, branch_id, setting_key, setting_value, description, row_version, created_on, created_by, updated_on, updated_by)
values (1, null, 'CURRENCY_CODE', 'INR', 'Currency code ISO 4217', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_settings (company_id, branch_id, setting_key, setting_value, description, row_version, created_on, created_by, updated_on, updated_by)
values (1, null, 'ALLOW_NEGATIVE_STOCK', 'N', 'Prevent selling items when stock is insufficient (Y/N)', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_settings (company_id, null, setting_key, setting_value, description, row_version, created_on, created_by, updated_on, updated_by)
values (1, null, 'INVOICE_PREFIX', 'INV', 'Prefix for POS sales invoices', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
insert into pos_settings (company_id, null, setting_key, setting_value, description, row_version, created_on, created_by, updated_on, updated_by)
values (1, null, 'RECEIPT_PRINTER_TYPE', 'THERMAL_80MM', 'Default receipt layout (THERMAL_80MM or A4)', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');

commit;

prompt >> 04_pos_sample_data.sql completed successfully.
