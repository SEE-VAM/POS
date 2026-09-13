"""
=============================================================================
MYPOS PRIVATE LICENSE KEY GENERATOR (FOR VENDOR / DEVELOPER ONLY)
DO NOT SHARE OR DISTRIBUTE THIS FILE TO CLIENTS
=============================================================================
Use this tool to generate an Activation License Key when a client pays you.
Input client's Machine ID (e.g. MYPOS-7B29-4A1C-99E3) and select validity.
=============================================================================
"""

import hmac
import hashlib
import datetime
import sys

# Secret developer salt - EXACT MATCH WITH server.py
SECRET_SALT = b"MYPOS_SECURE_RETAIL_ENTERPRISE_KEYGEN_SALT_2026"

def generate_key(machine_id, lic_type='LIFETIME', valid_year=None):
    machine_id = machine_id.strip().upper()
    if not machine_id.startswith('MYPOS-'):
        print("[!] Warning: Machine ID should usually start with 'MYPOS-'")

    if not valid_year:
        if lic_type == 'LIFETIME':
            valid_year = 2099
        else:
            valid_year = datetime.datetime.now().year + 1

    payload = f"{machine_id}:{valid_year}:{lic_type}".encode('utf-8')
    sig = hmac.new(SECRET_SALT, payload, hashlib.sha256).hexdigest().upper()[:8]
    license_key = f"LIC-{valid_year}-{sig}-{lic_type}"
    return license_key

def main():
    print("=" * 65)
    print("    MYPOS PRIVATE LICENSE GENERATOR (DEVELOPER USE ONLY)    ")
    print("=" * 65)

    if len(sys.argv) >= 2:
        m_id = sys.argv[1].strip()
        l_type = sys.argv[2].upper() if len(sys.argv) >= 3 else 'LIFETIME'
    else:
        m_id = input("\nEnter Client Machine ID (e.g. MYPOS-7B29-4A1C-99E3): ").strip()
        if not m_id:
            print("[!] Error: Machine ID is required!")
            return

        print("\nSelect License Plan:")
        print("  1) Lifetime License (One-time payment - ₹9,999)")
        print("  2) 1-Year Annual Subscription (₹4,999 / year)")
        print("  3) 30-Day Free Demo / Trial")
        choice = input("Enter choice (1/2/3) [default: 1]: ").strip()

        if choice == '2':
            l_type = '1YEAR'
        elif choice == '3':
            l_type = 'TRIAL'
        else:
            l_type = 'LIFETIME'

    key = generate_key(m_id, l_type)

    print("\n" + "=" * 65)
    print(f"[*] CLIENT MACHINE ID : {m_id}")
    print(f"[*] PLAN TYPE         : {l_type}")
    print(f"[*] ACTIVATION KEY    : {key}")
    print("=" * 65)

    print("\n📋 Ready-to-Send WhatsApp Message for Client:\n")
    print("-" * 50)
    print(f"Namaste! Aapka MyPOS Retail Software License ready hai.\n")
    print(f"Machine ID: {m_id}")
    print(f"Activation Key: {key}")
    print(f"Plan: {l_type} Active\n")
    print("Software me ye Activation Key paste karein aur 'Activate' dabayein.")
    print("Aapka store turant unlock ho jayega. Thank you!")
    print("-" * 50)

if __name__ == '__main__':
    main()
