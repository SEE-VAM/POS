"""
BrainShop License Deactivator & Lock Utility
Revokes license and locks the POS system for a given Machine ID.
Shows Customer Shop/Company name before deactivating to prevent mistakes.
"""
import os
import sys
import json
import sqlite3
import server

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

REGISTRY_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'clients_registry.json')

def load_registry():
    """Loads all registered client licenses from vendor database."""
    if os.path.exists(REGISTRY_FILE):
        try:
            with open(REGISTRY_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}
    # Default seed if file doesn't exist yet
    current_mid = server.get_machine_hardware_id()
    default_seed = {
        current_mid: {
            "shop_name": "BrainShop Retail Store (Main Client)",
            "owner_info": "Store Owner (+91 98765 43210)",
            "plan_name": "1-Year Annual Plan (Best Seller)",
            "price": "Rs 3,999",
            "license_key": "LIC-ACTIVE-CLIENT",
            "issued_on": "18-Sep-2026",
            "expires_on": "18-Sep-2027",
            "status": "ACTIVE"
        }
    }
    try:
        with open(REGISTRY_FILE, 'w', encoding='utf-8') as f:
            json.dump(default_seed, f, indent=2, ensure_ascii=False)
        return default_seed
    except Exception:
        return default_seed

def get_client_shop_info(target_mid):
    """
    Fetches store details by matching Machine ID:
    1. Checks clients_registry.json (Vendor Client Register)
    2. Checks pos_database.db (Local SQLite on PC)
    """
    target_mid = target_mid.strip().upper()
    info = {
        "store_name": "Retail Store",
        "owner": "N/A",
        "phone": "N/A",
        "plan": "Commercial License",
        "status": "ACTIVE",
        "found_in": "Default"
    }

    # 1. Search in clients_registry.json
    reg = load_registry()
    for mid, data in reg.items():
        if mid.strip().upper() == target_mid:
            info["store_name"] = data.get("shop_name") or "Retail Store"
            info["owner"] = data.get("owner_info") or "N/A"
            info["plan"] = data.get("plan_name") or "Commercial License"
            info["status"] = data.get("status") or "ACTIVE"
            info["found_in"] = "Client Register"
            return info

    # 2. Search in local pos_database.db
    db_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pos_database.db')
    if os.path.exists(db_file):
        try:
            conn = sqlite3.connect(db_file)
            c = conn.cursor()
            c.execute("SELECT store_name, address, phone, gstin FROM company_settings LIMIT 1")
            row = c.fetchone()
            conn.close()
            if row and row[0]:
                info["store_name"] = str(row[0])
                info["owner"] = str(row[1]) if row[1] else "Store Owner"
                info["phone"] = str(row[2]) if row[2] else "N/A"
                info["found_in"] = "pos_database.db"
                return info
        except Exception:
            pass

    return info

def main():
    print("\n" + "=" * 70)
    print("      BRAINSHOP LICENSE DEACTIVATION & SYSTEM LOCK UTILITY      ")
    print("                    (VENDOR / ADMIN ONLY)                       ")
    print("=" * 70)

    current_mid = server.get_machine_hardware_id()
    reg = load_registry()

    # Show registered clients if available
    if reg:
        print("\n[REGISTERED CLIENTS IN YOUR RECORD]:")
        idx = 1
        client_list = []
        for mid, data in reg.items():
            status_badge = "ACTIVE" if data.get("status") == "ACTIVE" else "LOCKED"
            s_name = data.get("shop_name", "Shop")
            owner = data.get("owner_info", "N/A")
            print(f"  {idx}) {s_name} | {owner} | ID: {mid} | [{status_badge}]")
            client_list.append((idx, mid, s_name))
            idx += 1
        print("-" * 70)

    print(f"\n[*] Current PC Machine ID : {current_mid}")
    user_input = input("\nEnter Machine ID (or Client Number 1/2) to DEACTIVATE: ").strip()

    if not user_input:
        print("\n[!] Error: Machine ID is required to deactivate.")
        return

    # Check if user entered a number from the list
    entered_id = user_input.upper()
    if user_input.isdigit() and reg:
        chosen_idx = int(user_input)
        if 1 <= chosen_idx <= len(client_list):
            entered_id = client_list[chosen_idx - 1][1]

    # Fetch Shop Information linked to this Machine ID
    shop_info = get_client_shop_info(entered_id)

    # If shop name is generic/unknown, allow vendor to confirm
    if shop_info["store_name"] in ["Retail Store", "BrainShop Retail Store"]:
        custom_name = input(f"Enter Shop Name for Machine ID {entered_id} [Press Enter to keep '{shop_info['store_name']}']: ").strip()
        if custom_name:
            shop_info["store_name"] = custom_name

    # Display Client Shop Details for 100% Confirmation
    print("\n" + "=" * 70)
    print("   [!] VERIFY CLIENT / SHOP DETAILS BEFORE LOCKING:   ")
    print("=" * 70)
    print(f"   Dukaan / Shop Name   : {shop_info['store_name']}")
    print(f"   Owner & Contact      : {shop_info['owner']}")
    print(f"   Plan                 : {shop_info['plan']}")
    print(f"   Target Machine ID    : {entered_id}")
    print(f"   Current Status       : {shop_info['status']}")
    print("=" * 70)
    print("\n[WARNING] Deactivating will immediately LOCK the software for this shop.")
    print("Next time Start_POS.bat is run, billing will be BLOCKED until activated.\n")

    confirm = input(f"Are you SURE you want to DEACTIVATE '{shop_info['store_name']}'? (Type Y to confirm): ").strip().upper()

    if confirm != 'Y':
        print("\n[-] DEACTIVATION CANCELLED.")
        print(f"[SAFE] License remains ACTIVE and untouched for '{shop_info['store_name']}'.\n")
        return

    # Update Registry Status
    if entered_id in reg:
        reg[entered_id]["status"] = "DEACTIVATED"
        try:
            with open(REGISTRY_FILE, 'w', encoding='utf-8') as f:
                json.dump(reg, f, indent=2, ensure_ascii=False)
        except Exception:
            pass

    # 2. Deactivate license file(s) on local computer
    deleted_keys = []
    if entered_id == current_mid:
        # Check current working folder
        current_lic = os.path.join(os.path.dirname(os.path.abspath(__file__)), "license.key")
        if os.path.exists(current_lic):
            try:
                os.remove(current_lic)
                deleted_keys.append(current_lic)
            except Exception as e:
                print(f"[Warning] Could not remove {current_lic}: {e}")

        # Search for any other BrainShop setup folders on Desktop
        search_dirs = [
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),  # Desktop
            os.path.expanduser("~/Desktop"),
            os.path.expanduser("~/OneDrive/Desktop")
        ]
        seen_dirs = set()
        for base_dir in search_dirs:
            if not os.path.exists(base_dir) or base_dir in seen_dirs:
                continue
            seen_dirs.add(base_dir)
            try:
                for entry in os.listdir(base_dir):
                    sub_path = os.path.join(base_dir, entry)
                    if os.path.isdir(sub_path):
                        target_lic = os.path.join(sub_path, "license.key")
                        if os.path.exists(target_lic) and target_lic not in deleted_keys:
                            try:
                                os.remove(target_lic)
                                deleted_keys.append(target_lic)
                            except Exception:
                                pass
            except Exception:
                pass

    print("\n" + "=" * 70)
    print(f"[SUCCESS] License DEACTIVATED and LOCKED!")
    print(f"Shop Name  : {shop_info['store_name']}")
    print(f"Machine ID : {entered_id}")
    print(f"Status     : COMPLETELY LOCKED (Deactivated)")
    if deleted_keys:
        print("\n[OK] License key files removed from system:")
        for k in deleted_keys:
            print(f"    - {k}")
    else:
        print("\n[*] Note: No local license.key found (Already locked or remote client).")
    print("=" * 70 + "\n")

if __name__ == '__main__':
    main()

