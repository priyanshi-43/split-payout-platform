const { calculateTax } = require('./taxService');

function calculateSplit(order, vendors) {
  const vendorMap = {};
  vendors.forEach(v => { vendorMap[v._id.toString()] = v; });

  const grouped = {};
  order.items.forEach(item => {
    const vId = item.vendorId.toString();
    if (!grouped[vId]) grouped[vId] = 0;
    grouped[vId] += item.price * item.quantity;
  });

  let breakdown = [];
  let totalPlatformFee = 0;
  let totalTax = 0;
  let totalNetPayout = 0;

  for (const vId in grouped) {
    const vendor = vendorMap[vId];
    const grossAmount = Math.round(grouped[vId] * 100) / 100;
    const platformFee = Math.round(grossAmount * vendor.commissionRate * 100) / 100;
    const taxAmount = calculateTax(grossAmount, vendor.region);
    const netPayout = Math.round((grossAmount - platformFee - taxAmount) * 100) / 100;

    breakdown.push({ vendorId: vId, grossAmount, platformFee, taxAmount, netPayout });
    totalPlatformFee += platformFee;
    totalTax += taxAmount;
    totalNetPayout += netPayout;
  }

  const totalCalculated = totalPlatformFee + totalTax + totalNetPayout;
  const roundingAdjustment = Math.round((order.totalAmount - totalCalculated) * 100) / 100;

  return { breakdown, totalPlatformFee, totalTax, roundingAdjustment };
}

module.exports = { calculateSplit };