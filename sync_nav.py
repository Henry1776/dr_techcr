import os
import re

drtech_dir = "/home/henry/sitios/dr_tech_2"
files = ["index.html", "nosotros.html", "computadoras.html", "instalacion.html", "contacto.html"]

def extract_nav(content):
    match = re.search(r'(<!-- Start Top Nav -->.*?<!-- Close Header -->)', content, flags=re.DOTALL)
    if match:
        return match.group(1)
    return None

with open(os.path.join(drtech_dir, 'nosotros.html'), 'r', encoding='utf-8') as f:
    nosotros_content = f.read()
    
nav_block = extract_nav(nosotros_content)

for fn in files:
    if fn == 'nosotros.html':
        continue
    path = os.path.join(drtech_dir, fn)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We replace the nav block in the target file
    content = re.sub(r'<!-- Start Top Nav -->.*?<!-- Close Header -->', nav_block, content, flags=re.DOTALL)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
