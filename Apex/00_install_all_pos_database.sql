-- =============================================================================
-- MASTER INSTALLATION SCRIPT: 00_install_all_pos_database.sql
-- APPLICATION: MyPOS Commercial Retail POS System for Oracle APEX
-- TARGET: Oracle Database 19c / 21c / 23ai / 26.x & Oracle APEX
-- =============================================================================
-- Run this script in SQL*Plus, SQLcl, or Oracle APEX SQL Workshop connected to
-- your target database schema.
-- =============================================================================

set define off;
set feedback on;
set serveroutput on size unlimited;

prompt >> =====================================================================
prompt >> STEP 1: INITIALIZING ORACLE APEX POS DATABASE SCHEMA
prompt >> =====================================================================

declare
    v_tbl_count number;
begin
    select count(*) into v_tbl_count from user_tables where table_name = 'POS_COMPANIES';
    if v_tbl_count = 0 then
        dbms_output.put_line('>> Clean schema detected. Creating full POS tables, constraints, indexes & triggers...');
    else
        dbms_output.put_line('>> Existing POS schema detected. Applying non-destructive migration...');
    end if;
end;
/

-- If tables exist, migration adds missing columns/sequences without dropping anything.
-- If tables do not exist yet, DDL builds them cleanly.
@@01_pos_schema_migration.sql;
@@01_pos_schema_ddl.sql;

prompt >> =====================================================================
prompt >> STEP 2: COMPILING ENTERPRISE REPORTING & REAL-TIME VIEWS
prompt >> =====================================================================
@@02_pos_views.sql;

prompt >> =====================================================================
prompt >> STEP 3: COMPILING PL/SQL BUSINESS LOGIC & ENCRYPTION PACKAGES
prompt >> =====================================================================
@@03_pos_packages.sql;

prompt >> =====================================================================
prompt >> STEP 4: SEEDING COMMERCIAL RETAIL DEMO DATA & PERMISSIONS MATRIX
prompt >> =====================================================================
@@04_pos_sample_data.sql;

commit;

prompt >> =====================================================================
prompt >> STEP 5: RUNNING 16-POINT AUTOMATED POS BUSINESS VERIFICATION SUITE
prompt >> =====================================================================
@@05_pos_test_suite.sql;

prompt >> =====================================================================
prompt >> STEP 6: VERIFYING APEX APPLICATION 101 REPOSITORY & SHARED COMPONENTS
prompt >> =====================================================================
@@06_apex_application_install.sql;

prompt >> =====================================================================
prompt >> MYPOS DATABASE & APEX APPLICATION DEPLOYMENT COMPLETE!
prompt >> Refer to APEX_26_1_COMMERCIAL_POS_MANUAL.md for complete App Builder setup.
prompt >> =====================================================================
