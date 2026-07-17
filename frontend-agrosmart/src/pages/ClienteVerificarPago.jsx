import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ClientNavbar from '../components/ClientNavbar';
import { useCart } from '../context/CartContext';
import { clienteFetch } from '../services/api';
import './ClienteVerificarPago.css';

function ClienteVerificarPago() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();

  const [estadoPago, setEstadoPago] = useState('procesando');
  const [datosVoucher, setDatosVoucher] = useState(null);
  const [ventaId, setVentaId] = useState(null);
  const [productosComprados, setProductosComprados] = useState([]);

  const procesadoRef = useRef(false);

  useEffect(() => {
    if (procesadoRef.current) return;
    procesadoRef.current = true;

    const procesarTransaccion = async () => {
      const params = new URLSearchParams(location.search);
      const token_ws = params.get('token_ws');

      if (!token_ws) {
        setEstadoPago('error');
        return;
      }

      try {
        const resConfirmacion = await fetch('/api/webpay/confirmar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token_ws })
        });

        const dataConfirmacion = await resConfirmacion.json();

        if (dataConfirmacion.response_code === 0 && dataConfirmacion.status === 'AUTHORIZED') {
          setDatosVoucher(dataConfirmacion);

          const ordenPendienteStr = localStorage.getItem('ordenPendienteAgrosmart');
          if (ordenPendienteStr) {
            const orden = JSON.parse(ordenPendienteStr);

            const resVenta = await clienteFetch('/api/ventas', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orden)
            });

            const dataVenta = await resVenta.json();

            if (resVenta.ok) {
              setVentaId(dataVenta.ventaId);
              setProductosComprados(orden.items);
              clearCart();
              localStorage.removeItem('ordenPendienteAgrosmart');
              setEstadoPago('exito');
            } else {
              setEstadoPago('error');
            }
          }
        } else {
          setEstadoPago('error');
        }
      } catch (error) {
        console.error("Error al procesar:", error);
        setEstadoPago('error');
      }
    };

    procesarTransaccion();
  }, [location, clearCart]);

  return (
    <div className="contenedor-pagina-verificacion">
      <ClientNavbar />

      <div className="contenido-pagina-verificacion animacion-entrada">
        <div className="tarjeta-central-verificacion">

          {estadoPago === 'procesando' && (
            <div className="bloque-procesando">
              <div className="icono-animado procesando"></div>
              <h2>Procesando pago...</h2>
              <p>Por favor no cierres la ventana.</p>
            </div>
          )}

          {estadoPago === 'exito' && (
            <div className="bloque-exito">
              <div className="icono-animado exito"></div>
              <h1 className="agro-tech-h1">¡Compra Exitosa!</h1>
              <p className="agro-tech-p">Tu orden está confirmada y en preparación.</p>

              <div className="bloque-voucher receipt-styled">

                <div className="voucher-fila">
                  <span className="label">Orden AgroSmart:</span>
                  <span className="valor strong-cyan">#{ventaId}</span>
                </div>
                <div className="voucher-fila">
                  <span className="label">Orden Webpay:</span>
                  <span className="valor">{datosVoucher?.buy_order}</span>
                </div>
                <div className="voucher-fila">
                  <span className="label">Monto Pagado:</span>
                  <span className="valor">${datosVoucher?.amount.toLocaleString('es-CL')}</span>
                </div>


                <div className="divisor-recibo"></div>
                <h4 className="titulo-detalle">Detalle de la compra</h4>
                <div className="lista-productos-compacta">
                  {productosComprados.map((prod) => (
                    <div key={prod.id} className="item-comprado-fila">
                      <span className="item-cant">{prod.cantidad}x</span>
                      <span className="item-nombre">{prod.nombre}</span>
                      <span className="item-precio">${(prod.precio_clp * prod.cantidad).toLocaleString('es-CL')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="instrucciones-sucursal">
                Retira en <strong>Sucursal Rancagua</strong> con tu número de orden.
              </p>

              <div className="botones-verificacion flex-row gap-10">
                <button className="btn-agro-primario" onClick={() => navigate('/cliente/home')}>Volver al Inicio</button>
                <button className="btn-agro-secundario" onClick={() => navigate('/cliente/catalogo')}>Seguir Comprando</button>
              </div>
            </div>
          )}

          {estadoPago === 'error' && (
            <div className="bloque-error">
              <div className="icono-animado error"></div>
              <h1 className="agro-tech-h1 orange">Pago Rechazado</h1>
              <p className="agro-tech-p">No se pudo procesar tu tarjeta o cancelaste el pago.</p>

              <p className="agro-tech-p-soft">Revisa tus fondos o intenta con otro medio de pago.</p>

              <div className="botones-verificacion flex-row gap-10">
                <button className="btn-agro-primario cyan-outline" onClick={() => navigate('/cliente/carrito')}>
                  Volver al Carrito
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ClienteVerificarPago;