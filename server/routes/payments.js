const express = require('express');
const router = express.Router();
const { initializePayment, getMyTransactions, getAllTransactions, verifyPayment, downloadInvoice, downloadReceipt } = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

router.post('/initialize', restrictTo('student'), initializePayment);
router.get('/my-transactions', restrictTo('student'), getMyTransactions);
router.get('/all', restrictTo('admin', 'staff'), getAllTransactions);
router.get('/verify/:reference', verifyPayment);
router.get('/invoice', restrictTo('student'), downloadInvoice);
router.get('/receipt/:reference', restrictTo('student'), downloadReceipt);

module.exports = router;