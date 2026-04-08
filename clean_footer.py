import os
import re

files = ["index.html", "nosotros.html", "computadoras.html", "instalacion.html", "contacto.html"]
drtech_dir = "/home/henry/sitios/dr_tech_2"

for filename in files:
    path = os.path.join(drtech_dir, filename)
    if not os.path.exists(path):
        continue
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove bg-dark and text-info from footer tags
    # <footer class="bg-dark container-fluid text-info p-5 my-5" id="...">
    content = re.sub(r'<footer\s+class="[^"]*bg-dark[^"]*text-info[^"]*"', 
                     lambda m: m.group(0).replace('bg-dark', '').replace('text-info', '').replace('  ', ' '), 
                     content)
    
    # Also remove text-light from footer elements if any
    # This is a bit more complex, let's just target the common ones
    # <h2 class="h2 text-light border-bottom
    footer_match = re.search(r'<footer.*?</footer>', content, flags=re.DOTALL)
    if footer_match:
        footer_content = footer_match.group(0)
        new_footer_content = footer_content.replace('text-light', '').replace('text-primary', '').replace('  ', ' ')
        content = content.replace(footer_content, new_footer_content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
print("Footer classes cleaned up in all files.")
