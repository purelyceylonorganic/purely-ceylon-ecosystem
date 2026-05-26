import { Router } from 'express';

import {
  placeOrder,
  getMyOrders,
  getSingleOrder
} from '../controllers/order.controller';

import { AddressController } from '../controllers/address.controller';

import { protect } from '../middlewares/auth.middleware';

const router = Router();


// ======================================================
// 🔒 PROTECTED ROUTES
// ======================================================


// 🛒 CHECKOUT & ORDER MANAGEMENT

// 🚀 PLACE ORDER
router.post(
  '/checkout',
  protect,
  placeOrder
);

// 📦 GET MY ORDERS
router.get(
  '/my-orders',
  protect,
  getMyOrders
);

// 📦 GET SINGLE ORDER
router.get(
  '/:id',
  protect,
  getSingleOrder
);


// ======================================================
// 📍 ADDRESS MANAGEMENT
// ======================================================

// ➕ ADD ADDRESS
router.post(
  '/addresses',
  protect,
  AddressController.addAddress
);

// 📋 GET ALL MY ADDRESSES
router.get(
  '/addresses',
  protect,
  AddressController.getMyAddresses
);

// ✏️ UPDATE ADDRESS
router.put(
  '/addresses/:id',
  protect,
  AddressController.updateAddress
);

// 🗑️ DELETE ADDRESS
router.delete(
  '/addresses/:id',
  protect,
  AddressController.deleteAddress
);


export default router;