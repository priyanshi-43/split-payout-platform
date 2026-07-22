// Simple mock tax rules by region — expand later
const TAX_RATES = { IN: 0.18, US: 0.08, DEFAULT: 0.10 };
function calculateTax(amount, region) {
  const rate = TAX_RATES[region] || TAX_RATES.DEFAULT;
  return Math.round(amount * rate * 100) / 100;
}
module.exports = { calculateTax };