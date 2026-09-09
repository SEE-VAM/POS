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
