import os

base_dir = r"c:\Users\sshin\OneDrive\Desktop\POS  PROJECT"

with open(os.path.join(base_dir, "index.html"), "r", encoding="utf-8") as f:
    html = f.read()

with open(os.path.join(base_dir, "styles.css"), "r", encoding="utf-8") as f:
    css = f.read()

with open(os.path.join(base_dir, "qrcode.min.js"), "r", encoding="utf-8") as f:
    qr = f.read()

with open(os.path.join(base_dir, "app.js"), "r", encoding="utf-8") as f:
    js = f.read()

body_start = html.find("<body>") + len("<body>")
body_end = html.rfind("</body>")
body_content = html[body_start:body_end]

# Remove the script tags pointing to external files
body_content = body_content.replace('<script src="qrcode.min.js"></script>', '')
body_content = body_content.replace('<script src="app.js"></script>', '')

bundle = f"""<!-- =============================================================================
     MYPOS COMPLETE COMMERCIAL RETAIL POS - ALL 24 SCREENS (ORACLE APEX EDITION)
     HOW TO USE IN ORACLE APEX:
     1. In APEX Page Designer on Page 1 (Home):
     2. Delete the old 'Page Navigation' region from Content Body.
     3. Create Region -> Type: Static Content -> Title: MyPOS Complete Retail System
     4. Paste this ENTIRE file into the 'Source' box.
     5. Under Page 1 (Top Left) -> Set Appearance -> Page Template: 'Minimal (No Navigation)'
     6. Click 'Save & Run' (Play Button ▶️)!
     ============================================================================= -->

<style>
{css}
</style>

<div id="apex-pos-app-wrapper" style="margin: -16px; min-height: 100vh; position: relative;">
{body_content}
</div>

<script>
{qr}
</script>

<script>
{js}
</script>
"""

out1 = os.path.join(base_dir, "Apex", "APEX_COMPLETE_24_SCREENS_APP.html")
out2 = os.path.join(base_dir, "APEX_COMPLETE_24_SCREENS_APP.html")

with open(out1, "w", encoding="utf-8") as f:
    f.write(bundle)

with open(out2, "w", encoding="utf-8") as f:
    f.write(bundle)

print("SUCCESS: APEX_COMPLETE_24_SCREENS_APP.html generated cleanly!")
print("File size in bytes:", len(bundle))
