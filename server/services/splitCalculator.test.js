const { calculateSplit } = require('./splitCalculator');

test('splits a single vendor order correctly', () => {
  const vendors = [{ _id: 'v1', commissionRate: 0.15, region: 'IN' }];
  const order = {
    totalAmount: 1000,
    items: [{ vendorId: 'v1', price: 1000, quantity: 1 }]
  };
  const result = calculateSplit(order, vendors);
  expect(result.breakdown[0].platformFee).toBe(150);
  expect(result.breakdown[0].taxAmount).toBe(180);
  expect(result.breakdown[0].netPayout).toBe(670);
});