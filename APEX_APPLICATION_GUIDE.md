# Complete Oracle APEX Retail POS Implementation Manual

This comprehensive guide details the exact architecture, shared components, regions, queries, page items, dynamic actions, validations, and processes required to configure and run the **MyPOS Commercial Retail POS Application** in Oracle APEX (Version 23.x / 24.x / 26.x).

---

## 1. Application Overview & Setup

| Setting | Value |
| :--- | :--- |
| **Application Name** | `MyPOS - Commercial Retail POS` |
| **Application ID** | e.g. `101` (or next available) |
| **Theme** | Universal Theme (Theme 42) |
| **Navigation Style** | Side Navigation Menu |
| **Authentication Scheme** | Custom PL/SQL Authentication (`POS_CUSTOM_AUTH`) |
| **Application CSS File** | `#APP_FILES#pos_theme_style.css` (Upload `pos_theme_style.css` under Shared Components > Static Application Files) |

---

## 2. Shared Components Configuration

### 2.1 Application Items (Global Session State)
Navigate to **Shared Components > Application Items** and create:
1. `G_COMPANY_ID` (Scope: Application, Session State Protection: Restricted)
2. `G_BRANCH_ID` (Scope: Application, Session State Protection: Restricted)
3. `G_BRANCH_NAME` (Scope: Application, Session State Protection: Unrestricted)
4. `G_USER_ID` (Scope: Application, Session State Protection: Restricted)
5. `G_USER_ROLE` (Scope: Application, Session State Protection: Restricted)

### 2.2 Authentication Scheme
Navigate to **Shared Components > Authentication Schemes**:
- **Name**: `POS_CUSTOM_AUTH`
- **Scheme Type**: `Custom`
- **Authentication Function Name**: `pkg_pos_auth.authenticate_user`
- Set as **Current Authentication Scheme**.

### 2.3 Application Process (Post-Authentication Context)
Navigate to **Shared Components > Application Processes**:
- **Name**: `AP_SET_USER_CONTEXT`
- **Point**: `After Authentication`
- **PL/SQL Code**:
  ```sql
  begin
      pkg_pos_auth.set_session_context(:APP_USER);
  end;
  ```

### 2.4 Authorization Schemes
Navigate to **Shared Components > Authorization Schemes**:
1. **`AUTH_IS_ADMIN`**:
   - Type: `PL/SQL Function Returning Boolean`
   - Body: `return :G_USER_ROLE = 'ADMIN';`
2. **`AUTH_IS_MANAGER`**:
   - Type: `PL/SQL Function Returning Boolean`
   - Body: `return :G_USER_ROLE in ('ADMIN', 'MANAGER');`
3. **`AUTH_CAN_ACCESS_POS`**:
   - Type: `PL/SQL Function Returning Boolean`
   - Body: `return pkg_pos_auth.has_permission(to_number(:G_USER_ID), 'POS', 'VIEW');`
4. **`AUTH_CAN_ACCESS_REPORTS`**:
   - Type: `PL/SQL Function Returning Boolean`
   - Body: `return pkg_pos_auth.has_permission(to_number(:G_USER_ID), 'REPORTS', 'VIEW');`
5. **`AUTH_CAN_ACCESS_ADMIN`**:
   - Type: `PL/SQL Function Returning Boolean`
   - Body: `return :G_USER_ROLE = 'ADMIN';`

### 2.5 Reusable Lists of Values (LOVs)
Navigate to **Shared Components > List of Values**:
- **`LOV_BRANCHES`**:
  ```sql
  select branch_name as d, id as r
  from pos_branches
  where company_id = to_number(:G_COMPANY_ID) and is_active = 'Y'
  order by branch_name;
  ```
- **`LOV_CATEGORIES`**:
  ```sql
  select name as d, id as r
  from pos_categories
  where company_id = to_number(:G_COMPANY_ID) and is_active = 'Y'
  order by name;
  ```
- **`LOV_CUSTOMERS`**:
  ```sql
  select name || case when mobile_number is not null then ' (' || mobile_number || ')' end as d, id as r
  from pos_customers
  where company_id = to_number(:G_COMPANY_ID) and is_active = 'Y'
  order by name;
  ```
- **`LOV_SUPPLIERS`**:
  ```sql
  select name || ' (' || supplier_code || ')' as d, id as r
  from pos_suppliers
  where company_id = to_number(:G_COMPANY_ID) and is_active = 'Y'
  order by name;
  ```
- **`LOV_PAYMENT_TYPES`**:
  - Static Values: `CASH;CASH, UPI;UPI, CARD;CARD, WALLET;WALLET, CREDIT;CREDIT, SPLIT;SPLIT`

---

## 3. Page-by-Page Specifications (All 23 Screens)

---

### Page 1: Login Screen
- **Page Name**: `Login` | **Page Mode**: `Standard` | **Page Template**: `Login`
- **Region**: `MyPOS Login Card` (Static Content)
  - Subtitle: *"Welcome Back, Sign in to your account"*
- **Page Items**:
  - `P1_USERNAME` (Text Field with Icon `fa-user`, Required)
  - `P1_PASSWORD` (Password with Icon `fa-lock`, Required)
  - `P1_REMEMBER_ME` (Single Checkbox)
- **Buttons**:
  - `LOGIN` (Hot Button, Label: *"Login"*, Action: Submit Page)
- **Processes**:
  - Process `Login Process` (Type: Native Login)
    - Username: `P1_USERNAME`, Password: `P1_PASSWORD`

---

### Page 2: Dashboard
- **Page Name**: `Dashboard` | **Page Mode**: `Standard` | **Authorization**: `AUTH_CAN_ACCESS_POS`
- **Region 1: KPI Summary Cards** (Cards Region / HTML Content)
  - **SQL Query**:
    ```sql
    select
        'Today Sales' as kpi_title,
        '₹ ' || to_char(today_sales, '99,99,990.00') as kpi_value,
        '+12%' as trend_label,
        'up' as trend_class,
        'fa-shopping-cart' as icon_class
    from v_pos_dashboard_kpis
    where company_id = to_number(:G_COMPANY_ID) and branch_id = to_number(:G_BRANCH_ID)
    union all
    select
        'Today Profit',
        '₹ ' || to_char(today_profit, '99,99,990.00'),
        '+8%', 'up', 'fa-line-chart'
    from v_pos_dashboard_kpis
    where company_id = to_number(:G_COMPANY_ID) and branch_id = to_number(:G_BRANCH_ID)
    union all
    select
        'Total Bills',
        to_char(today_bills_count, '999,999'),
        '+15%', 'up', 'fa-file-text-o'
    from v_pos_dashboard_kpis
    where company_id = to_number(:G_COMPANY_ID) and branch_id = to_number(:G_BRANCH_ID)
    union all
    select
        'Low Stock',
        to_char(low_stock_count, '999,999'),
        '-3%', 'down', 'fa-exclamation-triangle'
    from v_pos_dashboard_kpis
    where company_id = to_number(:G_COMPANY_ID) and branch_id = to_number(:G_BRANCH_ID);
    ```
- **Region 2: Sales Overview Chart** (Oracle JET Chart: Area/Line)
  - Title: *"Sales Overview"*
  - **SQL Query**:
    ```sql
    select sale_day_label, daily_sales
    from v_pos_sales_trend
    where company_id = to_number(:G_COMPANY_ID) and branch_id = to_number(:G_BRANCH_ID)
    order by sale_date;
    ```
- **Region 3: Top Selling Products** (Classic Report / Cards)
  - Title: *"Top Selling Products"*
  - **SQL Query**:
    ```sql
    select product_name, total_qty_sold, total_sales_revenue, sales_rank
    from v_pos_top_selling_products
    where company_id = to_number(:G_COMPANY_ID) and branch_id = to_number(:G_BRANCH_ID)
      and sales_rank <= 5
    order by sales_rank;
    ```

---

### Page 3: POS / New Sale (Main Cashier Billing)
- **Page Name**: `New Sale` | **Page Mode**: `Standard`
- **Layout Architecture**: 2-Column Responsive Layout (Left: Products & Search [8 cols], Right: Cart & Checkout [4 cols])
- **Header Metadata**:
  - Displays Bill No preview (`pos_invoice_seq.currval + 1`), Date (`to_char(sysdate, 'DD-MM-YYYY')`), Cashier (`:APP_USER`).
- **Left Column Components**:
  1. `P3_CUSTOMER_ID` (Popup LOV on `LOV_CUSTOMERS`, Default: `1` [Walk-in Customer])
  2. `P3_SEARCH_BARCODE` (Text Field with Barcode Scanner autofocus, Placeholder: *"Scan / Search Product (F2)"*)
  3. Category Chips Filter: Horizontal list of categories. Clicking sets `P3_CATEGORY_FILTER` and refreshes product cards.
  4. **Product Cards Grid**:
     - **SQL Query**:
       ```sql
       select
           product_id,
           product_code,
           product_name,
           '₹ ' || to_char(selling_price, '990.00') as price_display,
           selling_price,
           available_stock,
           image_url,
           stock_status,
           stock_badge_class
       from v_pos_current_stock
       where company_id = to_number(:G_COMPANY_ID)
         and branch_id = to_number(:G_BRANCH_ID)
         and is_active = 'Y'
         and (:P3_CATEGORY_FILTER is null or category_id = to_number(:P3_CATEGORY_FILTER))
         and (:P3_SEARCH_BARCODE is null or
              lower(product_name) like '%' || lower(:P3_SEARCH_BARCODE) || '%' or
              lower(product_code) like '%' || lower(:P3_SEARCH_BARCODE) || '%')
       order by product_name;
       ```
- **Right Column (Cart & Totals)**:
  - Sourced from APEX Collection `POS_CART`.
  - **Cart Collection Columns**: `c001` (product_id), `c002` (product_name), `n001` (qty), `n002` (unit_price), `n003` (discount), `n004` (tax_rate), `n005` (line_total).
  - Summary Calculations:
    - Subtotal: `sum(n001 * n002)`
    - Item Discount: `sum(n003)`
    - GST: `sum(round(((n001 * n002 - n003) * n004) / 100, 2))`
    - Grand Total: `round(Subtotal - Item Discount + GST)`
- **Dynamic Actions**:
  1. **Add Product to Cart** (Event: Click on Product Card):
     - PL/SQL Code:
       ```sql
       if not apex_collection.collection_exists('POS_CART') then
           apex_collection.create_collection('POS_CART');
       end if;

       declare
           v_seq_id   number := null;
           v_name     varchar2(255);
           v_code     varchar2(50);
           v_price    number;
           v_tax_rate number;
       begin
           select seq_id into v_seq_id
           from apex_collections
           where collection_name = 'POS_CART'
             and c001 = to_char(:P3_SELECTED_PRODUCT_ID)
             and rownum = 1;

           apex_collection.update_member_attribute(
               p_collection_name => 'POS_CART',
               p_seq             => v_seq_id,
               p_attr_number     => 1, -- n001 (quantity)
               p_number_value    => (
                   select n001 + 1 from apex_collections
                   where collection_name = 'POS_CART' and seq_id = v_seq_id
               )
           );
       exception
           when no_data_found then
               select p.name, p.product_code, p.selling_price, coalesce(t.tax_percentage, 0)
               into v_name, v_code, v_price, v_tax_rate
               from pos_products p
               left join pos_taxes t on t.id = p.tax_id
               where p.id = :P3_SELECTED_PRODUCT_ID;

               apex_collection.add_member(
                   p_collection_name => 'POS_CART',
                   p_c001            => to_char(:P3_SELECTED_PRODUCT_ID),
                   p_c002            => v_name,
                   p_c003            => v_code,
                   p_n001            => 1, -- quantity
                   p_n002            => v_price, -- unit_price
                   p_n003            => 0, -- discount
                   p_n004            => v_tax_rate, -- tax rate
                   p_n005            => round(v_price + (v_price * v_tax_rate / 100), 2)
               );
       end;
       ```
     - Refresh Cart Region.
  2. **Scan Barcode** (Event: Change / Key Release on `P3_SEARCH_BARCODE`):
     - Automatically looks up barcode in `pos_product_barcodes`, adds product to cart, clears search bar.
  3. **Cart Quantity +/- and Trash Button**:
     - Adjusts `n001` in `POS_CART` collection and refreshes totals.
- **Buttons**:
  - `HOLD` (Saves cart to draft storage)
  - `CLEAR` (Truncates `POS_CART` collection)
  - `PAY` (Redirects to Page 5 Payment Modal, passing Grand Total)

---

### Page 4: Product Search / Barcode
- **Page Name**: `Product Search` | **Page Mode**: `Modal Dialog`
- **Region**: Search Bar and Interactive Report on `v_pos_current_stock`.
- **Columns**: `Image`, `Product Name`, `Product Code`, `Price`, `Stock`, `Status`, `Action (Add to Cart)`.
- **Selecting Product**: Closes modal and adds item to Page 3 Cart.

---

### Page 5: Payment Modal
- **Page Name**: `Payment` | **Page Mode**: `Modal Dialog`
- **Header**: Bill Number, Total Payable (`P5_TOTAL_AMOUNT`), Date.
- **Page Items**:
  - `P5_PAYMENT_MODE` (Radio/Pill: `CASH`, `UPI`, `CARD`, `WALLET`, `CREDIT`, `SPLIT`)
  - `P5_AMOUNT_RECEIVED` (Number field, Default: `P5_TOTAL_AMOUNT`)
  - `P5_CHANGE_AMOUNT` (Display only, Green highlight: `P5_AMOUNT_RECEIVED - P5_TOTAL_AMOUNT`)
  - `P5_TRANSACTION_REF` (Text field for UPI/Card reference number)
  - `P5_SPLIT_CASH`, `P5_SPLIT_UPI`, `P5_SPLIT_CARD` (Visible only if Payment Mode = `SPLIT`)
- **Process: Complete Sale**:
  - **Type**: `Execute Code`
  - **PL/SQL Code**:
    ```sql
    declare
        v_items_json    clob;
        v_payments_json clob;
        v_sale_id       number;
        v_invoice_num   varchar2(255);
    begin
        -- Extract items from APEX Collection POS_CART into JSON
        select json_arrayagg(
            json_object(
                'product_id' value to_number(c001),
                'quantity' value n001,
                'unit_price' value n002,
                'discount_amount' value n003,
                'batch_id' value to_number(c003),
                'serial_number' value c004
            )
        ) into v_items_json
        from apex_collections
        where collection_name = 'POS_CART';

        -- Build payments JSON
        if :P5_PAYMENT_MODE = 'SPLIT' then
            v_payments_json := json_array(
                json_object('payment_type' value 'CASH', 'amount_received' value to_number(:P5_SPLIT_CASH)),
                json_object('payment_type' value 'UPI', 'amount_received' value to_number(:P5_SPLIT_UPI), 'transaction_ref_number' value :P5_TRANSACTION_REF),
                json_object('payment_type' value 'CARD', 'amount_received' value to_number(:P5_SPLIT_CARD))
            );
        else
            v_payments_json := json_array(
                json_object(
                    'payment_type' value :P5_PAYMENT_MODE,
                    'amount_received' value to_number(:P5_AMOUNT_RECEIVED),
                    'change_amount' value to_number(:P5_CHANGE_AMOUNT),
                    'transaction_ref_number' value :P5_TRANSACTION_REF
                )
            );
        end if;

        -- Atomic Process Call
        pkg_pos_sales.process_sale(
            p_company_id         => to_number(:G_COMPANY_ID),
            p_branch_id          => to_number(:G_BRANCH_ID),
            p_customer_id        => to_number(:P3_CUSTOMER_ID),
            p_cashier_id         => to_number(:G_USER_ID),
            p_bill_discount      => to_number(:P3_BILL_DISCOUNT),
            p_notes              => :P3_NOTES,
            p_items_json         => v_items_json,
            p_payments_json      => v_payments_json,
            p_out_sale_id        => v_sale_id,
            p_out_invoice_number => v_invoice_num
        );

        -- Clear Cart after successful checkout
        apex_collection.truncate_collection('POS_CART');
        :P5_GENERATED_SALE_ID := v_sale_id;
    end;
    ```
- **Redirect**: On success, close dialog and navigate to Page 6 (`P6_SALE_ID = :P5_GENERATED_SALE_ID`).

---

### Page 6: Invoice / Receipt
- **Page Name**: `Receipt / Invoice` | **Page Mode**: `Standard`
- **Region**: Printable Receipt layout (incorporates `pos-printable-receipt` CSS class)
- **Header**: Company Name, Address, GSTIN, Phone, Invoice No, Date, Cashier Name, Customer Name.
- **Items Report**:
  ```sql
  select
      rownum as sno,
      product_name,
      quantity,
      unit_price,
      line_total
  from pos_sale_items
  where sale_id = to_number(:P6_SALE_ID)
  order by id;
  ```
- **Totals**: Subtotal, Item Discount, GST, Round-Off, Grand Total, Payment Mode.
- **Buttons**:
  - `PRINT` (Action: `javascript:window.print();`)
  - `PDF` (Action: Native APEX PDF download)
  - `NEW_SALE` (Action: Redirect to Page 3)

---

### Page 7: Product Master
- **Page Name**: `Product Master` | **Page Mode**: `Standard`
- **Region**: Interactive Report on `pos_products` joined with categories and taxes.
- **Features**: Search bar, Category filter, Status badge, Add Product button, Excel/CSV Export.
- **Modal Dialog (Page 7 Form)**: SKU, Product Name, Category, Brand, Unit, MRP, Purchase Price, Selling Price, Min/Max stock, Barcode assignment.

---

### Page 8: Category Master
- **Page Name**: `Category Master` | **Page Mode**: `Standard`
- **Region**: Interactive Grid on `pos_categories` and master-detail sub-grid on `pos_subcategories`.
- **Columns**: `Name`, `Description`, `Status` (Active Switch), `Created On`, `Created By`.

---

### Page 9: Inventory / Stock
- **Page Name**: `Inventory / Stock` | **Page Mode**: `Standard`
- **Tabs Container Region**:
  1. **Tab 1: Stock Summary**: Interactive Report on `v_pos_current_stock`.
  2. **Tab 2: Stock Movement**: Interactive Report on `pos_stock_transactions` (Date, Type, Product, Change, Reference).
  3. **Tab 3: Low Stock Alerts**: Products where `available_stock <= reorder_level`.
  4. **Tab 4: Expiry Tracking**: Interactive Report on `v_pos_batch_stock` filtered for `EXPIRING_SOON` and `EXPIRED`.

---

### Page 10: Purchase Entry
- **Page Name**: `Purchase` | **Page Mode**: `Standard`
- **Header Region**: Supplier selector (`LOV_SUPPLIERS`), Purchase Date, Invoice Number (`P10_INVOICE_NO`).
- **Items Region**: Interactive Grid on `pos_purchase_items`.
- **Totals & Payment**: Subtotal, GST, Freight, Total Amount, Paid Amount.
- **Process**: Calls `PKG_POS_PURCHASE.RECORD_PURCHASE` to record bill, update batch, and intake inventory.

---

### Page 11: Customer Master
- **Page Name**: `Customer Master` | **Page Mode**: `Standard`
- **Region**: Interactive Report on `v_pos_customer_balances`.
- **Columns**: `Name`, `Mobile`, `GSTIN`, `Current Balance`, `Credit Limit`, `Available Credit`, `Status`.
- **Form Dialog**: Add/Edit customer profile and credit terms.

---

### Page 12: Supplier Master
- **Page Name**: `Supplier Master` | **Page Mode**: `Standard`
- **Region**: Interactive Report on `v_pos_supplier_balances`.
- **Columns**: `Code`, `Name`, `Mobile`, `GSTIN`, `Current Balance`, `Outstanding`, `Status`.
- **Actions**: Add Supplier, View Purchase History, Pay Outstanding.

---

### Page 13: Sales Return
- **Page Name**: `Sales Return` | **Page Mode**: `Standard`
- **Search Header**: `P13_INVOICE_NUMBER`, `Search` button.
- **Items Grid**: Displays sold items from invoice with return quantity input.
- **Process**: Validates `return_qty <= sold_qty - already_returned`, calls `PKG_POS_RETURNS.PROCESS_SALES_RETURN` to re-credit stock and issue refund/credit note.

---

### Page 14: Purchase Return
- **Page Name**: `Purchase Return` | **Page Mode**: `Standard`
- **Search Header**: Purchase Bill lookup.
- **Items Grid**: Return quantity entry with reason dropdown.
- **Process**: Calls `PKG_POS_RETURNS.PROCESS_PURCHASE_RETURN` to reduce stock and debit supplier ledger.

---

### Page 15: Stock Transfer
- **Page Name**: `Stock Transfer` | **Page Mode**: `Standard`
- **Fields**: From Branch (`P15_FROM_BRANCH`), To Branch (`P15_TO_BRANCH`), Remarks.
- **Items Grid**: Product selection and transfer quantity.
- **Process**: Calls `PKG_POS_TRANSFERS.CREATE_AND_COMPLETE_TRANSFER` to perform atomic `TRANSFER_OUT` and `TRANSFER_IN`.

---

### Page 16: Customer & Supplier Ledgers
- **Page Name**: `Ledger` | **Page Mode**: `Standard`
- **Tabs**:
  1. **Customer Ledger**: Filter by customer and date range. Columns: `Date`, `Particulars`, `Debit`, `Credit`, `Balance`.
  2. **Supplier Ledger**: Filter by supplier and date range. Columns: `Date`, `Particulars`, `Debit`, `Credit`, `Balance`.

---

### Page 17: Sales History
- **Page Name**: `Sales History` | **Page Mode**: `Standard`
- **Filters**: From Date, To Date, Customer, Cashier, Payment Mode.
- **Interactive Report**: `pos_sales` joined with `pos_customers` and `pos_payments`.
- **Action Buttons per Row**: `View Receipt` (Redirect to Page 6), `Return` (Redirect to Page 13), `Cancel Invoice` (with authorization check).

---

### Page 18: Sales Reports
- **Page Name**: `Sales Reports` | **Page Mode**: `Standard`
- **Sub-Tabs**:
  - Summary Report
  - Product-Wise Sales
  - Category-Wise Sales
  - Cashier-Wise Sales
  - Monthly & Daily Breakdown
- Sourced directly from `v_pos_top_selling_products`, `v_pos_category_sales`, and `v_pos_sales_trend`.

---

### Page 19: Profit Report
- **Page Name**: `Profit Report` | **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_MANAGER`
- **Metric Cards**: Total Sales, Total Purchase Cost, Gross Profit, Profit Margin %.
- **Table**: Product-wise and Category-wise profit report sourced from `v_pos_profit_analysis`.

---

### Page 20: User & Role Management
- **Page Name**: `User & Role Management` | **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_ADMIN`
- **Regions**:
  1. **User Master Report**: List of users with assigned Role and Status.
  2. **Module Permissions Matrix**: Interactive Grid displaying 14 permissions with checkboxes for View, Create, Edit, Delete, Approve.

---

### Page 21: Reserved for Future Module
- Kept unassigned to maintain 1:1 parity with the visual reference layout.

---

### Page 22: Audit Log
- **Page Name**: `Audit Log` | **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_ADMIN`
- **Region**: Read-only Interactive Report on `pos_audit_log`.
- **Columns**: `Timestamp`, `User`, `Action`, `Table`, `Record ID`, `Old Value`, `New Value`, `IP Address`, `Remarks`.

---

### Page 23: Company Settings
- **Page Name**: `Company Settings` | **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_ADMIN`
- **Form Sections**:
  - Company Profile (Name, Legal Name, GSTIN, PAN, Address)
  - POS Configuration (Invoice Prefix, Currency Symbol, Allow Negative Stock toggle)
  - Hardware / Receipt (Thermal 80mm vs. A4 layout)

---

### Page 24: Branch Management
- **Page Name**: `Branch Management` | **Page Mode**: `Standard` | **Authorization**: `AUTH_IS_ADMIN`
- **Region**: Interactive Report & Form for adding and editing company branches and GSTINs.
