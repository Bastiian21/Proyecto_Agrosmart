-- ============================================================
-- AgroSmart — Script completo de base de datos (esquema + catálogo)
-- Generado desde la base de datos real del proyecto con pg_dump,
-- incluye las migraciones 001_envios_pedidos.sql y 002_direccion_usuario.sql
-- ya aplicadas (columnas direccion_* en usuarios, direccion_envio/costo_envio/
-- tracking_code/tracking_url/fecha_entrega_estimada en ventas).
--
-- Este script NO incluye usuarios, ventas, solicitudes ni inscripciones reales
-- (son datos sensibles/transaccionales). Sí incluye el catálogo completo de
-- productos y cursos, listo para el catálogo del cliente.
--
-- Uso:
--   psql -U postgres -d agrosmart -f database-full.sql
-- (crea la base 'agrosmart' antes si no existe: createdb agrosmart)
-- ============================================================

--
-- PostgreSQL database dump
--


-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.ventas DROP CONSTRAINT IF EXISTS ventas_usuario_id_fkey;
ALTER TABLE IF EXISTS ONLY public.solicitudes DROP CONSTRAINT IF EXISTS solicitudes_usuario_id_fkey;
ALTER TABLE IF EXISTS ONLY public.producto_detalle_tecnologia DROP CONSTRAINT IF EXISTS producto_detalle_tecnologia_producto_id_fkey;
ALTER TABLE IF EXISTS ONLY public.producto_detalle_maquinaria DROP CONSTRAINT IF EXISTS producto_detalle_maquinaria_producto_id_fkey;
ALTER TABLE IF EXISTS ONLY public.producto_detalle_insumo DROP CONSTRAINT IF EXISTS producto_detalle_insumo_producto_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inscripciones_cursos DROP CONSTRAINT IF EXISTS inscripciones_cursos_venta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inscripciones_cursos DROP CONSTRAINT IF EXISTS inscripciones_cursos_usuario_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inscripciones_cursos DROP CONSTRAINT IF EXISTS inscripciones_cursos_curso_id_fkey;
ALTER TABLE IF EXISTS ONLY public.detalle_ventas DROP CONSTRAINT IF EXISTS detalle_ventas_venta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.detalle_ventas DROP CONSTRAINT IF EXISTS detalle_ventas_producto_id_fkey;
DROP INDEX IF EXISTS public.idx_ventas_usuario_id;
DROP INDEX IF EXISTS public.idx_prod_precio;
DROP INDEX IF EXISTS public.idx_prod_nuevo;
DROP INDEX IF EXISTS public.idx_prod_marca;
DROP INDEX IF EXISTS public.idx_prod_disponible;
DROP INDEX IF EXISTS public.idx_prod_destacado;
DROP INDEX IF EXISTS public.idx_prod_categoria;
DROP INDEX IF EXISTS public.idx_maq_tractor;
DROP INDEX IF EXISTS public.idx_ins_toxicologia;
DROP INDEX IF EXISTS public.idx_ins_sag;
DROP INDEX IF EXISTS public.idx_det_tec_prod;
DROP INDEX IF EXISTS public.idx_det_maq_prod;
DROP INDEX IF EXISTS public.idx_det_ins_prod;
ALTER TABLE IF EXISTS ONLY public.ventas DROP CONSTRAINT IF EXISTS ventas_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_rut_key;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_email_key;
ALTER TABLE IF EXISTS ONLY public.solicitudes DROP CONSTRAINT IF EXISTS solicitudes_pkey;
ALTER TABLE IF EXISTS ONLY public.productos DROP CONSTRAINT IF EXISTS productos_sku_key;
ALTER TABLE IF EXISTS ONLY public.productos DROP CONSTRAINT IF EXISTS productos_pkey;
ALTER TABLE IF EXISTS ONLY public.producto_detalle_tecnologia DROP CONSTRAINT IF EXISTS producto_detalle_tecnologia_producto_id_key;
ALTER TABLE IF EXISTS ONLY public.producto_detalle_tecnologia DROP CONSTRAINT IF EXISTS producto_detalle_tecnologia_pkey;
ALTER TABLE IF EXISTS ONLY public.producto_detalle_maquinaria DROP CONSTRAINT IF EXISTS producto_detalle_maquinaria_producto_id_key;
ALTER TABLE IF EXISTS ONLY public.producto_detalle_maquinaria DROP CONSTRAINT IF EXISTS producto_detalle_maquinaria_pkey;
ALTER TABLE IF EXISTS ONLY public.producto_detalle_insumo DROP CONSTRAINT IF EXISTS producto_detalle_insumo_producto_id_key;
ALTER TABLE IF EXISTS ONLY public.producto_detalle_insumo DROP CONSTRAINT IF EXISTS producto_detalle_insumo_pkey;
ALTER TABLE IF EXISTS ONLY public.inscripciones_cursos DROP CONSTRAINT IF EXISTS inscripciones_cursos_pkey;
ALTER TABLE IF EXISTS ONLY public.detalle_ventas DROP CONSTRAINT IF EXISTS detalle_ventas_pkey;
ALTER TABLE IF EXISTS ONLY public.cursos DROP CONSTRAINT IF EXISTS cursos_sku_key;
ALTER TABLE IF EXISTS ONLY public.cursos DROP CONSTRAINT IF EXISTS cursos_pkey;
ALTER TABLE IF EXISTS public.ventas ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.usuarios ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.solicitudes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.productos ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.producto_detalle_tecnologia ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.producto_detalle_maquinaria ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.producto_detalle_insumo ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.inscripciones_cursos ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.detalle_ventas ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.cursos ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.ventas_id_seq;
DROP TABLE IF EXISTS public.ventas;
DROP SEQUENCE IF EXISTS public.usuarios_id_seq;
DROP TABLE IF EXISTS public.usuarios;
DROP SEQUENCE IF EXISTS public.solicitudes_id_seq;
DROP TABLE IF EXISTS public.solicitudes;
DROP SEQUENCE IF EXISTS public.productos_id_seq;
DROP TABLE IF EXISTS public.productos;
DROP SEQUENCE IF EXISTS public.producto_detalle_tecnologia_id_seq;
DROP TABLE IF EXISTS public.producto_detalle_tecnologia;
DROP SEQUENCE IF EXISTS public.producto_detalle_maquinaria_id_seq;
DROP TABLE IF EXISTS public.producto_detalle_maquinaria;
DROP SEQUENCE IF EXISTS public.producto_detalle_insumo_id_seq;
DROP TABLE IF EXISTS public.producto_detalle_insumo;
DROP SEQUENCE IF EXISTS public.inscripciones_cursos_id_seq;
DROP TABLE IF EXISTS public.inscripciones_cursos;
DROP SEQUENCE IF EXISTS public.detalle_ventas_id_seq;
DROP TABLE IF EXISTS public.detalle_ventas;
DROP SEQUENCE IF EXISTS public.cursos_id_seq;
DROP TABLE IF EXISTS public.cursos;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cursos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cursos (
    id integer NOT NULL,
    nombre character varying(200) NOT NULL,
    sku character varying(50) NOT NULL,
    categoria character varying(50) NOT NULL,
    precio_clp numeric(10,2) DEFAULT 0 NOT NULL,
    stock integer DEFAULT 99 NOT NULL,
    descripcion text,
    imagen_url text,
    horas integer DEFAULT 0,
    modulos integer DEFAULT 0,
    dificultad character varying(20) DEFAULT 'Básico'::character varying,
    instructor character varying(150),
    disponible boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: cursos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cursos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cursos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cursos_id_seq OWNED BY public.cursos.id;


--
-- Name: detalle_ventas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.detalle_ventas (
    id integer NOT NULL,
    venta_id integer,
    producto_id integer,
    cantidad integer DEFAULT 1 NOT NULL,
    precio_unitario numeric(10,2) DEFAULT 0 NOT NULL
);


--
-- Name: detalle_ventas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.detalle_ventas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: detalle_ventas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.detalle_ventas_id_seq OWNED BY public.detalle_ventas.id;


--
-- Name: inscripciones_cursos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inscripciones_cursos (
    id integer NOT NULL,
    venta_id integer,
    usuario_id integer,
    curso_id integer,
    cantidad integer DEFAULT 1 NOT NULL,
    precio_pagado numeric(10,2) DEFAULT 0 NOT NULL,
    fecha_inscripcion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estado character varying(30) DEFAULT 'Inscrito'::character varying
);


--
-- Name: inscripciones_cursos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inscripciones_cursos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inscripciones_cursos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inscripciones_cursos_id_seq OWNED BY public.inscripciones_cursos.id;


--
-- Name: producto_detalle_insumo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.producto_detalle_insumo (
    id integer NOT NULL,
    producto_id integer NOT NULL,
    ingrediente_activo text,
    tipo_formulacion text,
    modo_accion text,
    cultivos_objetivo text,
    plagas_objetivo text,
    dosis_recomendada text,
    momento_aplicacion text,
    numero_aplicaciones text,
    periodo_carencia text,
    reingreso_campo text,
    clase_toxicologica text,
    registro_sag character varying(200),
    epp_requerido text,
    temperatura_almacen text,
    vida_util text,
    presentacion text
);


--
-- Name: producto_detalle_insumo_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.producto_detalle_insumo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: producto_detalle_insumo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.producto_detalle_insumo_id_seq OWNED BY public.producto_detalle_insumo.id;


--
-- Name: producto_detalle_maquinaria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.producto_detalle_maquinaria (
    id integer NOT NULL,
    producto_id integer NOT NULL,
    motor_tipo text,
    potencia text,
    combustible text,
    capacidad text,
    rendimiento text,
    ancho_trabajo text,
    requiere_tractor boolean DEFAULT false,
    hp_requerido text,
    enganche text,
    pto_rpm text,
    dimensiones text,
    peso_operativo text,
    material_estructura text
);


--
-- Name: producto_detalle_maquinaria_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.producto_detalle_maquinaria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: producto_detalle_maquinaria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.producto_detalle_maquinaria_id_seq OWNED BY public.producto_detalle_maquinaria.id;


--
-- Name: producto_detalle_tecnologia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.producto_detalle_tecnologia (
    id integer NOT NULL,
    producto_id integer NOT NULL,
    conectividad text,
    protocolo text,
    tipo_alimentacion text,
    autonomia text,
    variables_medidas text,
    precision_medicion text,
    rango_medicion text,
    ip_proteccion character varying(100),
    rango_temperatura text,
    dimensiones text,
    plataforma_app text,
    integraciones text,
    almacenamiento text
);


--
-- Name: producto_detalle_tecnologia_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.producto_detalle_tecnologia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: producto_detalle_tecnologia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.producto_detalle_tecnologia_id_seq OWNED BY public.producto_detalle_tecnologia.id;


--
-- Name: productos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.productos (
    id integer NOT NULL,
    nombre character varying(200) NOT NULL,
    sku character varying(50) NOT NULL,
    categoria character varying(50) NOT NULL,
    precio_clp numeric(10,2) DEFAULT 0 NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    disponible boolean DEFAULT true,
    descripcion text,
    imagen_url text,
    imagen_alt text,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    marca character varying(100),
    modelo character varying(100),
    peso character varying(50),
    garantia character varying(100),
    unidad_medida character varying(50) DEFAULT 'unidad'::character varying,
    ficha_tecnica text,
    precio_oferta bigint,
    descripcion_corta character varying(300),
    precio_anterior bigint,
    destacado boolean DEFAULT false,
    nuevo boolean DEFAULT false,
    etiquetas character varying(300),
    tiempo_entrega character varying(80),
    documento_url text,
    pais_origen character varying(80),
    certificaciones character varying(200),
    stock_minimo integer DEFAULT 5,
    ventas_totales integer DEFAULT 0
);


--
-- Name: productos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.productos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: productos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.productos_id_seq OWNED BY public.productos.id;


--
-- Name: solicitudes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitudes (
    id integer NOT NULL,
    usuario_id integer,
    asunto character varying(200),
    tipo_soporte character varying(50),
    urgencia character varying(30),
    equipos text,
    fecha_preferida date,
    ubicacion text,
    descripcion text,
    estado character varying(50) DEFAULT 'Pendiente'::character varying,
    fecha_visita_programada date,
    tecnico_asignado character varying(150),
    notas_admin text,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: solicitudes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.solicitudes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: solicitudes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.solicitudes_id_seq OWNED BY public.solicitudes.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre_completo character varying(150) NOT NULL,
    rut character varying(20) NOT NULL,
    email character varying(150) NOT NULL,
    telefono character varying(30),
    password_hash character varying(255) NOT NULL,
    rol character varying(20) DEFAULT 'cliente'::character varying,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    direccion_region character varying(10),
    direccion_comuna character varying(100),
    direccion_county_code character varying(20),
    direccion_calle character varying(200),
    direccion_numero character varying(20),
    direccion_depto character varying(50)
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: ventas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ventas (
    id integer NOT NULL,
    usuario_id integer,
    total numeric(10,2) DEFAULT 0 NOT NULL,
    metodo_entrega character varying(50) DEFAULT 'Retiro en Tienda'::character varying,
    sucursal character varying(100) DEFAULT 'Rancagua (Casa Matriz)'::character varying,
    estado character varying(50) DEFAULT 'Pendiente de Retiro'::character varying,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    direccion_envio jsonb,
    costo_envio integer DEFAULT 0,
    tracking_code character varying(100),
    tracking_url text,
    fecha_entrega_estimada date
);


--
-- Name: ventas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ventas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ventas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ventas_id_seq OWNED BY public.ventas.id;


--
-- Name: cursos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cursos ALTER COLUMN id SET DEFAULT nextval('public.cursos_id_seq'::regclass);


--
-- Name: detalle_ventas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_ventas ALTER COLUMN id SET DEFAULT nextval('public.detalle_ventas_id_seq'::regclass);


--
-- Name: inscripciones_cursos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inscripciones_cursos ALTER COLUMN id SET DEFAULT nextval('public.inscripciones_cursos_id_seq'::regclass);


--
-- Name: producto_detalle_insumo id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_detalle_insumo ALTER COLUMN id SET DEFAULT nextval('public.producto_detalle_insumo_id_seq'::regclass);


--
-- Name: producto_detalle_maquinaria id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_detalle_maquinaria ALTER COLUMN id SET DEFAULT nextval('public.producto_detalle_maquinaria_id_seq'::regclass);


--
-- Name: producto_detalle_tecnologia id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_detalle_tecnologia ALTER COLUMN id SET DEFAULT nextval('public.producto_detalle_tecnologia_id_seq'::regclass);


--
-- Name: productos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos ALTER COLUMN id SET DEFAULT nextval('public.productos_id_seq'::regclass);


--
-- Name: solicitudes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes ALTER COLUMN id SET DEFAULT nextval('public.solicitudes_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: ventas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas ALTER COLUMN id SET DEFAULT nextval('public.ventas_id_seq'::regclass);


--
-- Name: cursos cursos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT cursos_pkey PRIMARY KEY (id);


--
-- Name: cursos cursos_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT cursos_sku_key UNIQUE (sku);


--
-- Name: detalle_ventas detalle_ventas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_ventas
    ADD CONSTRAINT detalle_ventas_pkey PRIMARY KEY (id);


--
-- Name: inscripciones_cursos inscripciones_cursos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inscripciones_cursos
    ADD CONSTRAINT inscripciones_cursos_pkey PRIMARY KEY (id);


--
-- Name: producto_detalle_insumo producto_detalle_insumo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_detalle_insumo
    ADD CONSTRAINT producto_detalle_insumo_pkey PRIMARY KEY (id);


--
-- Name: producto_detalle_insumo producto_detalle_insumo_producto_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_detalle_insumo
    ADD CONSTRAINT producto_detalle_insumo_producto_id_key UNIQUE (producto_id);


--
-- Name: producto_detalle_maquinaria producto_detalle_maquinaria_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_detalle_maquinaria
    ADD CONSTRAINT producto_detalle_maquinaria_pkey PRIMARY KEY (id);


--
-- Name: producto_detalle_maquinaria producto_detalle_maquinaria_producto_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_detalle_maquinaria
    ADD CONSTRAINT producto_detalle_maquinaria_producto_id_key UNIQUE (producto_id);


--
-- Name: producto_detalle_tecnologia producto_detalle_tecnologia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_detalle_tecnologia
    ADD CONSTRAINT producto_detalle_tecnologia_pkey PRIMARY KEY (id);


--
-- Name: producto_detalle_tecnologia producto_detalle_tecnologia_producto_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_detalle_tecnologia
    ADD CONSTRAINT producto_detalle_tecnologia_producto_id_key UNIQUE (producto_id);


--
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id);


--
-- Name: productos productos_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_sku_key UNIQUE (sku);


--
-- Name: solicitudes solicitudes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes
    ADD CONSTRAINT solicitudes_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_rut_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_rut_key UNIQUE (rut);


--
-- Name: ventas ventas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_pkey PRIMARY KEY (id);


--
-- Name: idx_det_ins_prod; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_det_ins_prod ON public.producto_detalle_insumo USING btree (producto_id);


--
-- Name: idx_det_maq_prod; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_det_maq_prod ON public.producto_detalle_maquinaria USING btree (producto_id);


--
-- Name: idx_det_tec_prod; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_det_tec_prod ON public.producto_detalle_tecnologia USING btree (producto_id);


--
-- Name: idx_ins_sag; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ins_sag ON public.producto_detalle_insumo USING btree (registro_sag);


--
-- Name: idx_ins_toxicologia; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ins_toxicologia ON public.producto_detalle_insumo USING btree (clase_toxicologica);


--
-- Name: idx_maq_tractor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_maq_tractor ON public.producto_detalle_maquinaria USING btree (requiere_tractor);


--
-- Name: idx_prod_categoria; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prod_categoria ON public.productos USING btree (categoria);


--
-- Name: idx_prod_destacado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prod_destacado ON public.productos USING btree (destacado);


--
-- Name: idx_prod_disponible; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prod_disponible ON public.productos USING btree (disponible);


--
-- Name: idx_prod_marca; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prod_marca ON public.productos USING btree (marca);


--
-- Name: idx_prod_nuevo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prod_nuevo ON public.productos USING btree (nuevo);


--
-- Name: idx_prod_precio; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prod_precio ON public.productos USING btree (precio_clp);


--
-- Name: idx_ventas_usuario_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ventas_usuario_id ON public.ventas USING btree (usuario_id);


--
-- Name: detalle_ventas detalle_ventas_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_ventas
    ADD CONSTRAINT detalle_ventas_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: detalle_ventas detalle_ventas_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_ventas
    ADD CONSTRAINT detalle_ventas_venta_id_fkey FOREIGN KEY (venta_id) REFERENCES public.ventas(id) ON DELETE CASCADE;


--
-- Name: inscripciones_cursos inscripciones_cursos_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inscripciones_cursos
    ADD CONSTRAINT inscripciones_cursos_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id);


--
-- Name: inscripciones_cursos inscripciones_cursos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inscripciones_cursos
    ADD CONSTRAINT inscripciones_cursos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: inscripciones_cursos inscripciones_cursos_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inscripciones_cursos
    ADD CONSTRAINT inscripciones_cursos_venta_id_fkey FOREIGN KEY (venta_id) REFERENCES public.ventas(id) ON DELETE SET NULL;


--
-- Name: producto_detalle_insumo producto_detalle_insumo_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_detalle_insumo
    ADD CONSTRAINT producto_detalle_insumo_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON DELETE CASCADE;


--
-- Name: producto_detalle_maquinaria producto_detalle_maquinaria_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_detalle_maquinaria
    ADD CONSTRAINT producto_detalle_maquinaria_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON DELETE CASCADE;


--
-- Name: producto_detalle_tecnologia producto_detalle_tecnologia_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.producto_detalle_tecnologia
    ADD CONSTRAINT producto_detalle_tecnologia_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON DELETE CASCADE;


--
-- Name: solicitudes solicitudes_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes
    ADD CONSTRAINT solicitudes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: ventas ventas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- PostgreSQL database dump complete
--



-- ============================================================
-- Usuario administrador de demostración
-- (mismas credenciales ya documentadas en deploy/AWS-DEPLOY.md)
-- Email: admin@agrosmart.cl · Contraseña: admin123
-- ============================================================
SET search_path = public;

INSERT INTO public.usuarios (nombre_completo, rut, email, telefono, password_hash, rol)
VALUES (
    'Administrador AgroSmart',
    '11.111.111-1',
    'admin@agrosmart.cl',
    '+56900000000',
    '$2b$10$W.bIzQJOQp85oSiVfxaujOWFtuwHEjdGjG9zeo8rlTqvEzHXT4fhy',
    'admin'
)
ON CONFLICT (email) DO NOTHING;

--
-- PostgreSQL database dump
--


-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: cursos; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.cursos (id, nombre, sku, categoria, precio_clp, stock, descripcion, imagen_url, horas, modulos, dificultad, instructor, disponible, fecha_creacion) VALUES (1, 'Introducción a la Agronomía de Precisión', 'CURSO-001', 'Tecnología', 0.00, 99, 'Curso introductorio gratuito para entender los fundamentos del agro de precisión: sensores, mapeo georreferenciado, NDVI y tomas de decisión basadas en datos.', 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?q=80&w=600', 20, 5, 'Intermedio', 'Dra. María Elena González', true, '2026-05-22 09:21:24.071518');
INSERT INTO public.cursos (id, nombre, sku, categoria, precio_clp, stock, descripcion, imagen_url, horas, modulos, dificultad, instructor, disponible, fecha_creacion) VALUES (2, 'Operación Avanzada de Drones Mapeadores X-Pro', 'CURSO-002', 'Tecnología', 1200000.00, 30, 'Aprende a operar drones agrícolas profesionales para mapeo multiespectral, fumigación dirigida y conteo de plantas con visión artificial.', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=600', 15, 4, 'Avanzado', 'Ing. Carlos Ruiz', true, '2026-05-22 09:21:24.071518');
INSERT INTO public.cursos (id, nombre, sku, categoria, precio_clp, stock, descripcion, imagen_url, horas, modulos, dificultad, instructor, disponible, fecha_creacion) VALUES (3, 'Mantenimiento Preventivo de Tractores Compactos', 'CURSO-003', 'Maquinaria', 0.00, 99, 'Programa gratuito de mantenimiento para tractores compactos: cambios de aceite, calibración hidráulica, sistemas eléctricos y diagnóstico OBD.', 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c10?q=80&w=600', 10, 3, 'Básico', 'Téc. Juan Pérez', true, '2026-05-22 09:21:24.071518');
INSERT INTO public.cursos (id, nombre, sku, categoria, precio_clp, stock, descripcion, imagen_url, horas, modulos, dificultad, instructor, disponible, fecha_creacion) VALUES (4, 'Sensores IoT v2: Instalación y Calibración en Suelos', 'CURSO-004', 'Tecnología', 0.00, 99, 'Instalación y configuración de sensores SoilSense en cultivos hortícolas. Conexión a gateway, calibración por tipo de suelo y dashboards.', 'https://images.unsplash.com/photo-1586771107445-d3af2e84d436?q=80&w=600', 25, 6, 'Intermedio', 'Dra. María Elena González', true, '2026-05-22 09:21:24.071518');
INSERT INTO public.cursos (id, nombre, sku, categoria, precio_clp, stock, descripcion, imagen_url, horas, modulos, dificultad, instructor, disponible, fecha_creacion) VALUES (5, 'Riego Tecnificado: Diseño de Sistemas por Goteo', 'CURSO-005', 'Insumos', 450000.00, 40, 'Cálculo hidráulico, dimensionamiento de bombas, selección de emisores y diseño de redes de riego por goteo para predios de hasta 50 ha.', 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=600', 18, 5, 'Intermedio', 'Ing. Patricia Soto', true, '2026-05-22 09:21:24.071518');
INSERT INTO public.cursos (id, nombre, sku, categoria, precio_clp, stock, descripcion, imagen_url, horas, modulos, dificultad, instructor, disponible, fecha_creacion) VALUES (6, 'Fertilización Inteligente con Análisis de Suelo', 'CURSO-006', 'Insumos', 350000.00, 50, 'Interpretación de análisis químico de suelos, cálculo de dosis de NPK, fertilizantes foliares y planes anuales de nutrición por cultivo.', 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=600', 14, 4, 'Básico', 'Ing. Roberto Manríquez', true, '2026-05-22 09:21:24.071518');
INSERT INTO public.cursos (id, nombre, sku, categoria, precio_clp, stock, descripcion, imagen_url, horas, modulos, dificultad, instructor, disponible, fecha_creacion) VALUES (7, 'Manejo Integrado de Plagas (MIP) con Trampas Inteligentes', 'CURSO-007', 'Tecnología', 280000.00, 60, 'Estrategias MIP combinando control biológico, trampas con conteo automático IoT y modelos predictivos para chinches, polillas y trips.', 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=600', 12, 4, 'Intermedio', 'Dra. Carolina Vidal', true, '2026-05-22 09:21:24.071518');
INSERT INTO public.cursos (id, nombre, sku, categoria, precio_clp, stock, descripcion, imagen_url, horas, modulos, dificultad, instructor, disponible, fecha_creacion) VALUES (8, 'Cosecha Mecanizada de Frutales: Operador Certificado', 'CURSO-008', 'Maquinaria', 890000.00, 20, 'Operación segura de cosechadoras automotrices y vibradoras de árboles. Certificación oficial para operadores en huertos de cerezos y manzanos.', 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=600', 30, 7, 'Avanzado', 'Téc. Luis Carrasco', true, '2026-05-22 09:21:24.071518');
INSERT INTO public.cursos (id, nombre, sku, categoria, precio_clp, stock, descripcion, imagen_url, horas, modulos, dificultad, instructor, disponible, fecha_creacion) VALUES (9, 'Agricultura Regenerativa: Cultivos de Cobertura', 'CURSO-009', 'Asesorías', 0.00, 99, 'Curso gratuito sobre rotación de cultivos, cobertura vegetal, mejora de carbono orgánico y reducción del uso de agroquímicos en viñas y huertos.', 'https://images.unsplash.com/photo-1444858345840-1e1483bd0193?q=80&w=600', 16, 5, 'Básico', 'Dra. Francisca Aravena', true, '2026-05-22 09:21:24.071518');
INSERT INTO public.cursos (id, nombre, sku, categoria, precio_clp, stock, descripcion, imagen_url, horas, modulos, dificultad, instructor, disponible, fecha_creacion) VALUES (10, 'Big Data Agrícola: Power BI para Productores', 'CURSO-010', 'Tecnología', 520000.00, 44, 'Construye dashboards de productividad, rentabilidad y rendimiento por cuartel usando Power BI con datos de sensores, ERP y estación meteorológica.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600', 22, 6, 'Avanzado', 'Ing. Sebastián Rojas', true, '2026-05-22 09:21:24.071518');


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (3, 'Drone Mapeador DJI Agras T10 — Kit Básico', 'TEC-DR-003', 'Tecnología', 4290000.00, 6, true, 'Drone agrícola de 10L de carga útil con sistema de aspersión de precisión. Autonomía de 8 min/carga, cobertura de 3 ha/batería. Incluye 2 baterías y cargador rápido.', '', '', '2026-05-22 10:04:07.5267', 'DJI', 'Agras T10', NULL, NULL, 'unidad', 'Carga útil: 10 L
Autonomía: 8 min/carga
Cobertura: 3 ha/batería
Sistema: Aspersión de precisión
Incluye: 2 baterías + cargador rápido', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (5, 'Gateway IoT AgroConnect 4G-WiFi', 'TEC-GW-005', 'Tecnología', 158000.00, 34, true, 'Concentrador de datos para redes de sensores LoRaWAN, soporta hasta 128 nodos simultáneos. Carcasa IP67 para exterior, alimentación 12V DC o panel solar.', '', '', '2026-05-22 10:04:07.5267', 'AgroConnect', '4G-WiFi', NULL, NULL, 'unidad', 'Protocolo: LoRaWAN
Nodos soportados: hasta 128 simultáneos
Protección: IP67 (exterior)
Alimentación: 12V DC o panel solar
Conectividad: 4G + WiFi', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (6, 'Cámara de Monitoreo Nocturno CampoVision IR', 'TEC-CM-006', 'Tecnología', 124900.00, 50, true, 'Cámara PTZ de visión nocturna infrarroja 1080p con detección de movimiento y alertas por push notification. Resistencia IP66, temperatura de operación -10 °C a +60 °C.', '', '', '2026-05-22 10:04:07.5267', 'CampoVision', 'IR', NULL, NULL, 'unidad', 'Resolución: 1080p Full HD
Tipo: PTZ con visión nocturna infrarroja
Protección: IP66
Detección: Movimiento con alertas push notification
Rango de temperatura: -10 °C a +60 °C', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (8, 'Tablet Reforzada AgroTab 10 Pro', 'TEC-TB-008', 'Tecnología', 469000.00, 15, true, 'Tablet industrial 10" con pantalla legible bajo sol directo (1000 nits), resistente a polvo y agua (IP65), procesador Octa-Core, 4GB RAM, 4G LTE y batería de 8000 mAh.', '', '', '2026-05-22 10:04:07.5267', 'AgroTab', '10 Pro', NULL, NULL, 'unidad', 'Pantalla: 10" — 1.000 nits (legible bajo sol directo)
Protección: IP65 (polvo y agua)
Procesador: Octa-Core
RAM: 4 GB
Conectividad: 4G LTE
Batería: 8.000 mAh', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (10, 'Kit Automatización Invernadero ClimControl Basic', 'TEC-IV-010', 'Tecnología', 890000.00, 9, false, 'Sistema todo-en-uno para control de temperatura, humedad, CO₂ y ventilación en invernaderos de hasta 2.000 m². Incluye controlador central, 4 sensores y 2 actuadores de ventana motorizados.', '', '', '2026-05-22 10:04:07.5267', 'ClimControl', 'Basic', NULL, NULL, 'unidad', 'Cobertura: hasta 2.000 m² de invernadero
Control: Temperatura, humedad, CO₂ y ventilación
Incluye: Controlador central + 4 sensores + 2 actuadores de ventana motorizados
Tipo: Sistema todo-en-uno', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (12, 'Tractor Compacto Yanmar SA424 — 24HP GPS Ready', 'MAQ-TR-012', 'Maquinaria', 16500000.00, 3, true, 'Tractor 4WD de 24HP con soporte nativo para receptor GPS de guiado. Motor Stage V de bajas emisiones, transmisión en 12 marchas adelante, PTO de 540 RPM trasero y central.', '', '', '2026-05-22 10:04:07.5267', 'Yanmar', 'SA424', NULL, NULL, 'unidad', 'Potencia: 24HP
Tracción: 4WD
Motor: Stage V (bajas emisiones)
Transmisión: 12 marchas adelante
PTO: 540 RPM (trasero y central)
GPS: Soporte nativo para receptor de guiado', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (14, 'Cosechadora de Forraje John Deere 3975 — Reacondicionada', 'MAQ-CF-014', 'Maquinaria', 48000000.00, 1, true, 'Cosechadora de forraje autopropulsada de 370HP con cabezal de 3 m. Motor reacondicionado con garantía de 500 horas. Incluye picador fino y deflector de carga hidráulico.', '', '', '2026-05-22 10:04:07.5267', 'John Deere', '3975', NULL, 'Motor reacondicionado: 500 horas', 'unidad', 'Potencia: 370HP
Tipo: Autopropulsada
Cabezal: 3 m
Sistema: Picador fino
Deflector de carga: Hidráulico
Motor: Reacondicionado — garantía 500 horas incluida', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (15, 'Pulverizadora de Arrastre PulsoAgro 2000L', 'MAQ-PL-015', 'Maquinaria', 5200000.00, 5, true, 'Pulverizadora de arrastre con estanque de 2.000 L, barra de 18 m y bombas de membrana de triple diafragma. Compatible con sistemas de control de sección por GPS, presión ajustable 1-8 bar.', '', '', '2026-05-22 10:04:07.5267', 'PulsoAgro', '2000L', NULL, NULL, 'unidad', 'Estanque: 2.000 L
Barra de aspersión: 18 m
Bomba: Membrana triple diafragma
Presión: 1 a 8 bar (ajustable)
Compatible: Control de sección por GPS
Tipo: Arrastre', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (17, 'Motobomba Agrícola Honda WH20 — Diésel', 'MAQ-MB-017', 'Maquinaria', 680000.00, 20, true, 'Motobomba centrífuga diésel de 5HP con caudal máximo de 600 L/min y altura manométrica de 32 m. Cuerpo en hierro fundido, arranque por manivela, peso 37 kg.', '', '', '2026-05-22 10:04:07.5267', 'Honda', 'WH20', '37 kg', NULL, 'unidad', 'Potencia: 5HP
Combustible: Diésel
Caudal máximo: 600 L/min
Altura manométrica: 32 m
Material cuerpo: Hierro fundido
Arranque: Por manivela
Peso: 37 kg', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (19, 'Carretón Agrícola Volquete Hidráulico 5T', 'MAQ-CA-019', 'Maquinaria', 2950000.00, 7, true, 'Remolque agrícola de 5 toneladas de carga útil con volquete hidráulico de doble efecto. Estructura en perfiles de acero 4 mm, neumáticos 12.5/80-15.3, rampa de carga trasera incluida.', '', '', '2026-05-22 10:04:07.5267', NULL, 'Volquete Hidráulico 5T', NULL, NULL, 'unidad', 'Carga útil: 5 toneladas
Volquete: Hidráulico doble efecto
Estructura: Acero perfilado 4 mm
Neumáticos: 12.5/80-15.3
Rampa de carga trasera: incluida', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (21, 'Fertilizante Foliar Nitromax 30-0-0 Líquido — 20L', 'INS-FF-021', 'Insumos', 42000.00, 200, true, 'Solución nitrogenada al 30% con inhibidor de ureasa para aplicación foliar en cereales y hortalizas. Reduce pérdidas por volatilización hasta un 40% vs urea convencional. Rendimiento: 2–5 L/há.', '', '', '2026-05-22 10:04:07.5267', 'Nitromax', '30-0-0', '20 L', NULL, 'litro', 'Fórmula: 30-0-0 (solo Nitrógeno)
Concentración: 30% N con inhibidor de ureasa
Reducción volatilización: hasta 40% vs urea convencional
Dosis: 2 a 5 L/há
Aplicación: Foliar en cereales y hortalizas', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (22, 'Herbicida Sistémico GlifoAct 48 SL — 5L', 'INS-HB-022', 'Insumos', 18500.00, 350, true, 'Herbicida de amplio espectro a base de Glifosato 48% para control de malezas anuales y perennes. Absorción foliar sistémica con translocación hacia raíces. Dosis: 3–6 L/há según maleza objetivo.', '', '', '2026-05-22 10:04:07.5267', 'GlifoAct', '48 SL', '5 L', NULL, 'litro', 'Principio activo: Glifosato 48%
Espectro: Malezas anuales y perennes
Acción: Foliar sistémica con translocación hacia raíces
Dosis: 3 a 6 L/há según maleza objetivo', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (24, 'Bioestimulante Radicular BioRaiz Plus — 1L', 'INS-BS-024', 'Insumos', 34500.00, 120, true, 'Formulación líquida con ácidos húmicos, fúlvicos y micorrizas nativas. Estimula el desarrollo radicular y mejora la absorción de nutrientes. Aplicar vía drench o riego por goteo al trasplante.', '', '', '2026-05-22 10:04:07.5267', 'BioRaiz', 'Plus', '1 L', NULL, 'litro', 'Componentes: Ácidos húmicos + fúlvicos + micorrizas nativas
Efecto: Estimula desarrollo radicular
Mejora: Absorción de nutrientes
Aplicación: Drench o riego por goteo al trasplante', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (26, 'Fertilizante Granulado NPK 15-15-15 — Saco 50kg', 'INS-FG-026', 'Insumos', 31000.00, 500, true, 'Fertilizante compuesto de liberación gradual con nutrientes en relación 1:1:1, enriquecido con azufre (6%) y boro. Presentación perlada para fácil distribución manual o mecánica. Rendimiento: 100–200 kg/há.', '', '', '2026-05-22 10:04:07.5267', NULL, '15-15-15', '50 kg', NULL, 'saco', 'Fórmula: NPK 15-15-15 (relación 1:1:1)
Azufre: 6%
Boro: Enriquecido
Tipo: Liberación gradual, presentación perlada
Dosis: 100 a 200 kg/há
Aplicación: Manual o mecánica', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (1, 'Sensor de Humedad de Suelo SoilSense Pro 3', 'TEC-SS-001', 'Tecnología', 189900.00, 45, true, 'Sensor inalámbrico LoRa con profundidad de medición hasta 60 cm y autonomía de 12 meses con batería solar integrada. Compatible con app AgroSmart y plataformas Thingsboard / AWS IoT.', '', '', '2026-05-22 10:04:07.5267', 'SoilSense', 'Pro 3', NULL, NULL, 'unidad', 'Profundidad de medición: hasta 60 cm
Autonomía: 12 meses
Conectividad: LoRa + WiFi
Batería: Solar integrada
Compatible: Thingsboard, AWS IoT, App AgroSmart', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (2, 'Estación Meteorológica AgriClima 5 en 1', 'TEC-EM-002', 'Tecnología', 349000.00, 22, true, 'Mide temperatura, humedad ambiental, velocidad del viento, precipitaciones y radiación solar. Transmisión de datos cada 5 minutos vía 4G con panel solar de respaldo.', '', '', '2026-05-22 10:04:07.5267', 'AgriClima', '5 en 1', NULL, NULL, 'unidad', 'Mediciones: Temperatura, humedad ambiental, velocidad del viento, precipitaciones y radiación solar
Frecuencia de transmisión: cada 5 minutos
Conectividad: 4G
Respaldo: Panel solar integrado', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (4, 'Kit Sensor Nutrientes NPK FoliarScan v2', 'TEC-NK-004', 'Tecnología', 520000.00, 18, true, 'Sensor portátil para análisis foliar rápido de Nitrógeno, Fósforo y Potasio. Resultado en 90 segundos vía Bluetooth a la app. No requiere reactivos de laboratorio.', '', '', '2026-05-22 10:04:07.5267', 'FoliarScan', 'v2', NULL, NULL, 'unidad', 'Nutrientes detectados: Nitrógeno (N), Fósforo (P), Potasio (K)
Tiempo de resultado: 90 segundos
Conectividad: Bluetooth
Reactivos: No requiere
Compatible: App AgroSmart', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (7, 'Controlador de Riego SmartFlow Pro 8 Zonas', 'TEC-RI-007', 'Tecnología', 287000.00, 27, true, 'Controlador Wi-Fi para riego por goteo o aspersión en 8 zonas independientes. Integra datos de la estación meteorológica para riego predictivo y ahorro de hasta un 35% en agua.', '', '', '2026-05-22 10:04:07.5267', 'SmartFlow', 'Pro 8 Zonas', NULL, NULL, 'unidad', 'Zonas independientes: 8
Conectividad: WiFi
Compatible: Goteo y aspersión
Ahorro de agua: hasta 35%
Integración: Estación meteorológica para riego predictivo', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (9, 'Sensor de Caudal FlowMeter Ag-200', 'TEC-CF-009', 'Tecnología', 98500.00, 60, true, 'Medidor de caudal para tuberías de 1" a 3" con salida de pulsos y conectividad Modbus RTU. Precisión ±1.5%, cuerpo en acero inoxidable 316L para agua con fertilizantes.', '', '', '2026-05-22 10:04:07.5267', 'FlowMeter', 'Ag-200', NULL, NULL, 'unidad', 'Diámetro compatible: tuberías 1" a 3"
Salida: Pulsos + Modbus RTU
Precisión: ±1.5%
Material cuerpo: Acero inoxidable 316L
Compatible: Agua con fertilizantes disueltos', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (11, 'Tractor Compacto Kubota BX2380 — 23HP', 'MAQ-TR-011', 'Maquinaria', 14900000.00, 4, true, 'Tractor compacto 4WD de 23HP con motor diésel de 3 cilindros. Transmisión hidrostática, levante de 3 puntos de 680 kg, ideal para viñas, huertos y parcelas de hasta 15 há.', '', '', '2026-05-22 10:04:07.5267', 'Kubota', 'BX2380', NULL, NULL, 'unidad', 'Potencia: 23HP
Tracción: 4WD
Motor: Diésel 3 cilindros
Transmisión: Hidrostática
Levante 3 puntos: 680 kg
Superficie recomendada: hasta 15 há
Ideal para: Viñas, huertos y parcelas', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (13, 'Sembradora de Precisión GPS SeedMaster 6 Hileras', 'MAQ-SM-013', 'Maquinaria', 8750000.00, 2, true, 'Sembradora de siembra directa de 6 hileras con dosificador electrónico y corte de sección por GPS. Ancho de trabajo 3 m, profundidad de siembra regulable de 2 a 8 cm, tolva de 400 L.', '', '', '2026-05-22 10:04:07.5267', 'SeedMaster', '6 Hileras GPS', NULL, NULL, 'unidad', 'Hileras: 6
Tipo: Siembra directa con corte de sección GPS
Ancho de trabajo: 3 m
Profundidad de siembra: 2 a 8 cm (regulable)
Tolva: 400 L
Dosificador: Electrónico de precisión', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (16, 'Subsolador de Cincel Agrimetal 5 Brazos', 'MAQ-SB-016', 'Maquinaria', 1890000.00, 8, true, 'Subsolador rígido de 5 brazos con puntas intercambiables en acero boron. Profundidad de trabajo hasta 55 cm, ancho de 1.8 m, requiere tractor de mínimo 70HP.', '', '', '2026-05-22 10:04:07.5267', 'Agrimetal', '5 Brazos', NULL, NULL, 'unidad', 'Brazos: 5 con puntas intercambiables
Material puntas: Acero boron
Profundidad de trabajo: hasta 55 cm
Ancho: 1,8 m
Requisito tractor: mínimo 70HP', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (18, 'Rotocultivador Agrex RX180 — 1.8 m', 'MAQ-RC-018', 'Maquinaria', 1240000.00, 10, true, 'Rotocultivador de acople a 3 puntos con ancho de trabajo de 1.8 m y 36 cuchillas en L de acero templado. Caja de engranajes en baño de aceite, requiere PTO de 540 RPM, mínimo 35 HP.', '', '', '2026-05-22 10:04:07.5267', 'Agrex', 'RX180', NULL, NULL, 'unidad', 'Ancho de trabajo: 1,8 m
Cuchillas: 36 en L de acero templado
Transmisión: Caja de engranajes en baño de aceite
PTO: 540 RPM
Requisito tractor: mínimo 35HP', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (20, 'Receptor GPS de Guiado AgriNav RTK', 'MAQ-GP-020', 'Maquinaria', 3800000.00, 6, false, 'Receptor GPS RTK de alta precisión (±2 cm) con pantalla táctil de 7" y sistema de guiado visual de luz de barra. Compatible con tractores de cualquier marca, suscripción de correcciones incluida por 12 meses.', '', '', '2026-05-22 10:04:07.5267', 'AgriNav', 'RTK', NULL, 'Suscripción correcciones RTK incluida por 12 meses', 'unidad', 'Precisión: ±2 cm (RTK)
Pantalla: 7" táctil
Sistema de guiado: Luz de barra LED
Compatibilidad: Tractores de cualquier marca
Suscripción: Correcciones RTK incluida 12 meses', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (23, 'Fungicida Orgánico CobriShield 50 WP — 1kg', 'INS-FG-023', 'Insumos', 28900.00, 180, true, 'Fungicida cúprico de contacto al 50% de oxicloruro de cobre, autorizado para agricultura orgánica. Control de mildiu, alternaria y cáncer bacterial en vides, frutales y hortalizas. 4–6 g/L.', '', '', '2026-05-22 10:04:07.5267', 'CobriShield', '50 WP', '1 kg', NULL, 'kg', 'Principio activo: Oxicloruro de cobre 50%
Autorizado: Agricultura orgánica
Control: Mildiu, alternaria, cáncer bacterial
Cultivos: Vides, frutales y hortalizas
Dosis: 4 a 6 g/L', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (25, 'Insecticida Biológico SpinoBio SC — 500ml', 'INS-IB-025', 'Insumos', 54000.00, 90, true, 'Insecticida basado en Spinosad 12% de origen biológico para control de trips, polilla y mosca de la fruta. Mínimo período de reingreso (4h), carencia 1 día en hortalizas. Apto agricultura orgánica.', '', '', '2026-05-22 10:04:07.5267', 'SpinoBio', 'SC', '500 ml', NULL, 'litro', 'Principio activo: Spinosad 12%
Origen: Biológico
Control: Trips, polilla y mosca de la fruta
Período de reingreso: 4 horas
Carencia: 1 día en hortalizas
Certificación: Apto agricultura orgánica', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (28, 'Adhesivo Siliconado AgroStick — 200ml', 'INS-AD-028', 'Insumos', 12800.00, 250, true, 'Adherente y humectante siliconado para mezcla con plaguicidas y fertilizantes foliares. Reduce la tensión superficial de la mezcla, mejora cobertura y resistencia al lavado por lluvia. Dosis: 0.05–0.1%.', '', '', '2026-05-22 10:04:07.5267', 'AgroStick', NULL, '200 ml', NULL, 'litro', 'Tipo: Adherente y humectante siliconado
Uso: Mezclar con plaguicidas y fertilizantes foliares
Efecto: Reduce tensión superficial y mejora cobertura
Resistencia: Al lavado por lluvia
Dosis: 0,05 a 0,1% de la mezcla', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (27, 'Corrector de Suelo Cal Agrícola Dolomita — Saco 50kg', 'INS-CS-027', 'Insumos', 8500.00, 999, true, 'Cal dolomítica molida con 22% de CaO y 12% de MgO para corrección de pH ácido y aporte de magnesio. Granulometría 90% bajo malla 100. Aplicar 1–3 ton/há según análisis de suelo.', '', '', '2026-05-22 10:04:07.5267', NULL, 'Dolomita', '50 kg', NULL, 'saco', 'Composición: 22% CaO + 12% MgO
Función: Corrección de pH ácido + aporte de magnesio
Granulometría: 90% bajo malla 100
Dosis recomendada: 1 a 3 ton/há según análisis de suelo', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (29, 'Fertilizante Soluble Fertiriego KCl 0-0-60 — 25kg', 'INS-KS-029', 'Insumos', 39000.00, 297, true, 'Cloruro de potasio grado fertiriego de alta solubilidad (>99.5%) para aplicación vía riego tecnificado. Esencial en etapa de fructificación y llenado de fruto. Compatibilidad verificada con sistemas de goteo.', '', '', '2026-05-22 10:04:07.5267', NULL, 'KCl 0-0-60', '25 kg', NULL, 'saco', 'Fórmula: 0-0-60 (solo Potasio)
Concentración: Cloruro de potasio >99,5% de solubilidad
Aplicación: Fertiriego / riego por goteo
Etapa recomendada: Fructificación y llenado de fruto
Compatibilidad: Sistemas de goteo verificada', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);
INSERT INTO public.productos (id, nombre, sku, categoria, precio_clp, stock, disponible, descripcion, imagen_url, imagen_alt, fecha_creacion, marca, modelo, peso, garantia, unidad_medida, ficha_tecnica, precio_oferta, descripcion_corta, precio_anterior, destacado, nuevo, etiquetas, tiempo_entrega, documento_url, pais_origen, certificaciones, stock_minimo, ventas_totales) VALUES (30, 'Kit Muestreo de Suelo LaboPack Pro — 10 muestras', 'INS-KM-030', 'Insumos', 22000.00, 141, true, 'Kit con 10 bolsas de polietileno para muestras de suelo, 1 calador de acero inoxidable de 30 cm, guía de muestreo impresa y formulario de envío a laboratorio. Compatible con laboratorios INIA y privados.', '/api/uploads/productos/img-1782766763624.jpg', '', '2026-05-22 10:04:07.5267', 'LaboPack', 'Pro 10', NULL, NULL, 'unidad', 'Contenido del kit: 10 bolsas de polietileno para muestras de suelo
Calador: Acero inoxidable 30 cm incluido
Guía: Muestreo impresa incluida
Formulario: Envío a laboratorio incluido
Compatible: Laboratorios INIA y privados', NULL, NULL, NULL, false, false, NULL, NULL, NULL, NULL, NULL, 5, 0);


--
-- Data for Name: producto_detalle_insumo; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.producto_detalle_insumo (id, producto_id, ingrediente_activo, tipo_formulacion, modo_accion, cultivos_objetivo, plagas_objetivo, dosis_recomendada, momento_aplicacion, numero_aplicaciones, periodo_carencia, reingreso_campo, clase_toxicologica, registro_sag, epp_requerido, temperatura_almacen, vida_util, presentacion) VALUES (1, 21, 'Nitrógeno total 30% con inhibidor de ureasa', 'Solución nitrogenada líquida (UAN + inhibidor)', 'Foliar — absorción directa por hoja. Inhibidor de ureasa reduce pérdidas por volatilización hasta 40% vs urea convencional', 'Cereales (trigo, maíz, avena), hortalizas en general', NULL, '2–5 L/há en 200–400 L de agua | Fertiriego: 3–8 L/há', 'Macollaje en cereales / estados de alta demanda de N', NULL, 'Sin período de carencia (fertilizante, no plaguicida)', '4 horas (para evitar arrastre en lluvia)', 'No aplica — fertilizante sin clasificación toxicológica SAG', NULL, 'Guantes de nitrilo, lentes de seguridad', '5°C a 35°C — evitar heladas y exposición solar directa', '2 años sellado desde fabricación', 'Envase 20 L');
INSERT INTO public.producto_detalle_insumo (id, producto_id, ingrediente_activo, tipo_formulacion, modo_accion, cultivos_objetivo, plagas_objetivo, dosis_recomendada, momento_aplicacion, numero_aplicaciones, periodo_carencia, reingreso_campo, clase_toxicologica, registro_sag, epp_requerido, temperatura_almacen, vida_util, presentacion) VALUES (2, 22, 'Glifosato 48% (sal isopropilamina)', 'Solución líquida (SL)', 'Herbicida sistémico no selectivo. Absorción foliar con translocación hacia raíces. Inhibe enzima EPSPS (ruta del shikimato)', 'Aplicar en barbecho o entre hileras — NO en cultivos en crecimiento activo', 'Malezas anuales (avena loca, mostaza) y perennes (gramón, correhuela, cardo)', '3–4 L/há malezas anuales | 5–6 L/há malezas perennes establecidas', 'Malezas en pleno crecimiento activo — 4 a 6 hojas anuales / 15–20 cm perennes', 'Máximo 2 aplicaciones por temporada en el mismo lote', '30 días antes de siembra o cosecha del cultivo siguiente', '12 horas post-aplicación (sin lluvia)', 'Clase IV — Ligeramente peligroso (banda verde)', 'Consultar etiqueta para N° SAG vigente', 'Guantes nitrilo, lentes herméticos, ropa manga larga, mascarilla partículas', '0°C a 40°C — proteger de congelamiento', '2 años desde fabricación', 'Envase 5 L');
INSERT INTO public.producto_detalle_insumo (id, producto_id, ingrediente_activo, tipo_formulacion, modo_accion, cultivos_objetivo, plagas_objetivo, dosis_recomendada, momento_aplicacion, numero_aplicaciones, periodo_carencia, reingreso_campo, clase_toxicologica, registro_sag, epp_requerido, temperatura_almacen, vida_util, presentacion) VALUES (3, 23, 'Oxicloruro de cobre 50% (equivalente a 25% Cu metálico)', 'Polvo mojable (WP)', 'Fungicida cúprico de contacto. Libera iones Cu²⁺ tóxicos para el hongo. Acción preventiva — no sistémico. Autorizado para agricultura orgánica', 'Vid, manzano, peral, duraznero, kiwi, tomate, papa, lechuga, apio', 'Mildiu (Plasmopara, Peronospora), Alternaria, Cáncer bacterial, Botritis (preventivo)', '4–6 g/L de agua (400–600 g/há según cultivo)', 'Preventivo — aplicar antes de lluvia o alta humedad. Repetir cada 7–14 días', 'Sin restricción — respetar dosis máxima cobre por temporada', '7 días frutales / 5 días hortalizas de hoja', '24 horas post-aplicación', 'Clase III — Moderadamente peligroso (banda amarilla) | Apto agricultura orgánica', 'Consultar etiqueta para N° SAG vigente', 'Guantes nitrilo, mascarilla FFP2, lentes de seguridad, ropa protectora', '15°C a 30°C — lugar seco, evitar humedad', '3 años sellado desde fabricación', 'Bolsa 1 kg');
INSERT INTO public.producto_detalle_insumo (id, producto_id, ingrediente_activo, tipo_formulacion, modo_accion, cultivos_objetivo, plagas_objetivo, dosis_recomendada, momento_aplicacion, numero_aplicaciones, periodo_carencia, reingreso_campo, clase_toxicologica, registro_sag, epp_requerido, temperatura_almacen, vida_util, presentacion) VALUES (4, 24, 'Ácidos húmicos 8% + Ácidos fúlvicos 4% + Micorrizas nativas (Glomus spp.) 50 esporas/mL', 'Solución líquida (SL)', 'Bioestimulante radicular. Ácidos húmicos/fúlvicos mejoran estructura del suelo y disponibilidad de nutrientes. Micorrizas colonizan raíces ampliando superficie de absorción hasta 10×', 'Hortalizas, frutales, viñas, flores, papas, cereales en trasplante', NULL, '2–3 mL/L en drench o riego por goteo al trasplante | 3–5 L/há en fertiriego', 'Al trasplante (máximo beneficio) / inicio temporada en plantas establecidas', '2–4 aplicaciones por temporada — espaciar 20–30 días', 'Sin período de carencia (bioestimulante, no plaguicida)', 'Sin restricción', 'No aplica — sin clasificación toxicológica', NULL, 'Guantes recomendados — sin riesgo significativo', '5°C a 25°C — no congelar. Refrigerar si temperatura supera 30°C', '18 meses sellado / usar antes de 6 meses de apertura', 'Envase 1 L');
INSERT INTO public.producto_detalle_insumo (id, producto_id, ingrediente_activo, tipo_formulacion, modo_accion, cultivos_objetivo, plagas_objetivo, dosis_recomendada, momento_aplicacion, numero_aplicaciones, periodo_carencia, reingreso_campo, clase_toxicologica, registro_sag, epp_requerido, temperatura_almacen, vida_util, presentacion) VALUES (5, 25, 'Spinosad 12% (mezcla de espinasinas A y D)', 'Suspensión concentrada (SC)', 'Insecticida biológico de Saccharopolyspora spinosa. Actúa sobre receptores nicotínicos de acetilcolina y receptores GABA. Selectivo: bajo impacto en insectos benéficos. Apto agricultura orgánica', 'Hortalizas, frutales (manzano, peral, vid), papas, flores', 'Trips (Frankliniella, Thrips tabaci), Polilla del manzano, Mosca de la fruta (Ceratitis capitata)', '0.5–1 mL/L (100–200 mL/há) en 400–800 L agua/há', 'Al detectar primeros adultos o vuelo en trampas. Aplicar mañana o tarde (proteger abejas)', 'Máximo 2 aplicaciones consecutivas — rotar modo de acción (IRAC grupo 5)', '1 día en hortalizas de hoja / 3 días en frutales', '4 horas post-aplicación', 'Clase IV — Ligeramente peligroso (banda verde) | Certificado agricultura orgánica', 'Consultar etiqueta para N° SAG vigente', 'Guantes nitrilo, lentes, ropa manga larga', '5°C a 30°C — no congelar, proteger de luz solar directa', '2 años sellado desde fabricación', 'Envase 500 mL');
INSERT INTO public.producto_detalle_insumo (id, producto_id, ingrediente_activo, tipo_formulacion, modo_accion, cultivos_objetivo, plagas_objetivo, dosis_recomendada, momento_aplicacion, numero_aplicaciones, periodo_carencia, reingreso_campo, clase_toxicologica, registro_sag, epp_requerido, temperatura_almacen, vida_util, presentacion) VALUES (6, 26, 'N 15% + P₂O₅ 15% + K₂O 15% + Azufre (S) 6% + Boro (B) trazas', 'Granulado perlado de liberación gradual', 'Fertilizante compuesto edáfico. Relación 1:1:1 NPK equilibrada. Azufre mejora absorción de N. Liberación gradual reduce pérdidas por lixiviación', 'Cereales, hortalizas, frutales, viñas, praderas y cultivos extensivos en general', NULL, '100–200 kg/há según análisis de suelo | Incorporar con último rastraje', 'Pre-siembra incorporado / inicio de temporada en cultivos establecidos', NULL, 'Sin período de carencia (fertilizante)', NULL, 'No aplica — fertilizante', NULL, 'Guantes al manipular (puede irritar piel)', 'Lugar seco y ventilado. Evitar humedad (apelmaza el granulado)', '2 años en envase sellado', 'Saco 50 kg');
INSERT INTO public.producto_detalle_insumo (id, producto_id, ingrediente_activo, tipo_formulacion, modo_accion, cultivos_objetivo, plagas_objetivo, dosis_recomendada, momento_aplicacion, numero_aplicaciones, periodo_carencia, reingreso_campo, clase_toxicologica, registro_sag, epp_requerido, temperatura_almacen, vida_util, presentacion) VALUES (7, 27, 'Carbonato de calcio (CaCO₃) 22% CaO + Carbonato de magnesio (MgCO₃) 12% MgO', 'Polvo molido — granulometría 90% bajo malla 100', 'Corrector de pH edáfico. Reacciona con H⁺ del suelo ácido elevando pH hacia 6.5–7.0. Aporta calcio y magnesio. Reacción lenta 3–6 meses', 'Todos los cultivos en suelos ácidos (pH < 6.0) — cereales, papa, raps, praderas', NULL, '1–3 ton/há según análisis de suelo y pH actual | Incorporar con arado o rastraje', 'Antes de la siembra — mínimo 3 meses antes para corrección efectiva', '1 aplicación cada 3–4 años según mantención de pH', 'Sin período de carencia', NULL, 'No aplica — enmienda mineral natural', NULL, 'Mascarilla antipolvo, guantes', 'Lugar seco — absorbe humedad y puede apelmazarse', 'Indefinido en condiciones secas', 'Saco 50 kg');
INSERT INTO public.producto_detalle_insumo (id, producto_id, ingrediente_activo, tipo_formulacion, modo_accion, cultivos_objetivo, plagas_objetivo, dosis_recomendada, momento_aplicacion, numero_aplicaciones, periodo_carencia, reingreso_campo, clase_toxicologica, registro_sag, epp_requerido, temperatura_almacen, vida_util, presentacion) VALUES (8, 28, 'Polialquilsiloxano (siliconado) 100%', 'Concentrado líquido (SL)', 'Coadyuvante adherente y humectante. Reduce tensión superficial de la mezcla facilitando mojado uniforme y penetración estomática. Mejora resistencia al lavado. Sin acción biológica propia', 'Usar con cualquier plaguicida o fertilizante foliar en todos los cultivos', NULL, '0.05–0.1% v/v de la mezcla total (0.5–1 mL/L) — no superar 0.1%', 'Agregar al final del proceso de mezcla del caldo de aspersión', NULL, 'Sin período de carencia propio — respetar el del producto con que se mezcla', NULL, 'No aplica — coadyuvante', NULL, 'Guantes al manipular concentrado', '5°C a 35°C — evitar congelamiento y calor excesivo', '3 años sellado', 'Envase 200 mL');
INSERT INTO public.producto_detalle_insumo (id, producto_id, ingrediente_activo, tipo_formulacion, modo_accion, cultivos_objetivo, plagas_objetivo, dosis_recomendada, momento_aplicacion, numero_aplicaciones, periodo_carencia, reingreso_campo, clase_toxicologica, registro_sag, epp_requerido, temperatura_almacen, vida_util, presentacion) VALUES (9, 29, 'Cloruro de potasio (KCl) grado fertiriego — K₂O 60% | Pureza >99.5%', 'Cristales solubles grado fertiriego (alta solubilidad)', 'Fertilizante potásico de alta solubilidad para fertiriego. K⁺ esencial en fructificación, llenado de fruto, resistencia a estrés hídrico y calidad postcosecha', 'Frutales (uva, manzano, peral), hortalizas (tomate, pimiento, melón), papa, cereales — vía riego tecnificado', NULL, '3–8 kg/há por aplicación en fertiriego / dosis total temporada según análisis foliar', 'Etapa de fructificación y llenado de fruto — máxima demanda de K', 'Fraccionado en 4–8 aplicaciones durante la temporada', 'Sin período de carencia (fertilizante)', NULL, 'No aplica — fertilizante', NULL, 'Guantes al manipular (puede irritar piel)', 'Lugar seco — higroscópico, absorbe humedad y se apelmaza', '2 años en saco sellado', 'Saco 25 kg');
INSERT INTO public.producto_detalle_insumo (id, producto_id, ingrediente_activo, tipo_formulacion, modo_accion, cultivos_objetivo, plagas_objetivo, dosis_recomendada, momento_aplicacion, numero_aplicaciones, periodo_carencia, reingreso_campo, clase_toxicologica, registro_sag, epp_requerido, temperatura_almacen, vida_util, presentacion) VALUES (10, 30, 'No aplica — kit de muestreo físico sin ingrediente activo', 'Kit físico — bolsas polietileno + calador acero inoxidable 30 cm', 'Kit de toma de muestras de suelo para análisis de laboratorio. Permite determinar pH, materia orgánica, NPK disponible, micronutrientes y conductividad eléctrica. Base del manejo racional de fertilización', 'Todos los cultivos — muestreo previo a siembra o inicio de temporada', NULL, '1 muestra compuesta por há (mezcla de 10–15 submuestras por sector homogéneo)', 'Antes de siembra o inicio de temporada — con suelo en tempero', NULL, 'Sin período de carencia', NULL, 'No aplica', NULL, 'Guantes recomendados para higiene', 'Temperatura ambiente — evitar humedad en bolsas antes de uso', '3 años — bolsas y calador sin caducidad en condiciones normales', 'Kit: 10 bolsas PE + calador 30 cm + guía impresa + formulario laboratorio');


--
-- Data for Name: producto_detalle_maquinaria; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.producto_detalle_maquinaria (id, producto_id, motor_tipo, potencia, combustible, capacidad, rendimiento, ancho_trabajo, requiere_tractor, hp_requerido, enganche, pto_rpm, dimensiones, peso_operativo, material_estructura) VALUES (1, 11, 'Diésel 3 cilindros Kubota D902 — 4 tiempos, refrigerado por agua', '23 HP (17.2 kW) a 3.200 rpm', 'Diésel — tanque 17 L', 'Levante 3 puntos: 680 kg | Depósito hidráulico: 17 L', 'Hasta 15 há en viñas, huertos y parcelas', NULL, false, 'Automotriz — no requiere tractor adicional', '3 puntos categoría I', '540 RPM trasero', '257 × 119 × 95 cm | Batalla: 144 cm', '770 kg operativo', 'Chasis acero de alta resistencia, capó HDPE termomoldeado');
INSERT INTO public.producto_detalle_maquinaria (id, producto_id, motor_tipo, potencia, combustible, capacidad, rendimiento, ancho_trabajo, requiere_tractor, hp_requerido, enganche, pto_rpm, dimensiones, peso_operativo, material_estructura) VALUES (2, 12, 'Diésel 3 cilindros Yanmar 3TNV88 — Stage V (bajas emisiones)', '24 HP (17.9 kW)', 'Diésel Stage V baja emisión — tanque 28 L', 'Levante 3 puntos: 750 kg | Transmisión: 12 marchas adelante + 12 reversa', 'Versátil para viñas, huertos y campo abierto hasta 20 há', NULL, false, 'Automotriz', '3 puntos categoría I/II', '540 RPM trasero y central', NULL, '850 kg operativo', 'Chasis acero estructural, soporte nativo receptor GPS externo en cabina');
INSERT INTO public.producto_detalle_maquinaria (id, producto_id, motor_tipo, potencia, combustible, capacidad, rendimiento, ancho_trabajo, requiere_tractor, hp_requerido, enganche, pto_rpm, dimensiones, peso_operativo, material_estructura) VALUES (3, 13, 'Dosificadores eléctricos paso a paso — TDF solo para ventilador soplante', 'Sin motor propio — usa TDF del tractor para soplante', 'Sin consumo propio', 'Tolva semilla: 400 L | Profundidad siembra: 2 a 8 cm regulable', 'Hasta 8 ha/hora a 9 km/h con 6 hileras activas y corte de sección GPS', '3 metros (6 hileras × 50 cm)', true, 'Mínimo 60 HP', '3 puntos categoría II o barra de tiro', '540 RPM solo ventilador', NULL, NULL, 'Chasis acero SAE 1020, discos sembradoras de acero temperado');
INSERT INTO public.producto_detalle_maquinaria (id, producto_id, motor_tipo, potencia, combustible, capacidad, rendimiento, ancho_trabajo, requiere_tractor, hp_requerido, enganche, pto_rpm, dimensiones, peso_operativo, material_estructura) VALUES (4, 14, 'Diésel John Deere PowerTech 6.8L 6 cilindros — reacondicionado con garantía 500 horas', '370 HP (276 kW)', 'Diésel — tanque aprox. 400 L', 'Cabezal cosechador: 3 m | Picador fino de alta densidad | Deflector hidráulico incluido', 'Alta capacidad para forraje — rendimiento según cultivo y condiciones de campo', '3 metros (cabezal cosechador)', false, 'Autopropulsada — no requiere tractor', NULL, NULL, NULL, 'Aprox. 14.500 kg operativo', 'Estructura John Deere original, chasis acero de alta resistencia');
INSERT INTO public.producto_detalle_maquinaria (id, producto_id, motor_tipo, potencia, combustible, capacidad, rendimiento, ancho_trabajo, requiere_tractor, hp_requerido, enganche, pto_rpm, dimensiones, peso_operativo, material_estructura) VALUES (5, 15, 'Bomba membrana triple diafragma accionada por TDF del tractor', 'Sin motor propio — usa potencia TDF del tractor', 'Sin consumo propio', 'Estanque: 2.000 litros | Presión ajustable: 1–8 bar', '6–10 ha/hora según velocidad de avance y volumen de caldo aplicado', '18 metros de barra de aspersión', true, 'Mínimo 80 HP', '3 puntos categoría II / III', '540 RPM', NULL, NULL, 'Chasis acero galvanizado, estanque polietileno PEAD 2.000 L');
INSERT INTO public.producto_detalle_maquinaria (id, producto_id, motor_tipo, potencia, combustible, capacidad, rendimiento, ancho_trabajo, requiere_tractor, hp_requerido, enganche, pto_rpm, dimensiones, peso_operativo, material_estructura) VALUES (6, 16, 'Sin motor — implemento de arrastre pasivo', 'Sin potencia propia', 'Sin consumo', '5 brazos rígidos con puntas intercambiables | Profundidad: hasta 55 cm', '1.5–2.5 ha/hora según velocidad y profundidad de trabajo', '1.8 metros', true, 'Mínimo 70 HP (100 HP recomendado a 55 cm de profundidad)', '3 puntos categoría II', NULL, NULL, 'Aprox. 560 kg', 'Brazos acero boron templado, puntas intercambiables de reemplazo disponibles');
INSERT INTO public.producto_detalle_maquinaria (id, producto_id, motor_tipo, potencia, combustible, capacidad, rendimiento, ancho_trabajo, requiere_tractor, hp_requerido, enganche, pto_rpm, dimensiones, peso_operativo, material_estructura) VALUES (7, 17, 'Diésel Honda 4 tiempos monocilíndrico, arranque por manivela', '5 HP (3.7 kW)', 'Diésel — tanque 3.6 L', 'Caudal máximo: 600 L/min | Altura manométrica: 32 m | Diámetro aspiración: 2"', '600 L/min a baja altura — caudal disminuye a mayor altura manométrica', NULL, false, 'Autónoma — no requiere tractor', NULL, NULL, NULL, '37 kg', 'Cuerpo bomba y carcasa en hierro fundido, impulsor bronce');
INSERT INTO public.producto_detalle_maquinaria (id, producto_id, motor_tipo, potencia, combustible, capacidad, rendimiento, ancho_trabajo, requiere_tractor, hp_requerido, enganche, pto_rpm, dimensiones, peso_operativo, material_estructura) VALUES (8, 18, 'Sin motor propio — accionado por TDF del tractor, caja de engranajes en baño de aceite', 'Sin consumo propio', 'Sin consumo', '36 cuchillas en L de acero templado | Profundidad regulable: 5–20 cm', '0.8–1.5 ha/hora según velocidad y condición del suelo', '1.8 metros', true, 'Mínimo 35 HP', '3 puntos categoría I/II', '540 RPM', NULL, NULL, 'Chasis acero estructural, cuchillas acero templado intercambiables');
INSERT INTO public.producto_detalle_maquinaria (id, producto_id, motor_tipo, potencia, combustible, capacidad, rendimiento, ancho_trabajo, requiere_tractor, hp_requerido, enganche, pto_rpm, dimensiones, peso_operativo, material_estructura) VALUES (9, 19, 'Sin motor — sistema hidráulico accionado por tractor', 'Sin potencia propia (hidráulico desde tractor)', 'Sin consumo propio', 'Carga útil: 5 toneladas | Volquete hidráulico doble efecto', NULL, '2.2 metros de ancho de caja', true, 'Mínimo 50 HP con salida hidráulica', 'Barra de tiro estándar + acople hidráulico', NULL, NULL, 'Aprox. 1.200 kg vacío', 'Acero perfilado 4 mm, rampa trasera incluida, neumáticos 12.5/80-15.3');
INSERT INTO public.producto_detalle_maquinaria (id, producto_id, motor_tipo, potencia, combustible, capacidad, rendimiento, ancho_trabajo, requiere_tractor, hp_requerido, enganche, pto_rpm, dimensiones, peso_operativo, material_estructura) VALUES (10, 20, 'Sin motor — dispositivo electrónico de guiado', 'Alimentación 12V DC desde tractor (cable incluido)', 'Sin consumo de combustible', 'Pantalla táctil 7" | Correcciones RTK incluidas 12 meses | Compatible cualquier marca tractor', 'Precisión ±2 cm modo RTK / ±30 cm modo GPS estándar', NULL, false, 'Compatible con cualquier tractor — instalación universal en cabina', NULL, NULL, NULL, 'Aprox. 1.2 kg (receptor + antena)', 'Carcasa ABS reforzado, antena GNSS externa incluida, cable alimentación 12V');


--
-- Data for Name: producto_detalle_tecnologia; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.producto_detalle_tecnologia (id, producto_id, conectividad, protocolo, tipo_alimentacion, autonomia, variables_medidas, precision_medicion, rango_medicion, ip_proteccion, rango_temperatura, dimensiones, plataforma_app, integraciones, almacenamiento) VALUES (1, 1, 'LoRa 868 MHz + WiFi 802.11 b/g/n', 'MQTT v3.1, REST API JSON', 'Batería solar integrada recargable', '12 meses con luz solar / 3 meses sin sol directo', 'Humedad volumétrica del suelo, Temperatura de suelo', 'Humedad ±2% | Temperatura ±0.5°C', 'Humedad: 0–100% | Temperatura: -10°C a 70°C | Profundidad: hasta 60 cm', 'IP67', '-10°C a +60°C operación', NULL, 'App AgroSmart (iOS / Android), Web dashboard', 'Thingsboard, AWS IoT Core, API REST JSON', 'Nube AgroSmart + app local sin conexión');
INSERT INTO public.producto_detalle_tecnologia (id, producto_id, conectividad, protocolo, tipo_alimentacion, autonomia, variables_medidas, precision_medicion, rango_medicion, ip_proteccion, rango_temperatura, dimensiones, plataforma_app, integraciones, almacenamiento) VALUES (2, 2, '4G LTE + WiFi de respaldo', 'REST API JSON, MQTT', 'Panel solar integrado + batería de respaldo', 'Ilimitada con sol / 72 h sin energía solar', 'Temperatura ambiente, Humedad relativa, Velocidad del viento, Precipitaciones, Radiación solar', 'Temperatura ±0.3°C | Humedad ±2% | Viento ±5%', 'Temperatura: -30°C a 70°C | Humedad: 0–100% | Viento: 0–60 m/s | Lluvia: 0.2 mm resolución', 'IP65', '-30°C a +70°C', NULL, 'App AgriClima (iOS / Android), Panel web', 'Plataformas meteorológicas, API REST, exportación CSV', 'Transmisión cada 5 min / histórico 12 meses en nube');
INSERT INTO public.producto_detalle_tecnologia (id, producto_id, conectividad, protocolo, tipo_alimentacion, autonomia, variables_medidas, precision_medicion, rango_medicion, ip_proteccion, rango_temperatura, dimensiones, plataforma_app, integraciones, almacenamiento) VALUES (3, 3, 'OcuSync 3.0 (control remoto), WiFi para transferencia de datos', 'DJI SDK v5, REST API telemetría', '2 baterías LiPo de alta densidad incluidas + cargador rápido', '8 min/carga con carga útil 10 L — cargador rápido incluido', 'Posición GPS, altitud barométrica, caudal aspersión, cobertura ha', 'Posición GPS ±1.5 m | Caudal ±1%', 'Radio control: 3 km | Altitud máx: 3000 m s.n.m. | Velocidad: 0–8 m/s', 'IP43', '0°C a 40°C operación', 'Brazos desplegados: aprox. 100 x 100 cm', 'DJI Agras App (iOS / Android)', 'DJI Terra para planificación de vuelo, importación shapefile', 'Logs de vuelo y cobertura en app DJI');
INSERT INTO public.producto_detalle_tecnologia (id, producto_id, conectividad, protocolo, tipo_alimentacion, autonomia, variables_medidas, precision_medicion, rango_medicion, ip_proteccion, rango_temperatura, dimensiones, plataforma_app, integraciones, almacenamiento) VALUES (4, 4, 'Bluetooth 5.0', 'BLE perfil GATT personalizado, exportación JSON', 'Batería recargable USB-C integrada', '200 análisis por carga / aprox. 8 horas uso continuo', 'Nitrógeno (N), Fósforo (P), Potasio (K) — análisis foliar rápido', 'N ±3% | P ±4% | K ±3% (validado vs laboratorio)', 'N: 0.5–5% hoja seca | P: 0.1–1% | K: 0.5–4%', 'IP54', '5°C a 45°C', NULL, 'App AgroSmart (iOS / Android)', 'App AgroSmart, exportación PDF de informe por muestra', 'Historial de análisis en app / exportación CSV');
INSERT INTO public.producto_detalle_tecnologia (id, producto_id, conectividad, protocolo, tipo_alimentacion, autonomia, variables_medidas, precision_medicion, rango_medicion, ip_proteccion, rango_temperatura, dimensiones, plataforma_app, integraciones, almacenamiento) VALUES (5, 5, '4G LTE + WiFi 802.11 b/g/n + LoRaWAN 868 MHz', 'LoRaWAN 1.0.3, MQTT, REST API JSON, Modbus TCP', '12V DC (adaptador incluido) o panel solar externo', 'Continua (requiere alimentación permanente)', 'Concentrador — gestiona hasta 128 nodos sensores simultáneos', 'No aplica (concentrador de datos)', 'Cobertura LoRa: hasta 2 km línea vista | Nodos simultáneos: 128', 'IP67', '-20°C a +60°C', NULL, 'Panel web AgroConnect, API de configuración REST', 'AWS IoT, Azure IoT Hub, Thingsboard, Chirpstack', 'Buffer local 72 h ante corte de red / sincronización automática al reconectar');
INSERT INTO public.producto_detalle_tecnologia (id, producto_id, conectividad, protocolo, tipo_alimentacion, autonomia, variables_medidas, precision_medicion, rango_medicion, ip_proteccion, rango_temperatura, dimensiones, plataforma_app, integraciones, almacenamiento) VALUES (6, 6, 'WiFi 802.11 b/g/n + cable Ethernet RJ45', 'RTSP, ONVIF, HTTP API', '12V DC (cable incluido) / PoE opcional', 'Continua (alimentación permanente)', 'Video 1080p Full HD, detección de movimiento por zonas, visión nocturna IR hasta 30 m', 'Resolución: 1920×1080 px | Campo visual: 90° horizontal', 'Zoom PTZ: 4× digital | Visión nocturna IR: hasta 30 m', 'IP66', '-10°C a +60°C', NULL, 'App CampoVision (iOS / Android), VMS compatible ONVIF', 'Sistemas NVR, alertas por email/push, integración Hikvision/Dahua', 'MicroSD hasta 256 GB + grabación en NVR / nube opcional');
INSERT INTO public.producto_detalle_tecnologia (id, producto_id, conectividad, protocolo, tipo_alimentacion, autonomia, variables_medidas, precision_medicion, rango_medicion, ip_proteccion, rango_temperatura, dimensiones, plataforma_app, integraciones, almacenamiento) VALUES (7, 7, 'WiFi 802.11 b/g/n', 'REST API, MQTT, integración cloud propietaria', '24V AC (transformador incluido)', 'Continua (requiere alimentación permanente)', 'Control de 8 zonas de riego independientes — goteo o aspersión', 'Tiempo apertura/cierre electroválvula: ±1 segundo', '8 zonas independientes | Programación: hasta 6 programas/zona/día', 'IP44', '0°C a +50°C', NULL, 'App SmartFlow (iOS / Android), Panel web', 'Estación meteorológica AgriClima para riego predictivo, sensores de lluvia', 'Historial de riegos y consumo estimado en nube');
INSERT INTO public.producto_detalle_tecnologia (id, producto_id, conectividad, protocolo, tipo_alimentacion, autonomia, variables_medidas, precision_medicion, rango_medicion, ip_proteccion, rango_temperatura, dimensiones, plataforma_app, integraciones, almacenamiento) VALUES (8, 8, '4G LTE (nano SIM) + WiFi 802.11 a/b/g/n/ac + Bluetooth 5.0 + GPS integrado', 'Estándar Android — compatible con cualquier app', 'Batería litio integrada 8.000 mAh + cargador rápido 18W incluido', '10–12 horas uso continuo / 3 semanas en espera', 'No aplica (dispositivo de gestión y campo)', 'Pantalla: 1920×1200 px, 1.000 nits — legible bajo sol directo', 'Pantalla: 10" | RAM: 4 GB | Almacenamiento interno: 64 GB', 'IP65', '-20°C a +60°C', '262 × 163 × 13 mm | Peso: 780 g', 'Android 12 — compatible con App AgroSmart y todas las apps de campo', 'Bluetooth a sensores, GPS para georreferenciación de muestras', '64 GB interno + microSD hasta 512 GB');
INSERT INTO public.producto_detalle_tecnologia (id, producto_id, conectividad, protocolo, tipo_alimentacion, autonomia, variables_medidas, precision_medicion, rango_medicion, ip_proteccion, rango_temperatura, dimensiones, plataforma_app, integraciones, almacenamiento) VALUES (9, 9, 'Modbus RTU (RS-485) + salida de pulsos analógica', 'Modbus RTU, salida de pulsos 4–20 mA', '12–24V DC desde controlador o fuente externa', 'Continua (alimentación permanente)', 'Caudal instantáneo, caudal acumulado, temperatura del fluido', '±1.5% del fondo de escala', 'Caudal: 0.1–30 m³/h | Tuberías: 1" a 3" | Temperatura fluido: 0–60°C', 'IP68', '-10°C a +60°C operación', NULL, 'Compatible con cualquier SCADA o controlador con Modbus', 'Controlador SmartFlow, sistemas SCADA agrícola, dataloggers', 'Lectura en tiempo real vía Modbus — sin almacenamiento local propio');
INSERT INTO public.producto_detalle_tecnologia (id, producto_id, conectividad, protocolo, tipo_alimentacion, autonomia, variables_medidas, precision_medicion, rango_medicion, ip_proteccion, rango_temperatura, dimensiones, plataforma_app, integraciones, almacenamiento) VALUES (10, 10, 'WiFi 802.11 b/g/n (controlador central)', 'REST API propietaria, MQTT', '220V AC (cable incluido)', 'Continua (requiere red eléctrica)', 'Temperatura ambiente, Humedad relativa, CO₂, estado ventanas (abierto/cerrado)', 'Temperatura ±0.5°C | Humedad ±3% | CO₂ ±50 ppm', 'Temperatura: 0–50°C | Humedad: 20–95% HR | CO₂: 400–5.000 ppm | Cobertura: hasta 2.000 m²', 'IP44 controlador / IP65 sensores', '0°C a +50°C operación', NULL, 'App ClimControl (iOS / Android), Panel web', 'Expansible hasta 16 sensores y actuadores adicionales', 'Historial de condiciones y alertas por umbral en nube');


--
-- Name: cursos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cursos_id_seq', 14, true);


--
-- Name: producto_detalle_insumo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.producto_detalle_insumo_id_seq', 10, true);


--
-- Name: producto_detalle_maquinaria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.producto_detalle_maquinaria_id_seq', 10, true);


--
-- Name: producto_detalle_tecnologia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.producto_detalle_tecnologia_id_seq', 10, true);


--
-- Name: productos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.productos_id_seq', 41, true);


--
-- PostgreSQL database dump complete
--



-- ============================================================
-- Verificación rápida
-- ============================================================
SELECT 'usuarios' AS tabla, COUNT(*) FROM public.usuarios
UNION ALL SELECT 'productos', COUNT(*) FROM public.productos
UNION ALL SELECT 'cursos', COUNT(*) FROM public.cursos
UNION ALL SELECT 'ventas', COUNT(*) FROM public.ventas
UNION ALL SELECT 'solicitudes', COUNT(*) FROM public.solicitudes;
