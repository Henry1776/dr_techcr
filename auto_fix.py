import os

files = ["index.html", "nosotros.html", "computadoras.html", "instalacion.html", "contacto.html"]
drtech_dir = "/home/henry/sitios/dr_tech_2"

onclick_code = '''href="#" onClick="window.open(\'assets/form/form.html\', \'Form\', \'top=100, left=400, width=600, height=600, location=no, status=yes, toolbar=no, menubar=no, scrollbars=no, resizable=no\')"'''

def fix_file(filename):
    path = os.path.join(drtech_dir, filename)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update mailto link everywhere
    content = content.replace('href="mailto:info@drtech.com"', onclick_code)

    if filename == "index.html":
        # Make font color white in some spots or add text-white to headings
        content = content.replace('text-primary"><b>DR-TECH</b>', 'text-white"><b>DR-TECH</b>')
        content = content.replace('<h3 class="h2">', '<h3 class="h2 text-white">')
        content = content.replace('<h1 class="h1">', '<h1 class="h1 text-white">')
        content = content.replace('class="display-3 font-weight-bold', 'class="display-3 font-weight-bold text-white')
        
        # Change card-deck to row
        content = content.replace('<div class="card-deck">', '<div class="row row-cols-1 row-cols-md-3 g-4 justify-content-center">')
        content = content.replace('<div class="card col-12 col-lg-4">', '<div class="col">\n          <div class="card h-100 w-100">')
        
        # We need to add one more closing </div> to each of the 3 cards.
        # Find where they end. The cards end right before the next <div class="col"> or right before </div>\n    </div>\n  </section>
        
        # Let's fix the specific sections using a simpler string replace block
        
        # After card 1:
        content = content.replace('          </div>\n        </div>\n        <div class="col">', '          </div>\n        </div>\n        </div>\n        <div class="col">')
        
        # There's a better way, just regex sub precisely:
        # replace: </div>\n        <div class="col">\n          <div class="card h-100 w-100">
        # with: </div></div>\n        <div class="col">\n          <div class="card h-100 w-100">
        content = content.replace('</div>\n        <div class="col">\n          <div class="card h-100 w-100">', '</div></div>\n        <div class="col">\n          <div class="card h-100 w-100">')
        
        # For the last card:
        content = content.replace('</div>\n      </div>\n    </div>\n  </section>', '</div></div>\n      </div>\n    </div>\n  </section>')

        # Extra sanity check if there are lingering structural issues:
        # Actually a better regex:
        pass
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

for f in files:
    fix_file(f)
