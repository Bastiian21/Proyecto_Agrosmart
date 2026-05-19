import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientNavbar from '../components/ClientNavbar';
import { useCart } from '../context/CartContext';
import './ClienteCarrito.css';

function ClienteCarrito() {
  const navigate = useNavigate();


  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart } = useCart();


  const [mostrarModalLogin, setMostrarModalLogin] = useState(false);


  const handleProcederPago = async () => {

    const userStr = localStorage.getItem('usuarioAgrosmart');
    if (!userStr) {
      setMostrarModalLogin(true);
      return;
    }

    const usuario = JSON.parse(userStr);


    const datosCompraPendiente = {
      usuario_id: usuario.id,
      total: totalPrice,
      items: cart
    };
    localStorage.setItem('ordenPendienteAgrosmart', JSON.stringify(datosCompraPendiente));


    const ordenCompra = "AGRO-" + Math.floor(Math.random() * 1000000);
    const sessionId = "SES-" + usuario.id + "-" + Date.now();

    try {

      const response = await fetch('/api/webpay/iniciar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monto: totalPrice,
          sessionId: sessionId,
          ordenCompra: ordenCompra
        })
      });

      const data = await response.json();

      if (data.url && data.token) {

        const form = document.createElement('form');
        form.action = data.url;
        form.method = 'POST';

        const inputToken = document.createElement('input');
        inputToken.type = 'hidden';
        inputToken.name = 'token_ws';
        inputToken.value = data.token;

        form.appendChild(inputToken);
        document.body.appendChild(form);
        form.submit();
      } else {
        alert("Hubo un problema al contactar a Webpay.");
      }
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      alert("Hubo un error de conexión con el servidor de pagos.");
    }
  };

  return (
    <div className="contenedor-pagina-carrito">
      <ClientNavbar />

      <div className="contenido-pagina-carrito animacion-entrada">
        <button className="btn-volver-catalogo" onClick={() => navigate('/cliente/catalogo')}>
          ← Volver al Catálogo
        </button>

        <div className="cabecera-pagina-carrito">
          <svg viewBox="0 0 24 24" fill="none" stroke="#00ddeb" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          <h1>Carrito de Compras <span>({totalItems} producto{totalItems !== 1 ? 's' : ''})</span></h1>
        </div>

        <div className="grid-carrito">

          <div className="col-izquierda-carrito">
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(0, 18, 46, 0.6)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '15px' }}>🛒</span>
                <h2 style={{ color: 'white', marginBottom: '10px' }}>Tu carrito está vacío</h2>
                <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Parece que aún no has agregado productos de tecnología para tu campo.</p>
                <button
                  onClick={() => navigate('/cliente/catalogo')}
                  style={{ background: '#00ddeb', color: '#00122e', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Ir al Catálogo
                </button>
              </div>
            ) : (
              cart.map((producto) => (
                <div className="item-carrito-completo" key={producto.id}>
                  <img
                    src={producto.imagen_url || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb18865?w=500'}
                    alt={producto.nombre}
                    className="img-item-completo"
                  />
                  <div className="info-item-completo">
                    <h3>{producto.nombre}</h3>
                    <p>{producto.descripcion ? producto.descripcion.substring(0, 60) + '...' : 'Sin descripción técnica disponible.'}</p>
                    <span className="sku">SKU: {producto.sku}</span>
                  </div>

                  <div className="controles-item-completo">
                    <div className="selector-cantidad">
                      <button onClick={() => updateQuantity(producto.id, producto.cantidad - 1)}>-</button>
                      <span>{producto.cantidad}</span>
                      <button onClick={() => updateQuantity(producto.id, producto.cantidad + 1)}>+</button>
                    </div>
                    <div className="precios-item-completo">
                      <strong>${(producto.precio_clp * producto.cantidad).toLocaleString('es-CL')}</strong>
                      <span>${Number(producto.precio_clp).toLocaleString('es-CL')} c/u</span>
                    </div>
                    <button className="btn-eliminar" onClick={() => removeFromCart(producto.id)}>🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>


          <div className="col-derecha-carrito">
            <div className="tarjeta-resumen">
              <h3>Resumen de Orden</h3>

              <div className="fila-resumen">
                <span>Subtotal</span>
                <span>${totalPrice.toLocaleString('es-CL')}</span>
              </div>
              <div className="fila-resumen">
                <span>Despacho al Predio</span>
                {totalPrice > 0 ? <span className="texto-verde">Retiro en Tienda</span> : <span>$0</span>}
              </div>

              <div className="divisor-resumen"></div>

              <div className="fila-resumen fila-total">
                <span>Total</span>
                <span className="texto-verde-brillo">${totalPrice.toLocaleString('es-CL')}</span>
              </div>

              <div className="seccion-descuento">
                <label>CÓDIGO DE DESCUENTO</label>
                <div className="grupo-input-descuento">
                  <input type="text" placeholder="Ingresa tu código" disabled={cart.length === 0} />
                  <button disabled={cart.length === 0}>Aplicar</button>
                </div>
              </div>

              <button
                className="btn-proceder-pago webpay-btn"
                disabled={cart.length === 0}
                style={{ opacity: cart.length === 0 ? 0.5 : 1, cursor: cart.length === 0 ? 'not-allowed' : 'pointer' }}
                onClick={handleProcederPago}
              >
                Pagar con Webpay
              </button>

              <div className="insignias-confianza">
                <div className="insignia">🔒 Pago Seguro</div>
                <div className="insignia">🛡️ SSL Encriptado</div>
                <div className="insignia">📄 Datos Protegidos</div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {mostrarModalLogin && (
        <div className="modal-overlay" onClick={() => setMostrarModalLogin(false)}>
          <div className="modal-login-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-lock">🔒</div>
            <h2>¡Casi listo!</h2>
            <p>Para proteger tus compras y asociar tu pedido a la sucursal de retiro, necesitas iniciar sesión o crear una cuenta en AgroSmart.</p>
            <div className="modal-login-actions">
              <button className="btn-cancelar" onClick={() => setMostrarModalLogin(false)}>Cancelar</button>
              <button className="btn-ir-login" onClick={() => navigate('/cliente/login')}>Ir a Iniciar Sesión</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ClienteCarrito;