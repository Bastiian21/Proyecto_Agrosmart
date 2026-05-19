import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CarroLateral.css';

function CarroLateral({ isOpen, onClose }) {
  const navigate = useNavigate();


  const { cart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

  const handleProcederPago = () => {
    onClose();
    navigate('/cliente/carrito');
  };

  const handleSeguirComprando = () => {
    onClose();
    navigate('/cliente/catalogo');
  };

  return createPortal(
    <>

      <div className={`carro-overlay ${isOpen ? 'abierto' : ''}`} onClick={onClose}></div>


      <div className={`carro-lateral ${isOpen ? 'abierto' : ''}`}>


        <div className="carro-cabecera">
          <div className="carro-titulo">
            <svg viewBox="0 0 24 24" fill="none" stroke="#00ddeb" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            <div>
              <h2>Carrito de Compras</h2>
              <span>{totalItems} productos</span>
            </div>
          </div>
          <button className="btn-cerrar-carro" onClick={onClose}>✕</button>
        </div>


        <div className="carro-items-contenedor">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>🛒</span>
              <p>Tu carrito está vacío.</p>
            </div>
          ) : (
            cart.map(producto => (
              <div className="tarjeta-item-carro" key={producto.id}>
                <img src={producto.imagen_url || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb18865?w=500'} alt={producto.nombre} className="img-item-carro" />
                <div className="detalles-item-carro">
                  <div className="fila-cabecera-item">
                    <h4>{producto.nombre}</h4>

                    <button className="btn-eliminar" onClick={() => removeFromCart(producto.id)}>🗑️</button>
                  </div>
                  <span className="sku-item">{producto.sku}</span>

                  <div className="fila-acciones-item">
                    <div className="selector-cantidad">

                      <button onClick={() => updateQuantity(producto.id, producto.cantidad - 1)}>-</button>
                      <span>{producto.cantidad}</span>
                      <button onClick={() => updateQuantity(producto.id, producto.cantidad + 1)}>+</button>
                    </div>
                    <div className="precio-item">
                      ${(producto.precio_clp * producto.cantidad).toLocaleString('es-CL')}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>


        {cart.length > 0 && (
          <div className="carro-pie">
            <div className="resumen-mini-carro">
              <div className="col-resumen"><span>Productos</span><strong>{cart.length}</strong></div>
              <div className="col-resumen"><span>Unidades</span><strong>{totalItems}</strong></div>
              <div className="col-resumen"><span>Despacho</span><strong className="texto-verde">Gratis</strong></div>
            </div>


            <button className="btn-limpiar-carro" onClick={clearCart}>🗑️ Limpiar Carrito</button>

            <div className="fila-total-carro">
              <div>
                <span>Total</span>
                <p>{totalItems} productos</p>
              </div>
              <strong className="precio-total">${totalPrice.toLocaleString('es-CL')}</strong>
            </div>

            <div className="fila-botones-carro">
              <button className="btn-seguir" onClick={handleSeguirComprando}>Seguir Comprando</button>
              <button className="btn-pagar" onClick={handleProcederPago}>Proceder al Pago →</button>
            </div>
          </div>
        )}
      </div>
    </>,
    document.body
  );
}

export default CarroLateral;