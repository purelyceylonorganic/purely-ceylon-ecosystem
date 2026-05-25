import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import appRoutes from './routes/appRoutes';

import { globalErrorHandler } from './middlewares/error.middleware';

import enterpriseRouter from './routes/enterprise.routes';
import authRouter from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import productRouter from './routes/product.routes';


console.log('EMAIL_USER =', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD =', process.env.EMAIL_PASSWORD);

const app = express();


// 1. Security & Parsers
app.use(helmet());
app.set('trust proxy', 1);

app.use(express.json({
  limit: '10mb'
}));

app.use(cookieParser());


// 2. CORS
const allowedOrigins = [
  'https://purely-ceylon-store.vercel.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('❌ Security Restriction: CORS Blocked!'));
    }
  },
  credentials: true
}));


// 3. Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: '❌ மிகவும் அதிகமான கோரிக்கைகள். சிறிது நேரம் கழித்து முயற்சிக்கவும்!'
});

app.use('/api/', apiLimiter);

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'PCO Enterprise Backend',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 4. Routes
app.use('/api/v1/auth', authRouter);

app.use('/api/v1/enterprise', enterpriseRouter);

app.use('/api/v1/orders', orderRoutes);

app.use('/api/v1/products', productRouter);

app.use('/api', appRoutes);

// Homepage Route
app.get('/', (req, res) => {
  res.send('✅ Purely Ceylon Backend Ecosystem Active 🌿');
});

app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API Route Not Found'
  });
});

// 5. Global Error Handler
app.use(globalErrorHandler);


// 6. Server Start
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Purely Ceylon Enterprise Server running on port ${PORT}`);
  });
}


// FINAL EXPORT
export default app;