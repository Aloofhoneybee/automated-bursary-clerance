const express = require('express');
const router = express.Router();
const { handlePaystackWebhook } = require('../controllers/webhookController');

// Paystack webhook — no auth, Paystack calls this directly
router.post('/paystack', handlePaystackWebhook);

module.exports = router;