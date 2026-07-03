const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();


const allowedOrigins = (process.env.CORS_ORIGIN || '*')
    .split(',')
    .map(o => o.trim());

app.use(cors({
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
    credentials: true,
}));
app.use(express.json());


require('./config/db');


const authRoutes = require('./routes/authRoutes');
const productoRoutes = require('./routes/productoRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const webpayRoutes = require('./routes/webpayRoutes');
const solicitudRoutes = require('./routes/solicitudRoutes');
const cursoRoutes = require('./routes/cursoRoutes');
const envioRoutes = require('./routes/envioRoutes');

app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/webpay', webpayRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/envios', envioRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`=== Servidor Backend corriendo en: http://localhost:${PORT} ===`);
});