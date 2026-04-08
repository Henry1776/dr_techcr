import os
import re

files = ["index.html", "nosotros.html", "computadoras.html", "instalacion.html", "contacto.html"]
drtech_dir = "/home/henry/sitios/dr_tech_2"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove old Bootstrap 4 link
    content = re.sub(r'<link rel="stylesheet" href="https://cdn\.jsdelivr\.net/npm/bootstrap@4\.5\.3.*?crossorigin="anonymous">', '', content, flags=re.DOTALL)
    
    # 2. Upgrade fonts, duplicate css links (clean up head)
    # the original has <link rel="stylesheet" href="assets/css/style.css"> in head already.
    # we just add the bootstrap 5 link into the head
    b5_head = '''
    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
'''
    if '<!-- Bootstrap 5 -->' not in content:
        content = content.replace('</head>', f'{b5_head}</head>')
    
    # 3. Clean up the bottom JS
    content = re.sub(r'<link href="https://cdn\.jsdelivr\.net/npm/bootstrap@5\.2\.3/dist/css/bootstrap\.min\.css".*?>', '', content)
    content = re.sub(r'<script src="https://cdn\.jsdelivr\.net/npm/bootstrap@5\.2\.3/dist/js/bootstrap.*?></script>', '', content)
    content = re.sub(r'<script src="https://cdn\.jsdelivr\.net/npm/@popperjs/core@2\.11\.6/dist/umd/popper\.min\.js".*?></script>', '', content)
    
    b5_js = '<!-- Bootstrap 5 JS Bundle -->\n<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>'
    if '<!-- Bootstrap 5 JS Bundle -->' not in content:
        content = content.replace('</body>', f'{b5_js}\n</body>')

    # 4. Fix dummy text
    content = content.replace('https://fb.com/templatemo', '#')
    content = content.replace('info@company.com', 'info@drtech.com')
    content = content.replace('Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem', 'Especialistas en tecnología, ofrecemos soluciones garantizadas y soporte de primera.')
    content = content.replace('Ullamco laboris nisi ut', 'Servicio Técnico Especializado')
    content = content.replace('We bring you 100% free CSS templates for your websites.', 'Ofrecemos los mejores productos y accesorios tecnológicos de Costa Rica.')
    content = content.replace('If you wish to support TemplateMo, please make a small contribution via PayPal or tell your friends about our website. Thank you.', 'Con el respaldo de expertos. Visítanos y descubre la mayor variedad de productos.')
    content = content.replace('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod', 'Somos DR TECH, una empresa de tecnología líder enfocada en el cliente.')
    content = content.replace('tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,', 'Nuestros técnicos especializados y equipo de soporte estarán encantados de ayudarle.')
    content = content.replace('quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', 'Nos ubicamos en el corazón de Barva, Heredia, buscando dar un excelente servicio.')
    content = content.replace('<h1>About Us</h1>', '<h1>Acerca de Nosotros</h1>')
    content = content.replace('San XXXXXX', 'San Bartolomé Apostol')
    content = content.replace('00:00 hasta las 00:00', '8:00 AM hasta las 6:00 PM')
    
    # 5. Cards placeholders in computadoras and instalacion
    placeholder_text = 'This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.'
    content = content.replace(placeholder_text, 'Equipos de alta calidad con garantía completa y disponibilidad inmediata. Contáctenos para más detalles.')
    
    # Save back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
for f in files:
    try:
        process_file(os.path.join(drtech_dir, f))
        print(f"Processed {f}")
    except Exception as e:
        print(f"Error processing {f}: {e}")
