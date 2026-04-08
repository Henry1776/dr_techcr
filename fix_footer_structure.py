import os
import re

drtech_dir = "/home/henry/sitios/dr_tech_2"
files = ["computadoras.html", "instalacion.html"]

for fn in files:
    path = os.path.join(drtech_dir, fn)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Look for the card container end
    # It usually ends with:
    #       </div>
    #     </div>
    #   </div>
    #   <!-- Close Cards -->
    
    # Let's fix the footer placement. 
    # Extract footer
    footer_match = re.search(r'(<!-- Open footer -->.*?<!-- End Footer -->)', content, flags=re.DOTALL)
    if not footer_match:
        continue
    footer_block = footer_match.group(1)
    
    # Remove footer from where it is
    content = content.replace(footer_block, '')
    
    # Find the end of the cards container
    # It has <div id="cards" ...>
    # We need to make sure we close the inner div and the id="cards" div.
    
    # In my previous view, I saw:
    # 191:     </div>
    # 192:   </div>
    # 193: 
    # 194:     <!-- Close Cards -->
    
    # If id="cards" started at 78, and we have container at 79...
    # Then 191 ends row/cols, 192 ends container... we need one more to end id="cards".
    
    content = content.replace('<!-- Close Cards -->', '</div>\n    <!-- Close Cards -->')
    
    # Now place footer after "Close Cards"
    content = content.replace('<!-- Close Cards -->', '<!-- Close Cards -->\n\n' + footer_block)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Footer structure fixed in computadoras.html and instalacion.html")
