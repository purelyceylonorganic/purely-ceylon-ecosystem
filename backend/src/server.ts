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
import checkoutRoutes from './routes/checkout.routes';
import paymentRoutes from './routes/payment.routes';
import invoiceRoutes from './routes/invoice.routes';
import shippingRoutes from './routes/shipping.routes';
import cartRouter from './routes/cart.routes';
import warehouseRoutes from "./routes/warehouse.routes";
import inventoryRoutes from "./routes/inventory.routes";
import adminRoutes from "./routes/admin.routes";
import productVariantRoutes from "./routes/productVariant.routes";
import farmerRoutes from "./routes/farmer.routes";
import farmRoutes from "./routes/farm.routes";
import batchRoutes from "./routes/batch.routes";
import traceabilityRecordRoutes from "./routes/traceability.routes";
import certificateRoutes from "./routes/certificate.routes";
import currencyRoutes from "./routes/currency.routes";
import { startCurrencyJob } from "./jobs/currency.job";
import taxRoutes from "./routes/tax.routes";
import couponRoutes from "./routes/coupon.routes";
import rfqRoutes from "./routes/rfq.routes";
import adminQuoteRoutes from "./routes/adminQuote.routes";
import bulkOrderRoutes from "./routes/bulkOrder.routes";
import { payBulkOrder } from './controllers/bulkOrder.controller';
import router from './routes';
import categoryRoutes from "./routes/category.routes";
import reviewRoutes from "./routes/review.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import questionRoutes from "./routes/question.routes";
import exportInvoiceRoutes from "./routes/exportInvoice.routes";
import exportDocumentRoutes from "./routes/exportDocument.routes";
import shipmentRoutes from "./routes/shipment.routes";
import addressRoutes from "./routes/address.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import reportRoutes from "./routes/report.routes";
import {verifyEmailConnection} from "./services/notification/email.service";
import {swaggerUi,swaggerSpec} from "./config/swagger";
startCurrencyJob();

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
  'http://localhost:3000',
  "http://localhost:5173"   // ✅ இதை add செய்யுங்கள்
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
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1', appRoutes);
app.use("/api/v1", router);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/checkout', checkoutRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/invoice', invoiceRoutes);
app.use('/api/v1/shipping', shippingRoutes);
app.use("/api/v1/warehouse", warehouseRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/variants", productVariantRoutes);
app.use("/api/v1/farmers", farmerRoutes);
app.use("/api/v1/farms", farmRoutes);
app.use("/api/v1/batches", batchRoutes);
app.use("/api/v1/traceability", traceabilityRecordRoutes);
app.use("/api/v1/certificates", certificateRoutes);
app.use("/api/v1/currency", currencyRoutes);
app.use("/api/v1/tax", taxRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/b2b/rfq", rfqRoutes);
app.use("/api/v1/b2b/admin/quotes", adminQuoteRoutes);
app.use("/api/v1/b2b/bulk-orders", bulkOrderRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/questions", questionRoutes);
app.use("/api/v1/b2b/export-invoices",exportInvoiceRoutes);
app.use("/api/v1/b2b/export-documents", exportDocumentRoutes);
app.use("/api/v1/shipments", shipmentRoutes);
app.use("/api/v1/address", addressRoutes);
app.use("/api/v1/dashboard",dashboardRoutes);
app.use("/api/docs",swaggerUi.serve,swaggerUi.setup(swaggerSpec));
app.use("/api/v1/reports",reportRoutes);
app.get('/api/v1/b2b/bulk-orders/pay/:bulkOrderId', payBulkOrder);
app.get('/api/v1/verify-email-connection', async (_req, res) => {
  try {
    await verifyEmailConnection();
    res.status(200).json({
      success: true,
      message: 'Email server connection verified successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify email server connection.'
    });
  }
});
console.log("Dashboard Route Imported");

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