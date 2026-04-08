import os
import re

drtech_dir = "/home/henry/sitios/dr_tech_2"
files = ["index.html", "nosotros.html", "computadoras.html", "instalacion.html", "contacto.html"]

for fn in files:
    path = os.path.join(drtech_dir, fn)
    if not os.path.exists(path):
        continue
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove my-5 from footer class
    content = re.sub(r'<footer([^>]*?)\s+my-5([^>]*?)>', r'<footer\1\2>', content)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Removed my-5 margin from all footer tags.")
