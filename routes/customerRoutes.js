import express from 'express';
import {
  regCustomer,
  loginCustomer,
  verifyCustomer,
} from '../controllers/customerController.js';

const router = express.Router();

router.post('/register-customer', regCustomer);
router.post('/verify-customer', verifyCustomer);
router.post('/login-customer', loginCustomer);

export default router;
