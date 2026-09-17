import sys
import hashlib
import hmac
import datetime

SECRET_SALT = b"MYPOS_SECURE_RETAIL_ENTERPRISE_KEYGEN_SALT_2026"

def generate_key(machine_id, lic_type="LIFETIME", year=None):
    clean_id = machine_id.strip().upper()
    if not year:
        curr_year = datetime.datetime.now().year
        year = curr_year if lic_type == "LIFETIME" else (curr_year + 1)
    payload = f"{clean_id}:{year}:{lic_type}".encode('utf-8')
    sig = hmac.new(SECRET_SALT, payload, hashlib.sha256).hexdigest().upper()[:8]
    return f"LIC-{year}-{sig}-{lic_type}"

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("\n=======================================================")
        print("   BRAINSHOP LICENSE KEY GENERATOR (DEVELOPER ONLY)   ")
        print("=======================================================")
        print("Usage:")
        print("   python keygen.py <MACHINE_ID> [LIFETIME | 1YEAR]")
        print("\nExample:")
        print("   python keygen.py BRAINSHOP-AA57-8347-5592 LIFETIME")
        print("=======================================================\n")
        sys.exit(1)

    m_id = sys.argv[1]
    l_type = sys.argv[2].upper() if len(sys.argv) > 2 else "LIFETIME"
    if l_type not in ("LIFETIME", "1YEAR"):
        l_type = "LIFETIME"

    key = generate_key(m_id, l_type)
    print("\n" + "=" * 60)
    print("   BRAINSHOP COMMERCIAL LICENSE ACTIVATION KEY   ")
    print("=" * 60)
    print(f"Client Machine ID : {m_id}")
    print(f"License Plan      : {l_type}")
    print(f"Generated Key     : {key}")
    print("=" * 60)
    print("[*] Send this License Key to your client to activate BrainShop.\n")
