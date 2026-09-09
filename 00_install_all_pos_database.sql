-- =============================================================================
-- MASTER INSTALLATION SCRIPT: 00_install_all_pos_database.sql
-- APPLICATION: MyPOS Commercial Retail POS System for Oracle APEX
-- =============================================================================
-- Run this script in SQL*Plus, SQLcl, or Oracle SQL Developer connected to your
-- target Oracle APEX application database schema.
-- =============================================================================

set define off;
set feedback on;
set serveroutput on size unlimited;

prompt >> =====================================================================
prompt >> STEP 1: EXECUTING DATABASE TABLES, CONSTRAINTS, INDEXES & TRIGGERS
prompt >> =====================================================================
@01_pos_schema_ddl.sql;

prompt >> =====================================================================
prompt >> STEP 2: COMPILING ENTERPRISE REPORTING & REAL-TIME VIEWS
prompt >> =====================================================================
@02_pos_views.sql;

prompt >> =====================================================================
prompt >> STEP 3: COMPILING PL/SQL BUSINESS LOGIC & ENCRYPTION PACKAGES
prompt >> =====================================================================
@03_pos_packages.sql;

prompt >> =====================================================================
prompt >> STEP 4: SEEDING COMMERCIAL RETAIL DEMO DATA & PERMISSIONS MATRIX
prompt >> =====================================================================
@04_pos_sample_data.sql;

commit;

prompt >> =====================================================================
prompt >> STEP 5: RUNNING 14-POINT AUTOMATED POS BUSINESS VERIFICATION SUITE
prompt >> =====================================================================
@05_pos_test_suite.sql;

prompt >> =====================================================================
prompt >> STEP 6: VERIFYING APEX APPLICATION 101 SHARED REPOSITORY ENTRIES
prompt >> =====================================================================
@06_apex_application_101.sql;

prompt >> =====================================================================
prompt >> MYPOS DATABASE & UI APPLICATION DEPLOYMENT COMPLETE!
prompt >> Open index.html in any browser to interact with the live UI,
prompt >> and consult APEX_APPLICATION_GUIDE.md to complete App Builder setup.
prompt >> =====================================================================
