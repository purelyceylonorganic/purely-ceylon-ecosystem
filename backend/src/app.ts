import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { globalErrorHandler } from './middlewares/error.middleware';

import enterpriseRouter from './routes/enterprise.routes';
import authRouter from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import productRouter from './routes/product.routes';
import cartRouter from './routes/cart.routes';
import warehouseRoutes from './routes/warehouse.routes';
import inventoryRoutes from './routes/inventory.routes';

const app = express();


// Security
app.use(helmet());

app.set('trust proxy', 1);

app.use(express.json({
  limit: '10mb'
}));

app.use(cookieParser());


// CORS
const allowedOrigins = [
  'https://purely-ceylon-store.vercel.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS Blocked'));
    }
  },
  credentials: true
}));


// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
});

app.use('/api/', apiLimiter);


// Health Check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'PCO Enterprise Backend',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});


// Routes
app.use('/api/v1/auth', authRouter);

app.use('/api/v1/enterprise', enterpriseRouter);

app.use('/api/v1/orders', orderRoutes);

app.use('/api/v1/products', productRouter);

app.use('/api/v1/cart', cartRouter);

app.use('/api/v1/warehouses', warehouseRoutes);

app.use('/api/v1/inventory', inventoryRoutes);

// Homepage
app.get('/', (_req, res) => {
  res.send('✅ Purely Ceylon Backend Ecosystem Active 🌿');
});


// 404
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API Route Not Found'
  });
});


// Error Handler
app.use(globalErrorHandler);

export default app;