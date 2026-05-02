'use strict';

(function($) {
    const carrito = JSON.parse(localStorage.getItem('drtech_carrito')) || [];
    const IVA_RATE = 0.13;
    const COSTO_ENVIO = 2500;

    // Funciones de seguridad y validación
    function sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input.replace(/[<>\"'&]/g, function(match) {
            const map = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '&': '&amp;'
            };
            return map[match];
        });
    }

    function validateCreditCard(number) {
        // Algoritmo de Luhn para validar tarjetas de crédito
        const digits = number.replace(/\D/g, '');
        if (digits.length < 13 || digits.length > 19) return false;
        
        let sum = 0;
        let isEven = false;
        
        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = parseInt(digits[i]);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    }

    function validateCVV(cvv, cardType = 'visa') {
        const digits = cvv.replace(/\D/g, '');
        return cardType === 'amex' ? digits.length === 4 : digits.length === 3;
    }

    function validateCedula(cedula) {
        const digits = cedula.replace(/\D/g, '');
        return digits.length === 9;
    }

    function detectCardType(number) {
        const patterns = {
            visa: /^4/,
            mastercard: /^5[1-5]/,
            amex: /^3[47]/,
            discover: /^6(?:011|5)/
        };
        
        for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(number)) return type;
        }
        return 'unknown';
    }

    // Formatear número de tarjeta
    function formatCardNumber(value) {
        const digits = value.replace(/\D/g, '');
        const groups = digits.match(/.{1,4}/g) || [];
        return groups.join(' ').substr(0, 19);
    }

    // Renderizar resumen del pedido
    function renderCheckoutSummary() {
        if (carrito.length === 0) {
            window.location.href = 'index.html';
            return;
        }

        const itemsContainer = $('#checkout-items');
        itemsContainer.empty();

        carrito.forEach(item => {
            const itemHtml = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="d-flex align-items-center">
                        <img src="${sanitizeInput(item.imagen)}" alt="${sanitizeInput(item.nombre)}" 
                             style="width: 40px; height: 40px; object-fit: contain;" class="me-2">
                        <div>
                            <small class="text-muted">${sanitizeInput(item.nombre)}</small>
                            <br>
                            <small>Cantidad: ${item.cantidad}</small>
                        </div>
                    </div>
                    <span>₡${(item.precio * item.cantidad).toLocaleString()}</span>
                </div>
            `;
            itemsContainer.append(itemHtml);
        });

        // Calcular totales
        const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        const iva = Math.round(subtotal * IVA_RATE);
        const total = subtotal + iva + COSTO_ENVIO;

        $('#checkout-subtotal').text(subtotal.toLocaleString());
        $('#checkout-iva').text(iva.toLocaleString());
        $('#checkout-total').text(total.toLocaleString());
    }

    // Validación en tiempo real
    function setupRealTimeValidation() {
        // Validación de cédula
        $('#cedula').on('input', function() {
            const cedula = $(this).val().replace(/\D/g, '');
            $(this).val(cedula);
            
            if (cedula.length === 9) {
                $(this).removeClass('is-invalid').addClass('is-valid');
            } else if (cedula.length > 0) {
                $(this).removeClass('is-valid').addClass('is-invalid');
            }
        });

        // Validación de teléfono
        $('#telefono').on('input', function() {
            const telefono = $(this).val().replace(/\D/g, '');
            $(this).val(telefono);
            
            if (telefono.length === 8) {
                $(this).removeClass('is-invalid').addClass('is-valid');
            } else if (telefono.length > 0) {
                $(this).removeClass('is-valid').addClass('is-invalid');
            }
        });

        // Formateo y validación de tarjeta
        $('#numero_tarjeta').on('input', function() {
            const formatted = formatCardNumber($(this).val());
            $(this).val(formatted);
            
            const digits = formatted.replace(/\s/g, '');
            if (digits.length >= 13 && validateCreditCard(digits)) {
                $(this).removeClass('is-invalid').addClass('is-valid');
                
                // Detectar tipo de tarjeta
                const cardType = detectCardType(digits);
                $(this).attr('data-card-type', cardType);
            } else if (digits.length > 0) {
                $(this).removeClass('is-valid').addClass('is-invalid');
            }
        });

        // Validación CVV
        $('#cvv').on('input', function() {
            const cvv = $(this).val().replace(/\D/g, '');
            $(this).val(cvv);
            
            const cardType = $('#numero_tarjeta').attr('data-card-type') || 'visa';
            if (validateCVV(cvv, cardType)) {
                $(this).removeClass('is-invalid').addClass('is-valid');
            } else if (cvv.length > 0) {
                $(this).removeClass('is-valid').addClass('is-invalid');
            }
        });

        // Validación de email
        $('#email').on('blur', function() {
            const email = $(this).val();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (emailRegex.test(email)) {
                $(this).removeClass('is-invalid').addClass('is-valid');
            } else if (email.length > 0) {
                $(this).removeClass('is-valid').addClass('is-invalid');
            }
        });
    }

    // Alternar método de pago
    function setupPaymentMethodToggle() {
        $('input[name="metodo_pago"]').on('change', function() {
            if ($(this).val() === 'tarjeta') {
                $('#tarjeta-info').show();
                $('#sinpe-info').hide();
                
                // Hacer campos de tarjeta requeridos
                $('#numero_tarjeta, #cvv, #mes_exp, #ano_exp, #nombre_tarjeta').attr('required', true);
            } else {
                $('#tarjeta-info').hide();
                $('#sinpe-info').show();
                
                // Quitar requerimiento de campos de tarjeta
                $('#numero_tarjeta, #cvv, #mes_exp, #ano_exp, #nombre_tarjeta').removeAttr('required');
            }
        });
    }

    // Procesar formulario de checkout
    function setupCheckoutForm() {
        $('#checkout-form').on('submit', function(e) {
            e.preventDefault();
            
            // Validar formulario
            if (!this.checkValidity()) {
                e.stopPropagation();
                $(this).addClass('was-validated');
                return;
            }

            // Mostrar modal de procesamiento
            $('#procesandoModal').modal('show');

            // Recopilar datos del formulario
            const formData = {
                // Información personal
                nombre: sanitizeInput($('#nombre').val()),
                cedula: sanitizeInput($('#cedula').val()),
                email: sanitizeInput($('#email').val()),
                telefono: sanitizeInput($('#telefono').val()),
                
                // Dirección
                provincia: $('#provincia option:selected').text(),
                canton: $('#canton option:selected').text(),
                distrito: $('#distrito option:selected').text(),
                direccion: `${$('#provincia option:selected').text()}, ${$('#canton option:selected').text()}, ${$('#distrito option:selected').text()}. ${sanitizeInput($('#direccion').val())}`,
                
                // Método de pago
                metodo_pago: $('input[name="metodo_pago"]:checked').val(),
                
                // Carrito
                items: carrito,
                subtotal: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
                iva: Math.round(carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0) * IVA_RATE),
                envio: COSTO_ENVIO,
                total: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0) + 
                       Math.round(carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0) * IVA_RATE) + 
                       COSTO_ENVIO,
                
                // Consentimientos
                marketing: $('#marketing').is(':checked'),
                timestamp: new Date().toISOString()
            };

            // Si es pago con tarjeta, agregar datos de pago (estos se enviarían a la pasarela de pago)
            if (formData.metodo_pago === 'tarjeta') {
                // IMPORTANTE: En producción, estos datos se envían directamente a la pasarela de pago
                // y NUNCA se almacenan en el servidor
                const paymentData = {
                    // Estos datos se cifran y envían a la pasarela de pago
                    card_number: $('#numero_tarjeta').val().replace(/\s/g, ''),
                    cvv: $('#cvv').val(),
                    exp_month: $('#mes_exp').val(),
                    exp_year: $('#ano_exp').val(),
                    card_name: sanitizeInput($('#nombre_tarjeta').val())
                };
                
                // Simular procesamiento de pago
                processPayment(formData, paymentData);
            } else {
                // SINPE Móvil
                processSinpePayment(formData);
            }
        });
    }

    // Procesar pago con tarjeta (simulado)
    function processPayment(orderData, paymentData) {
        // En producción, esto se conectaría con la API de la pasarela de pago
        // usando variables de entorno como process.env.API_KEY_PAYMENT
        
        setTimeout(() => {
            // Simular respuesta exitosa
            const success = Math.random() > 0.1; // 90% de éxito para demo
            
            if (success) {
                const orderId = 'DR' + Date.now();
                
                // Limpiar carrito
                localStorage.removeItem('drtech_carrito');
                
                // Redirigir a página de confirmación
                localStorage.setItem('order_confirmation', JSON.stringify({
                    orderId: orderId,
                    total: orderData.total,
                    metodo: 'Tarjeta de Crédito',
                    email: orderData.email,
                    orderData: orderData
                }));
                
                window.location.href = 'confirmacion-compra.html';
            } else {
                $('#procesandoModal').modal('hide');
                alert('Error al procesar el pago. Por favor intente nuevamente.');
            }
        }, 3000);
    }

    // Procesar pago SINPE
    function processSinpePayment(orderData) {
        setTimeout(() => {
            const orderId = 'DR' + Date.now();
            
            // Limpiar carrito
            localStorage.removeItem('drtech_carrito');
            
            // Redirigir a página de confirmación
            localStorage.setItem('order_confirmation', JSON.stringify({
                orderId: orderId,
                total: orderData.total,
                metodo: 'SINPE Móvil',
                telefono: '8888-8888',
                email: orderData.email,
                orderData: orderData
            }));
            
            window.location.href = 'confirmacion-compra.html';
        }, 2000);
    }

    function setupLocationDropdowns() {
        $('#provincia').on('change', function() {
            const idProvincia = $(this).val();
            const cantonSelect = $('#canton');
            const distritoSelect = $('#distrito');
            
            cantonSelect.empty().append('<option value="">Cargando cantones...</option>').prop('disabled', true);
            distritoSelect.empty().append('<option value="">Seleccione primero un cantón</option>').prop('disabled', true);
            
            if (!idProvincia) {
                cantonSelect.empty().append('<option value="">Seleccione primero una provincia</option>');
                return;
            }
            
            $.getJSON(`https://ubicaciones.paginasweb.cr/provincia/${idProvincia}/cantones.json`, function(data) {
                cantonSelect.empty().append('<option value="">Seleccione un cantón</option>');
                $.each(data, function(key, value) {
                    cantonSelect.append(`<option value="${key}">${value}</option>`);
                });
                cantonSelect.prop('disabled', false);
            }).fail(function() {
                cantonSelect.empty().append('<option value="">Error al cargar cantones</option>');
            });
        });

        $('#canton').on('change', function() {
            const idProvincia = $('#provincia').val();
            const idCanton = $(this).val();
            const distritoSelect = $('#distrito');
            
            distritoSelect.empty().append('<option value="">Cargando distritos...</option>').prop('disabled', true);
            
            if (!idCanton) {
                distritoSelect.empty().append('<option value="">Seleccione primero un cantón</option>');
                return;
            }
            
            $.getJSON(`https://ubicaciones.paginasweb.cr/provincia/${idProvincia}/canton/${idCanton}/distritos.json`, function(data) {
                distritoSelect.empty().append('<option value="">Seleccione un distrito</option>');
                $.each(data, function(key, value) {
                    distritoSelect.append(`<option value="${key}">${value}</option>`);
                });
                distritoSelect.prop('disabled', false);
            }).fail(function() {
                distritoSelect.empty().append('<option value="">Error al cargar distritos</option>');
            });
        });
    }

    // Inicialización
    $(document).ready(function() {
        setupLocationDropdowns();
        renderCheckoutSummary();
        setupRealTimeValidation();
        setupPaymentMethodToggle();
        setupCheckoutForm();
        
        // Prevenir envío accidental del formulario
        $('#checkout-form input').on('keypress', function(e) {
            if (e.which === 13 && $(this).attr('type') !== 'submit') {
                e.preventDefault();
            }
        });
        
        // Seguridad: Limpiar campos sensibles al salir de la página
        $(window).on('beforeunload', function() {
            $('#numero_tarjeta, #cvv').val('');
        });
    });

})(jQuery);
