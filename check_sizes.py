import os

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

start = html.find("<body>") + 6
end = html.rfind("</body>")
body = html[start:end]
body = body.replace('<script src="qrcode.min.js"></script>', '').replace('<script src="app.js"></script>', '')

print("Body HTML size in bytes:", len(body.encode("utf-8")))

with open("styles.css", "r", encoding="utf-8") as f:
    css = f.read()
print("styles.css size in bytes:", len(css.encode("utf-8")))

with open("app.js", "r", encoding="utf-8") as f:
    js = f.read()
print("app.js size in bytes:", len(js.encode("utf-8")))
