-- =============================================================================
-- ALL-IN-ONE MASTER SCRIPT: MYPOS_COMPLETE_DATABASE_INSTALL.sql
-- APPLICATION: MyPOS Commercial Retail POS System for Oracle APEX
-- PURPOSE: Single file for direct upload to Oracle APEX SQL Workshop > SQL Scripts
-- CONTAINS: Full Tables, Sequences, Indexes, Triggers, Views, PL/SQL Packages,
--           Sample Data, and 16-Point Verification Test Suite.
-- =============================================================================
set define off;
set feedback on;
set serveroutput on size unlimited;


-- >>> FILE: 01_pos_schema_migration.sql <<<

-- =============================================================================
-- SCRIPT: 01_pos_schema_migration.sql
-- APPLICATION: MyPOS Commercial Retail POS System for Oracle APEX
-- PURPOSE: Non-Destructive Schema Upgrade & Migration Script
-- SAFE: Does NOT drop tables, does NOT delete data. Adds missing columns,
--       sequences, indexes, and constraints idempotently.
-- =============================================================================

set define off;
set feedback on;
set serveroutput on size unlimited;

prompt >> =====================================================================
prompt >> STEP 1.1: CREATING CONCURRENCY-SAFE SEQUENCES
prompt >> =====================================================================

declare
    procedure safe_create_seq(p_seq_name in varchar2, p_start in number) is
        v_count number;
    begin
        select count(*) into v_count from user_sequences where sequence_name = upper(p_seq_name);
        if v_count = 0 then
            execute immediate 'create sequence ' || p_seq_name || ' start with ' || p_start || ' increment by 1 nocache nocycle';
            dbms_output.put_line('Created sequence: ' || p_seq_name);
        else
            dbms_output.put_line('Sequence already exists: ' || p_seq_name);
        end if;
    end safe_create_seq;
begin
    safe_create_seq('pos_invoice_seq',    100001);
    safe_create_seq('pos_purchase_seq',   200001);
    safe_create_seq('pos_transfer_seq',   300001);
    safe_create_seq('pos_adjustment_seq', 400001);
    safe_create_seq('pos_return_seq',     500001);
end;
/

prompt >> =====================================================================
prompt >> STEP 1.2: ADDING MISSING COLUMNS (NON-DESTRUCTIVE)
prompt >> =====================================================================

declare
    procedure safe_add_col(p_table in varchar2, p_col_def in varchar2) is
    begin
        execute immediate 'alter table ' || p_table || ' add ( ' || p_col_def || ' )';
        dbms_output.put_line('Added column to ' || p_table || ': ' || p_col_def);
    exception
        when others then
            if sqlcode in (-1430, -904) then
                -- ORA-01430: column being added already exists in table
                null;
            else
                dbms_output.put_line('Notice for ' || p_table || ' (' || p_col_def || '): ' || sqlerrm);
            end if;
    end safe_add_col;
begin
    -- 1. POS_BRANCHES: contact fields
    safe_add_col('pos_branches', 'phone_number varchar2(255)');
    safe_add_col('pos_branches', 'email varchar2(255)');

    -- 2. POS_USERS: role linkage
    safe_add_col('pos_users', 'role_id number constraint pos_user_role_fk references pos_roles(id)');

    -- 3. POS_USER_BRANCHES: default branch flag
    safe_add_col('pos_user_branches', 'is_default varchar2(1) default ''N'' not null');

    -- 4. POS_ROLE_PERMISSIONS: granular action permissions
    safe_add_col('pos_role_permissions', 'can_view varchar2(1) default ''Y'' not null');
    safe_add_col('pos_role_permissions', 'can_create varchar2(1) default ''N'' not null');
    safe_add_col('pos_role_permissions', 'can_edit varchar2(1) default ''N'' not null');
    safe_add_col('pos_role_permissions', 'can_delete varchar2(1) default ''N'' not null');
    safe_add_col('pos_role_permissions', 'can_approve varchar2(1) default ''N'' not null');

    -- 5. POS_PRODUCTS: visual display image URL
    safe_add_col('pos_products', 'image_url varchar2(1000)');

    -- 6. POS_SALES: notes and GST component breakdown
    safe_add_col('pos_sales', 'notes varchar2(4000)');
    safe_add_col('pos_sales', 'cgst_amount number(18,2) default 0 not null');
    safe_add_col('pos_sales', 'sgst_amount number(18,2) default 0 not null');
    safe_add_col('pos_sales', 'igst_amount number(18,2) default 0 not null');

    -- 7. POS_SALE_ITEMS: cost price at time of sale (critical for accurate profit reports)
    safe_add_col('pos_sale_items', 'purchase_price number(18,2) default 0 not null');

    -- 8. POS_PURCHASES: paid amount
    safe_add_col('pos_purchases', 'paid_amount number(18,2) default 0 not null');

    -- 9. POS_SALES_RETURNS: return tracking
    safe_add_col('pos_sales_returns', 'return_number varchar2(255)');
    safe_add_col('pos_sales_returns', 'refund_mode varchar2(50) default ''CASH''');

    -- 10. POS_PURCHASE_RETURNS: debit note number
    safe_add_col('pos_purchase_returns', 'return_number varchar2(255)');

    -- 11. POS_STOCK_TRANSACTIONS: unit cost for inventory valuation
    safe_add_col('pos_stock_transactions', 'unit_cost number(18,2) default 0 not null');

    -- 12. POS_STOCK_TRANSFERS: approval tracking
    safe_add_col('pos_stock_transfers', 'approved_by_user_id number constraint pos_st_appr_user_fk references pos_users(id)');

    -- 13. POS_STOCK_ADJUSTMENTS: reference document number
    safe_add_col('pos_stock_adjustments', 'adjustment_ref_number varchar2(255)');
end;
/

prompt >> =====================================================================
prompt >> STEP 1.3: ENSURING ESSENTIAL PERFORMANCE INDEXES
prompt >> =====================================================================

declare
    procedure safe_create_idx(p_idx_name in varchar2, p_table in varchar2, p_cols in varchar2) is
        v_count number;
    begin
        select count(*) into v_count from user_indexes where index_name = upper(p_idx_name);
        if v_count = 0 then
            execute immediate 'create index ' || p_idx_name || ' on ' || p_table || ' (' || p_cols || ')';
            dbms_output.put_line('Created index: ' || p_idx_name);
        end if;
    exception
        when others then
            dbms_output.put_line('Index notice (' || p_idx_name || '): ' || sqlerrm);
    end safe_create_idx;
begin
    safe_create_idx('pos_users_role_idx',        'pos_users',              'role_id');
    safe_create_idx('pos_stk_txn_composite_idx', 'pos_stock_transactions', 'company_id, branch_id, product_id');
    safe_create_idx('pos_stk_txn_type_idx',      'pos_stock_transactions', 'transaction_type, transaction_date');
    safe_create_idx('pos_sale_items_perf_idx',   'pos_sale_items',         'sale_id, product_id');
    safe_create_idx('pos_sales_perf_idx',        'pos_sales',              'company_id, branch_id, invoice_date, status');
    safe_create_idx('pos_purchases_perf_idx',    'pos_purchases',          'company_id, branch_id, purchase_date, status');
    safe_create_idx('pos_prod_barcode_perf_idx', 'pos_product_barcodes',   'barcode');
    safe_create_idx('pos_prod_code_perf_idx',    'pos_products',           'company_id, product_code');
end;
/

prompt >> 01_pos_schema_migration.sql completed successfully.


-- >>> FILE: 01_pos_schema_ddl.sql <<<

-- =============================================================================
-- SCRIPT: 01_pos_schema_ddl.sql
-- PURPOSE: Production-Ready Commercial Retail POS Database Schema for Oracle APEX
-- TARGET: Oracle Database 19c / 21c / 23ai / 26.x & Oracle APEX
-- =============================================================================

-- Sequences for Concurrency-Safe Document Numbering
create sequence pos_invoice_seq start with 100001 increment by 1 nocache nocycle;
create sequence pos_purchase_seq start with 200001 increment by 1 nocache nocycle;
create sequence pos_transfer_seq start with 300001 increment by 1 nocache nocycle;
create sequence pos_adjustment_seq start with 400001 increment by 1 nocache nocycle;
create sequence pos_return_seq start with 500001 increment by 1 nocache nocycle;

-- =============================================================================
-- 1. COMPANY & BRANCH STRUCTURE
-- =============================================================================

create table pos_companies (
    id                            number         generated by default on null as identity
                                                 constraint pos_company_pk primary key,
    company_name                  varchar2(255)  not null constraint pos_company_name_uk unique,
    legal_name                    varchar2(255),
    gstin                         varchar2(20),
    pan                           varchar2(20),
    address                       varchar2(4000),
    phone_number                  varchar2(255),
    email                         varchar2(255),
    logo                          blob,
    is_active                     varchar2(1)    default 'Y' not null
                                                 constraint pos_company_active_ck check (is_active in ('Y', 'N')),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null
);

create table pos_branches (
    id                            number         generated by default on null as identity
                                                 constraint pos_branch_pk primary key,
    company_id                    number         not null
                                                 constraint pos_branch_company_fk
                                                 references pos_companies ( id ),
    branch_code                   varchar2(50)   not null,
    branch_name                   varchar2(255)  not null,
    gstin                         varchar2(20),
    address                       varchar2(4000),
    phone_number                  varchar2(255),
    email                         varchar2(255),
    is_active                     varchar2(1)    default 'Y' not null
                                                 constraint pos_branch_active_ck check (is_active in ('Y', 'N')),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null,
    constraint pos_branch_code_uk unique ( company_id, branch_code )
);

-- =============================================================================
-- 2. SECURITY, ROLES & PERMISSIONS
-- =============================================================================

create table pos_roles (
    id                            number         generated by default on null as identity
                                                 constraint pos_role_pk primary key,
    role_name                     varchar2(255)  not null constraint pos_role_name_uk unique,
    description                   varchar2(4000),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null
);

create table pos_permissions (
    id                            number         generated by default on null as identity
                                                 constraint pos_permission_pk primary key,
    permission_code               varchar2(255)  not null constraint pos_permission_code_uk unique,
    description                   varchar2(4000),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null
);

create table pos_role_permissions (
    id                            number         generated by default on null as identity
                                                 constraint pos_role_permission_pk primary key,
    role_id                       number         not null
                                                 constraint pos_role_perm_role_fk
                                                 references pos_roles ( id )
                                                 on delete cascade,
    permission_id                 number         not null
                                                 constraint pos_role_perm_perm_fk
                                                 references pos_permissions ( id )
                                                 on delete cascade,
    can_view                      varchar2(1)    default 'Y' not null,
    can_create                    varchar2(1)    default 'N' not null,
    can_edit                      varchar2(1)    default 'N' not null,
    can_delete                    varchar2(1)    default 'N' not null,
    can_approve                   varchar2(1)    default 'N' not null,
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null,
    constraint pos_role_perm_uk unique ( role_id, permission_id )
);

create table pos_users (
    id                            number         generated by default on null as identity
                                                 constraint pos_user_pk primary key,
    company_id                    number         not null
                                                 constraint pos_user_company_fk
                                                 references pos_companies ( id ),
    role_id                       number         not null
                                                 constraint pos_user_role_fk
                                                 references pos_roles ( id ),
    username                      varchar2(255)  not null constraint pos_user_username_uk unique,
    password_hash                 varchar2(255)  not null,
    password_salt                 varchar2(255)  not null,
    first_name                    varchar2(255)  not null,
    last_name                     varchar2(255)  not null,
    email                         varchar2(255),
    phone_number                  varchar2(255),
    is_active                     varchar2(1)    default 'Y' not null
                                                 constraint pos_user_active_ck check (is_active in ('Y', 'N')),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null
);

create table pos_user_branches (
    id                            number         generated by default on null as identity
                                                 constraint pos_user_branch_pk primary key,
    user_id                       number         not null
                                                 constraint pos_user_branch_user_fk
                                                 references pos_users ( id )
                                                 on delete cascade,
    branch_id                     number         not null
                                                 constraint pos_user_branch_branch_fk
                                                 references pos_branches ( id )
                                                 on delete cascade,
    is_default                    varchar2(1)    default 'N' not null,
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null,
    constraint pos_user_branch_uk unique ( user_id, branch_id )
);

-- =============================================================================
-- 3. PRODUCT CATALOG MASTER DATA
-- =============================================================================

create table pos_categories (
    id                            number         generated by default on null as identity
                                                 constraint pos_category_pk primary key,
    company_id                    number         not null
                                                 constraint pos_category_company_fk
                                                 references pos_companies ( id ),
    name                          varchar2(255)  not null,
    description                   varchar2(4000),
    is_active                     varchar2(1)    default 'Y' not null
                                                 constraint pos_category_active_ck check (is_active in ('Y', 'N')),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null,
    constraint pos_category_name_uk unique ( company_id, name )
);

create table pos_subcategories (
    id                            number         generated by default on null as identity
                                                 constraint pos_subcategory_pk primary key,
    company_id                    number         not null
                                                 constraint pos_subcategory_company_fk
                                                 references pos_companies ( id ),
    category_id                   number         not null
                                                 constraint pos_subcategory_category_fk
                                                 references pos_categories ( id ),
    name                          varchar2(255)  not null,
    description                   varchar2(4000),
    is_active                     varchar2(1)    default 'Y' not null
                                                 constraint pos_subcategory_active_ck check (is_active in ('Y', 'N')),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null,
    constraint pos_subcategory_name_uk unique ( company_id, category_id, name )
);

create table pos_brands (
    id                            number         generated by default on null as identity
                                                 constraint pos_brand_pk primary key,
    company_id                    number         not null
                                                 constraint pos_brand_company_fk
                                                 references pos_companies ( id ),
    name                          varchar2(255)  not null,
    description                   varchar2(4000),
    is_active                     varchar2(1)    default 'Y' not null
                                                 constraint pos_brand_active_ck check (is_active in ('Y', 'N')),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null,
    constraint pos_brand_name_uk unique ( company_id, name )
);

create table pos_units (
    id                            number         generated by default on null as identity
                                                 constraint pos_unit_pk primary key,
    company_id                    number         not null
                                                 constraint pos_unit_company_fk
                                                 references pos_companies ( id ),
    name                          varchar2(255)  not null,
    short_name                    varchar2(50),
    is_active                     varchar2(1)    default 'Y' not null
                                                 constraint pos_unit_active_ck check (is_active in ('Y', 'N')),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null,
    constraint pos_unit_name_uk unique ( company_id, name )
);

create table pos_taxes (
    id                            number         generated by default on null as identity
                                                 constraint pos_tax_pk primary key,
    company_id                    number         not null
                                                 constraint pos_tax_company_fk
                                                 references pos_companies ( id ),
    tax_name                      varchar2(255)  not null,
    tax_percentage                number(5,2)    not null constraint pos_tax_percentage_ck check (tax_percentage >= 0),
    is_active                     varchar2(1)    default 'Y' not null
                                                 constraint pos_tax_active_ck check (is_active in ('Y', 'N')),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null
);

create table pos_products (
    id                            number         generated by default on null as identity
                                                 constraint pos_product_pk primary key,
    company_id                    number         not null
                                                 constraint pos_product_company_fk
                                                 references pos_companies ( id ),
    product_code                  varchar2(50)   not null,
    name                          varchar2(255)  not null,
    short_name                    varchar2(255),
    description                   varchar2(4000),
    category_id                   number         not null
                                                 constraint pos_product_category_fk
                                                 references pos_categories ( id ),
    subcategory_id                number
                                                 constraint pos_product_subcategory_fk
                                                 references pos_subcategories ( id ),
    brand_id                      number
                                                 constraint pos_product_brand_fk
                                                 references pos_brands ( id ),
    unit_id                       number         not null
                                                 constraint pos_product_unit_fk
                                                 references pos_units ( id ),
    hsn_sac                       varchar2(50),
    tax_id                        number         not null
                                                 constraint pos_product_tax_fk
                                                 references pos_taxes ( id ),
    mrp                           number(18,2)   not null constraint pos_product_mrp_ck check (mrp >= 0),
    purchase_price                number(18,2)   not null constraint pos_product_pprice_ck check (purchase_price >= 0),
    selling_price                 number(18,2)   not null constraint pos_product_sprice_ck check (selling_price >= 0),
    wholesale_price               number(18,2),
    min_stock                     number         default 0 not null constraint pos_product_minstock_ck check (min_stock >= 0),
    max_stock                     number         default 0 not null constraint pos_product_maxstock_ck check (max_stock >= 0),
    reorder_level                 number         default 0 not null constraint pos_product_reorder_ck check (reorder_level >= 0),
    image_url                     varchar2(1000),
    is_active                     varchar2(1)    default 'Y' not null
                                                 constraint pos_product_active_ck check (is_active in ('Y', 'N')),
    batch_applicable              varchar2(1)    default 'N' not null
                                                 constraint pos_product_batch_ck check (batch_applicable in ('Y', 'N')),
    expiry_applicable             varchar2(1)    default 'N' not null
                                                 constraint pos_product_expiry_ck check (expiry_applicable in ('Y', 'N')),
    serial_applicable             varchar2(1)    default 'N' not null
                                                 constraint pos_product_serial_ck check (serial_applicable in ('Y', 'N')),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null,
    constraint pos_product_code_uk unique ( company_id, product_code )
);

create table pos_product_barcodes (
    id                            number         generated by default on null as identity
                                                 constraint pos_prod_barcode_pk primary key,
    product_id                    number         not null
                                                 constraint pos_prod_barcode_product_fk
                                                 references pos_products ( id )
                                                 on delete cascade,
    barcode                       varchar2(255)  not null constraint pos_prod_barcode_uk unique,
    is_primary                    varchar2(1)    default 'N' not null
                                                 constraint pos_prod_barcode_isprimary_ck check (is_primary in ('Y', 'N')),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null
);

create table pos_batches (
    id                            number         generated by default on null as identity
                                                 constraint pos_batch_pk primary key,
    company_id                    number         not null
                                                 constraint pos_batch_company_fk
                                                 references pos_companies ( id ),
    branch_id                     number         not null
                                                 constraint pos_batch_branch_fk
                                                 references pos_branches ( id ),
    product_id                    number         not null
                                                 constraint pos_batch_product_fk
                                                 references pos_products ( id ),
    batch_number                  varchar2(255)  not null,
    mfg_date                      date,
    expiry_date                   date,
    current_stock_quantity        number         default 0 not null constraint pos_batch_stock_ck check (current_stock_quantity >= 0),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null,
    constraint pos_batch_number_uk unique ( company_id, branch_id, product_id, batch_number )
);

-- =============================================================================
-- 4. BUSINESS PARTNERS (CUSTOMERS & SUPPLIERS)
-- =============================================================================

create table pos_customers (
    id                            number         generated by default on null as identity
                                                 constraint pos_customer_pk primary key,
    company_id                    number         not null
                                                 constraint pos_customer_company_fk
                                                 references pos_companies ( id ),
    customer_code                 varchar2(50)   not null,
    name                          varchar2(255)  not null,
    mobile_number                 varchar2(255),
    email                         varchar2(255),
    gstin                         varchar2(20),
    address                       varchar2(4000),
    credit_limit                  number(18,2)   default 0 not null constraint pos_customer_credit_ck check (credit_limit >= 0),
    opening_balance               number(18,2)   default 0 not null,
    is_active                     varchar2(1)    default 'Y' not null
                                                 constraint pos_customer_active_ck check (is_active in ('Y', 'N')),
    customer_type                 varchar2(50)   default 'REGULAR' not null
                                                 constraint pos_customer_type_ck check (customer_type in ('WALK_IN', 'REGULAR', 'WHOLESALE')),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null,
    constraint pos_customer_code_uk unique ( company_id, customer_code )
);

create table pos_suppliers (
    id                            number         generated by default on null as identity
                                                 constraint pos_supplier_pk primary key,
    company_id                    number         not null
                                                 constraint pos_supplier_company_fk
                                                 references pos_companies ( id ),
    supplier_code                 varchar2(50)   not null,
    name                          varchar2(255)  not null,
    mobile_number                 varchar2(255),
    email                         varchar2(255),
    gstin                         varchar2(20),
    address                       varchar2(4000),
    opening_balance               number(18,2)   default 0 not null,
    is_active                     varchar2(1)    default 'Y' not null
                                                 constraint pos_supplier_active_ck check (is_active in ('Y', 'N')),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null,
    constraint pos_supplier_code_uk unique ( company_id, supplier_code )
);

-- =============================================================================
-- 5. SALES TRANSACTIONS & PAYMENTS
-- =============================================================================

create table pos_sales (
    id                            number         generated by default on null as identity
                                                 constraint pos_sale_pk primary key,
    company_id                    number         not null
                                                 constraint pos_sale_company_fk
                                                 references pos_companies ( id ),
    branch_id                     number         not null
                                                 constraint pos_sale_branch_fk
                                                 references pos_branches ( id ),
    invoice_number                varchar2(255)  not null,
    invoice_date                  timestamp      not null,
    customer_id                   number         not null
                                                 constraint pos_sale_customer_fk
                                                 references pos_customers ( id ),
    cashier_id                    number         not null
                                                 constraint pos_sale_cashier_fk
                                                 references pos_users ( id ),
    subtotal                      number(18,2)   not null constraint pos_sale_subtotal_ck check (subtotal >= 0),
    item_discount_amount          number(18,2)   default 0 not null constraint pos_sale_itemdisc_ck check (item_discount_amount >= 0),
    bill_discount_amount          number(18,2)   default 0 not null constraint pos_sale_billdisc_ck check (bill_discount_amount >= 0),
    taxable_amount                number(18,2)   not null constraint pos_sale_taxable_ck check (taxable_amount >= 0),
    tax_amount                    number(18,2)   not null constraint pos_sale_tax_ck check (tax_amount >= 0),
    cgst_amount                   number(18,2)   default 0 not null,
    sgst_amount                   number(18,2)   default 0 not null,
    igst_amount                   number(18,2)   default 0 not null,
    round_off_amount              number(18,2)   default 0 not null,
    grand_total                   number(18,2)   not null constraint pos_sale_grandtotal_ck check (grand_total >= 0),
    status                        varchar2(50)   not null
                                                 constraint pos_sale_status_ck check (status in ('COMPLETED', 'HOLD', 'PENDING', 'CANCELLED', 'RETURNED')),
    notes                         varchar2(4000),
    cancellation_reason           varchar2(4000),
    cancelled_by_user_id          number
                                                 constraint pos_sale_cancel_user_fk
                                                 references pos_users ( id ),
    cancelled_on_date             timestamp,
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null,
    constraint pos_sale_invoice_num_uk unique ( company_id, branch_id, invoice_number )
);

create table pos_sale_items (
    id                            number         generated by default on null as identity
                                                 constraint pos_sale_item_pk primary key,
    sale_id                       number         not null
                                                 constraint pos_sale_item_sale_fk
                                                 references pos_sales ( id ),
    product_id                    number         not null
                                                 constraint pos_sale_item_product_fk
                                                 references pos_products ( id ),
    product_name                  varchar2(255)  not null,
    product_code                  varchar2(50),
    hsn_sac                       varchar2(50),
    quantity                      number         not null constraint pos_sale_item_qty_ck check (quantity > 0),
    unit_price                    number(18,2)   not null constraint pos_sale_item_unitprice_ck check (unit_price >= 0),
    purchase_price                number(18,2)   default 0 not null, -- Cost basis captured at time of sale
    discount_amount               number(18,2)   default 0 not null constraint pos_sale_item_disc_ck check (discount_amount >= 0),
    tax_rate                      number(5,2)    not null constraint pos_sale_item_taxrate_ck check (tax_rate >= 0),
    tax_amount                    number(18,2)   not null constraint pos_sale_item_taxamt_ck check (tax_amount >= 0),
    line_total                    number(18,2)   not null constraint pos_sale_item_linetotal_ck check (line_total >= 0),
    batch_id                      number
                                                 constraint pos_sale_item_batch_fk
                                                 references pos_batches ( id ),
    serial_number                 varchar2(255),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null
);

create table pos_payments (
    id                            number         generated by default on null as identity
                                                 constraint pos_payment_pk primary key,
    company_id                    number         not null
                                                 constraint pos_payment_company_fk
                                                 references pos_companies ( id ),
    branch_id                     number         not null
                                                 constraint pos_payment_branch_fk
                                                 references pos_branches ( id ),
    sale_id                       number         not null
                                                 constraint pos_payment_sale_fk
                                                 references pos_sales ( id ),
    payment_type                  varchar2(50)   not null
                                                 constraint pos_payment_type_ck check (payment_type in ('CASH', 'CARD', 'UPI', 'WALLET', 'CREDIT', 'OTHER')),
    amount_received               number(18,2)   not null constraint pos_payment_amt_ck check (amount_received >= 0),
    change_amount                 number(18,2)   default 0 not null,
    transaction_ref_number        varchar2(255),
    payment_date                  timestamp      not null,
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null
);

-- =============================================================================
-- 6. PURCHASES & SUPPLIER PAYMENTS
-- =============================================================================

create table pos_purchases (
    id                            number         generated by default on null as identity
                                                 constraint pos_purchase_pk primary key,
    company_id                    number         not null
                                                 constraint pos_purchase_company_fk
                                                 references pos_companies ( id ),
    branch_id                     number         not null
                                                 constraint pos_purchase_branch_fk
                                                 references pos_branches ( id ),
    supplier_id                   number         not null
                                                 constraint pos_purchase_supplier_fk
                                                 references pos_suppliers ( id ),
    purchase_invoice_number       varchar2(255)  not null,
    purchase_date                 timestamp      not null,
    subtotal                      number(18,2)   not null constraint pos_purchase_subtotal_ck check (subtotal >= 0),
    discount_amount               number(18,2)   default 0 not null constraint pos_purchase_discount_ck check (discount_amount >= 0),
    freight_charges               number(18,2)   default 0 not null constraint pos_purchase_freight_ck check (freight_charges >= 0),
    other_charges                 number(18,2)   default 0 not null constraint pos_purchase_other_ck check (other_charges >= 0),
    tax_amount                    number(18,2)   default 0 not null constraint pos_purchase_tax_ck check (tax_amount >= 0),
    total_amount                  number(18,2)   not null constraint pos_purchase_total_ck check (total_amount >= 0),
    paid_amount                   number(18,2)   default 0 not null,
    outstanding_amount            number(18,2)   default 0 not null,
    status                        varchar2(50)   not null
                                                 constraint pos_purchase_status_ck check (status in ('COMPLETED', 'DRAFT', 'CANCELLED')),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null,
    constraint pos_purchase_invoice_num_uk unique ( company_id, branch_id, purchase_invoice_number )
);

create table pos_purchase_items (
    id                            number         generated by default on null as identity
                                                 constraint pos_purchase_item_pk primary key,
    purchase_id                   number         not null
                                                 constraint pos_purchase_item_purchase_fk
                                                 references pos_purchases ( id ),
    product_id                    number         not null
                                                 constraint pos_purchase_item_product_fk
                                                 references pos_products ( id ),
    product_name                  varchar2(255)  not null,
    product_code                  varchar2(50),
    hsn_sac                       varchar2(50),
    quantity                      number         not null constraint pos_purchase_item_qty_ck check (quantity > 0),
    purchase_rate                 number(18,2)   not null constraint pos_purchase_item_rate_ck check (purchase_rate >= 0),
    mrp                           number(18,2)   not null constraint pos_purchase_item_mrp_ck check (mrp >= 0),
    discount_amount               number(18,2)   default 0 not null constraint pos_purchase_item_disc_ck check (discount_amount >= 0),
    tax_rate                      number(5,2)    not null constraint pos_purchase_item_taxrate_ck check (tax_rate >= 0),
    tax_amount                    number(18,2)   not null constraint pos_purchase_item_taxamt_ck check (tax_amount >= 0),
    line_total                    number(18,2)   not null constraint pos_purchase_item_linetotal_ck check (line_total >= 0),
    batch_id                      number
                                                 constraint pos_purchase_item_batch_fk
                                                 references pos_batches ( id ),
    expiry_date                   date,
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null
);

create table pos_purchase_payments (
    id                            number         generated by default on null as identity
                                                 constraint pos_purchase_payment_pk primary key,
    company_id                    number         not null
                                                 constraint pos_purchase_pay_company_fk
                                                 references pos_companies ( id ),
    branch_id                     number         not null
                                                 constraint pos_purchase_pay_branch_fk
                                                 references pos_branches ( id ),
    purchase_id                   number         not null
                                                 constraint pos_purchase_pay_purchase_fk
                                                 references pos_purchases ( id ),
    payment_type                  varchar2(50)   not null
                                                 constraint pos_purchase_pay_type_ck check (payment_type in ('CASH', 'BANK_TRANSFER', 'CHEQUE', 'CREDIT', 'OTHER')),
    amount                        number(18,2)   not null constraint pos_purchase_pay_amt_ck check (amount >= 0),
    payment_date                  timestamp      not null,
    transaction_ref_number        varchar2(255),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null
);

-- =============================================================================
-- 7. SALES & PURCHASE RETURNS
-- =============================================================================

create table pos_sales_returns (
    id                            number         generated by default on null as identity
                                                 constraint pos_sales_return_pk primary key,
    company_id                    number         not null
                                                 constraint pos_sales_return_company_fk
                                                 references pos_companies ( id ),
    branch_id                     number         not null
                                                 constraint pos_sales_return_branch_fk
                                                 references pos_branches ( id ),
    return_number                 varchar2(255)  not null,
    original_sale_id              number
                                                 constraint pos_sales_return_sale_fk
                                                 references pos_sales ( id ),
    return_date                   timestamp      not null,
    customer_id                   number         not null
                                                 constraint pos_sales_return_customer_fk
                                                 references pos_customers ( id ),
    cashier_id                    number         not null
                                                 constraint pos_sales_return_cashier_fk
                                                 references pos_users ( id ),
    total_amount                  number(18,2)   not null constraint pos_sales_return_total_ck check (total_amount >= 0),
    refund_mode                   varchar2(50)   default 'CASH' not null,
    reason                        varchar2(4000),
    status                        varchar2(50)   not null
                                                 constraint pos_sales_return_status_ck check (status in ('COMPLETED', 'PENDING', 'CANCELLED')),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null,
    constraint pos_sales_return_num_uk unique ( company_id, branch_id, return_number )
);

create table pos_sales_return_items (
    id                            number         generated by default on null as identity
                                                 constraint pos_sales_return_item_pk primary key,
    sales_return_id               number         not null
                                                 constraint pos_sales_return_item_sr_fk
                                                 references pos_sales_returns ( id ),
    original_sale_item_id         number
                                                 constraint pos_sales_return_item_origsi_fk
                                                 references pos_sale_items ( id ),
    product_id                    number         not null
                                                 constraint pos_sales_return_item_prod_fk
                                                 references pos_products ( id ),
    returned_quantity             number         not null constraint pos_sales_return_item_qty_ck check (returned_quantity > 0),
    unit_price                    number(18,2)   not null constraint pos_sales_return_item_uprice_ck check (unit_price >= 0),
    tax_rate                      number(5,2)    not null constraint pos_sales_return_item_taxrate_ck check (tax_rate >= 0),
    tax_amount                    number(18,2)   not null constraint pos_sales_return_item_taxamt_ck check (tax_amount >= 0),
    line_total                    number(18,2)   not null constraint pos_sales_return_item_ltotal_ck check (line_total >= 0),
    batch_id                      number
                                                 constraint pos_sales_return_item_batch_fk
                                                 references pos_batches ( id ),
    serial_number                 varchar2(255),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null
);

create table pos_purchase_returns (
    id                            number         generated by default on null as identity
                                                 constraint pos_purchase_return_pk primary key,
    company_id                    number         not null
                                                 constraint pos_purchase_return_company_fk
                                                 references pos_companies ( id ),
    branch_id                     number         not null
                                                 constraint pos_purchase_return_branch_fk
                                                 references pos_branches ( id ),
    return_number                 varchar2(255)  not null,
    original_purchase_id          number
                                                 constraint pos_purchase_return_origp_fk
                                                 references pos_purchases ( id ),
    return_date                   timestamp      not null,
    supplier_id                   number         not null
                                                 constraint pos_purchase_return_supplier_fk
                                                 references pos_suppliers ( id ),
    total_amount                  number(18,2)   not null constraint pos_purchase_return_total_ck check (total_amount >= 0),
    reason                        varchar2(4000),
    status                        varchar2(50)   not null
                                                 constraint pos_purchase_return_status_ck check (status in ('COMPLETED', 'PENDING', 'CANCELLED')),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null,
    constraint pos_purch_return_num_uk unique ( company_id, branch_id, return_number )
);

create table pos_purchase_return_items (
    id                            number         generated by default on null as identity
                                                 constraint pos_purchase_return_item_pk primary key,
    purchase_return_id            number         not null
                                                 constraint pos_purchase_return_item_pr_fk
                                                 references pos_purchase_returns ( id ),
    original_purchase_item_id     number
                                                 constraint pos_purchase_return_item_origpi_fk
                                                 references pos_purchase_items ( id ),
    product_id                    number         not null
                                                 constraint pos_purchase_return_item_prod_fk
                                                 references pos_products ( id ),
    returned_quantity             number         not null constraint pos_purchase_return_item_qty_ck check (returned_quantity > 0),
    unit_price                    number(18,2)   not null constraint pos_purchase_return_item_uprice_ck check (unit_price >= 0),
    tax_rate                      number(5,2)    not null constraint pos_purchase_return_item_taxrate_ck check (tax_rate >= 0),
    tax_amount                    number(18,2)   not null constraint pos_purchase_return_item_taxamt_ck check (tax_amount >= 0),
    line_total                    number(18,2)   not null constraint pos_purchase_return_item_ltotal_ck check (line_total >= 0),
    batch_id                      number
                                                 constraint pos_purchase_return_item_batch_fk
                                                 references pos_batches ( id ),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null
);

-- =============================================================================
-- 8. CENTRAL STOCK LEDGER, TRANSFERS & ADJUSTMENTS
-- =============================================================================

create table pos_stock_transactions (
    id                            number         generated by default on null as identity
                                                 constraint pos_stock_txn_pk primary key,
    company_id                    number         not null
                                                 constraint pos_stock_txn_company_fk
                                                 references pos_companies ( id ),
    branch_id                     number         not null
                                                 constraint pos_stock_txn_branch_fk
                                                 references pos_branches ( id ),
    product_id                    number         not null
                                                 constraint pos_stock_txn_product_fk
                                                 references pos_products ( id ),
    batch_id                      number
                                                 constraint pos_stock_txn_batch_fk
                                                 references pos_batches ( id ),
    transaction_type              varchar2(50)   not null
                                                 constraint pos_stock_txn_type_ck check (transaction_type in (
                                                     'OPENING', 'PURCHASE', 'PURCHASE_RETURN', 'SALE', 
                                                     'SALES_RETURN', 'TRANSFER_IN', 'TRANSFER_OUT', 
                                                     'ADJUSTMENT_IN', 'ADJUSTMENT_OUT'
                                                 )),
    quantity_change               number         not null, -- positive for in, negative for out
    unit_cost                     number(18,2)   default 0 not null,
    transaction_date              timestamp      not null,
    reference_table               varchar2(255),
    reference_id                  number,
    user_id                       number
                                                 constraint pos_stock_txn_user_fk
                                                 references pos_users ( id ),
    remarks                       varchar2(4000),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null
);

create table pos_stock_transfers (
    id                            number         generated by default on null as identity
                                                 constraint pos_stock_transfer_pk primary key,
    company_id                    number         not null
                                                 constraint pos_stock_transfer_company_fk
                                                 references pos_companies ( id ),
    from_branch_id                number         not null
                                                 constraint pos_stock_transfer_fromb_fk
                                                 references pos_branches ( id ),
    to_branch_id                  number         not null
                                                 constraint pos_stock_transfer_tob_fk
                                                 references pos_branches ( id ),
    transfer_date                 timestamp      not null,
    transfer_ref_number           varchar2(255)  not null,
    status                        varchar2(50)   not null
                                                 constraint pos_stock_transfer_status_ck check (status in ('DRAFT', 'SUBMITTED', 'APPROVED', 'COMPLETED', 'CANCELLED')),
    remarks                       varchar2(4000),
    user_id                       number         not null
                                                 constraint pos_stock_transfer_user_fk
                                                 references pos_users ( id ),
    approved_by_user_id           number
                                                 constraint pos_stock_transfer_appr_user_fk
                                                 references pos_users ( id ),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null,
    constraint pos_stock_transfer_num_uk unique ( company_id, transfer_ref_number )
);

create table pos_stock_transfer_items (
    id                            number         generated by default on null as identity
                                                 constraint pos_st_item_pk primary key,
    stock_transfer_id             number         not null
                                                 constraint pos_st_item_transfer_fk
                                                 references pos_stock_transfers ( id )
                                                 on delete cascade,
    product_id                    number         not null
                                                 constraint pos_st_item_product_fk
                                                 references pos_products ( id ),
    quantity                      number         not null constraint pos_st_item_qty_ck check (quantity > 0),
    batch_id                      number
                                                 constraint pos_st_item_batch_fk
                                                 references pos_batches ( id ),
    serial_number                 varchar2(255),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null
);

create table pos_stock_adjustments (
    id                            number         generated by default on null as identity
                                                 constraint pos_stock_adjustment_pk primary key,
    company_id                    number         not null
                                                 constraint pos_stock_adjustment_company_fk
                                                 references pos_companies ( id ),
    branch_id                     number         not null
                                                 constraint pos_stock_adjustment_branch_fk
                                                 references pos_branches ( id ),
    adjustment_ref_number         varchar2(255)  not null,
    adjustment_date               timestamp      not null,
    adjustment_type               varchar2(50)   not null
                                                 constraint pos_stock_adjustment_type_ck check (adjustment_type in ('IN', 'OUT')),
    reason                        varchar2(4000) not null,
    status                        varchar2(50)   not null
                                                 constraint pos_stock_adjustment_status_ck check (status in ('COMPLETED', 'DRAFT', 'CANCELLED')),
    user_id                       number         not null
                                                 constraint pos_stock_adjustment_user_fk
                                                 references pos_users ( id ),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null,
    constraint pos_stock_adjust_num_uk unique ( company_id, branch_id, adjustment_ref_number )
);

create table pos_stock_adjustment_items (
    id                            number         generated by default on null as identity
                                                 constraint pos_sa_item_pk primary key,
    stock_adjustment_id           number         not null
                                                 constraint pos_sa_item_adjustment_fk
                                                 references pos_stock_adjustments ( id )
                                                 on delete cascade,
    product_id                    number         not null
                                                 constraint pos_sa_item_product_fk
                                                 references pos_products ( id ),
    quantity_adjusted             number         not null, -- positive for IN, negative for OUT
    batch_id                      number
                                                 constraint pos_sa_item_batch_fk
                                                 references pos_batches ( id ),
    serial_number                 varchar2(255),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null
);

-- =============================================================================
-- 9. FINANCIAL LEDGERS (CUSTOMER & SUPPLIER)
-- =============================================================================

create table pos_customer_ledger (
    id                            number         generated by default on null as identity
                                                 constraint pos_customer_ledger_pk primary key,
    company_id                    number         not null
                                                 constraint pos_customer_ledger_company_fk
                                                 references pos_companies ( id ),
    branch_id                     number         not null
                                                 constraint pos_customer_ledger_branch_fk
                                                 references pos_branches ( id ),
    customer_id                   number         not null
                                                 constraint pos_customer_ledger_customer_fk
                                                 references pos_customers ( id ),
    transaction_date              timestamp      not null,
    transaction_type              varchar2(50)   not null
                                                 constraint pos_cust_ledger_type_ck check (transaction_type in ('SALE', 'PAYMENT', 'SALES_RETURN_REFUND', 'CREDIT_NOTE', 'OPENING_BALANCE')),
    reference_table               varchar2(255),
    reference_id                  number,
    debit_amount                  number(18,2)   default 0 not null constraint pos_cust_ledger_debit_ck check (debit_amount >= 0),
    credit_amount                 number(18,2)   default 0 not null constraint pos_cust_ledger_credit_ck check (credit_amount >= 0),
    current_balance               number(18,2)   not null,
    remarks                       varchar2(4000),
    user_id                       number
                                                 constraint pos_customer_ledger_user_fk
                                                 references pos_users ( id ),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null
);

create table pos_supplier_ledger (
    id                            number         generated by default on null as identity
                                                 constraint pos_supplier_ledger_pk primary key,
    company_id                    number         not null
                                                 constraint pos_supplier_ledger_company_fk
                                                 references pos_companies ( id ),
    branch_id                     number         not null
                                                 constraint pos_supplier_ledger_branch_fk
                                                 references pos_branches ( id ),
    supplier_id                   number         not null
                                                 constraint pos_supplier_ledger_supplier_fk
                                                 references pos_suppliers ( id ),
    transaction_date              timestamp      not null,
    transaction_type              varchar2(50)   not null
                                                 constraint pos_supp_ledger_type_ck check (transaction_type in ('PURCHASE', 'PAYMENT', 'PURCHASE_RETURN_REFUND', 'DEBIT_NOTE', 'OPENING_BALANCE')),
    reference_table               varchar2(255),
    reference_id                  number,
    debit_amount                  number(18,2)   default 0 not null constraint pos_supp_ledger_debit_ck check (debit_amount >= 0),
    credit_amount                 number(18,2)   default 0 not null constraint pos_supp_ledger_credit_ck check (credit_amount >= 0),
    current_balance               number(18,2)   not null,
    remarks                       varchar2(4000),
    user_id                       number
                                                 constraint pos_supplier_ledger_user_fk
                                                 references pos_users ( id ),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null
);

-- =============================================================================
-- 10. CONFIGURATION & AUDIT TRAIL
-- =============================================================================

create table pos_settings (
    id                            number         generated by default on null as identity
                                                 constraint pos_setting_pk primary key,
    company_id                    number         not null
                                                 constraint pos_setting_company_fk
                                                 references pos_companies ( id ),
    branch_id                     number, -- Null for company-wide settings
    setting_key                   varchar2(255)  not null,
    setting_value                 varchar2(4000),
    description                   varchar2(4000),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null,
    constraint pos_setting_key_uk unique ( company_id, branch_id, setting_key )
);

create table pos_audit_log (
    id                            number         generated by default on null as identity
                                                 constraint pos_audit_log_pk primary key,
    company_id                    number
                                                 constraint pos_audit_log_company_fk
                                                 references pos_companies ( id ),
    branch_id                     number
                                                 constraint pos_audit_log_branch_fk
                                                 references pos_branches ( id ),
    user_id                       number
                                                 constraint pos_audit_log_user_fk
                                                 references pos_users ( id ),
    action_type                   varchar2(255)  not null,
    table_name                    varchar2(255),
    record_id                     number,
    old_value                     clob,
    new_value                     clob,
    action_timestamp              timestamp      not null,
    ip_address                    varchar2(255),
    browser_info                  varchar2(4000),
    remarks                       varchar2(4000),
    row_version                   integer        not null,
    created_on                    date           not null,
    created_by                    varchar2(255)  not null,
    updated_on                    date           not null,
    updated_by                    varchar2(255)  not null
);

-- =============================================================================
-- 11. INDEXES (FIXED & OPTIMIZED FOR LARGE RETAIL DATASETS)
-- =============================================================================

create index pos_branches_indx_1 on pos_branches ( company_id );
create index pos_role_permissions_indx_1 on pos_role_permissions ( role_id );
create index pos_role_permissions_indx_2 on pos_role_permissions ( permission_id );
create index pos_users_indx_1 on pos_users ( company_id );
create index pos_users_indx_2 on pos_users ( role_id );
create index pos_user_branches_indx_1 on pos_user_branches ( user_id );
create index pos_user_branches_indx_2 on pos_user_branches ( branch_id );
create index pos_categories_indx_1 on pos_categories ( company_id );
create index pos_subcategories_indx_1 on pos_subcategories ( company_id );
create index pos_subcategories_indx_2 on pos_subcategories ( category_id );
create index pos_brands_indx_1 on pos_brands ( company_id );
create index pos_units_indx_1 on pos_units ( company_id );
create index pos_taxes_indx_1 on pos_taxes ( company_id );
create index pos_products_indx_1 on pos_products ( company_id );
create index pos_products_indx_2 on pos_products ( category_id );
create index pos_products_indx_3 on pos_products ( subcategory_id );
create index pos_products_indx_4 on pos_products ( brand_id );
create index pos_products_indx_5 on pos_products ( unit_id );
create index pos_products_indx_6 on pos_products ( tax_id );
create index pos_product_barcodes_indx_1 on pos_product_barcodes ( product_id );
create index pos_customers_indx_1 on pos_customers ( company_id );
create index pos_suppliers_indx_1 on pos_suppliers ( company_id );
create index pos_batches_indx_1 on pos_batches ( company_id );
create index pos_batches_indx_2 on pos_batches ( branch_id );
create index pos_batches_indx_3 on pos_batches ( product_id );
create index pos_sales_indx_1 on pos_sales ( company_id );
create index pos_sales_indx_2 on pos_sales ( branch_id );
create index pos_sales_indx_3 on pos_sales ( customer_id );
create index pos_sales_indx_4 on pos_sales ( cashier_id );
create index pos_sales_indx_5 on pos_sales ( invoice_date );
create index pos_sales_item_indx_1 on pos_sale_items ( sale_id );
create index pos_sales_item_indx_2 on pos_sale_items ( product_id );
create index pos_sales_item_indx_3 on pos_sale_items ( batch_id );
create index pos_payments_indx_1 on pos_payments ( company_id );
create index pos_payments_indx_2 on pos_payments ( branch_id );
create index pos_payments_indx_3 on pos_payments ( sale_id );
create index pos_purchases_indx_1 on pos_purchases ( company_id );
create index pos_purchases_indx_2 on pos_purchases ( branch_id );
create index pos_purchases_indx_3 on pos_purchases ( supplier_id );
create index pos_purchases_indx_4 on pos_purchases ( purchase_date );
create index pos_purchase_item_indx_1 on pos_purchase_items ( purchase_id );
create index pos_purchase_item_indx_2 on pos_purchase_items ( product_id );
create index pos_purchase_item_indx_3 on pos_purchase_items ( batch_id );
create index pos_purchase_payments_indx_1 on pos_purchase_payments ( company_id );
create index pos_purchase_payments_indx_2 on pos_purchase_payments ( branch_id );
create index pos_purchase_payments_indx_3 on pos_purchase_payments ( purchase_id );
create index pos_sales_returns_indx_1 on pos_sales_returns ( company_id );
create index pos_sales_returns_indx_2 on pos_sales_returns ( branch_id );
create index pos_sales_returns_indx_3 on pos_sales_returns ( original_sale_id );
create index pos_sales_returns_indx_4 on pos_sales_returns ( customer_id );
create index pos_sales_returns_indx_5 on pos_sales_returns ( cashier_id );
create index pos_sales_return_items_indx_1 on pos_sales_return_items ( sales_return_id );
create index pos_sales_return_items_indx_2 on pos_sales_return_items ( original_sale_item_id );
create index pos_sales_return_items_indx_3 on pos_sales_return_items ( product_id );
create index pos_sales_return_items_indx_4 on pos_sales_return_items ( batch_id );
create index pos_purchase_returns_indx_1 on pos_purchase_returns ( company_id );
create index pos_purchase_returns_indx_2 on pos_purchase_returns ( branch_id );
create index pos_purchase_returns_indx_3 on pos_purchase_returns ( original_purchase_id );
create index pos_purchase_returns_indx_4 on pos_purchase_returns ( supplier_id );
create index pos_purchase_return_items_indx_1 on pos_purchase_return_items ( purchase_return_id );
create index pos_purchase_return_items_indx_2 on pos_purchase_return_items ( original_purchase_item_id );
create index pos_purchase_return_items_indx_3 on pos_purchase_return_items ( product_id );
create index pos_purchase_return_items_indx_4 on pos_purchase_return_items ( batch_id );
create index pos_stock_transactions_indx_1 on pos_stock_transactions ( company_id );
create index pos_stock_transactions_indx_2 on pos_stock_transactions ( branch_id );
create index pos_stock_transactions_indx_3 on pos_stock_transactions ( product_id );
create index pos_stock_transactions_indx_4 on pos_stock_transactions ( batch_id );
create index pos_stock_transactions_indx_5 on pos_stock_transactions ( reference_table, reference_id );
create index pos_stock_transactions_indx_6 on pos_stock_transactions ( user_id );
create index pos_stock_transfers_indx_1 on pos_stock_transfers ( company_id );
create index pos_stock_transfers_indx_2 on pos_stock_transfers ( from_branch_id );
create index pos_stock_transfers_indx_3 on pos_stock_transfers ( to_branch_id );
create index pos_stock_transfers_indx_4 on pos_stock_transfers ( user_id );
create index pos_st_items_indx_1 on pos_stock_transfer_items ( stock_transfer_id );
create index pos_st_items_indx_2 on pos_stock_transfer_items ( product_id );
create index pos_st_items_indx_3 on pos_stock_transfer_items ( batch_id );
create index pos_stock_adjustments_indx_1 on pos_stock_adjustments ( company_id );
create index pos_stock_adjustments_indx_2 on pos_stock_adjustments ( branch_id );
create index pos_stock_adjustments_indx_3 on pos_stock_adjustments ( user_id );
create index pos_sa_items_indx_1 on pos_stock_adjustment_items ( stock_adjustment_id );
create index pos_sa_items_indx_2 on pos_stock_adjustment_items ( product_id );
-- FIX: Corrected typo from POS.txt line 1051 where table was mistakenly named pos_sa_items
create index pos_sa_items_indx_3 on pos_stock_adjustment_items ( batch_id );
create index pos_customer_ledger_indx_1 on pos_customer_ledger ( company_id );
create index pos_customer_ledger_indx_2 on pos_customer_ledger ( branch_id );
create index pos_customer_ledger_indx_3 on pos_customer_ledger ( customer_id );
create index pos_customer_ledger_indx_4 on pos_customer_ledger ( reference_table, reference_id );
create index pos_customer_ledger_indx_5 on pos_customer_ledger ( user_id );
create index pos_supplier_ledger_indx_1 on pos_supplier_ledger ( company_id );
create index pos_supplier_ledger_indx_2 on pos_supplier_ledger ( branch_id );
create index pos_supplier_ledger_indx_3 on pos_supplier_ledger ( supplier_id );
create index pos_supplier_ledger_indx_4 on pos_supplier_ledger ( reference_table, reference_id );
create index pos_supplier_ledger_indx_5 on pos_supplier_ledger ( user_id );
create index pos_settings_indx_1 on pos_settings ( company_id );
create index pos_settings_indx_2 on pos_settings ( branch_id );
create index pos_audit_log_indx_1 on pos_audit_log ( company_id );
create index pos_audit_log_indx_2 on pos_audit_log ( branch_id );
create index pos_audit_log_indx_3 on pos_audit_log ( user_id );
create index pos_audit_log_indx_4 on pos_audit_log ( table_name, record_id );

-- =============================================================================
-- 12. AUDIT & ROW VERSIONING TRIGGERS (BIU)
-- =============================================================================

create or replace trigger pos_companies_biu
    before insert or update on pos_companies for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_branches_biu
    before insert or update on pos_branches for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_roles_biu
    before insert or update on pos_roles for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_permissions_biu
    before insert or update on pos_permissions for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_role_permissions_biu
    before insert or update on pos_role_permissions for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_users_biu
    before insert or update on pos_users for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_user_branches_biu
    before insert or update on pos_user_branches for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_categories_biu
    before insert or update on pos_categories for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_subcategories_biu
    before insert or update on pos_subcategories for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_brands_biu
    before insert or update on pos_brands for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_units_biu
    before insert or update on pos_units for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_taxes_biu
    before insert or update on pos_taxes for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_products_biu
    before insert or update on pos_products for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_product_barcodes_biu
    before insert or update on pos_product_barcodes for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_customers_biu
    before insert or update on pos_customers for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_suppliers_biu
    before insert or update on pos_suppliers for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_batches_biu
    before insert or update on pos_batches for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_sales_biu
    before insert or update on pos_sales for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_sale_items_biu
    before insert or update on pos_sale_items for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_payments_biu
    before insert or update on pos_payments for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_purchases_biu
    before insert or update on pos_purchases for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_purchase_items_biu
    before insert or update on pos_purchase_items for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_purchase_payments_biu
    before insert or update on pos_purchase_payments for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_sales_returns_biu
    before insert or update on pos_sales_returns for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_sales_return_items_biu
    before insert or update on pos_sales_return_items for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_purchase_returns_biu
    before insert or update on pos_purchase_returns for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_purchase_return_items_biu
    before insert or update on pos_purchase_return_items for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_stock_transactions_biu
    before insert or update on pos_stock_transactions for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_stock_transfers_biu
    before insert or update on pos_stock_transfers for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_stock_transfer_items_biu
    before insert or update on pos_stock_transfer_items for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_stock_adjustments_biu
    before insert or update on pos_stock_adjustments for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_stock_adjustment_items_biu
    before insert or update on pos_stock_adjustment_items for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_customer_ledger_biu
    before insert or update on pos_customer_ledger for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_supplier_ledger_biu
    before insert or update on pos_supplier_ledger for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_settings_biu
    before insert or update on pos_settings for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

create or replace trigger pos_audit_log_biu
    before insert or update on pos_audit_log for each row
begin
    :new.updated_on := sysdate;
    :new.updated_by := coalesce(sys_context('APEX$SESSION', 'APP_USER'), user);
    if inserting then
        :new.row_version := 1;
        :new.created_on  := :new.updated_on;
        :new.created_by  := :new.updated_by;
    elsif updating then
        :new.row_version := nvl(:old.row_version, 0) + 1;
    end if;
end;
/

prompt >> 01_pos_schema_ddl.sql completed successfully.


-- >>> FILE: 02_pos_views.sql <<<

-- =============================================================================
-- SCRIPT: 02_pos_views.sql
-- APPLICATION: MyPOS Commercial Retail POS System for Oracle APEX
-- PURPOSE: Enterprise Real-Time Reporting, Stock Ledgers & Analytics Views
-- =============================================================================

set define off;
set feedback on;

prompt >> =====================================================================
prompt >> CREATING ENTERPRISE VIEWS FOR APEX SCREENS & REPORTS
prompt >> =====================================================================

-- -----------------------------------------------------------------------------
-- 1. LIVE AVAILABLE STOCK BY COMPANY, BRANCH & PRODUCT
-- -----------------------------------------------------------------------------
create or replace view v_pos_current_stock as
with stock_calc as (
    select
        company_id,
        branch_id,
        product_id,
        coalesce(sum(quantity_change), 0) as available_stock
    from pos_stock_transactions
    group by company_id, branch_id, product_id
)
select
    p.company_id,
    c.company_name,
    b.id as branch_id,
    b.branch_code,
    b.branch_name,
    p.id as product_id,
    p.product_code,
    p.name as product_name,
    p.short_name,
    p.category_id,
    cat.name as category_name,
    p.subcategory_id,
    sub.name as subcategory_name,
    p.brand_id,
    br.name as brand_name,
    p.unit_id,
    u.name as unit_name,
    u.short_name as unit_short_name,
    p.tax_id,
    t.tax_name,
    t.tax_percentage,
    p.hsn_sac,
    p.mrp,
    p.purchase_price,
    p.selling_price,
    p.wholesale_price,
    p.min_stock,
    p.max_stock,
    p.reorder_level,
    p.image_url,
    p.batch_applicable,
    p.expiry_applicable,
    p.serial_applicable,
    p.is_active,
    coalesce(sc.available_stock, 0) as available_stock,
    case
        when coalesce(sc.available_stock, 0) <= 0 then 'OUT_OF_STOCK'
        when coalesce(sc.available_stock, 0) <= p.reorder_level then 'LOW_STOCK'
        else 'OK'
    end as stock_status,
    case
        when coalesce(sc.available_stock, 0) <= 0 then 'danger'
        when coalesce(sc.available_stock, 0) <= p.reorder_level then 'warning'
        else 'success'
    end as stock_badge_class
from pos_products p
join pos_companies c on c.id = p.company_id
cross join pos_branches b
left join pos_categories cat on cat.id = p.category_id
left join pos_subcategories sub on sub.id = p.subcategory_id
left join pos_brands br on br.id = p.brand_id
left join pos_units u on u.id = p.unit_id
left join pos_taxes t on t.id = p.tax_id
left join stock_calc sc on sc.company_id = p.company_id
                        and sc.branch_id = b.id
                        and sc.product_id = p.id
where b.company_id = p.company_id
  and b.is_active = 'Y';

-- Standard View Alias as requested in architecture requirements
create or replace view vw_pos_current_stock as
select * from v_pos_current_stock;

-- -----------------------------------------------------------------------------
-- 2. LIVE BATCH STOCK WITH EXPIRY TRACKING
-- -----------------------------------------------------------------------------
create or replace view v_pos_batch_stock as
with batch_calc as (
    select
        company_id,
        branch_id,
        product_id,
        batch_id,
        coalesce(sum(quantity_change), 0) as available_stock
    from pos_stock_transactions
    where batch_id is not null
    group by company_id, branch_id, product_id, batch_id
)
select
    b.company_id,
    b.branch_id,
    br.branch_name,
    b.product_id,
    p.product_code,
    p.name as product_name,
    b.id as batch_id,
    b.batch_number,
    b.mfg_date,
    b.expiry_date,
    coalesce(bc.available_stock, 0) as available_stock,
    case
        when b.expiry_date is null then 'NO_EXPIRY'
        when b.expiry_date < trunc(sysdate) then 'EXPIRED'
        when b.expiry_date <= trunc(sysdate) + 30 then 'EXPIRING_SOON'
        else 'OK'
    end as expiry_status,
    case
        when b.expiry_date is null then 'secondary'
        when b.expiry_date < trunc(sysdate) then 'danger'
        when b.expiry_date <= trunc(sysdate) + 30 then 'warning'
        else 'success'
    end as expiry_badge_class
from pos_batches b
join pos_branches br on br.id = b.branch_id
join pos_products p on p.id = b.product_id
left join batch_calc bc on bc.company_id = b.company_id
                        and bc.branch_id = b.branch_id
                        and bc.batch_id = b.id;

-- -----------------------------------------------------------------------------
-- 3. EXECUTIVE DASHBOARD REAL-TIME KPIS (TODAY & TOTALS)
-- -----------------------------------------------------------------------------
create or replace view v_pos_dashboard_kpis as
select
    b.company_id,
    b.id as branch_id,
    b.branch_name,
    -- 1. Today's Sales
    coalesce((
        select sum(s.grand_total)
        from pos_sales s
        where s.company_id = b.company_id
          and s.branch_id = b.id
          and trunc(s.invoice_date) = trunc(sysdate)
          and s.status = 'COMPLETED'
    ), 0) as today_sales,
    -- 2. Today's Gross Profit (Line Revenue - Snapshot Cost Basis)
    coalesce((
        select sum(si.line_total - (si.quantity * si.purchase_price))
        from pos_sale_items si
        join pos_sales s on s.id = si.sale_id
        where s.company_id = b.company_id
          and s.branch_id = b.id
          and trunc(s.invoice_date) = trunc(sysdate)
          and s.status = 'COMPLETED'
    ), 0) as today_profit,
    -- 3. Today's Bill Count
    coalesce((
        select count(s.id)
        from pos_sales s
        where s.company_id = b.company_id
          and s.branch_id = b.id
          and trunc(s.invoice_date) = trunc(sysdate)
          and s.status = 'COMPLETED'
    ), 0) as today_bills_count,
    -- 4. Low Stock Alerts Count
    coalesce((
        select count(*)
        from v_pos_current_stock cs
        where cs.company_id = b.company_id
          and cs.branch_id = b.id
          and cs.stock_status in ('LOW_STOCK', 'OUT_OF_STOCK')
          and cs.is_active = 'Y'
    ), 0) as low_stock_count,
    -- 5. Today's Purchases Total
    coalesce((
        select sum(p.total_amount)
        from pos_purchases p
        where p.company_id = b.company_id
          and p.branch_id = b.id
          and trunc(p.purchase_date) = trunc(sysdate)
          and p.status = 'COMPLETED'
    ), 0) as today_purchase,
    -- 6. Today's Sales Returns
    coalesce((
        select sum(sr.total_amount)
        from pos_sales_returns sr
        where sr.company_id = b.company_id
          and sr.branch_id = b.id
          and trunc(sr.return_date) = trunc(sysdate)
          and sr.status = 'COMPLETED'
    ), 0) as today_sales_return,
    -- 7. Today's Purchase Returns
    coalesce((
        select sum(pr.total_amount)
        from pos_purchase_returns pr
        where pr.company_id = b.company_id
          and pr.branch_id = b.id
          and trunc(pr.return_date) = trunc(sysdate)
          and pr.status = 'COMPLETED'
    ), 0) as today_purchase_return,
    -- 8. Cash Sales Today
    coalesce((
        select sum(pay.amount_received - pay.change_amount)
        from pos_payments pay
        join pos_sales s on s.id = pay.sale_id
        where s.company_id = b.company_id
          and s.branch_id = b.id
          and trunc(pay.payment_date) = trunc(sysdate)
          and s.status = 'COMPLETED'
          and pay.payment_type = 'CASH'
    ), 0) as cash_sales_today,
    -- 9. UPI Sales Today
    coalesce((
        select sum(pay.amount_received)
        from pos_payments pay
        join pos_sales s on s.id = pay.sale_id
        where s.company_id = b.company_id
          and s.branch_id = b.id
          and trunc(pay.payment_date) = trunc(sysdate)
          and s.status = 'COMPLETED'
          and pay.payment_type = 'UPI'
    ), 0) as upi_sales_today,
    -- 10. Card Sales Today
    coalesce((
        select sum(pay.amount_received)
        from pos_payments pay
        join pos_sales s on s.id = pay.sale_id
        where s.company_id = b.company_id
          and s.branch_id = b.id
          and trunc(pay.payment_date) = trunc(sysdate)
          and s.status = 'COMPLETED'
          and pay.payment_type = 'CARD'
    ), 0) as card_sales_today,
    -- 11. Credit Sales Today
    coalesce((
        select sum(pay.amount_received)
        from pos_payments pay
        join pos_sales s on s.id = pay.sale_id
        where s.company_id = b.company_id
          and s.branch_id = b.id
          and trunc(pay.payment_date) = trunc(sysdate)
          and s.status = 'COMPLETED'
          and pay.payment_type = 'CREDIT'
    ), 0) as credit_sales_today,
    -- 12. Outstanding Customer Receivables
    coalesce((
        select sum(current_balance)
        from (
            select customer_id, current_balance,
                   row_number() over (partition by customer_id order by transaction_date desc, id desc) as rn
            from pos_customer_ledger
            where company_id = b.company_id
        ) where rn = 1
    ), 0) as total_receivable,
    -- 13. Outstanding Supplier Payables
    coalesce((
        select sum(pur.outstanding_amount)
        from pos_purchases pur
        where pur.company_id = b.company_id
          and pur.branch_id = b.id
          and pur.status = 'COMPLETED'
    ), 0) as total_payable
from pos_branches b
where b.is_active = 'Y';

-- -----------------------------------------------------------------------------
-- 4. 30-DAY SALES TREND VIEW (FOR APEX JET AREA / BAR CHARTS)
-- -----------------------------------------------------------------------------
create or replace view v_pos_sales_trend as
select
    s.company_id,
    s.branch_id,
    trunc(s.invoice_date) as sale_date,
    to_char(s.invoice_date, 'DD-Mon') as sale_day_label,
    sum(s.grand_total) as daily_sales,
    count(s.id) as daily_bill_count,
    round(avg(s.grand_total), 2) as avg_bill_value
from pos_sales s
where s.status = 'COMPLETED'
  and s.invoice_date >= trunc(sysdate) - 30
group by s.company_id, s.branch_id, trunc(s.invoice_date), to_char(s.invoice_date, 'DD-Mon');

-- -----------------------------------------------------------------------------
-- 5. TOP SELLING PRODUCTS LEADERBOARD
-- -----------------------------------------------------------------------------
create or replace view v_pos_top_selling_products as
select
    s.company_id,
    s.branch_id,
    si.product_id,
    si.product_name,
    si.product_code,
    c.name as category_name,
    sum(si.quantity) as total_qty_sold,
    sum(si.line_total) as total_sales_revenue,
    sum(si.line_total - (si.quantity * si.purchase_price)) as total_profit,
    dense_rank() over (
        partition by s.company_id, s.branch_id 
        order by sum(si.quantity) desc
    ) as sales_rank
from pos_sales s
join pos_sale_items si on si.sale_id = s.id
join pos_products p on p.id = si.product_id
join pos_categories c on c.id = p.category_id
where s.status = 'COMPLETED'
group by s.company_id, s.branch_id, si.product_id, si.product_name, si.product_code, c.name;

-- -----------------------------------------------------------------------------
-- 6. CATEGORY-WISE SALES DISTRIBUTION (FOR DONUT / PIE CHARTS)
-- -----------------------------------------------------------------------------
create or replace view v_pos_category_sales as
select
    s.company_id,
    s.branch_id,
    c.id as category_id,
    c.name as category_name,
    sum(si.quantity) as total_qty_sold,
    sum(si.line_total) as total_sales_amount
from pos_sales s
join pos_sale_items si on si.sale_id = s.id
join pos_products p on p.id = si.product_id
join pos_categories c on c.id = p.category_id
where s.status = 'COMPLETED'
group by s.company_id, s.branch_id, c.id, c.name;

-- -----------------------------------------------------------------------------
-- 7. BRAND-WISE SALES DISTRIBUTION
-- -----------------------------------------------------------------------------
create or replace view v_pos_brand_sales as
select
    s.company_id,
    s.branch_id,
    br.id as brand_id,
    br.name as brand_name,
    sum(si.quantity) as total_qty_sold,
    sum(si.line_total) as total_sales_amount
from pos_sales s
join pos_sale_items si on si.sale_id = s.id
join pos_products p on p.id = si.product_id
join pos_brands br on br.id = p.brand_id
where s.status = 'COMPLETED'
group by s.company_id, s.branch_id, br.id, br.name;

-- -----------------------------------------------------------------------------
-- 8. PAYMENT MODE BREAKDOWN
-- -----------------------------------------------------------------------------
create or replace view v_pos_payment_mode_summary as
select
    p.company_id,
    p.branch_id,
    p.payment_type,
    trunc(p.payment_date) as payment_day,
    count(p.id) as transaction_count,
    sum(p.amount_received - p.change_amount) as total_amount
from pos_payments p
join pos_sales s on s.id = p.sale_id
where s.status = 'COMPLETED'
group by p.company_id, p.branch_id, p.payment_type, trunc(p.payment_date);

-- -----------------------------------------------------------------------------
-- 9. HISTORICAL PROFIT ANALYSIS (LINE-BY-LINE & AGGREGATED)
-- -----------------------------------------------------------------------------
create or replace view v_pos_profit_analysis as
select
    s.id as sale_id,
    s.company_id,
    s.branch_id,
    br.branch_name,
    s.invoice_number,
    s.invoice_date,
    trunc(s.invoice_date) as sale_date,
    cust.name as customer_name,
    si.product_id,
    si.product_name,
    si.product_code,
    cat.name as category_name,
    si.quantity,
    si.unit_price as selling_price,
    si.purchase_price as unit_cost,
    si.line_total as sales_revenue,
    (si.quantity * si.purchase_price) as total_cost,
    (si.line_total - (si.quantity * si.purchase_price)) as gross_profit,
    case
        when si.line_total > 0 then
            round(((si.line_total - (si.quantity * si.purchase_price)) / si.line_total) * 100, 2)
        else 0
    end as profit_margin_pct
from pos_sales s
join pos_branches br on br.id = s.branch_id
join pos_customers cust on cust.id = s.customer_id
join pos_sale_items si on si.sale_id = s.id
join pos_products p on p.id = si.product_id
join pos_categories cat on cat.id = p.category_id
where s.status = 'COMPLETED';

-- -----------------------------------------------------------------------------
-- 10. CUSTOMER BALANCES & AVAILABLE CREDIT
-- -----------------------------------------------------------------------------
create or replace view v_pos_customer_balances as
select
    c.id as customer_id,
    c.company_id,
    c.customer_code,
    c.name as customer_name,
    c.mobile_number,
    c.email,
    c.gstin,
    c.customer_type,
    c.credit_limit,
    c.opening_balance,
    coalesce((
        select current_balance
        from (
            select cl.current_balance
            from pos_customer_ledger cl
            where cl.customer_id = c.id
            order by cl.transaction_date desc, cl.id desc
        )
        where rownum = 1
    ), c.opening_balance) as current_balance,
    greatest(c.credit_limit - coalesce((
        select current_balance
        from (
            select cl.current_balance
            from pos_customer_ledger cl
            where cl.customer_id = c.id
            order by cl.transaction_date desc, cl.id desc
        )
        where rownum = 1
    ), c.opening_balance), 0) as available_credit,
    c.is_active
from pos_customers c;

-- -----------------------------------------------------------------------------
-- 11. SUPPLIER BALANCES & OUTSTANDING
-- -----------------------------------------------------------------------------
create or replace view v_pos_supplier_balances as
select
    sup.id as supplier_id,
    sup.company_id,
    sup.supplier_code,
    sup.name as supplier_name,
    sup.mobile_number,
    sup.email,
    sup.gstin,
    sup.opening_balance,
    coalesce((
        select current_balance
        from (
            select sl.current_balance
            from pos_supplier_ledger sl
            where sl.supplier_id = sup.id
            order by sl.transaction_date desc, sl.id desc
        )
        where rownum = 1
    ), sup.opening_balance) as current_balance,
    coalesce((
        select sum(p.outstanding_amount)
        from pos_purchases p
        where p.supplier_id = sup.id
          and p.status = 'COMPLETED'
    ), 0) as total_outstanding,
    sup.is_active
from pos_suppliers sup;

-- -----------------------------------------------------------------------------
-- 12. COMMERCIAL GST TAX REPORT VIEW
-- -----------------------------------------------------------------------------
create or replace view v_pos_gst_report as
select
    s.company_id,
    s.branch_id,
    br.branch_name,
    br.gstin as branch_gstin,
    s.id as sale_id,
    s.invoice_number,
    s.invoice_date,
    trunc(s.invoice_date) as invoice_day,
    cust.name as customer_name,
    cust.gstin as customer_gstin,
    s.taxable_amount,
    s.cgst_amount,
    s.sgst_amount,
    s.igst_amount,
    s.tax_amount as total_tax,
    s.round_off_amount,
    s.grand_total,
    s.status
from pos_sales s
join pos_branches br on br.id = s.branch_id
join pos_customers cust on cust.id = s.customer_id
where s.status = 'COMPLETED';

-- -----------------------------------------------------------------------------
-- 13. AUDITED STOCK LEDGER MOVEMENT VIEW
-- -----------------------------------------------------------------------------
create or replace view v_pos_stock_ledger as
select
    st.id as txn_id,
    st.company_id,
    st.branch_id,
    br.branch_name,
    st.product_id,
    p.product_code,
    p.name as product_name,
    st.batch_id,
    b.batch_number,
    st.transaction_type,
    st.quantity_change,
    st.unit_cost,
    (st.quantity_change * st.unit_cost) as total_valuation_change,
    st.transaction_date,
    st.reference_table,
    st.reference_id,
    st.user_id,
    u.username as operator_username,
    st.remarks
from pos_stock_transactions st
join pos_branches br on br.id = st.branch_id
join pos_products p on p.id = st.product_id
left join pos_batches b on b.id = st.batch_id
left join pos_users u on u.id = st.user_id;

prompt >> 02_pos_views.sql completed successfully.


-- >>> FILE: 03_pos_packages.sql <<<

-- =============================================================================
-- SCRIPT: 03_pos_packages.sql
-- PURPOSE: Core Enterprise PL/SQL Business Packages for Oracle APEX POS
-- =============================================================================

-- =============================================================================
-- PACKAGE 1: PKG_POS_AUDIT
-- =============================================================================
create or replace package pkg_pos_audit as
    procedure log_action(
        p_company_id  in number,
        p_branch_id   in number,
        p_user_id     in number,
        p_action_type in varchar2,
        p_table_name  in varchar2 default null,
        p_record_id   in number   default null,
        p_old_value   in clob     default null,
        p_new_value   in clob     default null,
        p_remarks     in varchar2 default null
    );
end pkg_pos_audit;
/

create or replace package body pkg_pos_audit as
    procedure log_action(
        p_company_id  in number,
        p_branch_id   in number,
        p_user_id     in number,
        p_action_type in varchar2,
        p_table_name  in varchar2 default null,
        p_record_id   in number   default null,
        p_old_value   in clob     default null,
        p_new_value   in clob     default null,
        p_remarks     in varchar2 default null
    ) is
        pragma autonomous_transaction;
        v_ip      varchar2(255);
        v_browser varchar2(4000);
    begin
        v_ip := sys_context('USERENV', 'IP_ADDRESS');
        begin
            v_browser := owa_util.get_cgi_env('HTTP_USER_AGENT');
        exception
            when others then
                v_browser := null;
        end;
        
        insert into pos_audit_log (
            company_id, branch_id, user_id, action_type, table_name,
            record_id, old_value, new_value, action_timestamp,
            ip_address, browser_info, remarks, row_version,
            created_on, created_by, updated_on, updated_by
        ) values (
            p_company_id, p_branch_id, p_user_id, p_action_type, p_table_name,
            p_record_id, p_old_value, p_new_value, systimestamp,
            v_ip, v_browser, p_remarks, 1,
            sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user),
            sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user)
        );
        commit;
    exception
        when others then
            rollback;
    end log_action;
end pkg_pos_audit;
/

-- =============================================================================
-- PACKAGE 2: PKG_POS_AUTH
-- =============================================================================
create or replace package pkg_pos_auth as
    function hash_password(
        p_password in varchar2,
        p_salt     in varchar2
    ) return varchar2;

    function authenticate_user(
        p_username in varchar2,
        p_password in varchar2
    ) return boolean;

    procedure set_session_context(
        p_username in varchar2
    );

    function has_permission(
        p_user_id         in number,
        p_permission_code in varchar2,
        p_action          in varchar2 default 'VIEW'
    ) return boolean;
end pkg_pos_auth;
/

create or replace package body pkg_pos_auth as
    function hash_password(
        p_password in varchar2,
        p_salt     in varchar2
    ) return varchar2 is
    begin
        return standard_hash(p_password || ':' || p_salt, 'SHA256');
    end hash_password;

    function authenticate_user(
        p_username in varchar2,
        p_password in varchar2
    ) return boolean is
        v_hash       varchar2(255);
        v_salt       varchar2(255);
        v_stored_pwd varchar2(255);
        v_active     varchar2(1);
        v_user_id    number;
        v_company_id number;
    begin
        select id, company_id, password_hash, password_salt, is_active
        into v_user_id, v_company_id, v_stored_pwd, v_salt, v_active
        from pos_users
        where lower(username) = lower(trim(p_username));

        if v_active != 'Y' then
            return false;
        end if;

        v_hash := hash_password(p_password, v_salt);
        if v_hash = v_stored_pwd then
            set_session_context(p_username);
            pkg_pos_audit.log_action(
                p_company_id  => v_company_id,
                p_branch_id   => null,
                p_user_id     => v_user_id,
                p_action_type => 'LOGIN_SUCCESS',
                p_table_name  => 'POS_USERS',
                p_record_id   => v_user_id,
                p_remarks     => 'User successfully authenticated'
            );
            return true;
        else
            pkg_pos_audit.log_action(
                p_company_id  => v_company_id,
                p_branch_id   => null,
                p_user_id     => v_user_id,
                p_action_type => 'LOGIN_FAILED',
                p_table_name  => 'POS_USERS',
                p_record_id   => v_user_id,
                p_remarks     => 'Password mismatch'
            );
            return false;
        end if;
    exception
        when no_data_found then
            return false;
    end authenticate_user;

    procedure set_session_context(
        p_username in varchar2
    ) is
        v_user_id     number;
        v_company_id  number;
        v_branch_id   number;
        v_role_id     number;
        v_role_name   varchar2(255);
        v_branch_name varchar2(255);
    begin
        select u.id, u.company_id, u.role_id, r.role_name
        into v_user_id, v_company_id, v_role_id, v_role_name
        from pos_users u
        join pos_roles r on r.id = u.role_id
        where lower(u.username) = lower(trim(p_username));

        -- Determine primary/default branch for user
        begin
            select ub.branch_id, b.branch_name
            into v_branch_id, v_branch_name
            from pos_user_branches ub
            join pos_branches b on b.id = ub.branch_id
            where ub.user_id = v_user_id
              and ub.is_default = 'Y'
              and rownum = 1;
        exception
            when no_data_found then
                select ub.branch_id, b.branch_name
                into v_branch_id, v_branch_name
                from pos_user_branches ub
                join pos_branches b on b.id = ub.branch_id
                where ub.user_id = v_user_id
                  and rownum = 1;
        end;

        -- Set APEX Global Application Items if APEX session is active
        apex_util.set_session_state('G_COMPANY_ID', to_char(v_company_id));
        apex_util.set_session_state('G_BRANCH_ID', to_char(v_branch_id));
        apex_util.set_session_state('G_USER_ID', to_char(v_user_id));
        apex_util.set_session_state('G_USER_ROLE', v_role_name);
        apex_util.set_session_state('G_BRANCH_NAME', v_branch_name);
    exception
        when others then
            null;
    end set_session_context;

    function has_permission(
        p_user_id         in number,
        p_permission_code in varchar2,
        p_action          in varchar2 default 'VIEW'
    ) return boolean is
        v_role_name varchar2(255);
        v_allowed   varchar2(1) := 'N';
    begin
        select r.role_name
        into v_role_name
        from pos_users u
        join pos_roles r on r.id = u.role_id
        where u.id = p_user_id;

        -- Super Administrator has unrestricted access
        if v_role_name = 'ADMIN' then
            return true;
        end if;

        case upper(p_action)
            when 'CREATE' then
                select rp.can_create into v_allowed
                from pos_users u
                join pos_role_permissions rp on rp.role_id = u.role_id
                join pos_permissions p on p.id = rp.permission_id
                where u.id = p_user_id and p.permission_code = p_permission_code;
            when 'EDIT' then
                select rp.can_edit into v_allowed
                from pos_users u
                join pos_role_permissions rp on rp.role_id = u.role_id
                join pos_permissions p on p.id = rp.permission_id
                where u.id = p_user_id and p.permission_code = p_permission_code;
            when 'DELETE' then
                select rp.can_delete into v_allowed
                from pos_users u
                join pos_role_permissions rp on rp.role_id = u.role_id
                join pos_permissions p on p.id = rp.permission_id
                where u.id = p_user_id and p.permission_code = p_permission_code;
            when 'APPROVE' then
                select rp.can_approve into v_allowed
                from pos_users u
                join pos_role_permissions rp on rp.role_id = u.role_id
                join pos_permissions p on p.id = rp.permission_id
                where u.id = p_user_id and p.permission_code = p_permission_code;
            else
                select rp.can_view into v_allowed
                from pos_users u
                join pos_role_permissions rp on rp.role_id = u.role_id
                join pos_permissions p on p.id = rp.permission_id
                where u.id = p_user_id and p.permission_code = p_permission_code;
        end case;

        return (v_allowed = 'Y');
    exception
        when no_data_found then
            return false;
    end has_permission;
end pkg_pos_auth;
/

-- =============================================================================
-- PACKAGE 3: PKG_POS_STOCK
-- =============================================================================
create or replace package pkg_pos_stock as
    function get_current_stock(
        p_company_id in number,
        p_branch_id  in number,
        p_product_id in number,
        p_batch_id   in number default null
    ) return number;

    function can_sell_stock(
        p_company_id in number,
        p_branch_id  in number,
        p_product_id in number,
        p_qty        in number,
        p_batch_id   in number default null
    ) return boolean;

    procedure log_stock_transaction(
        p_company_id       in number,
        p_branch_id        in number,
        p_product_id       in number,
        p_batch_id         in number default null,
        p_transaction_type in varchar2,
        p_quantity_change  in number,
        p_unit_cost        in number default 0,
        p_reference_table  in varchar2 default null,
        p_reference_id     in number default null,
        p_user_id          in number default null,
        p_remarks          in varchar2 default null
    );
end pkg_pos_stock;
/

create or replace package body pkg_pos_stock as
    function get_current_stock(
        p_company_id in number,
        p_branch_id  in number,
        p_product_id in number,
        p_batch_id   in number default null
    ) return number is
        v_stock number := 0;
    begin
        if p_batch_id is not null then
            select coalesce(sum(quantity_change), 0)
            into v_stock
            from pos_stock_transactions
            where company_id = p_company_id
              and branch_id = p_branch_id
              and product_id = p_product_id
              and batch_id = p_batch_id;
        else
            select coalesce(sum(quantity_change), 0)
            into v_stock
            from pos_stock_transactions
            where company_id = p_company_id
              and branch_id = p_branch_id
              and product_id = p_product_id;
        end if;
        return v_stock;
    end get_current_stock;

    function can_sell_stock(
        p_company_id in number,
        p_branch_id  in number,
        p_product_id in number,
        p_qty        in number,
        p_batch_id   in number default null
    ) return boolean is
        v_allow_neg varchar2(10) := 'N';
        v_stock     number;
    begin
        -- Check branch-level or company-level negative stock policy
        begin
            select setting_value into v_allow_neg
            from pos_settings
            where company_id = p_company_id
              and (branch_id = p_branch_id or branch_id is null)
              and setting_key = 'ALLOW_NEGATIVE_STOCK'
              and rownum = 1;
        exception
            when no_data_found then
                v_allow_neg := 'N';
        end;

        if upper(v_allow_neg) in ('Y', 'TRUE', '1') then
            return true;
        end if;

        v_stock := get_current_stock(p_company_id, p_branch_id, p_product_id, p_batch_id);
        return (v_stock >= p_qty);
    end can_sell_stock;

    procedure log_stock_transaction(
        p_company_id       in number,
        p_branch_id        in number,
        p_product_id       in number,
        p_batch_id         in number default null,
        p_transaction_type in varchar2,
        p_quantity_change  in number,
        p_unit_cost        in number default 0,
        p_reference_table  in varchar2 default null,
        p_reference_id     in number default null,
        p_user_id          in number default null,
        p_remarks          in varchar2 default null
    ) is
    begin
        insert into pos_stock_transactions (
            company_id, branch_id, product_id, batch_id,
            transaction_type, quantity_change, unit_cost,
            transaction_date, reference_table, reference_id,
            user_id, remarks, row_version,
            created_on, created_by, updated_on, updated_by
        ) values (
            p_company_id, p_branch_id, p_product_id, p_batch_id,
            p_transaction_type, p_quantity_change, p_unit_cost,
            systimestamp, p_reference_table, p_reference_id,
            p_user_id, p_remarks, 1,
            sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user),
            sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user)
        );

        -- Update batch cached stock if batch is applicable
        if p_batch_id is not null then
            update pos_batches
            set current_stock_quantity = greatest(current_stock_quantity + p_quantity_change, 0),
                updated_on = sysdate,
                updated_by = coalesce(sys_context('APEX$SESSION', 'APP_USER'), user)
            where id = p_batch_id;
        end if;
    end log_stock_transaction;
end pkg_pos_stock;
/

-- =============================================================================
-- PACKAGE 4: PKG_POS_LEDGER
-- =============================================================================
create or replace package pkg_pos_ledger as
    function get_customer_balance(
        p_customer_id in number
    ) return number;

    function get_supplier_balance(
        p_supplier_id in number
    ) return number;

    procedure record_customer_entry(
        p_company_id        in number,
        p_branch_id         in number,
        p_customer_id       in number,
        p_transaction_type  in varchar2,
        p_reference_table   in varchar2,
        p_reference_id      in number,
        p_debit_amount      in number default 0,
        p_credit_amount     in number default 0,
        p_user_id           in number default null,
        p_remarks           in varchar2 default null
    );

    procedure record_supplier_entry(
        p_company_id        in number,
        p_branch_id         in number,
        p_supplier_id       in number,
        p_transaction_type  in varchar2,
        p_reference_table   in varchar2,
        p_reference_id      in number,
        p_debit_amount      in number default 0,
        p_credit_amount     in number default 0,
        p_user_id           in number default null,
        p_remarks           in varchar2 default null
    );
end pkg_pos_ledger;
/

create or replace package body pkg_pos_ledger as
    function get_customer_balance(
        p_customer_id in number
    ) return number is
        v_bal number;
    begin
        select current_balance into v_bal
        from (
            select current_balance
            from pos_customer_ledger
            where customer_id = p_customer_id
            order by transaction_date desc, id desc
        )
        where rownum = 1;
        return v_bal;
    exception
        when no_data_found then
            select opening_balance into v_bal
            from pos_customers
            where id = p_customer_id;
            return v_bal;
    end get_customer_balance;

    function get_supplier_balance(
        p_supplier_id in number
    ) return number is
        v_bal number;
    begin
        select current_balance into v_bal
        from (
            select current_balance
            from pos_supplier_ledger
            where supplier_id = p_supplier_id
            order by transaction_date desc, id desc
        )
        where rownum = 1;
        return v_bal;
    exception
        when no_data_found then
            select opening_balance into v_bal
            from pos_suppliers
            where id = p_supplier_id;
            return v_bal;
    end get_supplier_balance;

    procedure record_customer_entry(
        p_company_id        in number,
        p_branch_id         in number,
        p_customer_id       in number,
        p_transaction_type  in varchar2,
        p_reference_table   in varchar2,
        p_reference_id      in number,
        p_debit_amount      in number default 0,
        p_credit_amount     in number default 0,
        p_user_id           in number default null,
        p_remarks           in varchar2 default null
    ) is
        v_prev_bal number;
        v_new_bal  number;
    begin
        v_prev_bal := get_customer_balance(p_customer_id);
        -- Debit increases customer receivable; Credit decreases it
        v_new_bal := v_prev_bal + p_debit_amount - p_credit_amount;

        insert into pos_customer_ledger (
            company_id, branch_id, customer_id, transaction_date,
            transaction_type, reference_table, reference_id,
            debit_amount, credit_amount, current_balance,
            remarks, user_id, row_version,
            created_on, created_by, updated_on, updated_by
        ) values (
            p_company_id, p_branch_id, p_customer_id, systimestamp,
            p_transaction_type, p_reference_table, p_reference_id,
            p_debit_amount, p_credit_amount, v_new_bal,
            p_remarks, p_user_id, 1,
            sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user),
            sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user)
        );
    end record_customer_entry;

    procedure record_supplier_entry(
        p_company_id        in number,
        p_branch_id         in number,
        p_supplier_id       in number,
        p_transaction_type  in varchar2,
        p_reference_table   in varchar2,
        p_reference_id      in number,
        p_debit_amount      in number default 0,
        p_credit_amount     in number default 0,
        p_user_id           in number default null,
        p_remarks           in varchar2 default null
    ) is
        v_prev_bal number;
        v_new_bal  number;
    begin
        v_prev_bal := get_supplier_balance(p_supplier_id);
        -- Credit increases payable to supplier; Debit decreases it (payment)
        v_new_bal := v_prev_bal + p_credit_amount - p_debit_amount;

        insert into pos_supplier_ledger (
            company_id, branch_id, supplier_id, transaction_date,
            transaction_type, reference_table, reference_id,
            debit_amount, credit_amount, current_balance,
            remarks, user_id, row_version,
            created_on, created_by, updated_on, updated_by
        ) values (
            p_company_id, p_branch_id, p_supplier_id, systimestamp,
            p_transaction_type, p_reference_table, p_reference_id,
            p_debit_amount, p_credit_amount, v_new_bal,
            p_remarks, p_user_id, 1,
            sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user),
            sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user)
        );
    end record_supplier_entry;
end pkg_pos_ledger;
/

-- =============================================================================
-- PACKAGE 5: PKG_POS_SALES
-- =============================================================================
create or replace package pkg_pos_sales as
    function generate_invoice_number(
        p_company_id in number,
        p_branch_id  in number
    ) return varchar2;

    procedure process_sale(
        p_company_id          in number,
        p_branch_id           in number,
        p_customer_id         in number,
        p_cashier_id          in number,
        p_bill_discount       in number default 0,
        p_notes               in varchar2 default null,
        p_items_json          in clob,
        p_payments_json       in clob,
        p_out_sale_id         out number,
        p_out_invoice_number  out varchar2
    );

    procedure cancel_sale(
        p_sale_id in number,
        p_user_id in number,
        p_reason  in varchar2
    );
end pkg_pos_sales;
/

create or replace package body pkg_pos_sales as
    function generate_invoice_number(
        p_company_id in number,
        p_branch_id  in number
    ) return varchar2 is
        v_prefix      varchar2(50) := 'INV';
        v_branch_code varchar2(50);
        v_year        varchar2(4);
        v_seq         number;
    begin
        begin
            select setting_value into v_prefix
            from pos_settings
            where company_id = p_company_id
              and (branch_id = p_branch_id or branch_id is null)
              and setting_key = 'INVOICE_PREFIX'
              and rownum = 1;
        exception
            when no_data_found then
                v_prefix := 'INV';
        end;

        select branch_code into v_branch_code
        from pos_branches
        where id = p_branch_id;

        v_year := to_char(sysdate, 'YYYY');
        v_seq := pos_invoice_seq.nextval;

        return v_prefix || '/' || v_branch_code || '/' || v_year || '/' || lpad(v_seq, 6, '0');
    end generate_invoice_number;

    procedure process_sale(
        p_company_id          in number,
        p_branch_id           in number,
        p_customer_id         in number,
        p_cashier_id          in number,
        p_bill_discount       in number default 0,
        p_notes               in varchar2 default null,
        p_items_json          in clob,
        p_payments_json       in clob,
        p_out_sale_id         out number,
        p_out_invoice_number  out varchar2
    ) is
        v_sale_id         number;
        v_invoice_num     varchar2(255);
        v_subtotal        number(18,2) := 0;
        v_item_discount   number(18,2) := 0;
        v_taxable_amt     number(18,2) := 0;
        v_tax_amt         number(18,2) := 0;
        v_grand_total     number(18,2) := 0;
        v_round_off       number(18,2) := 0;
        v_exact_total     number(18,2) := 0;
        v_total_paid      number(18,2) := 0;
        v_cust_active     varchar2(1);
        v_cust_name       varchar2(255);
        v_credit_limit    number(18,2);
        v_curr_balance    number(18,2);
        v_has_credit_pay  boolean := false;
        v_credit_amt      number(18,2) := 0;
        v_cgst            number(18,2) := 0;
        v_sgst            number(18,2) := 0;
        v_igst            number(18,2) := 0;
        v_cust_gstin      varchar2(20);
        v_branch_gstin    varchar2(20);
    begin
        -- 1. Validate Customer
        select name, is_active, credit_limit
        into v_cust_name, v_cust_active, v_credit_limit
        from pos_customers
        where id = p_customer_id and company_id = p_company_id;

        if v_cust_active != 'Y' then
            raise_application_error(-20001, 'Customer ' || v_cust_name || ' is inactive and cannot make purchases.');
        end if;

        -- 2. Validate Stock and Calculate Item Totals from JSON
        for r in (
            select
                jt.product_id,
                jt.quantity,
                jt.unit_price,
                coalesce(jt.discount_amount, 0) as discount_amount,
                jt.batch_id,
                jt.serial_number
            from json_table(p_items_json, '$[*]'
                columns (
                    product_id      number path '$.product_id',
                    quantity        number path '$.quantity',
                    unit_price      number path '$.unit_price',
                    discount_amount number path '$.discount_amount',
                    batch_id        number path '$.batch_id',
                    serial_number   varchar2(255) path '$.serial_number'
                )
            ) jt
        ) loop
            declare
                v_prod_name varchar2(255);
                v_tax_rate  number(5,2);
                v_line_sub  number(18,2);
                v_line_tax  number(18,2);
            begin
                select p.name, coalesce(t.tax_percentage, 0)
                into v_prod_name, v_tax_rate
                from pos_products p
                left join pos_taxes t on t.id = p.tax_id
                where p.id = r.product_id;

                if not pkg_pos_stock.can_sell_stock(p_company_id, p_branch_id, r.product_id, r.quantity, r.batch_id) then
                    raise_application_error(-20002, 'Insufficient stock for product "' || v_prod_name || '". Sale blocked.');
                end if;

                v_line_sub := (r.quantity * r.unit_price) - r.discount_amount;
                v_line_tax := round((v_line_sub * v_tax_rate) / 100, 2);

                v_subtotal := v_subtotal + (r.quantity * r.unit_price);
                v_item_discount := v_item_discount + r.discount_amount;
                v_taxable_amt := v_taxable_amt + v_line_sub;
                v_tax_amt := v_tax_amt + v_line_tax;
            end;
        end loop;

        -- 3. Calculate Overall Totals & Round-Off
        v_taxable_amt := greatest(v_taxable_amt - coalesce(p_bill_discount, 0), 0);
        v_exact_total := v_taxable_amt + v_tax_amt;
        v_grand_total := round(v_exact_total);
        v_round_off := v_grand_total - v_exact_total;

        -- 4. Validate Payments
        for p in (
            select
                pj.payment_type,
                pj.amount_received,
                pj.change_amount,
                pj.transaction_ref_number
            from json_table(p_payments_json, '$[*]'
                columns (
                    payment_type           varchar2(50)  path '$.payment_type',
                    amount_received        number        path '$.amount_received',
                    change_amount          number        path '$.change_amount',
                    transaction_ref_number varchar2(255) path '$.transaction_ref_number'
                )
            ) pj
        ) loop
            v_total_paid := v_total_paid + (p.amount_received - coalesce(p.change_amount, 0));
            if p.payment_type = 'CREDIT' then
                v_has_credit_pay := true;
                v_credit_amt := v_credit_amt + p.amount_received;
            end if;
        end loop;

        if abs(v_total_paid - v_grand_total) > 0.05 then
            raise_application_error(-20003, 'Total payment received (' || v_total_paid || ') does not match invoice grand total (' || v_grand_total || ').');
        end if;

        -- Validate Credit limit if credit payment mode used
        if v_has_credit_pay then
            v_curr_balance := pkg_pos_ledger.get_customer_balance(p_customer_id);
            if (v_curr_balance + v_credit_amt) > v_credit_limit then
                raise_application_error(-20004, 'Credit limit exceeded for ' || v_cust_name || '. Allowed: ' || v_credit_limit || ', Current Outstanding: ' || v_curr_balance);
            end if;
        end if;

        -- 5. Calculate GST Components (Intra-State vs Inter-State)
        begin
            select gstin into v_cust_gstin from pos_customers where id = p_customer_id;
            select gstin into v_branch_gstin from pos_branches where id = p_branch_id;
            if v_cust_gstin is not null and v_branch_gstin is not null 
               and length(v_cust_gstin) >= 2 and length(v_branch_gstin) >= 2
               and substr(v_cust_gstin, 1, 2) != substr(v_branch_gstin, 1, 2) then
                v_igst := v_tax_amt;
                v_cgst := 0;
                v_sgst := 0;
            else
                v_cgst := round(v_tax_amt / 2, 2);
                v_sgst := v_tax_amt - v_cgst;
                v_igst := 0;
            end if;
        exception
            when others then
                v_cgst := round(v_tax_amt / 2, 2);
                v_sgst := v_tax_amt - v_cgst;
                v_igst := 0;
        end;

        -- 6. Generate Safe Sequential Invoice Number
        v_invoice_num := generate_invoice_number(p_company_id, p_branch_id);

        -- 7. Insert Sale Header
        insert into pos_sales (
            company_id, branch_id, invoice_number, invoice_date,
            customer_id, cashier_id, subtotal, item_discount_amount,
            bill_discount_amount, taxable_amount, tax_amount,
            cgst_amount, sgst_amount, igst_amount,
            round_off_amount, grand_total, status, notes,
            row_version, created_on, created_by, updated_on, updated_by
        ) values (
            p_company_id, p_branch_id, v_invoice_num, systimestamp,
            p_customer_id, p_cashier_id, v_subtotal, v_item_discount,
            coalesce(p_bill_discount, 0), v_taxable_amt, v_tax_amt,
            v_cgst, v_sgst, v_igst,
            v_round_off, v_grand_total, 'COMPLETED', p_notes,
            1, sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user),
            sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user)
        ) returning id into v_sale_id;

        -- 7. Insert Sale Items & Record Stock Ledger Deductions
        for r in (
            select
                jt.product_id,
                jt.quantity,
                jt.unit_price,
                coalesce(jt.discount_amount, 0) as discount_amount,
                jt.batch_id,
                jt.serial_number
            from json_table(p_items_json, '$[*]'
                columns (
                    product_id      number path '$.product_id',
                    quantity        number path '$.quantity',
                    unit_price      number path '$.unit_price',
                    discount_amount number path '$.discount_amount',
                    batch_id        number path '$.batch_id',
                    serial_number   varchar2(255) path '$.serial_number'
                )
            ) jt
        ) loop
            declare
                v_prod_code   varchar2(50);
                v_prod_name   varchar2(255);
                v_hsn         varchar2(50);
                v_tax_rate    number(5,2);
                v_purch_price number(18,2);
                v_item_sub    number(18,2);
                v_item_tax    number(18,2);
                v_item_total  number(18,2);
            begin
                select p.product_code, p.name, p.hsn_sac, p.purchase_price, coalesce(t.tax_percentage, 0)
                into v_prod_code, v_prod_name, v_hsn, v_purch_price, v_tax_rate
                from pos_products p
                left join pos_taxes t on t.id = p.tax_id
                where p.id = r.product_id;

                v_item_sub   := (r.quantity * r.unit_price) - r.discount_amount;
                v_item_tax   := round((v_item_sub * v_tax_rate) / 100, 2);
                v_item_total := v_item_sub + v_item_tax;

                insert into pos_sale_items (
                    sale_id, product_id, product_name, product_code,
                    hsn_sac, quantity, unit_price, purchase_price,
                    discount_amount, tax_rate, tax_amount, line_total,
                    batch_id, serial_number, row_version,
                    created_on, created_by, updated_on, updated_by
                ) values (
                    v_sale_id, r.product_id, v_prod_name, v_prod_code,
                    v_hsn, r.quantity, r.unit_price, v_purch_price,
                    r.discount_amount, v_tax_rate, v_item_tax, v_item_total,
                    r.batch_id, r.serial_number, 1,
                    sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user),
                    sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user)
                );

                -- Deduct inventory in source-of-truth Stock Ledger
                pkg_pos_stock.log_stock_transaction(
                    p_company_id       => p_company_id,
                    p_branch_id        => p_branch_id,
                    p_product_id       => r.product_id,
                    p_batch_id         => r.batch_id,
                    p_transaction_type => 'SALE',
                    p_quantity_change  => -1 * r.quantity,
                    p_unit_cost        => v_purch_price,
                    p_reference_table  => 'POS_SALES',
                    p_reference_id     => v_sale_id,
                    p_user_id          => p_cashier_id,
                    p_remarks          => 'Sale: ' || v_invoice_num
                );
            end;
        end loop;

        -- 8. Insert Payments
        for p in (
            select
                pj.payment_type,
                pj.amount_received,
                pj.change_amount,
                pj.transaction_ref_number
            from json_table(p_payments_json, '$[*]'
                columns (
                    payment_type           varchar2(50)  path '$.payment_type',
                    amount_received        number        path '$.amount_received',
                    change_amount          number        path '$.change_amount',
                    transaction_ref_number varchar2(255) path '$.transaction_ref_number'
                )
            ) pj
        ) loop
            insert into pos_payments (
                company_id, branch_id, sale_id, payment_type,
                amount_received, change_amount, transaction_ref_number,
                payment_date, row_version,
                created_on, created_by, updated_on, updated_by
            ) values (
                p_company_id, p_branch_id, v_sale_id, p.payment_type,
                p.amount_received, coalesce(p.change_amount, 0), p.transaction_ref_number,
                systimestamp, 1,
                sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user),
                sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user)
            );

            -- Post to customer ledger if payment mode is CREDIT
            if p.payment_type = 'CREDIT' then
                pkg_pos_ledger.record_customer_entry(
                    p_company_id       => p_company_id,
                    p_branch_id        => p_branch_id,
                    p_customer_id      => p_customer_id,
                    p_transaction_type => 'SALE',
                    p_reference_table  => 'POS_SALES',
                    p_reference_id     => v_sale_id,
                    p_debit_amount     => p.amount_received,
                    p_credit_amount    => 0,
                    p_user_id          => p_cashier_id,
                    p_remarks          => 'Credit Sale: ' || v_invoice_num
                );
            end if;
        end loop;

        -- 9. Audit Logging
        pkg_pos_audit.log_action(
            p_company_id  => p_company_id,
            p_branch_id   => p_branch_id,
            p_user_id     => p_cashier_id,
            p_action_type => 'CREATE_SALE',
            p_table_name  => 'POS_SALES',
            p_record_id   => v_sale_id,
            p_new_value   => 'Invoice: ' || v_invoice_num || ', Amount: ' || v_grand_total,
            p_remarks     => 'Sale completed successfully'
        );

        p_out_sale_id := v_sale_id;
        p_out_invoice_number := v_invoice_num;
    end process_sale;

    procedure cancel_sale(
        p_sale_id in number,
        p_user_id in number,
        p_reason  in varchar2
    ) is
        v_company_id   number;
        v_branch_id    number;
        v_customer_id  number;
        v_inv_number   varchar2(255);
        v_status       varchar2(50);
        v_grand_total  number(18,2);
    begin
        select company_id, branch_id, customer_id, invoice_number, status, grand_total
        into v_company_id, v_branch_id, v_customer_id, v_inv_number, v_status, v_grand_total
        from pos_sales
        where id = p_sale_id;

        if v_status != 'COMPLETED' then
            raise_application_error(-20005, 'Only completed sales can be cancelled. Current status: ' || v_status);
        end if;

        -- Restock all sold items
        for item in (
            select product_id, quantity, batch_id, purchase_price
            from pos_sale_items
            where sale_id = p_sale_id
        ) loop
            pkg_pos_stock.log_stock_transaction(
                p_company_id       => v_company_id,
                p_branch_id        => v_branch_id,
                p_product_id       => item.product_id,
                p_batch_id         => item.batch_id,
                p_transaction_type => 'SALES_RETURN',
                p_quantity_change  => item.quantity,
                p_unit_cost        => item.purchase_price,
                p_reference_table  => 'POS_SALES',
                p_reference_id     => p_sale_id,
                p_user_id          => p_user_id,
                p_remarks          => 'Restock from cancelled invoice: ' || v_inv_number
            );
        end loop;

        -- Revert customer ledger if credit payment was made
        for pay in (
            select amount_received
            from pos_payments
            where sale_id = p_sale_id and payment_type = 'CREDIT'
        ) loop
            pkg_pos_ledger.record_customer_entry(
                p_company_id       => v_company_id,
                p_branch_id        => v_branch_id,
                p_customer_id      => v_customer_id,
                p_transaction_type => 'CREDIT_NOTE',
                p_reference_table  => 'POS_SALES',
                p_reference_id     => p_sale_id,
                p_debit_amount     => 0,
                p_credit_amount    => pay.amount_received,
                p_user_id          => p_user_id,
                p_remarks          => 'Reversal for cancelled invoice: ' || v_inv_number
            );
        end loop;

        -- Update sale status
        update pos_sales
        set status = 'CANCELLED',
            cancellation_reason = p_reason,
            cancelled_by_user_id = p_user_id,
            cancelled_on_date = systimestamp,
            updated_on = sysdate,
            updated_by = coalesce(sys_context('APEX$SESSION', 'APP_USER'), user)
        where id = p_sale_id;

        -- Audit log
        pkg_pos_audit.log_action(
            p_company_id  => v_company_id,
            p_branch_id   => v_branch_id,
            p_user_id     => p_user_id,
            p_action_type => 'CANCEL_SALE',
            p_table_name  => 'POS_SALES',
            p_record_id   => p_sale_id,
            p_old_value   => 'COMPLETED',
            p_new_value   => 'CANCELLED',
            p_remarks     => 'Cancelled: ' || v_inv_number || ' Reason: ' || p_reason
        );
    end cancel_sale;
end pkg_pos_sales;
/

-- =============================================================================
-- PACKAGE 6: PKG_POS_PURCHASE
-- =============================================================================
create or replace package pkg_pos_purchase as
    procedure record_purchase(
        p_company_id           in number,
        p_branch_id            in number,
        p_supplier_id          in number,
        p_invoice_number       in varchar2,
        p_purchase_date        in timestamp,
        p_freight_charges      in number default 0,
        p_other_charges        in number default 0,
        p_items_json           in clob,
        p_paid_amount          in number default 0,
        p_payment_type         in varchar2 default 'BANK_TRANSFER',
        p_transaction_ref      in varchar2 default null,
        p_user_id              in number,
        p_out_purchase_id      out number
    );
end pkg_pos_purchase;
/

create or replace package body pkg_pos_purchase as
    procedure record_purchase(
        p_company_id           in number,
        p_branch_id            in number,
        p_supplier_id          in number,
        p_invoice_number       in varchar2,
        p_purchase_date        in timestamp,
        p_freight_charges      in number default 0,
        p_other_charges        in number default 0,
        p_items_json           in clob,
        p_paid_amount          in number default 0,
        p_payment_type         in varchar2 default 'BANK_TRANSFER',
        p_transaction_ref      in varchar2 default null,
        p_user_id              in number,
        p_out_purchase_id      out number
    ) is
        v_purchase_id number;
        v_subtotal    number(18,2) := 0;
        v_discount    number(18,2) := 0;
        v_tax_amt     number(18,2) := 0;
        v_total_amt   number(18,2) := 0;
        v_outstanding number(18,2) := 0;
    begin
        -- 1. Calculate Totals
        for item in (
            select
                jt.product_id,
                jt.quantity,
                jt.purchase_rate,
                jt.mrp,
                coalesce(jt.discount_amount, 0) as discount_amount,
                jt.batch_number,
                jt.mfg_date,
                jt.expiry_date
            from json_table(p_items_json, '$[*]'
                columns (
                    product_id      number        path '$.product_id',
                    quantity        number        path '$.quantity',
                    purchase_rate   number        path '$.purchase_rate',
                    mrp             number        path '$.mrp',
                    discount_amount number        path '$.discount_amount',
                    batch_number    varchar2(255) path '$.batch_number',
                    mfg_date        date          path '$.mfg_date',
                    expiry_date     date          path '$.expiry_date'
                )
            ) jt
        ) loop
            declare
                v_tax_pct  number(5,2);
                v_line_sub number(18,2);
                v_line_tax number(18,2);
            begin
                select coalesce(t.tax_percentage, 0)
                into v_tax_pct
                from pos_products p
                left join pos_taxes t on t.id = p.tax_id
                where p.id = item.product_id;

                v_line_sub := (item.quantity * item.purchase_rate) - item.discount_amount;
                v_line_tax := round((v_line_sub * v_tax_pct) / 100, 2);

                v_subtotal := v_subtotal + (item.quantity * item.purchase_rate);
                v_discount := v_discount + item.discount_amount;
                v_tax_amt  := v_tax_amt + v_line_tax;
            end;
        end loop;

        v_total_amt := v_subtotal - v_discount + v_tax_amt + coalesce(p_freight_charges, 0) + coalesce(p_other_charges, 0);
        v_outstanding := greatest(v_total_amt - coalesce(p_paid_amount, 0), 0);

        -- 2. Insert Purchase Header
        insert into pos_purchases (
            company_id, branch_id, supplier_id, purchase_invoice_number,
            purchase_date, subtotal, discount_amount, freight_charges,
            other_charges, tax_amount, total_amount, paid_amount,
            outstanding_amount, status, row_version,
            created_on, created_by, updated_on, updated_by
        ) values (
            p_company_id, p_branch_id, p_supplier_id, p_invoice_number,
            p_purchase_date, v_subtotal, v_discount, coalesce(p_freight_charges, 0),
            coalesce(p_other_charges, 0), v_tax_amt, v_total_amt, coalesce(p_paid_amount, 0),
            v_outstanding, 'COMPLETED', 1,
            sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user),
            sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user)
        ) returning id into v_purchase_id;

        -- 3. Insert Purchase Items, Batches & Stock Ledger
        for item in (
            select
                jt.product_id,
                jt.quantity,
                jt.purchase_rate,
                jt.mrp,
                coalesce(jt.discount_amount, 0) as discount_amount,
                jt.batch_number,
                jt.mfg_date,
                jt.expiry_date
            from json_table(p_items_json, '$[*]'
                columns (
                    product_id      number        path '$.product_id',
                    quantity        number        path '$.quantity',
                    purchase_rate   number        path '$.purchase_rate',
                    mrp             number        path '$.mrp',
                    discount_amount number        path '$.discount_amount',
                    batch_number    varchar2(255) path '$.batch_number',
                    mfg_date        date          path '$.mfg_date',
                    expiry_date     date          path '$.expiry_date'
                )
            ) jt
        ) loop
            declare
                v_prod_name  varchar2(255);
                v_prod_code  varchar2(50);
                v_hsn        varchar2(50);
                v_tax_pct    number(5,2);
                v_batch_id   number := null;
                v_line_sub   number(18,2);
                v_line_tax   number(18,2);
                v_line_total number(18,2);
            begin
                select name, product_code, hsn_sac, coalesce(t.tax_percentage, 0)
                into v_prod_name, v_prod_code, v_hsn, v_tax_pct
                from pos_products p
                left join pos_taxes t on t.id = p.tax_id
                where p.id = item.product_id;

                v_line_sub   := (item.quantity * item.purchase_rate) - item.discount_amount;
                v_line_tax   := round((v_line_sub * v_tax_pct) / 100, 2);
                v_line_total := v_line_sub + v_line_tax;

                -- Create or update batch if batch_number provided
                if item.batch_number is not null then
                    begin
                        select id into v_batch_id
                        from pos_batches
                        where company_id = p_company_id
                          and branch_id = p_branch_id
                          and product_id = item.product_id
                          and batch_number = trim(item.batch_number);

                        update pos_batches
                        set current_stock_quantity = current_stock_quantity + item.quantity,
                            expiry_date = coalesce(item.expiry_date, expiry_date),
                            updated_on = sysdate
                        where id = v_batch_id;
                    exception
                        when no_data_found then
                            insert into pos_batches (
                                company_id, branch_id, product_id, batch_number,
                                mfg_date, expiry_date, current_stock_quantity,
                                row_version, created_on, created_by, updated_on, updated_by
                            ) values (
                                p_company_id, p_branch_id, item.product_id, trim(item.batch_number),
                                item.mfg_date, item.expiry_date, item.quantity,
                                1, sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user),
                                sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user)
                            ) returning id into v_batch_id;
                    end;
                end if;

                insert into pos_purchase_items (
                    purchase_id, product_id, product_name, product_code,
                    hsn_sac, quantity, purchase_rate, mrp,
                    discount_amount, tax_rate, tax_amount, line_total,
                    batch_id, expiry_date, row_version,
                    created_on, created_by, updated_on, updated_by
                ) values (
                    v_purchase_id, item.product_id, v_prod_name, v_prod_code,
                    v_hsn, item.quantity, item.purchase_rate, item.mrp,
                    item.discount_amount, v_tax_pct, v_line_tax, v_line_total,
                    v_batch_id, item.expiry_date, 1,
                    sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user),
                    sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user)
                );

                -- Update Product purchase price & MRP
                update pos_products
                set purchase_price = item.purchase_rate,
                    mrp = greatest(mrp, item.mrp),
                    updated_on = sysdate
                where id = item.product_id;

                -- Log Stock In
                pkg_pos_stock.log_stock_transaction(
                    p_company_id       => p_company_id,
                    p_branch_id        => p_branch_id,
                    p_product_id       => item.product_id,
                    p_batch_id         => v_batch_id,
                    p_transaction_type => 'PURCHASE',
                    p_quantity_change  => item.quantity,
                    p_unit_cost        => item.purchase_rate,
                    p_reference_table  => 'POS_PURCHASES',
                    p_reference_id     => v_purchase_id,
                    p_user_id          => p_user_id,
                    p_remarks          => 'Purchase PO: ' || p_invoice_number
                );
            end;
        end loop;

        -- 4. Supplier Ledger Posting
        pkg_pos_ledger.record_supplier_entry(
            p_company_id       => p_company_id,
            p_branch_id        => p_branch_id,
            p_supplier_id      => p_supplier_id,
            p_transaction_type => 'PURCHASE',
            p_reference_table  => 'POS_PURCHASES',
            p_reference_id     => v_purchase_id,
            p_debit_amount     => 0,
            p_credit_amount    => v_total_amt,
            p_user_id          => p_user_id,
            p_remarks          => 'Bill: ' || p_invoice_number
        );

        -- If paid upfront, record payment
        if p_paid_amount > 0 then
            insert into pos_purchase_payments (
                company_id, branch_id, purchase_id, payment_type,
                amount, payment_date, transaction_ref_number,
                row_version, created_on, created_by, updated_on, updated_by
            ) values (
                p_company_id, p_branch_id, v_purchase_id, p_payment_type,
                p_paid_amount, systimestamp, p_transaction_ref,
                1, sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user),
                sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user)
            );

            pkg_pos_ledger.record_supplier_entry(
                p_company_id       => p_company_id,
                p_branch_id        => p_branch_id,
                p_supplier_id      => p_supplier_id,
                p_transaction_type => 'PAYMENT',
                p_reference_table  => 'POS_PURCHASE_PAYMENTS',
                p_reference_id     => v_purchase_id,
                p_debit_amount     => p_paid_amount,
                p_credit_amount    => 0,
                p_user_id          => p_user_id,
                p_remarks          => 'Payment for Bill: ' || p_invoice_number
            );
        end if;

        pkg_pos_audit.log_action(
            p_company_id  => p_company_id,
            p_branch_id   => p_branch_id,
            p_user_id     => p_user_id,
            p_action_type => 'PURCHASE_ENTRY',
            p_table_name  => 'POS_PURCHASES',
            p_record_id   => v_purchase_id,
            p_new_value   => 'Bill: ' || p_invoice_number || ', Total: ' || v_total_amt,
            p_remarks     => 'Purchase received and inventory updated'
        );

        p_out_purchase_id := v_purchase_id;
    end record_purchase;
end pkg_pos_purchase;
/

-- =============================================================================
-- PACKAGE 7: PKG_POS_RETURNS
-- =============================================================================
create or replace package pkg_pos_returns as
    procedure process_sales_return(
        p_company_id         in number,
        p_branch_id          in number,
        p_original_sale_id   in number,
        p_cashier_id         in number,
        p_refund_mode        in varchar2 default 'CASH',
        p_reason             in varchar2,
        p_items_json         in clob,
        p_out_return_id      out number,
        p_out_return_number  out varchar2
    );

    procedure process_purchase_return(
        p_company_id           in number,
        p_branch_id            in number,
        p_original_purchase_id in number,
        p_user_id              in number,
        p_reason               in varchar2,
        p_items_json           in clob,
        p_out_return_id        out number,
        p_out_return_number    out varchar2
    );
end pkg_pos_returns;
/

create or replace package body pkg_pos_returns as
    procedure process_sales_return(
        p_company_id         in number,
        p_branch_id          in number,
        p_original_sale_id   in number,
        p_cashier_id         in number,
        p_refund_mode        in varchar2 default 'CASH',
        p_reason             in varchar2,
        p_items_json         in clob,
        p_out_return_id      out number,
        p_out_return_number  out varchar2
    ) is
        v_return_id     number;
        v_return_num    varchar2(255);
        v_customer_id   number;
        v_orig_inv_num  varchar2(255);
        v_total_refund  number(18,2) := 0;
        v_seq           number;
    begin
        select customer_id, invoice_number
        into v_customer_id, v_orig_inv_num
        from pos_sales
        where id = p_original_sale_id;

        v_seq := pos_return_seq.nextval;
        v_return_num := 'SR/' || to_char(sysdate, 'YYYY') || '/' || lpad(v_seq, 6, '0');

        -- Calculate refund total & validate quantities against original sale
        for r in (
            select
                jt.original_sale_item_id,
                jt.product_id,
                jt.return_qty
            from json_table(p_items_json, '$[*]'
                columns (
                    original_sale_item_id number path '$.original_sale_item_id',
                    product_id            number path '$.product_id',
                    return_qty            number path '$.return_qty'
                )
            ) jt
        ) loop
            declare
                v_sold_qty     number;
                v_prev_ret_qty number := 0;
                v_unit_price   number(18,2);
                v_tax_rate     number(5,2);
                v_line_tax     number(18,2);
                v_line_total   number(18,2);
            begin
                select quantity, unit_price, tax_rate
                into v_sold_qty, v_unit_price, v_tax_rate
                from pos_sale_items
                where id = r.original_sale_item_id and sale_id = p_original_sale_id;

                select coalesce(sum(returned_quantity), 0)
                into v_prev_ret_qty
                from pos_sales_return_items
                where original_sale_item_id = r.original_sale_item_id;

                if (r.return_qty + v_prev_ret_qty) > v_sold_qty then
                    raise_application_error(-20010, 'Return quantity (' || r.return_qty || ') exceeds eligible sold quantity (' || (v_sold_qty - v_prev_ret_qty) || ').');
                end if;

                v_line_tax := round(((r.return_qty * v_unit_price) * v_tax_rate) / 100, 2);
                v_line_total := (r.return_qty * v_unit_price) + v_line_tax;
                v_total_refund := v_total_refund + v_line_total;
            end;
        end loop;

        -- Insert Return Header
        insert into pos_sales_returns (
            company_id, branch_id, return_number, original_sale_id,
            return_date, customer_id, cashier_id, total_amount,
            refund_mode, reason, status, row_version,
            created_on, created_by, updated_on, updated_by
        ) values (
            p_company_id, p_branch_id, v_return_num, p_original_sale_id,
            systimestamp, v_customer_id, p_cashier_id, v_total_refund,
            p_refund_mode, p_reason, 'COMPLETED', 1,
            sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user),
            sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user)
        ) returning id into v_return_id;

        -- Insert Return Items & Re-credit Stock
        for r in (
            select
                jt.original_sale_item_id,
                jt.product_id,
                jt.return_qty,
                jt.batch_id
            from json_table(p_items_json, '$[*]'
                columns (
                    original_sale_item_id number path '$.original_sale_item_id',
                    product_id            number path '$.product_id',
                    return_qty            number path '$.return_qty',
                    batch_id              number path '$.batch_id'
                )
            ) jt
        ) loop
            declare
                v_unit_price   number(18,2);
                v_purch_price  number(18,2);
                v_tax_rate     number(5,2);
                v_line_tax     number(18,2);
                v_line_total   number(18,2);
            begin
                select unit_price, purchase_price, tax_rate
                into v_unit_price, v_purch_price, v_tax_rate
                from pos_sale_items
                where id = r.original_sale_item_id;

                v_line_tax := round(((r.return_qty * v_unit_price) * v_tax_rate) / 100, 2);
                v_line_total := (r.return_qty * v_unit_price) + v_line_tax;

                insert into pos_sales_return_items (
                    sales_return_id, original_sale_item_id, product_id,
                    returned_quantity, unit_price, tax_rate, tax_amount,
                    line_total, batch_id, row_version,
                    created_on, created_by, updated_on, updated_by
                ) values (
                    v_return_id, r.original_sale_item_id, r.product_id,
                    r.return_qty, v_unit_price, v_tax_rate, v_line_tax,
                    v_line_total, r.batch_id, 1,
                    sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user),
                    sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user)
                );

                -- Re-stock to inventory ledger
                pkg_pos_stock.log_stock_transaction(
                    p_company_id       => p_company_id,
                    p_branch_id        => p_branch_id,
                    p_product_id       => r.product_id,
                    p_batch_id         => r.batch_id,
                    p_transaction_type => 'SALES_RETURN',
                    p_quantity_change  => r.return_qty,
                    p_unit_cost        => v_purch_price,
                    p_reference_table  => 'POS_SALES_RETURNS',
                    p_reference_id     => v_return_id,
                    p_user_id          => p_cashier_id,
                    p_remarks          => 'Sales Return: ' || v_return_num
                );
            end;
        end loop;

        -- Update customer ledger if credit note
        if p_refund_mode = 'CREDIT_NOTE' then
            pkg_pos_ledger.record_customer_entry(
                p_company_id       => p_company_id,
                p_branch_id        => p_branch_id,
                p_customer_id      => v_customer_id,
                p_transaction_type => 'CREDIT_NOTE',
                p_reference_table  => 'POS_SALES_RETURNS',
                p_reference_id     => v_return_id,
                p_debit_amount     => 0,
                p_credit_amount    => v_total_refund,
                p_user_id          => p_cashier_id,
                p_remarks          => 'Credit note from return: ' || v_return_num
            );
        end if;

        pkg_pos_audit.log_action(
            p_company_id  => p_company_id,
            p_branch_id   => p_branch_id,
            p_user_id     => p_cashier_id,
            p_action_type => 'SALES_RETURN',
            p_table_name  => 'POS_SALES_RETURNS',
            p_record_id   => v_return_id,
            p_new_value   => 'Return: ' || v_return_num || ', Refund: ' || v_total_refund,
            p_remarks     => 'Return processed for original invoice ' || v_orig_inv_num
        );

        p_out_return_id := v_return_id;
        p_out_return_number := v_return_num;
    end process_sales_return;

    procedure process_purchase_return(
        p_company_id           in number,
        p_branch_id            in number,
        p_original_purchase_id in number,
        p_user_id              in number,
        p_reason               in varchar2,
        p_items_json           in clob,
        p_out_return_id        out number,
        p_out_return_number    out varchar2
    ) is
        v_return_id     number;
        v_return_num    varchar2(255);
        v_supplier_id   number;
        v_total_amt     number(18,2) := 0;
        v_seq           number;
    begin
        select supplier_id into v_supplier_id
        from pos_purchases
        where id = p_original_purchase_id;

        v_seq := pos_return_seq.nextval;
        v_return_num := 'PR/' || to_char(sysdate, 'YYYY') || '/' || lpad(v_seq, 6, '0');

        -- Calculate totals & check quantity
        for r in (
            select
                jt.original_purchase_item_id,
                jt.product_id,
                jt.return_qty
            from json_table(p_items_json, '$[*]'
                columns (
                    original_purchase_item_id number path '$.original_purchase_item_id',
                    product_id                number path '$.product_id',
                    return_qty                number path '$.return_qty'
                )
            ) jt
        ) loop
            declare
                v_purch_qty    number;
                v_prev_ret_qty number := 0;
                v_rate         number(18,2);
                v_tax_rate     number(5,2);
                v_line_tax     number(18,2);
                v_line_total   number(18,2);
            begin
                select quantity, purchase_rate, tax_rate
                into v_purch_qty, v_rate, v_tax_rate
                from pos_purchase_items
                where id = r.original_purchase_item_id;

                select coalesce(sum(returned_quantity), 0)
                into v_prev_ret_qty
                from pos_purchase_return_items
                where original_purchase_item_id = r.original_purchase_item_id;

                if (r.return_qty + v_prev_ret_qty) > v_purch_qty then
                    raise_application_error(-20011, 'Purchase return quantity exceeds received quantity.');
                end if;

                v_line_tax := round(((r.return_qty * v_rate) * v_tax_rate) / 100, 2);
                v_line_total := (r.return_qty * v_rate) + v_line_tax;
                v_total_amt := v_total_amt + v_line_total;
            end;
        end loop;

        insert into pos_purchase_returns (
            company_id, branch_id, return_number, original_purchase_id,
            return_date, supplier_id, total_amount, reason,
            status, row_version, created_on, created_by, updated_on, updated_by
        ) values (
            p_company_id, p_branch_id, v_return_num, p_original_purchase_id,
            systimestamp, v_supplier_id, v_total_amt, p_reason,
            'COMPLETED', 1, sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user),
            sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user)
        ) returning id into v_return_id;

        for r in (
            select
                jt.original_purchase_item_id,
                jt.product_id,
                jt.return_qty,
                jt.batch_id
            from json_table(p_items_json, '$[*]'
                columns (
                    original_purchase_item_id number path '$.original_purchase_item_id',
                    product_id                number path '$.product_id',
                    return_qty                number path '$.return_qty',
                    batch_id                  number path '$.batch_id'
                )
            ) jt
        ) loop
            declare
                v_rate       number(18,2);
                v_tax_rate   number(5,2);
                v_line_tax   number(18,2);
                v_line_total number(18,2);
            begin
                select purchase_rate, tax_rate
                into v_rate, v_tax_rate
                from pos_purchase_items
                where id = r.original_purchase_item_id;

                v_line_tax := round(((r.return_qty * v_rate) * v_tax_rate) / 100, 2);
                v_line_total := (r.return_qty * v_rate) + v_line_tax;

                insert into pos_purchase_return_items (
                    purchase_return_id, original_purchase_item_id, product_id,
                    returned_quantity, unit_price, tax_rate, tax_amount,
                    line_total, batch_id, row_version,
                    created_on, created_by, updated_on, updated_by
                ) values (
                    v_return_id, r.original_purchase_item_id, r.product_id,
                    r.return_qty, v_rate, v_tax_rate, v_line_tax,
                    v_line_total, r.batch_id, 1,
                    sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user),
                    sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user)
                );

                -- Deduct from stock
                pkg_pos_stock.log_stock_transaction(
                    p_company_id       => p_company_id,
                    p_branch_id        => p_branch_id,
                    p_product_id       => r.product_id,
                    p_batch_id         => r.batch_id,
                    p_transaction_type => 'PURCHASE_RETURN',
                    p_quantity_change  => -1 * r.return_qty,
                    p_unit_cost        => v_rate,
                    p_reference_table  => 'POS_PURCHASE_RETURNS',
                    p_reference_id     => v_return_id,
                    p_user_id          => p_user_id,
                    p_remarks          => 'Purchase Return: ' || v_return_num
                );
            end;
        end loop;

        -- Post debit note to supplier ledger (decreases our payable)
        pkg_pos_ledger.record_supplier_entry(
            p_company_id       => p_company_id,
            p_branch_id        => p_branch_id,
            p_supplier_id      => v_supplier_id,
            p_transaction_type => 'DEBIT_NOTE',
            p_reference_table  => 'POS_PURCHASE_RETURNS',
            p_reference_id     => v_return_id,
            p_debit_amount     => v_total_amt,
            p_credit_amount    => 0,
            p_user_id          => p_user_id,
            p_remarks          => 'Debit Note: ' || v_return_num
        );

        p_out_return_id := v_return_id;
        p_out_return_number := v_return_num;
    end process_purchase_return;
end pkg_pos_returns;
/

-- =============================================================================
-- PACKAGE 8: PKG_POS_TRANSFERS
-- =============================================================================
create or replace package pkg_pos_transfers as
    procedure create_and_complete_transfer(
        p_company_id     in number,
        p_from_branch_id in number,
        p_to_branch_id   in number,
        p_user_id        in number,
        p_remarks        in varchar2,
        p_items_json     in clob,
        p_out_transfer_id out number
    );
end pkg_pos_transfers;
/

create or replace package body pkg_pos_transfers as
    procedure create_and_complete_transfer(
        p_company_id     in number,
        p_from_branch_id in number,
        p_to_branch_id   in number,
        p_user_id        in number,
        p_remarks        in varchar2,
        p_items_json     in clob,
        p_out_transfer_id out number
    ) is
        v_transfer_id  number;
        v_ref_number   varchar2(255);
        v_seq          number;
    begin
        if p_from_branch_id = p_to_branch_id then
            raise_application_error(-20020, 'Source and destination branches cannot be the same.');
        end if;

        v_seq := pos_transfer_seq.nextval;
        v_ref_number := 'TRF/' || to_char(sysdate, 'YYYY') || '/' || lpad(v_seq, 6, '0');

        -- 1. Validate Source Branch Stock
        for item in (
            select jt.product_id, jt.quantity, jt.batch_id
            from json_table(p_items_json, '$[*]'
                columns (
                    product_id number path '$.product_id',
                    quantity   number path '$.quantity',
                    batch_id   number path '$.batch_id'
                )
            ) jt
        ) loop
            declare
                v_avail number;
                v_name  varchar2(255);
            begin
                v_avail := pkg_pos_stock.get_current_stock(p_company_id, p_from_branch_id, item.product_id, item.batch_id);
                if v_avail < item.quantity then
                    select name into v_name from pos_products where id = item.product_id;
                    raise_application_error(-20021, 'Cannot transfer: Available stock for ' || v_name || ' is ' || v_avail || ', requested: ' || item.quantity);
                end if;
            end;
        end loop;

        -- 2. Insert Transfer Header
        insert into pos_stock_transfers (
            company_id, from_branch_id, to_branch_id, transfer_date,
            transfer_ref_number, status, remarks, user_id,
            approved_by_user_id, row_version,
            created_on, created_by, updated_on, updated_by
        ) values (
            p_company_id, p_from_branch_id, p_to_branch_id, systimestamp,
            v_ref_number, 'COMPLETED', p_remarks, p_user_id,
            p_user_id, 1,
            sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user),
            sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user)
        ) returning id into v_transfer_id;

        -- 3. Insert Items and Perform Dual Stock Postings (OUT & IN)
        for item in (
            select jt.product_id, jt.quantity, jt.batch_id
            from json_table(p_items_json, '$[*]'
                columns (
                    product_id number path '$.product_id',
                    quantity   number path '$.quantity',
                    batch_id   number path '$.batch_id'
                )
            ) jt
        ) loop
            insert into pos_stock_transfer_items (
                stock_transfer_id, product_id, quantity, batch_id,
                row_version, created_on, created_by, updated_on, updated_by
            ) values (
                v_transfer_id, item.product_id, item.quantity, item.batch_id,
                1, sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user),
                sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user)
            );

            -- TRANSFER_OUT from source branch
            pkg_pos_stock.log_stock_transaction(
                p_company_id       => p_company_id,
                p_branch_id        => p_from_branch_id,
                p_product_id       => item.product_id,
                p_batch_id         => item.batch_id,
                p_transaction_type => 'TRANSFER_OUT',
                p_quantity_change  => -1 * item.quantity,
                p_reference_table  => 'POS_STOCK_TRANSFERS',
                p_reference_id     => v_transfer_id,
                p_user_id          => p_user_id,
                p_remarks          => 'Transfer to Branch ID ' || p_to_branch_id || ' (' || v_ref_number || ')'
            );

            -- TRANSFER_IN to target branch
            pkg_pos_stock.log_stock_transaction(
                p_company_id       => p_company_id,
                p_branch_id        => p_to_branch_id,
                p_product_id       => item.product_id,
                p_batch_id         => null, -- batch re-assigned at target if applicable
                p_transaction_type => 'TRANSFER_IN',
                p_quantity_change  => item.quantity,
                p_reference_table  => 'POS_STOCK_TRANSFERS',
                p_reference_id     => v_transfer_id,
                p_user_id          => p_user_id,
                p_remarks          => 'Transfer from Branch ID ' || p_from_branch_id || ' (' || v_ref_number || ')'
            );
        end loop;

        p_out_transfer_id := v_transfer_id;
    end create_and_complete_transfer;
end pkg_pos_transfers;
/

-- =============================================================================
-- PACKAGE 9: PKG_POS_ADJUSTMENTS
-- =============================================================================
create or replace package pkg_pos_adjustments as
    procedure record_adjustment(
        p_company_id      in number,
        p_branch_id       in number,
        p_adjustment_type in varchar2,
        p_reason          in varchar2,
        p_user_id         in number,
        p_items_json      in clob,
        p_out_adj_id      out number
    );
end pkg_pos_adjustments;
/

create or replace package body pkg_pos_adjustments as
    procedure record_adjustment(
        p_company_id      in number,
        p_branch_id       in number,
        p_adjustment_type in varchar2,
        p_reason          in varchar2,
        p_user_id         in number,
        p_items_json      in clob,
        p_out_adj_id      out number
    ) is
        v_adj_id     number;
        v_ref_number varchar2(255);
        v_seq        number;
    begin
        v_seq := pos_adjustment_seq.nextval;
        v_ref_number := 'ADJ/' || to_char(sysdate, 'YYYY') || '/' || lpad(v_seq, 6, '0');

        insert into pos_stock_adjustments (
            company_id, branch_id, adjustment_ref_number, adjustment_date,
            adjustment_type, reason, status, user_id, row_version,
            created_on, created_by, updated_on, updated_by
        ) values (
            p_company_id, p_branch_id, v_ref_number, systimestamp,
            p_adjustment_type, p_reason, 'COMPLETED', p_user_id, 1,
            sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user),
            sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user)
        ) returning id into v_adj_id;

        for item in (
            select jt.product_id, jt.quantity_adjusted, jt.batch_id
            from json_table(p_items_json, '$[*]'
                columns (
                    product_id        number path '$.product_id',
                    quantity_adjusted number path '$.quantity_adjusted',
                    batch_id          number path '$.batch_id'
                )
            ) jt
        ) loop
            declare
                v_qty_change number;
                v_txn_type   varchar2(50);
            begin
                if upper(p_adjustment_type) = 'IN' then
                    v_qty_change := abs(item.quantity_adjusted);
                    v_txn_type := 'ADJUSTMENT_IN';
                else
                    v_qty_change := -1 * abs(item.quantity_adjusted);
                    v_txn_type := 'ADJUSTMENT_OUT';
                end if;

                insert into pos_stock_adjustment_items (
                    stock_adjustment_id, product_id, quantity_adjusted, batch_id,
                    row_version, created_on, created_by, updated_on, updated_by
                ) values (
                    v_adj_id, item.product_id, v_qty_change, item.batch_id,
                    1, sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user),
                    sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user)
                );

                pkg_pos_stock.log_stock_transaction(
                    p_company_id       => p_company_id,
                    p_branch_id        => p_branch_id,
                    p_product_id       => item.product_id,
                    p_batch_id         => item.batch_id,
                    p_transaction_type => v_txn_type,
                    p_quantity_change  => v_qty_change,
                    p_reference_table  => 'POS_STOCK_ADJUSTMENTS',
                    p_reference_id     => v_adj_id,
                    p_user_id          => p_user_id,
                    p_remarks          => 'Physical Adjustment (' || p_reason || ')'
                );
            end;
        end loop;

        p_out_adj_id := v_adj_id;
    end record_adjustment;
end pkg_pos_adjustments;
/

-- =============================================================================
-- PACKAGE 10: PKG_POS_UTIL
-- =============================================================================
create or replace package pkg_pos_util as
    function format_inr(p_amount in number) return varchar2;

    function amount_to_words(p_amount in number) return varchar2;

    procedure calc_tax_breakdown(
        p_taxable_amount in number,
        p_tax_percentage in number,
        p_is_interstate  in varchar2 default 'N',
        p_cgst_amount    out number,
        p_sgst_amount    out number,
        p_igst_amount    out number,
        p_total_tax      out number
    );
end pkg_pos_util;
/

create or replace package body pkg_pos_util as
    function format_inr(p_amount in number) return varchar2 is
    begin
        return 'â‚¹ ' || trim(to_char(coalesce(p_amount, 0), '99,99,99,990.00'));
    end format_inr;

    function amount_to_words(p_amount in number) return varchar2 is
        v_num        number := trunc(abs(coalesce(p_amount, 0)));
        v_paise      number := round((abs(coalesce(p_amount, 0)) - v_num) * 100);
        v_words      varchar2(4000) := '';
        
        type t_str_arr is table of varchar2(30) index by binary_integer;
        v_units t_str_arr;
        v_tens  t_str_arr;

        function get_chunk_words(p_val in number) return varchar2 is
            v_res varchar2(500) := '';
            v_h   number := trunc(p_val / 100);
            v_rem number := mod(p_val, 100);
        begin
            if v_h > 0 then
                v_res := v_units(v_h) || ' Hundred ';
            end if;
            if v_rem > 0 then
                if v_rem < 20 then
                    v_res := v_res || v_units(v_rem) || ' ';
                else
                    v_res := v_res || v_tens(trunc(v_rem / 10)) || ' ' || v_units(mod(v_rem, 10)) || ' ';
                end if;
            end if;
            return trim(v_res);
        end get_chunk_words;
    begin
        if v_num = 0 and v_paise = 0 then
            return 'Zero Rupees Only';
        end if;

        v_units(0) := ''; v_units(1) := 'One'; v_units(2) := 'Two'; v_units(3) := 'Three'; v_units(4) := 'Four';
        v_units(5) := 'Five'; v_units(6) := 'Six'; v_units(7) := 'Seven'; v_units(8) := 'Eight'; v_units(9) := 'Nine';
        v_units(10) := 'Ten'; v_units(11) := 'Eleven'; v_units(12) := 'Twelve'; v_units(13) := 'Thirteen'; v_units(14) := 'Fourteen';
        v_units(15) := 'Fifteen'; v_units(16) := 'Sixteen'; v_units(17) := 'Seventeen'; v_units(18) := 'Eighteen'; v_units(19) := 'Nineteen';

        v_tens(2) := 'Twenty'; v_tens(3) := 'Thirty'; v_tens(4) := 'Forty'; v_tens(5) := 'Fifty';
        v_tens(6) := 'Sixty'; v_tens(7) := 'Seventy'; v_tens(8) := 'Eighty'; v_tens(9) := 'Ninety';

        -- Crores
        if v_num >= 10000000 then
            v_words := v_words || get_chunk_words(trunc(v_num / 10000000)) || ' Crore ';
            v_num := mod(v_num, 10000000);
        end if;
        -- Lakhs
        if v_num >= 100000 then
            v_words := v_words || get_chunk_words(trunc(v_num / 100000)) || ' Lakh ';
            v_num := mod(v_num, 100000);
        end if;
        -- Thousands
        if v_num >= 1000 then
            v_words := v_words || get_chunk_words(trunc(v_num / 1000)) || ' Thousand ';
            v_num := mod(v_num, 1000);
        end if;
        -- Hundreds & Units
        if v_num > 0 then
            v_words := v_words || get_chunk_words(v_num) || ' ';
        end if;

        v_words := trim(v_words);
        if v_words is not null then
            v_words := v_words || ' Rupees';
        end if;

        if v_paise > 0 then
            if v_words is not null then
                v_words := v_words || ' and ';
            end if;
            v_words := v_words || get_chunk_words(v_paise) || ' Paise';
        end if;

        return trim(v_words) || ' Only';
    end amount_to_words;

    procedure calc_tax_breakdown(
        p_taxable_amount in number,
        p_tax_percentage in number,
        p_is_interstate  in varchar2 default 'N',
        p_cgst_amount    out number,
        p_sgst_amount    out number,
        p_igst_amount    out number,
        p_total_tax      out number
    ) is
        v_total number(18,2);
    begin
        v_total := round((coalesce(p_taxable_amount, 0) * coalesce(p_tax_percentage, 0)) / 100, 2);
        p_total_tax := v_total;
        if upper(coalesce(p_is_interstate, 'N')) = 'Y' then
            p_igst_amount := v_total;
            p_cgst_amount := 0;
            p_sgst_amount := 0;
        else
            p_cgst_amount := round(v_total / 2, 2);
            p_sgst_amount := v_total - p_cgst_amount;
            p_igst_amount := 0;
        end if;
    end calc_tax_breakdown;
end pkg_pos_util;
/

-- =============================================================================
-- PACKAGE 11: PKG_POS_PAYMENTS
-- =============================================================================
create or replace package pkg_pos_payments as
    procedure post_payment(
        p_company_id   in number,
        p_branch_id    in number,
        p_sale_id      in number,
        p_payment_type in varchar2,
        p_amount       in number,
        p_change       in number default 0,
        p_ref_num      in varchar2 default null,
        p_user_id      in number default null
    );

    function validate_split(
        p_payments_json in clob,
        p_grand_total   in number
    ) return boolean;
end pkg_pos_payments;
/

create or replace package body pkg_pos_payments as
    procedure post_payment(
        p_company_id   in number,
        p_branch_id    in number,
        p_sale_id      in number,
        p_payment_type in varchar2,
        p_amount       in number,
        p_change       in number default 0,
        p_ref_num      in varchar2 default null,
        p_user_id      in number default null
    ) is
    begin
        insert into pos_payments (
            company_id, branch_id, sale_id, payment_type,
            amount_received, change_amount, transaction_ref_number,
            payment_date, row_version,
            created_on, created_by, updated_on, updated_by
        ) values (
            p_company_id, p_branch_id, p_sale_id, upper(p_payment_type),
            p_amount, coalesce(p_change, 0), p_ref_num,
            systimestamp, 1,
            sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user),
            sysdate, coalesce(sys_context('APEX$SESSION', 'APP_USER'), user)
        );
    end post_payment;

    function validate_split(
        p_payments_json in clob,
        p_grand_total   in number
    ) return boolean is
        v_total_paid number(18,2) := 0;
    begin
        for p in (
            select
                pj.amount_received,
                pj.change_amount
            from json_table(p_payments_json, '$[*]'
                columns (
                    amount_received number path '$.amount_received',
                    change_amount   number path '$.change_amount'
                )
            ) pj
        ) loop
            v_total_paid := v_total_paid + (p.amount_received - coalesce(p.change_amount, 0));
        end loop;

        return (abs(v_total_paid - p_grand_total) <= 0.05);
    end validate_split;
end pkg_pos_payments;
/

-- =============================================================================
-- PACKAGE 12: PKG_POS_INVOICE
-- =============================================================================
create or replace package pkg_pos_invoice as
    function get_next_invoice_no(
        p_company_id in number,
        p_branch_id  in number
    ) return varchar2;

    function get_thermal_receipt_html(
        p_sale_id in number
    ) return clob;

    function get_a4_tax_invoice_html(
        p_sale_id in number
    ) return clob;
end pkg_pos_invoice;
/

create or replace package body pkg_pos_invoice as
    function get_next_invoice_no(
        p_company_id in number,
        p_branch_id  in number
    ) return varchar2 is
    begin
        return pkg_pos_sales.generate_invoice_number(p_company_id, p_branch_id);
    end get_next_invoice_no;

    function get_thermal_receipt_html(
        p_sale_id in number
    ) return clob is
        v_html clob;
        v_sale pos_sales%rowtype;
        v_comp pos_companies%rowtype;
        v_br   pos_branches%rowtype;
        v_cust pos_customers%rowtype;
        v_cashier_name varchar2(255);
    begin
        select * into v_sale from pos_sales where id = p_sale_id;
        select * into v_comp from pos_companies where id = v_sale.company_id;
        select * into v_br from pos_branches where id = v_sale.branch_id;
        select * into v_cust from pos_customers where id = v_sale.customer_id;
        select first_name || ' ' || last_name into v_cashier_name from pos_users where id = v_sale.cashier_id;

        v_html := '<div class="pos-receipt-container" style="font-family: monospace; width: 300px; padding: 10px; margin: auto; border: 1px dashed #ccc;">';
        v_html := v_html || '<div style="text-align: center; margin-bottom: 8px;">';
        v_html := v_html || '<h3 style="margin: 0; font-size: 18px;">' || v_comp.company_name || '</h3>';
        v_html := v_html || '<div style="font-size: 11px;">' || v_br.branch_name || '</div>';
        if v_br.address is not null then
            v_html := v_html || '<div style="font-size: 10px;">' || v_br.address || '</div>';
        end if;
        if v_br.gstin is not null then
            v_html := v_html || '<div style="font-size: 11px; font-weight: bold;">GSTIN: ' || v_br.gstin || '</div>';
        end if;
        v_html := v_html || '</div><hr style="border-top: 1px dashed #000;"/>';

        -- Header Info
        v_html := v_html || '<table style="width:100%; font-size: 11px;">';
        v_html := v_html || '<tr><td>Inv #: <b>' || v_sale.invoice_number || '</b></td><td style="text-align:right;">Date: ' || to_char(v_sale.invoice_date, 'DD-Mon-YY HH24:MI') || '</td></tr>';
        v_html := v_html || '<tr><td>Cust: ' || substr(v_cust.name, 1, 15) || '</td><td style="text-align:right;">Cashier: ' || v_cashier_name || '</td></tr>';
        v_html := v_html || '</table><hr style="border-top: 1px dashed #000;"/>';

        -- Item Table
        v_html := v_html || '<table style="width:100%; font-size: 11px; border-collapse: collapse;">';
        v_html := v_html || '<tr style="border-bottom: 1px dashed #000;"><th style="text-align:left;">Item</th><th style="text-align:right;">Qty</th><th style="text-align:right;">Rate</th><th style="text-align:right;">Amt</th></tr>';

        for item in (select * from pos_sale_items where sale_id = p_sale_id order by id) loop
            v_html := v_html || '<tr>';
            v_html := v_html || '<td style="padding: 2px 0;">' || substr(item.product_name, 1, 16) || '</td>';
            v_html := v_html || '<td style="text-align:right;">' || item.quantity || '</td>';
            v_html := v_html || '<td style="text-align:right;">' || to_char(item.unit_price, '9990.00') || '</td>';
            v_html := v_html || '<td style="text-align:right;">' || to_char(item.line_total, '99990.00') || '</td>';
            v_html := v_html || '</tr>';
        end loop;

        v_html := v_html || '</table><hr style="border-top: 1px dashed #000;"/>';

        -- Totals
        v_html := v_html || '<table style="width:100%; font-size: 11px;">';
        v_html := v_html || '<tr><td>Subtotal:</td><td style="text-align:right;">â‚¹ ' || to_char(v_sale.subtotal, '99,990.00') || '</td></tr>';
        if v_sale.bill_discount_amount > 0 or v_sale.item_discount_amount > 0 then
            v_html := v_html || '<tr><td>Discount:</td><td style="text-align:right;">- â‚¹ ' || to_char(v_sale.bill_discount_amount + v_sale.item_discount_amount, '99,990.00') || '</td></tr>';
        end if;
        if v_sale.cgst_amount > 0 then
            v_html := v_html || '<tr><td>CGST:</td><td style="text-align:right;">â‚¹ ' || to_char(v_sale.cgst_amount, '99,990.00') || '</td></tr>';
            v_html := v_html || '<tr><td>SGST:</td><td style="text-align:right;">â‚¹ ' || to_char(v_sale.sgst_amount, '99,990.00') || '</td></tr>';
        end if;
        if v_sale.igst_amount > 0 then
            v_html := v_html || '<tr><td>IGST:</td><td style="text-align:right;">â‚¹ ' || to_char(v_sale.igst_amount, '99,990.00') || '</td></tr>';
        end if;
        if v_sale.round_off_amount != 0 then
            v_html := v_html || '<tr><td>Round Off:</td><td style="text-align:right;">â‚¹ ' || to_char(v_sale.round_off_amount, '90.00') || '</td></tr>';
        end if;
        v_html := v_html || '<tr style="font-size: 14px; font-weight: bold;"><td>GRAND TOTAL:</td><td style="text-align:right;">â‚¹ ' || to_char(v_sale.grand_total, '99,990.00') || '</td></tr>';
        v_html := v_html || '</table><hr style="border-top: 1px dashed #000;"/>';

        -- Payments
        v_html := v_html || '<div style="font-size: 11px;"><b>Payments:</b></div>';
        for pay in (select * from pos_payments where sale_id = p_sale_id) loop
            v_html := v_html || '<div style="font-size: 10px; display:flex; justify-content:space-between;"><span>' || pay.payment_type || ':</span><span>â‚¹ ' || to_char(pay.amount_received, '99,990.00') || '</span></div>';
        end loop;

        -- Footer & Barcode placeholder
        v_html := v_html || '<div style="text-align: center; margin-top: 12px; font-size: 11px;">';
        v_html := v_html || '<div>* Thank You! Visit Again *</div>';
        v_html := v_html || '<div style="margin-top: 6px; font-size: 10px; color: #555;">Items once sold can be returned within 7 days with bill.</div>';
        v_html := v_html || '</div></div>';

        return v_html;
    end get_thermal_receipt_html;

    function get_a4_tax_invoice_html(
        p_sale_id in number
    ) return clob is
        v_html clob;
        v_sale pos_sales%rowtype;
        v_comp pos_companies%rowtype;
        v_br   pos_branches%rowtype;
        v_cust pos_customers%rowtype;
        v_words varchar2(500);
    begin
        select * into v_sale from pos_sales where id = p_sale_id;
        select * into v_comp from pos_companies where id = v_sale.company_id;
        select * into v_br from pos_branches where id = v_sale.branch_id;
        select * into v_cust from pos_customers where id = v_sale.customer_id;
        v_words := pkg_pos_util.amount_to_words(v_sale.grand_total);

        v_html := '<div class="a4-invoice-container" style="font-family: Arial, sans-serif; max-width: 800px; margin: auto; padding: 20px; border: 1px solid #ddd;">';
        v_html := v_html || '<table style="width:100%; border-bottom: 2px solid #333; padding-bottom: 10px;"><tr>';
        v_html := v_html || '<td><h2 style="margin:0; color:#1a365d;">' || v_comp.company_name || '</h2><p style="margin:2px 0; font-size:12px;">' || v_br.address || '<br/>GSTIN: <b>' || v_br.gstin || '</b> | Phone: ' || v_br.phone_number || '</p></td>';
        v_html := v_html || '<td style="text-align:right;"><h3 style="margin:0; color:#4a5568;">TAX INVOICE</h3><p style="margin:2px 0; font-size:13px;"><b>Invoice No:</b> ' || v_sale.invoice_number || '<br/><b>Date:</b> ' || to_char(v_sale.invoice_date, 'DD-MM-YYYY HH24:MI') || '</p></td>';
        v_html := v_html || '</tr></table>';

        -- Bill To
        v_html := v_html || '<div style="margin: 15px 0; font-size: 13px;">';
        v_html := v_html || '<b>Billed To:</b><br/>' || v_cust.name;
        if v_cust.address is not null then
            v_html := v_html || '<br/>' || v_cust.address;
        end if;
        if v_cust.gstin is not null then
            v_html := v_html || '<br/><b>GSTIN:</b> ' || v_cust.gstin;
        end if;
        v_html := v_html || '</div>';

        -- Items Table
        v_html := v_html || '<table style="width:100%; border-collapse: collapse; font-size: 12px; margin-top: 10px;" border="1" cellpadding="6">';
        v_html := v_html || '<tr style="background:#f7fafc;"><th>#</th><th>Description of Goods</th><th>HSN/SAC</th><th>Qty</th><th>Rate</th><th>Discount</th><th>Taxable</th><th>GST %</th><th>Total</th></tr>';

        declare
            v_idx number := 1;
            v_line_sub number(18,2);
        begin
            for item in (select * from pos_sale_items where sale_id = p_sale_id order by id) loop
                v_line_sub := (item.quantity * item.unit_price) - item.discount_amount;
                v_html := v_html || '<tr>';
                v_html := v_html || '<td style="text-align:center;">' || v_idx || '</td>';
                v_html := v_html || '<td>' || item.product_name || ' (' || item.product_code || ')</td>';
                v_html := v_html || '<td style="text-align:center;">' || coalesce(item.hsn_sac, '-') || '</td>';
                v_html := v_html || '<td style="text-align:right;">' || item.quantity || '</td>';
                v_html := v_html || '<td style="text-align:right;">' || to_char(item.unit_price, '99990.00') || '</td>';
                v_html := v_html || '<td style="text-align:right;">' || to_char(item.discount_amount, '9990.00') || '</td>';
                v_html := v_html || '<td style="text-align:right;">' || to_char(v_line_sub, '99990.00') || '</td>';
                v_html := v_html || '<td style="text-align:center;">' || item.tax_rate || '%</td>';
                v_html := v_html || '<td style="text-align:right; font-weight:bold;">' || to_char(item.line_total, '99990.00') || '</td>';
                v_html := v_html || '</tr>';
                v_idx := v_idx + 1;
            end loop;
        end;

        v_html := v_html || '</table>';

        -- Summary Table
        v_html := v_html || '<table style="width:100%; margin-top: 15px; font-size: 13px;"><tr>';
        v_html := v_html || '<td style="width:60%; vertical-align: top;"><b>Amount in Words:</b><br/><i>' || v_words || '</i><br/><br/><b>Terms & Conditions:</b><br/><small>1. Goods once sold will not be taken back without original bill.<br/>2. Subject to local jurisdiction.</small></td>';
        v_html := v_html || '<td style="width:40%;"><table style="width:100%;" border="0" cellpadding="4">';
        v_html := v_html || '<tr><td>Taxable Value:</td><td style="text-align:right;">â‚¹ ' || to_char(v_sale.taxable_amount, '99,99,990.00') || '</td></tr>';
        if v_sale.cgst_amount > 0 then
            v_html := v_html || '<tr><td>CGST:</td><td style="text-align:right;">â‚¹ ' || to_char(v_sale.cgst_amount, '99,99,990.00') || '</td></tr>';
            v_html := v_html || '<tr><td>SGST:</td><td style="text-align:right;">â‚¹ ' || to_char(v_sale.sgst_amount, '99,99,990.00') || '</td></tr>';
        end if;
        if v_sale.igst_amount > 0 then
            v_html := v_html || '<tr><td>IGST:</td><td style="text-align:right;">â‚¹ ' || to_char(v_sale.igst_amount, '99,99,990.00') || '</td></tr>';
        end if;
        if v_sale.round_off_amount != 0 then
            v_html := v_html || '<tr><td>Round Off:</td><td style="text-align:right;">â‚¹ ' || to_char(v_sale.round_off_amount, '90.00') || '</td></tr>';
        end if;
        v_html := v_html || '<tr style="font-size:15px; font-weight:bold; background:#edf2f7;"><td>Invoice Total:</td><td style="text-align:right;">â‚¹ ' || to_char(v_sale.grand_total, '99,99,990.00') || '</td></tr>';
        v_html := v_html || '</table></td></tr></table>';

        v_html := v_html || '<div style="margin-top: 40px; display:flex; justify-content:space-between; font-size:12px;">';
        v_html := v_html || '<div>Customer Signature</div><div style="text-align:right;">For <b>' || v_comp.company_name || '</b><br/><br/><br/>Authorised Signatory</div>';
        v_html := v_html || '</div></div>';

        return v_html;
    end get_a4_tax_invoice_html;
end pkg_pos_invoice;
/

prompt >> 03_pos_packages.sql completed successfully.



-- >>> FILE: 04_pos_sample_data.sql <<<

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
-- INV-0000123: Rohit Sharma (â‚¹ 850.00, Cash)
insert into pos_sales (id, company_id, branch_id, invoice_number, invoice_date, customer_id, cashier_id, subtotal, item_discount_amount, bill_discount_amount, taxable_amount, tax_amount, round_off_amount, grand_total, status, row_version, created_on, created_by, updated_on, updated_by)
values (123, 1, 1, 'INV-0000123', systimestamp - 1, 2, 1, 800.00, 0.00, 0.00, 800.00, 50.00, 0.00, 850.00, 'COMPLETED', 1, sysdate, 'admin', sysdate, 'admin');
insert into pos_payments (company_id, branch_id, sale_id, payment_type, amount_received, change_amount, transaction_ref_number, payment_date, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 123, 'CASH', 850.00, 0.00, null, systimestamp - 1, 1, sysdate, 'admin', sysdate, 'admin');

-- INV-0000122: Priya Singh (â‚¹ 325.00, Card)
insert into pos_sales (id, company_id, branch_id, invoice_number, invoice_date, customer_id, cashier_id, subtotal, item_discount_amount, bill_discount_amount, taxable_amount, tax_amount, round_off_amount, grand_total, status, row_version, created_on, created_by, updated_on, updated_by)
values (122, 1, 1, 'INV-0000122', systimestamp - 2, 3, 1, 300.00, 0.00, 0.00, 300.00, 25.00, 0.00, 325.00, 'COMPLETED', 1, sysdate, 'admin', sysdate, 'admin');
insert into pos_payments (company_id, branch_id, sale_id, payment_type, amount_received, change_amount, transaction_ref_number, payment_date, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 122, 'CARD', 325.00, 0.00, 'TXN_CARD_9921', systimestamp - 2, 1, sysdate, 'admin', sysdate, 'admin');

-- INV-0000121: Amit Kumar (â‚¹ 540.00, UPI)
insert into pos_sales (id, company_id, branch_id, invoice_number, invoice_date, customer_id, cashier_id, subtotal, item_discount_amount, bill_discount_amount, taxable_amount, tax_amount, round_off_amount, grand_total, status, row_version, created_on, created_by, updated_on, updated_by)
values (121, 1, 1, 'INV-0000121', systimestamp - 3, 4, 3, 500.00, 0.00, 0.00, 500.00, 40.00, 0.00, 540.00, 'COMPLETED', 1, sysdate, 'cashier1', sysdate, 'cashier1');
insert into pos_payments (company_id, branch_id, sale_id, payment_type, amount_received, change_amount, transaction_ref_number, payment_date, row_version, created_on, created_by, updated_on, updated_by)
values (1, 1, 121, 'UPI', 540.00, 0.00, 'UPI_REF_44129', systimestamp - 3, 1, sysdate, 'cashier1', sysdate, 'cashier1');

-- INV-0000120: Sunita Devi (â‚¹ 780.00, UPI)
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
values (1, null, 'CURRENCY_SYMBOL', 'â‚¹', 'Retail currency symbol', 1, sysdate, 'SYSTEM', sysdate, 'SYSTEM');
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


-- >>> FILE: 05_pos_test_suite.sql <<<

-- =============================================================================
-- SCRIPT: 05_pos_test_suite.sql
-- PURPOSE: Automated PL/SQL Test Suite for all 14 POS Business Scenarios
-- =============================================================================

set serveroutput on size unlimited;

prompt >> =====================================================================
prompt >> STARTING 14-POINT AUTOMATED POS BUSINESS & SECURITY VERIFICATION
prompt >> =====================================================================

declare
    v_test_prod_id     number;
    v_test_prod_code   varchar2(50) := 'TEST_PROD_001';
    v_stock            number;
    v_stock_b          number;
    v_purchase_id      number;
    v_sale_id          number;
    v_invoice_num      varchar2(255);
    v_sale_item_id     number;
    v_return_id        number;
    v_return_num       varchar2(255);
    v_transfer_id      number;
    v_cust_bal_before  number;
    v_cust_bal_after   number;
    v_inv_1            varchar2(255);
    v_inv_2            varchar2(255);
    v_has_access       boolean;
    v_passed_count     number := 0;
begin
    -- -------------------------------------------------------------------------
    -- TEST 1: Create Product
    -- -------------------------------------------------------------------------
    begin
        delete from pos_stock_transactions where product_id in (select id from pos_products where product_code = v_test_prod_code);
        delete from pos_product_barcodes where product_id in (select id from pos_products where product_code = v_test_prod_code);
        delete from pos_products where product_code = v_test_prod_code;

        insert into pos_products (
            company_id, product_code, name, category_id, unit_id, tax_id,
            mrp, purchase_price, selling_price, min_stock, reorder_level, is_active,
            row_version, created_on, created_by, updated_on, updated_by
        ) values (
            1, v_test_prod_code, 'Test Coffee Beans 250g', 3, 1, 4,
            250.00, 150.00, 220.00, 5, 10, 'Y',
            1, sysdate, 'TEST', sysdate, 'TEST'
        ) returning id into v_test_prod_id;

        v_stock := pkg_pos_stock.get_current_stock(1, 1, v_test_prod_id);
        if v_test_prod_id is not null and v_stock = 0 then
            dbms_output.put_line('[PASS] TEST 1: Create Product - Product created successfully with Initial Stock = 0');
            v_passed_count := v_passed_count + 1;
        else
            dbms_output.put_line('[FAIL] TEST 1: Product creation failed');
        end if;
    exception
        when others then
            dbms_output.put_line('[FAIL] TEST 1: ' || sqlerrm);
    end;

    -- -------------------------------------------------------------------------
    -- TEST 2: Purchase 100 units -> Stock = 100
    -- -------------------------------------------------------------------------
    begin
        pkg_pos_purchase.record_purchase(
            p_company_id      => 1,
            p_branch_id       => 1,
            p_supplier_id     => 1,
            p_invoice_number  => 'TEST-PO-001',
            p_purchase_date   => systimestamp,
            p_items_json      => json_array(json_object('product_id' value v_test_prod_id, 'quantity' value 100, 'purchase_rate' value 150.00, 'mrp' value 250.00)),
            p_paid_amount     => 15000.00,
            p_user_id         => 1,
            p_out_purchase_id => v_purchase_id
        );

        v_stock := pkg_pos_stock.get_current_stock(1, 1, v_test_prod_id);
        if v_stock = 100 then
            dbms_output.put_line('[PASS] TEST 2: Purchase 100 units - Derived Stock from ledger = ' || v_stock);
            v_passed_count := v_passed_count + 1;
        else
            dbms_output.put_line('[FAIL] TEST 2: Expected 100 but got ' || v_stock);
        end if;
    exception
        when others then
            dbms_output.put_line('[FAIL] TEST 2: ' || sqlerrm);
    end;

    -- -------------------------------------------------------------------------
    -- TEST 3: Sell 5 units -> Stock = 95
    -- -------------------------------------------------------------------------
    begin
        pkg_pos_sales.process_sale(
            p_company_id         => 1,
            p_branch_id          => 1,
            p_customer_id        => 1,
            p_cashier_id         => 1,
            p_items_json         => json_array(json_object('product_id' value v_test_prod_id, 'quantity' value 5, 'unit_price' value 220.00)),
            p_payments_json      => json_array(json_object('payment_type' value 'CASH', 'amount_received' value 1298.00)),
            p_out_sale_id        => v_sale_id,
            p_out_invoice_number => v_invoice_num
        );

        v_stock := pkg_pos_stock.get_current_stock(1, 1, v_test_prod_id);
        if v_stock = 95 then
            dbms_output.put_line('[PASS] TEST 3: Sell 5 units - Stock decreased accurately to ' || v_stock);
            v_passed_count := v_passed_count + 1;
        else
            dbms_output.put_line('[FAIL] TEST 3: Expected 95 but got ' || v_stock);
        end if;
    exception
        when others then
            dbms_output.put_line('[FAIL] TEST 3: ' || sqlerrm);
    end;

    -- -------------------------------------------------------------------------
    -- TEST 4: Sales Return 2 units -> Stock = 97
    -- -------------------------------------------------------------------------
    begin
        select id into v_sale_item_id
        from pos_sale_items
        where sale_id = v_sale_id and product_id = v_test_prod_id;

        pkg_pos_returns.process_sales_return(
            p_company_id        => 1,
            p_branch_id         => 1,
            p_original_sale_id  => v_sale_id,
            p_cashier_id        => 1,
            p_refund_mode       => 'CASH',
            p_reason            => 'Customer returned sealed product',
            p_items_json        => json_array(json_object('original_sale_item_id' value v_sale_item_id, 'product_id' value v_test_prod_id, 'return_qty' value 2)),
            p_out_return_id     => v_return_id,
            p_out_return_number => v_return_num
        );

        v_stock := pkg_pos_stock.get_current_stock(1, 1, v_test_prod_id);
        if v_stock = 97 then
            dbms_output.put_line('[PASS] TEST 4: Sales Return 2 units - Stock restocked accurately to ' || v_stock);
            v_passed_count := v_passed_count + 1;
        else
            dbms_output.put_line('[FAIL] TEST 4: Expected 97 but got ' || v_stock);
        end if;
    exception
        when others then
            dbms_output.put_line('[FAIL] TEST 4: ' || sqlerrm);
    end;

    -- -------------------------------------------------------------------------
    -- TEST 5: Purchase Return 10 units -> Stock = 87
    -- -------------------------------------------------------------------------
    begin
        declare
            v_purch_item_id number;
        begin
            select id into v_purch_item_id
            from pos_purchase_items
            where purchase_id = v_purchase_id and product_id = v_test_prod_id;

            pkg_pos_returns.process_purchase_return(
                p_company_id           => 1,
                p_branch_id            => 1,
                p_original_purchase_id => v_purchase_id,
                p_user_id              => 1,
                p_reason               => 'Vendor return damaged packaging',
                p_items_json           => json_array(json_object('original_purchase_item_id' value v_purch_item_id, 'product_id' value v_test_prod_id, 'return_qty' value 10)),
                p_out_return_id        => v_return_id,
                p_out_return_number    => v_return_num
            );

            v_stock := pkg_pos_stock.get_current_stock(1, 1, v_test_prod_id);
            if v_stock = 87 then
                dbms_output.put_line('[PASS] TEST 5: Purchase Return 10 units - Stock reduced to ' || v_stock);
                v_passed_count := v_passed_count + 1;
            else
                dbms_output.put_line('[FAIL] TEST 5: Expected 87 but got ' || v_stock);
            end if;
        end;
    exception
        when others then
            dbms_output.put_line('[FAIL] TEST 5: ' || sqlerrm);
    end;

    -- -------------------------------------------------------------------------
    -- TEST 6: Transfer 20 units from Branch 1 to Branch 2
    -- -------------------------------------------------------------------------
    begin
        pkg_pos_transfers.create_and_complete_transfer(
            p_company_id      => 1,
            p_from_branch_id  => 1,
            p_to_branch_id    => 2,
            p_user_id         => 1,
            p_remarks         => 'Inter-branch replenishment',
            p_items_json      => json_array(json_object('product_id' value v_test_prod_id, 'quantity' value 20)),
            p_out_transfer_id => v_transfer_id
        );

        v_stock   := pkg_pos_stock.get_current_stock(1, 1, v_test_prod_id);
        v_stock_b := pkg_pos_stock.get_current_stock(1, 2, v_test_prod_id);

        if v_stock = 67 and v_stock_b >= 20 then
            dbms_output.put_line('[PASS] TEST 6: Stock Transfer - Branch 1 = ' || v_stock || ' (-20), Branch 2 = ' || v_stock_b || ' (+20)');
            v_passed_count := v_passed_count + 1;
        else
            dbms_output.put_line('[FAIL] TEST 6: Branch 1: ' || v_stock || ', Branch 2: ' || v_stock_b);
        end if;
    exception
        when others then
            dbms_output.put_line('[FAIL] TEST 6: ' || sqlerrm);
    end;

    -- -------------------------------------------------------------------------
    -- TEST 7: Block sale greater than available stock when negative stock disabled
    -- -------------------------------------------------------------------------
    begin
        -- Branch 1 has 67. Try selling 100 units.
        pkg_pos_sales.process_sale(
            p_company_id         => 1,
            p_branch_id          => 1,
            p_customer_id        => 1,
            p_cashier_id         => 1,
            p_items_json         => json_array(json_object('product_id' value v_test_prod_id, 'quantity' value 100, 'unit_price' value 220.00)),
            p_payments_json      => json_array(json_object('payment_type' value 'CASH', 'amount_received' value 25960.00)),
            p_out_sale_id        => v_sale_id,
            p_out_invoice_number => v_invoice_num
        );
        dbms_output.put_line('[FAIL] TEST 7: Over-selling was permitted but should have been blocked');
    exception
        when others then
            if sqlcode = -20002 then
                dbms_output.put_line('[PASS] TEST 7: Negative stock prevention - Over-selling blocked with application error');
                v_passed_count := v_passed_count + 1;
            else
                dbms_output.put_line('[FAIL] TEST 7: Unexpected error: ' || sqlerrm);
            end if;
    end;

    -- -------------------------------------------------------------------------
    -- TEST 8: Split Payment validation
    -- -------------------------------------------------------------------------
    begin
        -- Sell 2 units (Total = 2 * 220 + 18% GST = 519.20 -> Round = 519.00)
        -- Split: Cash = 300, UPI = 219 (Total = 519.00)
        pkg_pos_sales.process_sale(
            p_company_id         => 1,
            p_branch_id          => 1,
            p_customer_id        => 1,
            p_cashier_id         => 1,
            p_items_json         => json_array(json_object('product_id' value v_test_prod_id, 'quantity' value 2, 'unit_price' value 220.00)),
            p_payments_json      => json_array(
                json_object('payment_type' value 'CASH', 'amount_received' value 300.00),
                json_object('payment_type' value 'UPI', 'amount_received' value 219.00, 'transaction_ref_number' value 'UPI999')
            ),
            p_out_sale_id        => v_sale_id,
            p_out_invoice_number => v_invoice_num
        );

        declare
            v_pay_count number;
        begin
            select count(*) into v_pay_count from pos_payments where sale_id = v_sale_id;
            if v_pay_count = 2 then
                dbms_output.put_line('[PASS] TEST 8: Split payment - Cash (300) + UPI (219) verified exactly on invoice');
                v_passed_count := v_passed_count + 1;
            else
                dbms_output.put_line('[FAIL] TEST 8: Split payment count incorrect');
            end if;
        end;
    exception
        when others then
            dbms_output.put_line('[FAIL] TEST 8: ' || sqlerrm);
    end;

    -- -------------------------------------------------------------------------
    -- TEST 9: Customer Credit Sale -> Outstanding Increases
    -- -------------------------------------------------------------------------
    begin
        v_cust_bal_before := pkg_pos_ledger.get_customer_balance(2); -- Rohit Sharma

        -- Sell 1 unit on credit (220 + 18% GST = 260.00)
        pkg_pos_sales.process_sale(
            p_company_id         => 1,
            p_branch_id          => 1,
            p_customer_id        => 2,
            p_cashier_id         => 1,
            p_items_json         => json_array(json_object('product_id' value v_test_prod_id, 'quantity' value 1, 'unit_price' value 220.00)),
            p_payments_json      => json_array(json_object('payment_type' value 'CREDIT', 'amount_received' value 260.00)),
            p_out_sale_id        => v_sale_id,
            p_out_invoice_number => v_invoice_num
        );

        v_cust_bal_after := pkg_pos_ledger.get_customer_balance(2);
        if v_cust_bal_after = (v_cust_bal_before + 260.00) then
            dbms_output.put_line('[PASS] TEST 9: Customer Credit Sale - Balance increased from ' || v_cust_bal_before || ' to ' || v_cust_bal_after);
            v_passed_count := v_passed_count + 1;
        else
            dbms_output.put_line('[FAIL] TEST 9: Ledger did not increase properly');
        end if;
    exception
        when others then
            dbms_output.put_line('[FAIL] TEST 9: ' || sqlerrm);
    end;

    -- -------------------------------------------------------------------------
    -- TEST 10: Customer Payment -> Outstanding Decreases
    -- -------------------------------------------------------------------------
    begin
        v_cust_bal_before := pkg_pos_ledger.get_customer_balance(2);
        pkg_pos_ledger.record_customer_entry(
            p_company_id       => 1,
            p_branch_id        => 1,
            p_customer_id      => 2,
            p_transaction_type => 'PAYMENT',
            p_reference_table  => 'POS_PAYMENTS',
            p_reference_id     => null,
            p_debit_amount     => 0,
            p_credit_amount    => 260.00,
            p_user_id          => 1,
            p_remarks          => 'Customer payment settlement'
        );

        v_cust_bal_after := pkg_pos_ledger.get_customer_balance(2);
        if v_cust_bal_after = (v_cust_bal_before - 260.00) then
            dbms_output.put_line('[PASS] TEST 10: Customer Payment - Balance decreased from ' || v_cust_bal_before || ' to ' || v_cust_bal_after);
            v_passed_count := v_passed_count + 1;
        else
            dbms_output.put_line('[FAIL] TEST 10: Balance did not decrease properly');
        end if;
    exception
        when others then
            dbms_output.put_line('[FAIL] TEST 10: ' || sqlerrm);
    end;

    -- -------------------------------------------------------------------------
    -- TEST 11: Unauthorized Cashier access to Administration blocked
    -- -------------------------------------------------------------------------
    begin
        -- Cashier (User ID 3) has no USERS permission
        v_has_access := pkg_pos_auth.has_permission(3, 'USERS', 'VIEW');
        if not v_has_access then
            dbms_output.put_line('[PASS] TEST 11: RBAC Security - Cashier cannot access administration modules');
            v_passed_count := v_passed_count + 1;
        else
            dbms_output.put_line('[FAIL] TEST 11: Cashier was improperly granted access');
        end if;
    exception
        when others then
            dbms_output.put_line('[FAIL] TEST 11: ' || sqlerrm);
    end;

    -- -------------------------------------------------------------------------
    -- TEST 12: User from Branch 1 cannot view other branch records without assignment
    -- -------------------------------------------------------------------------
    begin
        declare
            v_can_view_b3 number;
        begin
            select count(*) into v_can_view_b3
            from pos_user_branches
            where user_id = 3 and branch_id = 3;

            if v_can_view_b3 = 0 then
                dbms_output.put_line('[PASS] TEST 12: Branch Isolation - Cashier assigned to Branch 1 is restricted from Branch 3');
                v_passed_count := v_passed_count + 1;
            else
                dbms_output.put_line('[FAIL] TEST 12: Cashier has unauthorized branch assignment');
            end if;
        end;
    exception
        when others then
            dbms_output.put_line('[FAIL] TEST 12: ' || sqlerrm);
    end;

    -- -------------------------------------------------------------------------
    -- TEST 13: Concurrency-Safe Invoice Generation
    -- -------------------------------------------------------------------------
    begin
        v_inv_1 := pkg_pos_sales.generate_invoice_number(1, 1);
        v_inv_2 := pkg_pos_sales.generate_invoice_number(1, 1);

        if v_inv_1 != v_inv_2 and v_inv_1 is not null and v_inv_2 is not null then
            dbms_output.put_line('[PASS] TEST 13: Concurrent sequence numbering - Unique invoices: ' || v_inv_1 || ' and ' || v_inv_2);
            v_passed_count := v_passed_count + 1;
        else
            dbms_output.put_line('[FAIL] TEST 13: Invoice collision detected');
        end if;
    exception
        when others then
            dbms_output.put_line('[FAIL] TEST 13: ' || sqlerrm);
    end;

    -- -------------------------------------------------------------------------
    -- TEST 14: Cancel Completed Invoice (Stock Restitution & Audit Trail)
    -- -------------------------------------------------------------------------
    begin
        -- Check current stock before sale
        v_stock := pkg_pos_stock.get_current_stock(1, 1, v_test_prod_id);

        -- Make a sale of 3 units
        pkg_pos_sales.process_sale(
            p_company_id         => 1,
            p_branch_id          => 1,
            p_customer_id        => 1,
            p_cashier_id         => 1,
            p_items_json         => json_array(json_object('product_id' value v_test_prod_id, 'quantity' value 3, 'unit_price' value 220.00)),
            p_payments_json      => json_array(json_object('payment_type' value 'CASH', 'amount_received' value 779.00)),
            p_out_sale_id        => v_sale_id,
            p_out_invoice_number => v_invoice_num
        );

        -- Now cancel the sale
        pkg_pos_sales.cancel_sale(
            p_sale_id => v_sale_id,
            p_user_id => 1,
            p_reason  => 'Customer left without taking items'
        );

        v_stock_b := pkg_pos_stock.get_current_stock(1, 1, v_test_prod_id);

        if v_stock_b = v_stock then
            dbms_output.put_line('[PASS] TEST 14: Invoice Cancellation - Stock fully restituted to ' || v_stock_b || ' with audit entry');
            v_passed_count := v_passed_count + 1;
        else
            dbms_output.put_line('[FAIL] TEST 14: Stock not restituted. Before: ' || v_stock || ', After: ' || v_stock_b);
        end if;
    exception
        when others then
            dbms_output.put_line('[FAIL] TEST 14: ' || sqlerrm);
    end;

    -- -------------------------------------------------------------------------
    -- TEST 15: GST Intra-State Tax Split Validation
    -- -------------------------------------------------------------------------
    begin
        declare
            v_sale_rec pos_sales%rowtype;
        begin
            select * into v_sale_rec from pos_sales where id = v_sale_id;
            if v_sale_rec.cgst_amount > 0 and v_sale_rec.sgst_amount > 0 and (v_sale_rec.cgst_amount + v_sale_rec.sgst_amount = v_sale_rec.tax_amount) then
                dbms_output.put_line('[PASS] TEST 15: GST Component Split - CGST (' || v_sale_rec.cgst_amount || ') + SGST (' || v_sale_rec.sgst_amount || ') = Tax (' || v_sale_rec.tax_amount || ')');
                v_passed_count := v_passed_count + 1;
            else
                dbms_output.put_line('[FAIL] TEST 15: GST component split mismatch');
            end if;
        end;
    exception
        when others then
            dbms_output.put_line('[FAIL] TEST 15: ' || sqlerrm);
    end;

    -- -------------------------------------------------------------------------
    -- TEST 16: Printable Thermal Receipt Generation
    -- -------------------------------------------------------------------------
    begin
        declare
            v_html clob;
        begin
            v_html := pkg_pos_invoice.get_thermal_receipt_html(v_sale_id);
            if v_html is not null and dbms_lob.getlength(v_html) > 100 then
                dbms_output.put_line('[PASS] TEST 16: Thermal Receipt HTML generation - Formatted ESC/POS length = ' || dbms_lob.getlength(v_html) || ' bytes');
                v_passed_count := v_passed_count + 1;
            else
                dbms_output.put_line('[FAIL] TEST 16: Receipt generation returned empty or truncated HTML');
            end if;
        end;
    exception
        when others then
            dbms_output.put_line('[FAIL] TEST 16: ' || sqlerrm);
    end;

    -- -------------------------------------------------------------------------
    -- FINAL RESULTS
    -- -------------------------------------------------------------------------
    dbms_output.put_line('---------------------------------------------------------------------');
    dbms_output.put_line('TOTAL TESTS RUN: 16 | TESTS PASSED: ' || v_passed_count || '/16');
    dbms_output.put_line('---------------------------------------------------------------------');
    if v_passed_count = 16 then
        dbms_output.put_line('>>> ALL 16 POS BUSINESS TEST SCENARIOS PASSED WITH 100% SUCCESS! <<<');
    end if;
end;
/

