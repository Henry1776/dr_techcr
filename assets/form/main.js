'use strict';

(function($) {
    // Variables globales para la tienda
    let carrito = JSON.parse(localStorage.getItem('drtech_carrito')) || [];
    const IVA_RATE = 0.13;
    const COSTO_ENVIO = 2500;
    
    // Funciones de seguridad
    function sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input.replace(/[<>\"']/g, function(match) {
            const map = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;'
            };
            return map[match];
        });
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validatePhone(phone) {
        const re = /^[0-9]{8}$/;
        return re.test(phone.replace(/\s|-/g, ''));
    }
    
    function validateCedula(cedula) {
        const re = /^[0-9]{9}$/;
        return re.test(cedula.replace(/\s|-/g, ''));
    }
    
    // Funciones del carrito de compras
    function actualizarContadorCarrito() {
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        $('#carrito-count').text(totalItems);
    }
    
    function calcularSubtotal() {
        return carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    }
    
    function calcularIVA(subtotal) {
        return Math.round(subtotal * IVA_RATE);
    }
    
    function calcularTotal() {
        const subtotal = calcularSubtotal();
        const iva = calcularIVA(subtotal);
        return subtotal + iva + COSTO_ENVIO;
    }
    
    function actualizarResumenCarrito() {
        const subtotal = calcularSubtotal();
        const iva = calcularIVA(subtotal);
        const total = calcularTotal();
        
        $('#subtotal').text(subtotal.toLocaleString());
        $('#iva').text(iva.toLocaleString());
        $('#envio').text(COSTO_ENVIO.toLocaleString());
        $('#total').text(total.toLocaleString());
    }
    
    function renderizarCarrito() {
        const carritoContainer = $('#carrito-items');
        carritoContainer.empty();
        
        if (carrito.length === 0) {
            carritoContainer.html(`
                <div class="carrito-vacio">
                    <i class="fas fa-shopping-cart"></i>
                    <h4>Tu carrito está vacío</h4>
                    <p>Agrega algunos productos para comenzar</p>
                </div>
            `);
            $('#proceder-checkout').prop('disabled', true);
        } else {
            carrito.forEach((item, index) => {
                const itemHtml = `
                    <div class="carrito-item" data-index="${index}">
                        <img src="${sanitizeInput(item.imagen)}" alt="${sanitizeInput(item.nombre)}">
                        <div class="carrito-item-info">
                            <div class="carrito-item-nombre">${sanitizeInput(item.nombre)}</div>
                            <div class="carrito-item-precio">₡${item.precio.toLocaleString()}</div>
                            <div class="cantidad-controls">
                                <button class="cantidad-btn decrementar" data-index="${index}">-</button>
                                <input type="number" class="cantidad-input" value="${item.cantidad}" min="1" max="10" data-index="${index}">
                                <button class="cantidad-btn incrementar" data-index="${index}">+</button>
                            </div>
                            <div class="subtotal-item">Subtotal: ₡${(item.precio * item.cantidad).toLocaleString()}</div>
                        </div>
                        <button class="eliminar-item" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                carritoContainer.append(itemHtml);
            });
            $('#proceder-checkout').prop('disabled', false);
        }
        
        actualizarResumenCarrito();
        actualizarContadorCarrito();
    }
    
    function agregarAlCarrito(producto) {
        const existingIndex = carrito.findIndex(item => item.id === producto.id);
        
        if (existingIndex !== -1) {
            if (carrito[existingIndex].cantidad < 10) {
                carrito[existingIndex].cantidad++;
            } else {
                alert('Máximo 10 unidades por producto');
                return;
            }
        } else {
            carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen: producto.imagen,
                cantidad: 1
            });
        }
        
        localStorage.setItem('drtech_carrito', JSON.stringify(carrito));
        actualizarContadorCarrito();
        
        // Mostrar notificación
        mostrarNotificacion('Producto agregado al carrito', 'success');
    }
    
    function eliminarDelCarrito(index) {
        carrito.splice(index, 1);
        localStorage.setItem('drtech_carrito', JSON.stringify(carrito));
        renderizarCarrito();
        mostrarNotificacion('Producto eliminado del carrito', 'info');
    }
    
    function actualizarCantidad(index, nuevaCantidad) {
        if (nuevaCantidad < 1 || nuevaCantidad > 10) return;
        
        carrito[index].cantidad = parseInt(nuevaCantidad);
        localStorage.setItem('drtech_carrito', JSON.stringify(carrito));
        renderizarCarrito();
    }
    
    function mostrarNotificacion(mensaje, tipo = 'info') {
        const alertClass = tipo === 'success' ? 'alert-success' : 
                          tipo === 'error' ? 'alert-danger' : 'alert-info';
        
        const notification = $(`
            <div class="alert ${alertClass} alert-dismissible fade show position-fixed" 
                 style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
                ${sanitizeInput(mensaje)}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);
        
        $('body').append(notification);
        
        setTimeout(() => {
            notification.alert('close');
        }, 3000);
    }
    
    // Event Listeners
    $(document).ready(function() {
        // Inicializar carrito
        actualizarContadorCarrito();
        
        // Agregar al carrito
        $('.agregar-carrito').on('click', function() {
            const producto = {
                id: parseInt($(this).data('id')),
                nombre: $(this).data('nombre'),
                precio: parseInt($(this).data('precio')),
                imagen: $(this).data('imagen')
            };
            
            agregarAlCarrito(producto);
        });
        
        // Renderizar carrito cuando se abre el modal
        $('#carritoModal').on('show.bs.modal', function() {
            renderizarCarrito();
        });
        
        // Event delegation para controles del carrito
        $(document).on('click', '.incrementar', function() {
            const index = $(this).data('index');
            const nuevaCantidad = carrito[index].cantidad + 1;
            actualizarCantidad(index, nuevaCantidad);
        });
        
        $(document).on('click', '.decrementar', function() {
            const index = $(this).data('index');
            const nuevaCantidad = carrito[index].cantidad - 1;
            actualizarCantidad(index, nuevaCantidad);
        });
        
        $(document).on('change', '.cantidad-input', function() {
            const index = $(this).data('index');
            const nuevaCantidad = parseInt($(this).val());
            actualizarCantidad(index, nuevaCantidad);
        });
        
        $(document).on('click', '.eliminar-item', function() {
            const index = $(this).data('index');
            if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                eliminarDelCarrito(index);
            }
        });
        
        // Proceder al checkout
        $('#proceder-checkout').on('click', function() {
            if (carrito.length === 0) {
                alert('Tu carrito está vacío');
                return;
            }
            
            // Redirigir a página de checkout
            window.location.href = 'checkout.html';
        });
        
        // Validación de formularios en tiempo real
        $('input[type="email"]').on('blur', function() {
            const email = $(this).val();
            if (email && !validateEmail(email)) {
                $(this).addClass('campo-error');
                $(this).next('.mensaje-error').remove();
                $(this).after('<div class="mensaje-error">Por favor ingresa un email válido</div>');
            } else {
                $(this).removeClass('campo-error').addClass('campo-valido');
                $(this).next('.mensaje-error').remove();
            }
        });
        
        $('input[type="tel"]').on('blur', function() {
            const phone = $(this).val();
            if (phone && !validatePhone(phone)) {
                $(this).addClass('campo-error');
                $(this).next('.mensaje-error').remove();
                $(this).after('<div class="mensaje-error">Por favor ingresa un teléfono válido (8 dígitos)</div>');
            } else {
                $(this).removeClass('campo-error').addClass('campo-valido');
                $(this).next('.mensaje-error').remove();
            }
        });
        
        // Formulario de contacto original
        var form = $('.contact__form'),
            message = $('.contact__msg'),
            form_data;
        
        function done_func(response) {
            message.fadeIn().removeClass('alert-danger').addClass('alert-success');
            message.text(response);
            setTimeout(function () {
                message.fadeOut();
            }, 5000);
            form.find('input:not([type="submit"]), textarea').val('');
        }
        
        function fail_func(data) {
            message.fadeIn().removeClass('alert-success').addClass('alert-danger');
            message.text(data.responseText);
            setTimeout(function () {
                message.fadeOut();
            }, 5000);
        }
        
        form.submit(function (e) {
            e.preventDefault();
            
            // Validar campos antes de enviar
            let isValid = true;
            
            form.find('input[required], textarea[required]').each(function() {
                const value = $(this).val().trim();
                if (!value) {
                    $(this).addClass('campo-error');
                    isValid = false;
                } else {
                    $(this).removeClass('campo-error').addClass('campo-valido');
                }
            });
            
            if (!isValid) {
                mostrarNotificacion('Por favor completa todos los campos requeridos', 'error');
                return;
            }
            
            form_data = $(this).serialize();
            $.ajax({
                type: 'POST',
                url: form.attr('action'),
                data: form_data
            })
            .done(done_func)
            .fail(fail_func);
        });
    });
    
})(jQuery);
