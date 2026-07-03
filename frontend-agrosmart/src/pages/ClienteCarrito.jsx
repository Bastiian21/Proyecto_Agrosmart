import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientNavbar from '../components/ClientNavbar';
import { useCart } from '../context/CartContext';
import './ClienteCarrito.css';

function ClienteCarrito() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart } = useCart();

  const [mostrarModalLogin, setMostrarModalLogin] = useState(false);

  const usuario = (() => {
    try { return JSON.parse(localStorage.getItem('usuarioAgrosmart')); }
    catch { return null; }
  })();

  const handleProcederPago = () => {
    if (!usuario) { setMostrarModalLogin(true); return; }
    navigate('/cliente/checkout');
  };

  return (
    <div className="contenedor-pagina-carrito">
      <ClientNavbar />

      <div className="contenido-pagina-carrito animacion-entrada">
        <div className="carrito-topline">
          <span className="carrito-topline-dot" />
          <b>AGROSMART</b>
          <span>/ SISTEMA DE PEDIDOS</span>
        </div>

        <button className="btn-volver-catalogo" onClick={() => navigate('/cliente/catalogo')}>
          ← Volver al catálogo
        </button>

        <div className="carrito-stepper">
          <span className="carrito-step done">
            <span className="carrito-step-num">01</span> Carro
          </span>
          <span className="carrito-step-sep" />
          <span className="carrito-step">
            <span className="carrito-step-num">02</span> Entrega
          </span>
          <span className="carrito-step-sep" />
          <span className="carrito-step">
            <span className="carrito-step-num">03</span> Pago
          </span>
        </div>

        <div className="cabecera-pagina-carrito">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <h1>Carrito de Compras <span>({totalItems} producto{totalItems !== 1 ? 's' : ''})</span></h1>
        </div>

        <div className="grid-carrito">
          <div className="col-izquierda-carrito">
            {cart.length === 0 ? (
              <div className="carrito-vacio">
                <span className="carrito-vacio-icon">🛒</span>
                <h2>Tu carrito está vacío</h2>
                <p>Parece que aún no has agregado productos de tecnología para tu campo.</p>
                <button className="btn-ir-catalogo" onClick={() => navigate('/cliente/catalogo')}>
                  Ir al Catálogo
                </button>
              </div>
            ) : (
              cart.map((producto) => (
                <div className="item-carrito-completo" key={producto.id}>
                  <div className="img-item-wrap">
                    <img
                      src={producto.imagen_url || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb18865?w=500'}
                      alt={producto.nombre}
                      className="img-item-completo"
                    />
                  </div>
                  <div className="info-item-completo">
                    <h3>{producto.nombre}</h3>
                    <p>{producto.descripcion ? producto.descripcion.substring(0, 60) + '...' : 'Sin descripción técnica disponible.'}</p>
                    <span className="sku">SKU {producto.sku}</span>
                  </div>
                  <div className="controles-item-completo">
                    <div className="selector-cantidad">
                      <button onClick={() => updateQuantity(producto.id, producto.cantidad - 1)}>−</button>
                      <span>{producto.cantidad}</span>
                      <button onClick={() => updateQuantity(producto.id, producto.cantidad + 1)}>+</button>
                    </div>
                    <div className="precios-item-completo">
                      <strong>${(producto.precio_clp * producto.cantidad).toLocaleString('es-CL')}</strong>
                      <span>${Number(producto.precio_clp).toLocaleString('es-CL')} c/u</span>
                    </div>
                    <button className="btn-eliminar" onClick={() => removeFromCart(producto.id)} title="Quitar del carrito">✕</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="col-derecha-carrito">
            <div className="tarjeta-resumen">
              <h3>Resumen de pedido</h3>
              <div className="fila-resumen">
                <span>Productos ({totalItems})</span>
                <span>${totalPrice.toLocaleString('es-CL')}</span>
              </div>
              <div className="fila-resumen">
                <span>Despacho</span>
                <span className="texto-verde">Se elige en el siguiente paso</span>
              </div>
              <div className="divisor-resumen" />
              <div className="fila-resumen fila-total">
                <span>Total</span>
                <span className="texto-verde-brillo">${totalPrice.toLocaleString('es-CL')}</span>
              </div>

              <div className="seccion-descuento">
                <label>Código de descuento</label>
                <div className="grupo-input-descuento">
                  <input type="text" placeholder="Ingresa tu código" disabled={cart.length === 0} />
                  <button disabled={cart.length === 0}>Aplicar</button>
                </div>
              </div>

              <button
                className="btn-proceder-pago"
                disabled={cart.length === 0}
                onClick={handleProcederPago}
              >
                Continuar
              </button>

              <div className="insignias-confianza">
                <div className="insignia">Pago seguro</div>
                <div className="insignia">SSL encriptado</div>
                <div className="insignia">Datos protegidos</div>
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
            <p>Para proteger tus compras y asociar tu pedido, necesitas iniciar sesión o crear una cuenta en AgroSmart.</p>
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
