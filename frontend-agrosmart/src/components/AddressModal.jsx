import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './AddressModal.css';

export const REGIONES_CHILE = [
    { code: '15', name: 'Arica y Parinacota' },
    { code: '01', name: 'Tarapacá' },
    { code: '02', name: 'Antofagasta' },
    { code: '03', name: 'Atacama' },
    { code: '04', name: 'Coquimbo' },
    { code: '05', name: 'Valparaíso' },
    { code: '13', name: 'Metropolitana de Santiago' },
    { code: '06', name: "O'Higgins" },
    { code: '07', name: 'Maule' },
    { code: '16', name: 'Ñuble' },
    { code: '08', name: 'Biobío' },
    { code: '09', name: 'La Araucanía' },
    { code: '14', name: 'Los Ríos' },
    { code: '10', name: 'Los Lagos' },
    { code: '11', name: 'Aysén' },
    { code: '12', name: 'Magallanes' },
];

const vacio = { region: '', comuna: '', county_code: '', calle: '', numero: '', depto: '' };

export default function AddressModal({ isOpen, onClose, onConfirm, usuarioId, direccionInicial }) {
    const [form, setForm] = useState(vacio);
    const [comunas, setComunas] = useState([]);
    const [cargandoComunas, setCargandoComunas] = useState(false);
    const [errorComunas, setErrorComunas] = useState(false);
    const [comunasSimuladas, setComunasSimuladas] = useState(false);
    const [guardarPrincipal, setGuardarPrincipal] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setForm({
                region: direccionInicial?.region || '',
                comuna: direccionInicial?.comuna || '',
                county_code: direccionInicial?.county_code || '',
                calle: direccionInicial?.calle || '',
                numero: direccionInicial?.numero || '',
                depto: direccionInicial?.depto || '',
            });
            setError('');
        }
    }, [isOpen, direccionInicial]);

    useEffect(() => {
        if (!isOpen || !form.region) { setComunas([]); setErrorComunas(false); setComunasSimuladas(false); return; }
        setCargandoComunas(true);
        setErrorComunas(false);
        setComunasSimuladas(false);
        fetch(`/api/envios/comunas?region=${form.region}`)
            .then(res => { if (!res.ok) throw new Error('fallo'); return res.json(); })
            .then(data => {
                const lista = Array.isArray(data?.comunas) ? data.comunas : [];
                setComunas(lista);
                setComunasSimuladas(!!data?.simulado);
                if (lista.length === 0) setErrorComunas(true);
            })
            .catch(() => { setComunas([]); setErrorComunas(true); })
            .finally(() => setCargandoComunas(false));
    }, [isOpen, form.region]);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleRegionChange = (code) => {
        setForm(f => ({ ...f, region: code, comuna: '', county_code: '' }));
    };

    const handleComunaChange = (countyCode) => {
        const c = comunas.find(c => c.countyCode === countyCode);
        setForm(f => ({ ...f, county_code: countyCode, comuna: c?.countyName || countyCode }));
    };

    const handleGuardar = async () => {
        if (!form.region) return setError('Selecciona una región.');
        if (errorComunas ? !form.comuna.trim() : !form.county_code) return setError('Ingresa tu comuna.');
        if (!form.calle.trim()) return setError('Ingresa el nombre de la calle.');
        if (!form.numero.trim()) return setError('Ingresa el número.');

        if (guardarPrincipal && usuarioId) {
            setGuardando(true);
            setError('');
            try {
                const res = await fetch(`/api/auth/direccion/${usuarioId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'No se pudo guardar la dirección.');

                const usuarioActual = JSON.parse(localStorage.getItem('usuarioAgrosmart') || '{}');
                localStorage.setItem('usuarioAgrosmart', JSON.stringify({ ...usuarioActual, ...data.usuario }));
            } catch (err) {
                setError(err.message);
                setGuardando(false);
                return;
            }
            setGuardando(false);
        }

        onConfirm(form);
    };

    return createPortal(
        <div className="addr-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="addr-modal">
                <div className="addr-header">
                    <h3>Agregar dirección</h3>
                    <button className="addr-close" onClick={onClose}>✕</button>
                </div>

                <div className="addr-body">
                    <div className="addr-field">
                        <label>Región</label>
                        <select value={form.region} onChange={e => handleRegionChange(e.target.value)}>
                            <option value="">Selecciona una opción</option>
                            {REGIONES_CHILE.map(r => (
                                <option key={r.code} value={r.code}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="addr-field">
                        <label>Comuna</label>
                        {errorComunas ? (
                            <input
                                value={form.comuna}
                                onChange={e => setForm(f => ({ ...f, comuna: e.target.value, county_code: '' }))}
                                placeholder="Escribe el nombre de tu comuna"
                                disabled={!form.region}
                            />
                        ) : (
                            <select
                                value={form.county_code}
                                onChange={e => handleComunaChange(e.target.value)}
                                disabled={!form.region || cargandoComunas}
                            >
                                <option value="">{cargandoComunas ? 'Cargando...' : 'Selecciona una opción'}</option>
                                {comunas.map(c => (
                                    <option key={c.countyCode} value={c.countyCode}>{c.countyName || c.countyCode}</option>
                                ))}
                            </select>
                        )}
                        {errorComunas && form.region && (
                            <span className="addr-hint">No pudimos cargar el listado de comunas automáticamente. Escríbela tú.</span>
                        )}
                        {!errorComunas && comunasSimuladas && form.region && (
                            <span className="addr-hint">Mostrando comunas frecuentes — Chile Express no respondió en este momento.</span>
                        )}
                    </div>

                    <div className="addr-field">
                        <label>Calle</label>
                        <input
                            value={form.calle}
                            onChange={e => setForm(f => ({ ...f, calle: e.target.value }))}
                            placeholder="Ingresa el nombre de la calle"
                        />
                    </div>

                    <div className="addr-row">
                        <div className="addr-field">
                            <label>Número</label>
                            <input
                                value={form.numero}
                                onChange={e => setForm(f => ({ ...f, numero: e.target.value }))}
                                placeholder="Ingresa el número de la calle"
                            />
                        </div>
                        <div className="addr-field">
                            <label>Departamento, casa u oficina (opcional)</label>
                            <input
                                value={form.depto}
                                onChange={e => setForm(f => ({ ...f, depto: e.target.value }))}
                                placeholder="Ejemplo: Depto. 101, casa 3"
                            />
                        </div>
                    </div>

                    <label className="addr-checkbox">
                        <input type="checkbox" checked={guardarPrincipal} onChange={e => setGuardarPrincipal(e.target.checked)} />
                        Guardar como dirección principal.
                    </label>

                    {error && <p className="addr-error">{error}</p>}
                </div>

                <div className="addr-footer">
                    <button className="btn-addr-cancelar" onClick={onClose}>Cancelar</button>
                    <button className="btn-addr-guardar" onClick={handleGuardar} disabled={guardando}>
                        {guardando ? 'Guardando...' : 'Guardar dirección'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
