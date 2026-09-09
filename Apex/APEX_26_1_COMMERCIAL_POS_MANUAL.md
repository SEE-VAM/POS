# Oracle APEX 26.1 Commercial POS – Complete Implementation & Configuration Manual

This official manual provides the exhaustive, step-by-step specifications for configuring and deploying the **MyPOS Commercial Retail POS Application** (App ID: `101`) in **Oracle APEX 26.1 / 23.x / 24.x**.

---

## 1. Global Application Setup & Shared Components

### 1.1 Application Properties
| Property | Configuration Value |
|:---|:---|
| **Application Name** | `MyPOS – Commercial Retail POS` |
| **Application ID** | `101` (or next available) |
| **Theme** | Universal Theme (Theme 42) |
| **Navigation Style** | Side Navigation Menu |
| **Custom CSS File** | `#APP_FILES#pos_theme_style.css` (Upload via Shared Components > Static Application Files) |

---

### 1.2 Application Items (Global Session State)
Navigate to **App Builder > Shared Components > Application Items** and create:

1. **`G_COMPANY_ID`**:
   - Scope: `Application`
   - Session State Protection: `Restricted - May not be set from browser`
2. **`G_BRANCH_ID`**:
   - Scope: `Application`
   - Session State Protection: `Restricted - May not be set from browser`
3. **`G_BRANCH_NAME`**:
   - Scope: `Application`
   - Session State Protection: `Unrestricted`
4. **`G_USER_ID`**:
   - Scope: `Application`
   - Session State Protection: `Restricted - May not be set from browser`
5. **`G_USER_ROLE`**:
   - Scope: `Application`
   - Session State Protection: `Restricted - May not be set from browser`

---

### 1.3 Authentication Scheme
Navigate to **Shared Components > Authentication Schemes > Create**:
* **Name**: `POS_CUSTOM_AUTH`
* **Scheme Type**: `Custom`
* **Authentication Function Name**: `pkg_pos_auth.authenticate_user`
* **Enable**: Set as **Current Authentication Scheme**.

---

### 1.4 Post-Authentication Application Process
Navigate to **Shared Components > Application Processes > Create**:
* **Name**: `AP_SET_USER_CONTEXT`
* **Point**: `After Authentication`
* **PL/SQL Code**:
```sql
begin
    pkg_pos_auth.set_session_context(:APP_USER);
end;
```

---

### 1.5 Authorization Schemes
Navigate to **Shared Components > Authorization Schemes > Create**:

1. **`AUTH_IS_ADMIN`**:
   - Scheme Type: `PL/SQL Function Returning Boolean`
   - PL/SQL Function Body:
     ```sql
     return :G_USER_ROLE = 'ADMIN';
     ```
   - Error Message: `Access denied. Administrator privileges required.`

2. **`AUTH_IS_MANAGER`**:
   - Scheme Type: `PL/SQL Function Returning Boolean`
   - PL/SQL Function Body:
     ```sql
     return :G_USER_ROLE in ('ADMIN', 'MANAGER');
     ```
   - Error Message: `Access denied. Store Manager privileges required.`

3. **`AUTH_IS_CASHIER`**:
   - Scheme Type: `PL/SQL Function Returning Boolean`
   - PL/SQL Function Body:
     ```sql
     return :G_USER_ROLE in ('ADMIN', 'MANAGER', 'CASHIER');
     ```

4. **`AUTH_CAN_PRICE_OVERRIDE`**:
   - Scheme Type: `PL/SQL Function Returning Boolean`
   - PL/SQL Function Body:
     ```sql
     return pkg_pos_auth.has_permission(to_number(:G_USER_ID), 'POS', 'APPROVE');
     ```

5. **`AUTH_CAN_CANCEL_SALE`**:
   - Scheme Type: `PL/SQL Function Returning Boolean`
   - PL/SQL Function Body:
     ```sql
     return pkg_pos_auth.has_permission(to_number(:G_USER_ID), 'SALES', 'DELETE');
     ```

6. **`AUTH_CAN_STOCK_ADJUST`**:
   - Scheme Type: `PL/SQL Function Returning Boolean`
   - PL/SQL Function Body:
     ```sql
     return pkg_pos_auth.has_permission(to_number(:G_USER_ID), 'INVENTORY', 'CREATE');
     ```

---

### 1.6 Reusable Shared Lists of Values (LOVs)
Navigate to **Shared Components > List of Values > Create**:

* **`LOV_BRANCHES`**:
  ```sql
  select branch_name as d, id as r
  from pos_branches
  where company_id = to_number(:G_COMPANY_ID) and is_active = 'Y'
  order by branch_name;
  ```
* **`LOV_CATEGORIES`**:
  ```sql
  select name as d, id as r
  from pos_categories
  where company_id = to_number(:G_COMPANY_ID) and is_active = 'Y'
  order by name;
  ```
* **`LOV_SUBCATEGORIES`**:
  ```sql
  select name as d, id as r
  from pos_subcategories
  where company_id = to_number(:G_COMPANY_ID)
    and (category_id = to_number(:P7_CATEGORY_ID) or :P7_CATEGORY_ID is null)
    and is_active = 'Y'
  order by name;
  ```
* **`LOV_BRANDS`**:
  ```sql
  select name as d, id as r
  from pos_brands
  where company_id = to_number(:G_COMPANY_ID) and is_active = 'Y'
  order by name;
  ```
* **`LOV_UNITS`**:
  ```sql
  select name || ' (' || short_name || ')' as d, id as r
  from pos_units
  where company_id = to_number(:G_COMPANY_ID) and is_active = 'Y'
  order by name;
  ```
* **`LOV_TAXES`**:
  ```sql
  select tax_name || ' (' || tax_percentage || '%)' as d, id as r
  from pos_taxes
  where company_id = to_number(:G_COMPANY_ID) and is_active = 'Y'
  order by tax_percentage;
  ```
* **`LOV_CUSTOMERS`**:
  ```sql
  select name || case when mobile_number is not null then ' (' || mobile_number || ')' end as d, id as r
  from pos_customers
  where company_id = to_number(:G_COMPANY_ID) and is_active = 'Y'
  order by name;
  ```
* **`LOV_SUPPLIERS`**:
  ```sql
  select name || ' [' || supplier_code || ']' as d, id as r
  from pos_suppliers
  where company_id = to_number(:G_COMPANY_ID) and is_active = 'Y'
  order by name;
  ```
* **`LOV_PAYMENT_TYPES`**:
  - Type: `Static Values`
  - Values: `CASH;CASH, UPI;UPI, CARD;CARD, WALLET;WALLET, CREDIT;CREDIT, SPLIT;SPLIT`

---

## 2. Page-by-Page Specifications (All 31 Functional Screens)

---

### Page 1: Login Screen
* **Page Mode**: `Standard` | **Page Template**: `Login`
* **Regions**:
  - `Login Card`: Static Content
* **Page Items**:
  - `P1_USERNAME` (Text Field with Icon `fa-user`, Value Required)
  - `P1_PASSWORD` (Password with Icon `fa-lock`, Value Required)
  - `P1_REMEMBER_ME` (Single Checkbox)
* **Buttons**:
  - `LOGIN` (Hot Button, Action: Submit Page)
* **Processes**:
  - `Login Process` (Type: Native Login, Username: `P1_USERNAME`, Password: `P1_PASSWORD`)

---

### Page 2: Executive Dashboard
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_CASHIER`
* **Region 1: KPI Cards** (Cards Region)
  - **SQL Query**:
    ```sql
    select 'Today Sales' as title, pkg_pos_util.format_inr(today_sales) as val, 'fa-shopping-cart' as icon, 'primary' as card_color from v_pos_dashboard_kpis where company_id = to_number(:G_COMPANY_ID) and branch_id = to_number(:G_BRANCH_ID)
    union all
    select 'Today Profit', pkg_pos_util.format_inr(today_profit), 'fa-line-chart', 'success' from v_pos_dashboard_kpis where company_id = to_number(:G_COMPANY_ID) and branch_id = to_number(:G_BRANCH_ID)
    union all
    select 'Total Bills', to_char(today_bills_count, '999,990'), 'fa-file-text-o', 'info' from v_pos_dashboard_kpis where company_id = to_number(:G_COMPANY_ID) and branch_id = to_number(:G_BRANCH_ID)
    union all
    select 'Low Stock Items', to_char(low_stock_count, '999,990'), 'fa-exclamation-triangle', case when low_stock_count > 0 then 'danger' else 'secondary' end from v_pos_dashboard_kpis where company_id = to_number(:G_COMPANY_ID) and branch_id = to_number(:G_BRANCH_ID)
    union all
    select 'Customer Receivable', pkg_pos_util.format_inr(total_receivable), 'fa-users', 'warning' from v_pos_dashboard_kpis where company_id = to_number(:G_COMPANY_ID) and branch_id = to_number(:G_BRANCH_ID)
    union all
    select 'Supplier Payable', pkg_pos_util.format_inr(total_payable), 'fa-truck', 'secondary' from v_pos_dashboard_kpis where company_id = to_number(:G_COMPANY_ID) and branch_id = to_number(:G_BRANCH_ID);
    ```
* **Region 2: Sales Trend (JET Area Chart)**
  - Series Query:
    ```sql
    select sale_day_label, daily_sales
    from v_pos_sales_trend
    where company_id = to_number(:G_COMPANY_ID) and branch_id = to_number(:G_BRANCH_ID)
    order by sale_date;
    ```
* **Region 3: Payment Mode Distribution (JET Donut Chart)**
  - Series Query:
    ```sql
    select payment_type, total_amount
    from v_pos_payment_mode_summary
    where company_id = to_number(:G_COMPANY_ID) and branch_id = to_number(:G_BRANCH_ID) and payment_day = trunc(sysdate);
    ```
* **Region 4: Category-Wise Sales (JET Bar Chart)**
  - Series Query:
    ```sql
    select category_name, total_sales_amount
    from v_pos_category_sales
    where company_id = to_number(:G_COMPANY_ID) and branch_id = to_number(:G_BRANCH_ID);
    ```
* **Region 5: Top Selling Products (Interactive Report)**
  - Query from `v_pos_top_selling_products`.
* **Region 6: Low Stock Action Items (Interactive Report)**
  - Query: `select product_code, product_name, category_name, available_stock, reorder_level from v_pos_current_stock where company_id = to_number(:G_COMPANY_ID) and branch_id = to_number(:G_BRANCH_ID) and stock_status in ('LOW_STOCK', 'OUT_OF_STOCK');`

---

### Page 3: New Sale / Cashier POS (The Core POS Screen)
* **Page Mode**: `Standard` | **Page Template**: `Minimal (No Navigation/Full Width)`
* **Header / Filter Bar**:
  - `P3_CUSTOMER_ID`: Popup LOV (`LOV_CUSTOMERS`), Default: `1` (Walk-In Customer)
  - `P3_BARCODE`: Text Field with `Barcode/SKU Scan` placeholder.
  - Display Badges: Active Branch (`&G_BRANCH_NAME.`), Cashier Name, Live Clock.
* **Cart Region (Left / Center Grid)**:
  - Source: `APEX_COLLECTION` (`MYPOS_CART`)
  - Columns:
    - Line ID (`c001`), Product ID (`c002`), Product Code (`c003`), Product Name (`c004`)
    - Unit Rate (`n001`), Qty (`n002`), Discount (`n003`), Tax Rate (`n004`), Tax Amount (`n005`), Line Total (`n006`)
    - Action column: Button with icon `fa-trash` calling DA to delete line.
* **Order Summary Sidebar (Right Column)**:
  - `P3_SUBTOTAL`: Display Only (Format: Currency)
  - `P3_ITEM_DISCOUNT`: Display Only
  - `P3_BILL_DISCOUNT`: Number Field (Action: Recalculate on Change)
  - `P3_TAXABLE_AMOUNT`: Display Only
  - `P3_CGST`: Display Only
  - `P3_SGST`: Display Only
  - `P3_IGST`: Display Only
  - `P3_ROUND_OFF`: Display Only
  - `P3_GRAND_TOTAL`: Display Only (Prominent font, 28px bold accent)
* **Buttons / Keyboard Shortcuts**:
  - `BTN_SEARCH` [F2]: Opens Page 4 (Product Search Modal)
  - `BTN_CUSTOMER` [F4]: Focuses `P3_CUSTOMER_ID`
  - `BTN_PAY` [F8]: Opens Page 5 (Payment Modal)
  - `BTN_CLEAR_CART` [ESC]: Clears `MYPOS_CART` collection
* **Dynamic Action on `P3_BARCODE` (Event: Key Release / Enter)**:
  - Action 1: Execute Server-Side Code:
    ```sql
    declare
        v_prod_id     number;
        v_prod_name   varchar2(255);
        v_prod_code   varchar2(50);
        v_price       number(18,2);
        v_tax_rate    number(5,2);
        v_hsn         varchar2(50);
        v_stock       number;
    begin
        -- Look up by barcode or product code
        select p.id, p.name, p.product_code, p.selling_price, coalesce(t.tax_percentage, 0), p.hsn_sac
        into v_prod_id, v_prod_name, v_prod_code, v_price, v_tax_rate, v_hsn
        from pos_products p
        left join pos_taxes t on t.id = p.tax_id
        left join pos_product_barcodes pb on pb.product_id = p.id
        where p.company_id = to_number(:G_COMPANY_ID)
          and (pb.barcode = trim(:P3_BARCODE) or p.product_code = trim(:P3_BARCODE))
          and p.is_active = 'Y'
          and rownum = 1;

        if not pkg_pos_stock.can_sell_stock(to_number(:G_COMPANY_ID), to_number(:G_BRANCH_ID), v_prod_id, 1) then
            raise_application_error(-20010, 'Insufficient stock for product "' || v_prod_name || '"');
        end if;

        if not apex_collection.collection_exists('MYPOS_CART') then
            apex_collection.create_or_truncate_collection('MYPOS_CART');
        end if;

        -- Add or increment line in cart
        apex_collection.add_member(
            p_collection_name => 'MYPOS_CART',
            p_c001            => to_char(v_prod_id),
            p_c002            => v_prod_code,
            p_c003            => v_prod_name,
            p_c004            => v_hsn,
            p_n001            => v_price,
            p_n002            => 1, -- Quantity
            p_n003            => 0, -- Discount
            p_n004            => v_tax_rate,
            p_n005            => round((v_price * v_tax_rate) / 100, 2),
            p_n006            => v_price + round((v_price * v_tax_rate) / 100, 2)
        );
        :P3_BARCODE := null;
    exception
        when no_data_found then
            :P3_BARCODE := null;
    end;
    ```
  - Action 2: Refresh Cart Region and Order Summary Sidebar.

---

### Page 4: Product Search & Barcode Lookup (Modal Dialog)
* **Page Mode**: `Modal Dialog` (Width: 800px)
* **Region**: Interactive Report on `V_POS_CURRENT_STOCK`
  - Columns: Product Code, Name, Category, Brand, MRP, Selling Price, Available Stock (`stock_badge_class`), Action Button ("Select Item").
  - On Row Click / Select: Executes PL/SQL adding selected item into `MYPOS_CART` and closes modal dialog.

---

### Page 5: Payment & Tender Dialog (Modal Dialog)
* **Page Mode**: `Modal Dialog` (Width: 650px)
* **Page Items**:
  - `P5_GRAND_TOTAL`: Display Only (Passed from Page 3)
  - `P5_PAYMENT_TYPE`: Select List (`LOV_PAYMENT_TYPES`), Default: `CASH`
  - `P5_AMOUNT_RECEIVED`: Number Field
  - `P5_CHANGE_AMOUNT`: Display Only
  - `P5_SPLIT_CASH`, `P5_SPLIT_UPI`, `P5_SPLIT_CARD`, `P5_SPLIT_CREDIT`: Number Fields (Displayed when `P5_PAYMENT_TYPE = 'SPLIT'`)
  - `P5_TRANSACTION_REF`: Text Field (For Card / UPI reference numbers)
* **Dynamic Action on `P5_AMOUNT_RECEIVED`**:
  - Computes `P5_CHANGE_AMOUNT = greatest(P5_AMOUNT_RECEIVED - P5_GRAND_TOTAL, 0)`.
* **Validation**:
  - PL/SQL Expression:
    ```sql
    case
        when :P5_PAYMENT_TYPE = 'SPLIT' then
            (coalesce(:P5_SPLIT_CASH, 0) + coalesce(:P5_SPLIT_UPI, 0) + coalesce(:P5_SPLIT_CARD, 0) + coalesce(:P5_SPLIT_CREDIT, 0)) = :P5_GRAND_TOTAL
        when :P5_PAYMENT_TYPE = 'CASH' then
            :P5_AMOUNT_RECEIVED >= :P5_GRAND_TOTAL
        else true
    end
    ```
    - Error Message: `Payment amount does not equal grand total.`
* **Processing (Process Sale)**:
  - Type: `Execute Code`
  ```sql
  declare
      v_items_json    clob;
      v_payments_json clob;
      v_sale_id       number;
      v_inv_no        varchar2(255);
  begin
      -- Build items JSON from APEX_COLLECTION
      select json_arrayagg(
          json_object(
              'product_id'      value to_number(c001),
              'quantity'        value n002,
              'unit_price'      value n001,
              'discount_amount' value n003
          )
      ) into v_items_json
      from apex_collections
      where collection_name = 'MYPOS_CART';

      -- Build payments JSON
      if :P5_PAYMENT_TYPE = 'SPLIT' then
          select json_array(
              json_object('payment_type' value 'CASH',   'amount_received' value coalesce(:P5_SPLIT_CASH, 0)),
              json_object('payment_type' value 'UPI',    'amount_received' value coalesce(:P5_SPLIT_UPI, 0)),
              json_object('payment_type' value 'CARD',   'amount_received' value coalesce(:P5_SPLIT_CARD, 0)),
              json_object('payment_type' value 'CREDIT', 'amount_received' value coalesce(:P5_SPLIT_CREDIT, 0))
          ) into v_payments_json from dual;
      else
          select json_array(
              json_object(
                  'payment_type'           value :P5_PAYMENT_TYPE,
                  'amount_received'        value case when :P5_PAYMENT_TYPE = 'CASH' then :P5_GRAND_TOTAL else :P5_AMOUNT_RECEIVED end,
                  'change_amount'          value :P5_CHANGE_AMOUNT,
                  'transaction_ref_number' value :P5_TRANSACTION_REF
              )
          ) into v_payments_json from dual;
      end if;

      -- Execute Atomic Sale Transaction
      pkg_pos_sales.process_sale(
          p_company_id         => to_number(:G_COMPANY_ID),
          p_branch_id          => to_number(:G_BRANCH_ID),
          p_customer_id        => to_number(:P3_CUSTOMER_ID),
          p_cashier_id         => to_number(:G_USER_ID),
          p_bill_discount      => to_number(:P3_BILL_DISCOUNT),
          p_items_json         => v_items_json,
          p_payments_json      => v_payments_json,
          p_out_sale_id        => v_sale_id,
          p_out_invoice_number => v_inv_no
      );

      -- Clear Cart
      apex_collection.truncate_collection('MYPOS_CART');
      :P5_OUT_SALE_ID := v_sale_id;
  end;
  ```
  - Branch on Submit: Redirect to Page 6 (Receipt), passing `P6_SALE_ID = :P5_OUT_SALE_ID`.

---

### Page 6: Invoice & Receipt (Printable Screen)
* **Page Mode**: `Standard`
* **Region 1: Action Controls**:
  - Buttons: `PRINT_THERMAL` (Icon: `fa-print`), `PRINT_A4` (Icon: `fa-file-pdf-o`), `NEW_SALE` (Redirect to Page 3)
* **Region 2: Thermal Receipt (80mm)**:
  - Source: PL/SQL Dynamic Content:
    ```sql
    htp.p(pkg_pos_invoice.get_thermal_receipt_html(to_number(:P6_SALE_ID)));
    ```
* **Region 3: A4 Tax Invoice Layout**:
  - Source: PL/SQL Dynamic Content:
    ```sql
    htp.p(pkg_pos_invoice.get_a4_tax_invoice_html(to_number(:P6_SALE_ID)));
    ```

---

### Page 7: Product Master
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_MANAGER`
* **Region**: Interactive Grid on `POS_PRODUCTS`
* **Features**: Full CRUD, validation against negative price/stock, category & brand selectors, low stock thresholds.

---

### Page 8: Category Master
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_MANAGER`
* **Region**: Interactive Grid on `POS_CATEGORIES` (Columns: Name, Description, Active Status).

---

### Page 9: Subcategory Master
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_MANAGER`
* **Region**: Interactive Grid on `POS_SUBCATEGORIES` (Columns: Category ID, Name, Description, Active Status).

---

### Page 10: Brand Master
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_MANAGER`
* **Region**: Interactive Grid on `POS_BRANDS` (Columns: Brand Name, Description, Active Status).

---

### Page 11: Customer Master
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_CASHIER`
* **Region**: Interactive Report on `V_POS_CUSTOMER_BALANCES`
* **Form Dialog**: Create / Edit Customer (Code, Name, Mobile, Email, GSTIN, Address, Credit Limit, Opening Balance).
* **Actions**: Link to Customer Ledger (Page 22) and Customer Sales History.

---

### Page 12: Supplier Master
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_MANAGER`
* **Region**: Interactive Report on `V_POS_SUPPLIER_BALANCES`
* **Form Dialog**: Create / Edit Supplier (Code, Name, Mobile, Email, GSTIN, Address, Opening Balance).
* **Actions**: Link to Supplier Ledger (Page 23) and Purchase History.

---

### Page 13: Purchase Order Entry
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_MANAGER`
* **Header**: Supplier LOV (`P13_SUPPLIER_ID`), Bill Invoice # (`P13_INVOICE_NUM`), Purchase Date.
* **Items Grid**: Product LOV, Qty, Purchase Rate, MRP, Tax Rate, Line Total, Batch Number, Expiry Date.
* **Process**: Calls `pkg_pos_purchase.record_purchase`.

---

### Page 14: Purchase History
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_MANAGER`
* **Region**: Interactive Report on `POS_PURCHASES`
* **Actions**: View Order Items, Cancel Order (Requires Admin authorization).

---

### Page 15: Sales History
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_CASHIER`
* **Region**: Interactive Report on `POS_SALES`
* **Columns**: Invoice Number, Date, Customer, Cashier, Taxable, CGST, SGST, Grand Total, Status.
* **Actions**: Reprint (Redirect to Page 6), Sales Return (Page 16), Cancel Invoice (Auth: `AUTH_CAN_CANCEL_SALE`).

---

### Page 16: Sales Return
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_CASHIER`
* **Original Invoice Lookup**: `P16_INVOICE_NO`
* **Items Grid**: Displays sold items, Sold Qty, Already Returned Qty, and Return Qty input.
* **Process**: Calls `pkg_pos_returns.create_sales_return`.

---

### Page 17: Purchase Return
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_MANAGER`
* **Original Purchase Invoice Lookup**: `P17_PO_INVOICE_NO`
* **Process**: Calls `pkg_pos_returns.create_purchase_return`.

---

### Page 18: Current Stock & Inventory Alerts
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_CASHIER`
* **Tab 1**: Live Stock Interactive Report from `V_POS_CURRENT_STOCK`.
* **Tab 2**: Batch & Expiry Tracking Interactive Report from `V_POS_BATCH_STOCK`.

---

### Page 19: Stock Ledger (Audit Trail)
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_MANAGER`
* **Region**: Interactive Report on `V_POS_STOCK_LEDGER` (Displays all 9 transaction types with user and timestamp).

---

### Page 20: Stock Transfer (Inter-Branch)
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_MANAGER`
* **Controls**: From Branch (`&G_BRANCH_ID.`), To Branch (`P20_TO_BRANCH_ID`), Items Grid.
* **Process**: Calls `pkg_pos_transfers.create_stock_transfer` and `complete_stock_transfer`.

---

### Page 21: Stock Adjustment
* **Page Mode**: `Standard` | **Authorization**: `AUTH_CAN_STOCK_ADJUST`
* **Controls**: Product, Current Qty (Display), Counted Qty, Adjustment Type (`IN`/`OUT`), Reason.
* **Process**: Calls `pkg_pos_adjustments.record_adjustment`.

---

### Page 22: Customer Ledger
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_CASHIER`
* **Selector**: `P22_CUSTOMER_ID`
* **Summary Cards**: Opening Balance, Total Debits, Total Credits, Current Balance, Credit Limit.
* **Interactive Report**: `POS_CUSTOMER_LEDGER` with running balance calculation.

---

### Page 23: Supplier Ledger
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_MANAGER`
* **Selector**: `P23_SUPPLIER_ID`
* **Interactive Report**: `POS_SUPPLIER_LEDGER` with running balance calculation.

---

### Page 24: Sales Report
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_MANAGER`
* **Date Filter**: `P24_START_DATE`, `P24_END_DATE`
* **Reports**: Summary by Day, Item-wise Sales, Category-wise Sales, Brand-wise Sales, Cashier-wise Sales.

---

### Page 25: Purchase Report
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_MANAGER`
* **Reports**: Supplier-wise Purchases, Item-wise Purchases, Taxable Inward Breakdown.

---

### Page 26: Gross Profit Report
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_MANAGER`
* **Region**: Interactive Report on `V_POS_PROFIT_ANALYSIS`
* **Columns**: Invoice #, Date, Product Name, Category, Sold Qty, Unit Cost, Selling Price, Gross Profit, Profit Margin %.

---

### Page 27: User Management
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_ADMIN`
* **Region**: Interactive Report on `POS_USERS`
* **Form Dialog**: User Profile, Role LOV, Branch Multi-Select, Active Toggle, Password Setter.

---

### Page 28: Role & Permission Management
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_ADMIN`
* **Region**: Interactive Grid on `POS_ROLE_PERMISSIONS` (Toggles for `can_view`, `can_create`, `can_edit`, `can_delete`, `can_approve`).

---

### Page 29: System Audit Log
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_ADMIN`
* **Region**: Interactive Report on `POS_AUDIT_LOG` (Immutable security log).

---

### Page 30: Company & POS Settings
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_ADMIN`
* **Form Region**: Company Name, GSTIN, Address, Logo, Invoice Prefix (`INVOICE_PREFIX`), Negative Stock Toggle (`ALLOW_NEGATIVE_STOCK`), Currency Code (`CURRENCY_CODE`).

---

### Page 31: Branch Management
* **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_ADMIN`
* **Region**: Interactive Grid on `POS_BRANCHES` (Branch Code, Name, GSTIN, Address, Phone, Email, Active Status).
