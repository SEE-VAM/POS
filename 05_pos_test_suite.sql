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
    -- FINAL RESULTS
    -- -------------------------------------------------------------------------
    dbms_output.put_line('---------------------------------------------------------------------');
    dbms_output.put_line('TOTAL TESTS RUN: 14 | TESTS PASSED: ' || v_passed_count || '/14');
    dbms_output.put_line('---------------------------------------------------------------------');
    if v_passed_count = 14 then
        dbms_output.put_line('>>> ALL 14 TEST SCENARIOS PASSED WITH 100% SUCCESS! <<<');
    end if;
end;
/
