"""
=============================================================================
BRAINSHOP PRIVATE LICENSE KEY GENERATOR (FOR VENDOR / DEVELOPER ONLY)
DO NOT SHARE OR DISTRIBUTE THIS FILE TO CLIENTS
=============================================================================
Use this tool to generate an Activation License Key when a client subscribes.
Input client's Machine ID (e.g. BRAINSHOP-7B29-4A1C-99E3) and select plan.
=============================================================================
"""

import hmac
import hashlib
import datetime
import sys
import os
import json

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Secret developer salt - EXACT MATCH WITH server.py
SECRET_SALT = b"MYPOS_SECURE_RETAIL_ENTERPRISE_KEYGEN_SALT_2026"
REGISTRY_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'clients_registry.json')

PLANS = {
    '1': {'code': '1YEAR', 'name': '1-Year Annual Plan (Best Seller)', 'price': 'Rs 3,999', 'days': 365, 'note': 'Roz ka sirf Rs 11! (~Rs 330/mo)'},
    '2': {'code': '6MONTH', 'name': '6-Month Plan', 'price': 'Rs 2,499', 'days': 180, 'note': '~Rs 415/mo'},
    '3': {'code': '3MONTH', 'name': '3-Month Plan', 'price': 'Rs 1,499', 'days': 90, 'note': '~Rs 500/mo'},
    '4': {'code': 'TRIAL15', 'name': '15-Day Free Trial', 'price': 'Rs 0 (FREE)', 'days': 15, 'note': '15 Din Bilkul Free'}
}

def generate_key(machine_id, plan_key='1'):
    machine_id = machine_id.strip().upper()
    plan = PLANS.get(str(plan_key), PLANS['1'])
    
    expiry_date = datetime.date.today() + datetime.timedelta(days=plan['days'])
    date_str = expiry_date.strftime("%Y%m%d")
    lic_type = plan['code']

    payload = f"{machine_id}:{date_str}:{lic_type}".encode('utf-8')
    sig = hmac.new(SECRET_SALT, payload, hashlib.sha256).hexdigest().upper()[:8]
    license_key = f"LIC-{date_str}-{sig}-{lic_type}"
    return license_key, plan, expiry_date

def main():
    print("\n" + "=" * 68)
    print("    BRAINSHOP PRIVATE LICENSE GENERATOR (DEVELOPER USE ONLY)    ")
    print("=" * 68)

    if len(sys.argv) >= 2:
        m_id = sys.argv[1].strip()
        p_choice = sys.argv[2] if len(sys.argv) >= 3 else '1'
        # Map textual code to plan if needed
        for k, v in PLANS.items():
            if v['code'] == p_choice.upper() or k == p_choice:
                p_choice = k
                break
    else:
        m_id = input("\nEnter Client Machine ID (e.g. BRAINSHOP-7B29-4A1C-99E3): ").strip()
        if not m_id:
            print("[!] Error: Machine ID is required!")
            return

        print("\nSelect Subscription Plan:")
        print("  1) 1-Year Annual Plan  - Rs 3,999 [Best Seller] (365 Days - Roz sirf Rs 11!)")
        print("  2) 6-Month Plan        - Rs 2,499 (180 Days - Rs 415/month)")
        print("  3) 3-Month Plan        - Rs 1,499 (90 Days - Rs 500/month)")
        print("  4) 15-Day Free Trial   - Rs 0 [FREE] (15 Days Full Access Demo)")
        p_choice = input("Enter choice (1/2/3/4) [default: 1]: ").strip() or '1'

    if p_choice not in PLANS:
        p_choice = '1'

    key, plan_info, exp_dt = generate_key(m_id, p_choice)

    # Save to clients_registry.json
    try:
        reg = {}
        if os.path.exists(REGISTRY_FILE):
            with open(REGISTRY_FILE, 'r', encoding='utf-8') as f:
                reg = json.load(f)
        reg[m_id] = {
            "shop_name": "Retail Store",
            "owner_info": "Store Owner",
            "plan_name": plan_info['name'],
            "price": plan_info['price'],
            "license_key": key,
            "issued_on": datetime.date.today().strftime("%d-%b-%Y"),
            "expires_on": exp_dt.strftime("%d-%b-%Y"),
            "status": "ACTIVE"
        }
        with open(REGISTRY_FILE, 'w', encoding='utf-8') as f:
            json.dump(reg, f, indent=2, ensure_ascii=False)
    except Exception:
        pass

    print("\n" + "=" * 68)
    print(f"[*] CLIENT MACHINE ID : {m_id}")
    print(f"[*] SELECTED PLAN     : {plan_info['name']}")
    print(f"[*] PLAN PRICE        : {plan_info['price']} ({plan_info['note']})")
    print(f"[*] VALID UNTIL       : {exp_dt.strftime('%d-%b-%Y')}")
    print(f"[*] ACTIVATION KEY    : {key}")
    print("=" * 68)
    print(f"[OK] License generated and saved to registry.")

    print("\n[+] Ready-to-Send WhatsApp Message for Client:\n")
    print("-" * 58)
    print(f"Namaste! Aapka BrainShop Retail Software License ready hai.")
    print(f"Plan: {plan_info['name']}")
    print(f"Price: {plan_info['price']} (Valid until {exp_dt.strftime('%d-%b-%Y')})")
    print(f"Activation Key: {key}\n")
    print("Activation Steps:")
    print("1. Apne computer par BrainShop open karein.")
    print("2. Activation popup me ye License Key paste karein.")
    print("3. 'Activate & Unlock Full System' button dabayein.")
    print("Aapka store turant unlock ho jayega. Dhanyawad!")
    print("-" * 58 + "\n")

if __name__ == '__main__':
    main()
