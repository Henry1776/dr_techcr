import os
import re

drtech_dir = "/home/henry/sitios/dr_tech_2"
files = ["index.html", "nosotros.html", "computadoras.html", "instalacion.html", "contacto.html"]

def clean_active(match, filename):
    original = match.group(0)
    lines = original.split('\n')
    new_lines = []
    for line in lines:
        if '<a class="nav-link' in line:
            # remove active first
            line = line.replace('nav-link active', 'nav-link')
            # check if it's the current file
            if f'href="{filename}"' in line or (filename == 'index.html' and 'href="index.html"' in line):
                line = line.replace('nav-link', 'nav-link active')
        new_lines.append(line)
    return '\n'.join(new_lines)


for fn in files:
    path = os.path.join(drtech_dir, fn)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We replace the navbar-nav block
    content = re.sub(
        r'<div class="navbar-nav ml-auto">.*?</div>', 
        lambda m: clean_active(m, fn), 
        content, 
        flags=re.DOTALL
    )
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
