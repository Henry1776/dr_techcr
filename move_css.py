import os

files = ["index.html", "nosotros.html", "computadoras.html", "instalacion.html", "contacto.html"]
drtech_dir = "/home/henry/sitios/dr_tech_2"

for fn in files:
    path = os.path.join(drtech_dir, fn)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove all instances of style.css
    content = content.replace('<link rel="stylesheet" href="assets/css/style.css">', '')
    content = content.replace('<link rel="stylesheet" href="assets/css/style.css" />', '')
    
    # Put it right before </head>
    content = content.replace('</head>', '\t<link rel="stylesheet" href="assets/css/style.css">\n</head>')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
