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
