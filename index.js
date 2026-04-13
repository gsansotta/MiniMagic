
        // Cargar productos desde JSON
        let productos = [];
        
        async function cargarProductosJSON() {
            try {
                const response = await fetch('productos.json');
                productos = await response.json();
                cargarProductos();
            } catch (error) {
                console.error('Error cargando productos:', error);
            }
        }

        let carrito = [];
        let filtroCategoria = 'todos';

        // Cargar productos al iniciar
        function cargarProductos() {
            const grid = document.getElementById('products-grid');
            grid.innerHTML = '';

            productos.forEach(producto => {
                if (filtroCategoria === 'todos' || producto.categoria === filtroCategoria) {
                    const productoHTML = `
                        <div class="product-card">
                            <div class="product-image">
                                ${producto.imagen ? `<img src="${producto.imagen}" alt="${producto.nombre}">` : 'No Image'}
                            </div>
                            <div class="product-info">
                                <div class="product-name">${producto.nombre}</div>
                                <div class="product-description">${producto.descripcion}</div>
                                <div class="product-price">$${producto.precio}</div>
                                <div class="product-actions">
                                    <div class="qty-selector">
                                        <button onclick="changeQty(${producto.id}, -1)">−</button>
                                        <input type="number" value="1" min="1" id="qty-${producto.id}">
                                        <button onclick="changeQty(${producto.id}, 1)">+</button>
                                    </div>
                                    <button class="add-btn" onclick="agregarAlCarrito(${producto.id})">Agregar</button>
                                </div>
                            </div>
                        </div>
                    `;
                    grid.innerHTML += productoHTML;
                }
            });
        }

        function changeQty(id, cambio) {
            const input = document.getElementById(`qty-${id}`);
            let valor = parseInt(input.value) + cambio;
            if (valor > 0) input.value = valor;
        }

        function agregarAlCarrito(id) {
            const producto = productos.find(p => p.id === id);
            const cantidad = parseInt(document.getElementById(`qty-${id}`).value);
            
            const itemCarrito = carrito.find(item => item.id === id);
            if (itemCarrito) {
                itemCarrito.cantidad += cantidad;
            } else {
                carrito.push({ ...producto, cantidad });
            }
            
            document.getElementById(`qty-${id}`).value = 1;
            actualizarCarrito();
        }

        function eliminarDelCarrito(id) {
            carrito = carrito.filter(item => item.id !== id);
            actualizarCarrito();
        }

        function actualizarCarrito() {
            const cartItems = document.getElementById('cart-items');
            const cartCount = document.getElementById('cart-count');
            const cartFooter = document.getElementById('cart-footer');
            
            if (carrito.length === 0) {
                cartItems.innerHTML = '<div class="cart-empty">Tu carrito está vacío</div>';
                cartFooter.style.display = 'none';
                cartCount.textContent = '0';
                return;
            }

            let html = '';
            let total = 0;
            let cantidad = 0;

            carrito.forEach(item => {
                const subtotal = item.precio * item.cantidad;
                total += subtotal;
                cantidad += item.cantidad;
                html += `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.nombre}</div>
                            <div class="cart-item-qty">${item.cantidad}x - $${item.precio}</div>
                        </div>
                        <div class="cart-item-price">$${subtotal}</div>
                        <button class="remove-item" onclick="eliminarDelCarrito(${item.id})">✕</button>
                    </div>
                `;
            });

            cartItems.innerHTML = html;
            document.getElementById('cart-total').textContent = total;
            cartCount.textContent = cantidad;
            cartFooter.style.display = 'block';
        }

        function toggleCart() {
            document.getElementById('cart-sidebar').classList.toggle('open');
        }

        function filterByCategory(categoria) {
            filtroCategoria = categoria;
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            cargarProductos();
        }

        function filterProducts() {
            const search = document.getElementById('search-input').value.toLowerCase();
            const cards = document.querySelectorAll('.product-card');
            
            cards.forEach(card => {
                const nombre = card.querySelector('.product-name').textContent.toLowerCase();
                card.style.display = nombre.includes(search) ? '' : 'none';
            });
        }

        function abrirWhatsApp() {
            if (carrito.length === 0) {
                alert('Tu carrito está vacío');
                return;
            }
            // Abrir modal en lugar de enviar directamente
            document.getElementById('modal-datos').classList.add('active');
        }

        function cerrarModal() {
            document.getElementById('modal-datos').classList.remove('active');
        }

        function enviarWhatsApp(event) {
            event.preventDefault();
            
            const nombre = document.getElementById('nombre').value.trim();
            const apellido = document.getElementById('apellido').value.trim();
            const codigoPostal = document.getElementById('codigopostal').value.trim();

            if (!nombre || !apellido || !codigoPostal) {
                alert('Por favor completa todos los campos');
                return;
            }

            let mensaje = "Hola! 🛍️ Quiero hacer un pedido:%0A%0A";
            mensaje += `👤 *Cliente:* ${nombre} ${apellido}%0A`;
            mensaje += `📍 *Código Postal:* ${codigoPostal}%0A%0A`;
            mensaje += `*DETALLES DEL PEDIDO:*%0A`;
            
            let total = 0;

            carrito.forEach(item => {
                const subtotal = item.precio * item.cantidad;
                mensaje += `📦 ${item.nombre}%0A   Cantidad: ${item.cantidad}x%0A   Precio unitario: $${item.precio}%0A   Subtotal: $${subtotal}%0A%0A`;
                total += subtotal;
            });

            mensaje += `💰 *TOTAL: $${total}*%0A%0A¿Cuál es el costo del envío y cuando pueden entregarlo?`;

            const numeroWhatsApp = "5491154811555"; // Formato internacional para Argentina
            const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
            
            // Limpiar formulario
            document.getElementById('form-datos').reset();
            cerrarModal();
            
            window.open(urlWhatsApp, '_blank');
        }

        // Cerrar modal al hacer click fuera
        document.addEventListener('click', function(event) {
            const modal = document.getElementById('modal-datos');
            if (event.target === modal) {
                cerrarModal();
            }
        });

        // Cargar productos al iniciar
        cargarProductosJSON();
