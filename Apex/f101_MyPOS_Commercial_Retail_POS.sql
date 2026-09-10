prompt --application/set_environment
set define off verify off feedback off
whenever sqlerror exit sql.sqlcode rollback;
--------------------------------------------------------------------------------
--
-- Oracle APEX Application Export File
-- Application: 101 - MyPOS Commercial Retail POS
-- Parsing Schema: WKSP_SHIVAM143WORKSPACE
--
--------------------------------------------------------------------------------
begin
wwv_flow_imp.import_begin (
 p_version_yyyy_mm_dd=>'2024.05.31'
,p_release=>'24.1.0'
,p_default_workspace_id=>12345678901234
,p_default_application_id=>101
,p_default_id_offset=>0
,p_default_owner=>'WKSP_SHIVAM143WORKSPACE'
);
end;
/
prompt --application/delete_application
begin
wwv_flow_imp.component_begin (
 p_version_yyyy_mm_dd=>'2024.05.31'
,p_release=>'24.1.0'
,p_default_workspace_id=>12345678901234
,p_default_application_id=>101
,p_default_id_offset=>0
,p_default_owner=>'WKSP_SHIVAM143WORKSPACE'
);
wwv_flow_imp.component_end;
end;
/
prompt --application/create_application
begin
wwv_flow_imp.component_begin (
 p_version_yyyy_mm_dd=>'2024.05.31'
,p_release=>'24.1.0'
,p_default_workspace_id=>12345678901234
,p_default_application_id=>101
,p_default_id_offset=>0
,p_default_owner=>'WKSP_SHIVAM143WORKSPACE'
);
wwv_flow_imp_shared.create_flow(
 p_id=>101
,p_owner=>'WKSP_SHIVAM143WORKSPACE'
,p_name=>'MyPOS - Commercial Retail POS'
,p_alias=>'MYPOS'
,p_page_view_logging=>'YES'
,p_page_view_cache_mode=>'DISABLED'
,p_theme_id=>42
,p_theme_version=>'24.1'
,p_default_page_template=>'#DEFAULT#'
,p_home_page=>2
,p_login_page=>1
);
wwv_flow_imp.component_end;
end;
/
prompt --application/shared_components/user_interface/templates/application_items
begin
wwv_flow_imp.component_begin (
 p_version_yyyy_mm_dd=>'2024.05.31'
,p_release=>'24.1.0'
,p_default_workspace_id=>12345678901234
,p_default_application_id=>101
,p_default_id_offset=>0
,p_default_owner=>'WKSP_SHIVAM143WORKSPACE'
);
wwv_flow_imp_shared.create_flow_item(
 p_id=>10100101
,p_name=>'G_COMPANY_ID'
,p_scope=>'APPLICATION'
,p_protection_level=>'I'
);
wwv_flow_imp_shared.create_flow_item(
 p_id=>10100102
,p_name=>'G_BRANCH_ID'
,p_scope=>'APPLICATION'
,p_protection_level=>'I'
);
wwv_flow_imp_shared.create_flow_item(
 p_id=>10100103
,p_name=>'G_BRANCH_NAME'
,p_scope=>'APPLICATION'
,p_protection_level=>'N'
);
wwv_flow_imp_shared.create_flow_item(
 p_id=>10100104
,p_name=>'G_USER_ID'
,p_scope=>'APPLICATION'
,p_protection_level=>'I'
);
wwv_flow_imp_shared.create_flow_item(
 p_id=>10100105
,p_name=>'G_USER_ROLE'
,p_scope=>'APPLICATION'
,p_protection_level=>'I'
);
wwv_flow_imp.component_end;
end;
/
prompt --application/shared_components/security/authorizations
begin
wwv_flow_imp.component_begin (
 p_version_yyyy_mm_dd=>'2024.05.31'
,p_release=>'24.1.0'
,p_default_workspace_id=>12345678901234
,p_default_application_id=>101
,p_default_id_offset=>0
,p_default_owner=>'WKSP_SHIVAM143WORKSPACE'
);
wwv_flow_imp_shared.create_security_scheme(
 p_id=>10100201
,p_name=>'AUTH_IS_ADMIN'
,p_scheme_type=>'NATIVE_PLSQL'
,p_attribute_01=>'return :G_USER_ROLE = ''ADMIN'';'
,p_error_message=>'Administrator access required.'
);
wwv_flow_imp_shared.create_security_scheme(
 p_id=>10100202
,p_name=>'AUTH_IS_MANAGER'
,p_scheme_type=>'NATIVE_PLSQL'
,p_attribute_01=>'return :G_USER_ROLE in (''ADMIN'', ''MANAGER'');'
,p_error_message=>'Manager access required.'
);
wwv_flow_imp_shared.create_security_scheme(
 p_id=>10100203
,p_name=>'AUTH_IS_CASHIER'
,p_scheme_type=>'NATIVE_PLSQL'
,p_attribute_01=>'return :G_USER_ROLE in (''ADMIN'', ''MANAGER'', ''CASHIER'');'
);
wwv_flow_imp.component_end;
end;
/
prompt --application/pages/all_pages
begin
wwv_flow_imp.component_begin (
 p_version_yyyy_mm_dd=>'2024.05.31'
,p_release=>'24.1.0'
,p_default_workspace_id=>12345678901234
,p_default_application_id=>101
,p_default_id_offset=>0
,p_default_owner=>'WKSP_SHIVAM143WORKSPACE'
);
wwv_flow_imp_page.create_page(p_id=>1, p_name=>'Login', p_alias=>'LOGIN', p_step_title=>'MyPOS - Login', p_page_is_public_y_n=>'Y');
wwv_flow_imp_page.create_page(p_id=>2, p_name=>'Executive Dashboard', p_alias=>'DASHBOARD', p_step_title=>'MyPOS - Dashboard');
wwv_flow_imp_page.create_page(p_id=>3, p_name=>'New Sale / POS', p_alias=>'POS', p_step_title=>'MyPOS - Point of Sale');
wwv_flow_imp_page.create_page(p_id=>4, p_name=>'Product Search', p_alias=>'PRODUCT-SEARCH', p_step_title=>'Search Products', p_page_mode=>'MODAL');
wwv_flow_imp_page.create_page(p_id=>5, p_name=>'Payment & Tender', p_alias=>'PAYMENT', p_step_title=>'Payment Checkout', p_page_mode=>'MODAL');
wwv_flow_imp_page.create_page(p_id=>6, p_name=>'Invoice & Receipt', p_alias=>'RECEIPT', p_step_title=>'Invoice & Receipt');
wwv_flow_imp_page.create_page(p_id=>7, p_name=>'Product Master', p_alias=>'PRODUCTS', p_step_title=>'Product Master');
wwv_flow_imp_page.create_page(p_id=>8, p_name=>'Category Master', p_alias=>'CATEGORIES', p_step_title=>'Category Master');
wwv_flow_imp_page.create_page(p_id=>9, p_name=>'Subcategory Master', p_alias=>'SUBCATEGORIES', p_step_title=>'Subcategory Master');
wwv_flow_imp_page.create_page(p_id=>10, p_name=>'Brand Master', p_alias=>'BRANDS', p_step_title=>'Brand Master');
wwv_flow_imp_page.create_page(p_id=>11, p_name=>'Customer Master', p_alias=>'CUSTOMERS', p_step_title=>'Customer Master');
wwv_flow_imp_page.create_page(p_id=>12, p_name=>'Supplier Master', p_alias=>'SUPPLIERS', p_step_title=>'Supplier Master');
wwv_flow_imp_page.create_page(p_id=>13, p_name=>'Purchase Entry', p_alias=>'PURCHASE', p_step_title=>'Purchase Order Entry');
wwv_flow_imp_page.create_page(p_id=>14, p_name=>'Purchase History', p_alias=>'PURCHASE-HISTORY', p_step_title=>'Purchase History');
wwv_flow_imp_page.create_page(p_id=>15, p_name=>'Sales History', p_alias=>'SALES-HISTORY', p_step_title=>'Sales History');
wwv_flow_imp_page.create_page(p_id=>16, p_name=>'Sales Return', p_alias=>'SALES-RETURN', p_step_title=>'Sales Return');
wwv_flow_imp_page.create_page(p_id=>17, p_name=>'Purchase Return', p_alias=>'PURCHASE-RETURN', p_step_title=>'Purchase Return');
wwv_flow_imp_page.create_page(p_id=>18, p_name=>'Current Stock', p_alias=>'INVENTORY', p_step_title=>'Current Stock & Alerts');
wwv_flow_imp_page.create_page(p_id=>19, p_name=>'Stock Ledger', p_alias=>'STOCK-LEDGER', p_step_title=>'Stock Movement Ledger');
wwv_flow_imp_page.create_page(p_id=>20, p_name=>'Stock Transfer', p_alias=>'STOCK-TRANSFER', p_step_title=>'Stock Transfer');
wwv_flow_imp_page.create_page(p_id=>21, p_name=>'Stock Adjustment', p_alias=>'STOCK-ADJUSTMENT', p_step_title=>'Stock Adjustment');
wwv_flow_imp_page.create_page(p_id=>22, p_name=>'Customer Ledger', p_alias=>'CUSTOMER-LEDGER', p_step_title=>'Customer Ledger');
wwv_flow_imp_page.create_page(p_id=>23, p_name=>'Supplier Ledger', p_alias=>'SUPPLIER-LEDGER', p_step_title=>'Supplier Ledger');
wwv_flow_imp_page.create_page(p_id=>24, p_name=>'Sales Report', p_alias=>'SALES-REPORT', p_step_title=>'Sales Report');
wwv_flow_imp_page.create_page(p_id=>25, p_name=>'Purchase Report', p_alias=>'PURCHASE-REPORT', p_step_title=>'Purchase Report');
wwv_flow_imp_page.create_page(p_id=>26, p_name=>'Profit Report', p_alias=>'PROFIT-REPORT', p_step_title=>'Profit Report');
wwv_flow_imp_page.create_page(p_id=>27, p_name=>'User Management', p_alias=>'USERS', p_step_title=>'User Management');
wwv_flow_imp_page.create_page(p_id=>28, p_name=>'Role Permissions', p_alias=>'ROLES', p_step_title=>'Role & Permission Matrix');
wwv_flow_imp_page.create_page(p_id=>29, p_name=>'Audit Log', p_alias=>'AUDIT-LOG', p_step_title=>'Audit Trail');
wwv_flow_imp_page.create_page(p_id=>30, p_name=>'Company Settings', p_alias=>'SETTINGS', p_step_title=>'Store Settings');
wwv_flow_imp_page.create_page(p_id=>31, p_name=>'Branch Management', p_alias=>'BRANCHES', p_step_title=>'Branch Management');
wwv_flow_imp.component_end;
end;
/
prompt --application/end_environment
begin
wwv_flow_imp.import_end(p_auto_install_sup_obj => false);
commit;
end;
/
