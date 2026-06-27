const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { runClearanceEngine } = require('../services/clearanceEngine');

// @route  POST /api/webhook/paystack
// @access Public (Paystack only)
const handlePaystackWebhook = async (req, res) => {
  try {
    // Step 1 — Validate Paystack signature
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto
      .createHmac('sha512', secret)
      .update(req.body)
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).json({ status: 'error', message: 'Invalid signature' });
    }

    // Step 2 — Parse the raw body
    const event = JSON.parse(req.body);

    // Step 3 — Only process successful charge events
    if (event.event !== 'charge.success') {
      return res.status(200).json({ status: 'success', message: 'Event received but not processed' });
    }

    const { reference, amount, channel, paid_at, metadata } = event.data;

    // Step 4 — Idempotency check: ignore if already processed
    const existing = await Transaction.findOne({ paystackReference: reference });
    if (!existing) {
      return res.status(200).json({ status: 'success', message: 'Transaction not found, skipping' });
    }

    if (existing.status === 'success') {
      return res.status(200).json({ status: 'success', message: 'Already processed, skipping' });
    }

    // Step 5 — Update transaction to success
    existing.status = 'success';
    existing.channel = channel;
    existing.paidAt = new Date(paid_at);
    existing.paystackResponse = event.data;
    await existing.save();

    await AuditLog.create({
      eventType: 'payment',
      actingUser: existing.student,
      description: `Payment confirmed via webhook - reference: ${reference}`,
      metadata: { reference, amount: amount / 100, channel },
    });

    // Create Notification
    await Notification.create({
      user: existing.student,
      title: 'School Fees Payment Successful',
      description: `Your payment of ₦${existing.amount.toLocaleString()} was confirmed successfully via ${channel || 'Paystack'}.`,
      type: 'billing',
      unread: true
    });

    // Step 6 — Trigger clearance engine
    await runClearanceEngine(existing.student, existing.academicSession, existing._id);

    // Always return 200 to Paystack immediately
    res.status(200).json({ status: 'success', message: 'Webhook processed' });
  } catch (err) {
    console.error('Webhook error:', err.message);
    // Still return 200 so Paystack doesn't keep retrying
    res.status(200).json({ status: 'success', message: 'Webhook received' });
  }
};

module.exports = { handlePaystackWebhook };