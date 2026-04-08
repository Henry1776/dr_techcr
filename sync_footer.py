import os
import re

drtech_dir = "/home/henry/sitios/dr_tech_2"
files = ["nosotros.html", "computadoras.html", "instalacion.html", "contacto.html"]

# 1. Extract footer from index.html
with open(os.path.join(drtech_dir, 'index.html'), 'r', encoding='utf-8') as f:
    index_content = f.read()

footer_match = re.search(r'(<!-- Open footer -->.*?<!-- End Footer -->)', index_content, flags=re.DOTALL)
if not footer_match:
    print("Could not find footer in index.html")
    exit(1)

footer_block = footer_match.group(1)

# 2. Replace footer in other files
for fn in files:
    path = os.path.join(drtech_dir, fn)
    if not os.path.exists(path):
        continue
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We look for the same markers or established footer tag
    new_content = re.sub(r'(<!-- Open footer -->.*?<!-- End Footer -->)', footer_block, content, flags=re.DOTALL)
    
    # If markers not found, try replacing the <footer> tag directly
    if new_content == content:
         new_content = re.sub(r'<footer.*?</footer>', footer_block, content, flags=re.DOTALL)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)

print("Footer synced successfully from index.html to all other pages.")
