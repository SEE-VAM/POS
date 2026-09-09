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

        -- 5. Generate Safe Sequential Invoice Number
        v_invoice_num := generate_invoice_number(p_company_id, p_branch_id);

        -- 6. Insert Sale Header
        insert into pos_sales (
            company_id, branch_id, invoice_number, invoice_date,
            customer_id, cashier_id, subtotal, item_discount_amount,
            bill_discount_amount, taxable_amount, tax_amount,
            round_off_amount, grand_total, status, notes,
            row_version, created_on, created_by, updated_on, updated_by
        ) values (
            p_company_id, p_branch_id, v_invoice_num, systimestamp,
            p_customer_id, p_cashier_id, v_subtotal, v_item_discount,
            coalesce(p_bill_discount, 0), v_taxable_amt, v_tax_amt,
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

prompt >> 03_pos_packages.sql completed successfully.
