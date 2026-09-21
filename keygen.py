import sys
import os
import json
import hashlib
import hmac
import datetime
import re
import subprocess

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

SECRET_SALT = b"MYPOS_SECURE_RETAIL_ENTERPRISE_KEYGEN_SALT_2026"
REGISTRY_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'clients_registry.json')

PLANS = {
    '1': {'code': '1YEAR', 'name': '1-Year Annual Plan (Best Seller)', 'price': 'Rs 3,999', 'days': 365, 'note': 'Roz ka sirf Rs 11! (~Rs 330/mo)'},
    '2': {'code': '6MONTH', 'name': '6-Month Plan', 'price': 'Rs 2,499', 'days': 180, 'note': '~Rs 415/mo'},
    '3': {'code': '3MONTH', 'name': '3-Month Plan', 'price': 'Rs 1,499', 'days': 90, 'note': '~Rs 500/mo'},
    '4': {'code': 'TRIAL15', 'name': '15-Day Free Trial', 'price': 'Rs 0 (FREE)', 'days': 15, 'note': '15 Din Bilkul Free'}
}

def clean_machine_id(raw_id):
    if not raw_id:
        return ""
    raw = str(raw_id).strip()
    match = re.search(r'BRAINSHOP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}', raw, re.IGNORECASE)
    if match:
        return match.group(0).upper()
    return raw.replace('"', '').replace("'", '').replace(" ", "").upper()

def copy_to_clipboard(text):
    try:
        subprocess.run(['clip'], input=text.encode('utf-8'), shell=True, check=False)
        return True
    except Exception:
        return False

def load_registry():
    if os.path.exists(REGISTRY_FILE):
        try:
            with open(REGISTRY_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_to_registry(machine_id, shop_name, owner_info, plan_info, key, exp_dt):
    reg = load_registry()
    reg[machine_id] = {
        "shop_name": shop_name,
        "owner_info": owner_info,
        "plan_name": plan_info['name'],
        "price": plan_info['price'],
        "license_key": key,
        "issued_on": datetime.date.today().strftime("%d-%b-%Y"),
        "expires_on": exp_dt.strftime("%d-%b-%Y"),
        "status": "ACTIVE"
    }
    try:
        with open(REGISTRY_FILE, 'w', encoding='utf-8') as f:
            json.dump(reg, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[Warning] Could not save client to registry: {e}")

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

if __name__ == '__main__':
    shop_name = "Retail Store"
    owner_info = "Store Owner"

    if len(sys.argv) >= 2:
        m_id = sys.argv[1].strip()
        p_choice = sys.argv[2] if len(sys.argv) >= 3 else '1'
        if len(sys.argv) >= 4:
            shop_name = sys.argv[3].strip()
        if len(sys.argv) >= 5:
            owner_info = sys.argv[4].strip()
        for k, v in PLANS.items():
            if v['code'] == p_choice.upper() or k == p_choice:
                p_choice = k
                break
    else:
        print("\n" + "=" * 68)
        print("   BRAINSHOP LICENSE KEY GENERATOR (DEVELOPER / VENDOR ONLY)   ")
        print("=" * 68)
        
        shop_name = input("\nEnter Client Dukaan / Shop Name (e.g. Sharma Kirana Store): ").strip()
        if not shop_name:
            shop_name = "Retail Store"

        owner_info = input("Enter Owner Name & Mobile (e.g. Rohit Sharma - 9876543210): ").strip()
        if not owner_info:
            owner_info = "Owner (N/A)"

        m_id = input("Enter Client Machine ID (e.g. BRAINSHOP-AA57-8347-5592): ").strip().upper()
        if not m_id:
            print("[!] Error: Machine ID is required!")
            sys.exit(1)

        print("\nSelect Subscription Plan:")
        print("  1) 1-Year Annual Plan  - Rs 3,999 [Best Seller] (365 Days - Roz sirf Rs 11!)")
        print("  2) 6-Month Plan        - Rs 2,499 (180 Days - Rs 415/month)")
        print("  3) 3-Month Plan        - Rs 1,499 (90 Days - Rs 500/month)")
        print("  4) 15-Day Free Trial   - Rs 0 [FREE] (15 Days Full Access Demo)")
        p_choice = input("Enter choice (1/2/3/4) [default: 1]: ").strip() or '1'

    if p_choice not in PLANS:
        p_choice = '1'

    m_id = clean_machine_id(m_id)
    key, plan_info, exp_dt = generate_key(m_id, p_choice)
    save_to_registry(m_id, shop_name, owner_info, plan_info, key, exp_dt)

    copied = copy_to_clipboard(key)

    print("\n" + "=" * 68)
    print(f"[*] DUKAAN / SHOP NAME : {shop_name}")
    print(f"[*] OWNER & CONTACT    : {owner_info}")
    print(f"[*] CLIENT MACHINE ID  : {m_id}")
    print(f"[*] SELECTED PLAN      : {plan_info['name']}")
    print(f"[*] PLAN PRICE         : {plan_info['price']} ({plan_info['note']})")
    print(f"[*] VALID UNTIL        : {exp_dt.strftime('%d-%b-%Y')}")
    print("-" * 68)
    print(f"  >>> ACTIVATION KEY :  {key}  <<<")
    print("=" * 68)
    if copied:
        print(f"[OK] KEY AUTO-COPIED TO CLIPBOARD! Press Ctrl + V to paste in BrainShop.")
    else:
        print(f"[OK] Client '{shop_name}' saved to your local clients register.")

    print("\n[+] Ready-to-Send WhatsApp Message for Client:\n")
    print("-" * 58)
    print(f"Namaste {shop_name}! Aapka BrainShop Retail Software License ready hai.")
    print(f"Plan: {plan_info['name']}")
    print(f"Price: {plan_info['price']} (Valid until {exp_dt.strftime('%d-%b-%Y')})")
    print(f"Activation Key: {key}\n")
    print("Activation Steps:")
    print("1. Apne computer par BrainShop open karein.")
    print("2. Activation popup me ye License Key paste karein.")
    print("3. 'Activate & Unlock Full System' button dabayein.")
    print("Aapka store turant unlock ho jayega. Dhanyawad!")
    print("-" * 58)

    print("\n" + "=" * 68)
    input("  Press Enter to close this window...")

if __name__ == '__main__':
    main()
