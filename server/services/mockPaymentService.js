// Simulates a payment gateway's behavior — same shape as a real Stripe call,
// but no external account or business approval needed.

function createPaymentIntent(amount) {
  return {
    id: `pi_mock_${Date.now()}`,
    amount,
    status: 'requires_confirmation',
    client_secret: `secret_mock_${Math.random().toString(36).slice(2)}`
  };
}

function confirmPayment(paymentIntentId) {
  return { id: paymentIntentId, status: 'succeeded' };
}

function createTransfer(amount, destinationVendorId) {
  return {
    id: `tr_mock_${Date.now()}`,
    amount,
    destination: destinationVendorId,
    status: 'succeeded'
  };
}

function createReversal(transferId, amount) {
  return { id: `trr_mock_${Date.now()}`, transferId, amount, status: 'succeeded' };
}

module.exports = { createPaymentIntent, confirmPayment, createTransfer, createReversal };