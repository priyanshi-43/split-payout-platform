import { useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

function CheckoutForm() {
  const [vendorId, setVendorId] = useState('');
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [order, setOrder] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');
    setTransaction(null);
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/orders/checkout', {
        customerEmail: 'test@test.com',
        items: [{ vendorId, productName, price: Number(price), quantity: Number(quantity) }]
      });
      setOrder(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setError('');
    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/api/orders/${order._id}/pay`);
      const confirmRes = await axios.post(`http://localhost:5000/api/orders/${order._id}/confirm-payment`);
      setTransaction(confirmRes.data.transaction);
      setOrder(confirmRes.data.order);
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h3 className="card-title">🧾 New Order</h3>
        <form onSubmit={handleCheckout}>
          <div className="form-group">
            <label className="form-label">Vendor ID</label>
            <input className="form-input" placeholder="e.g. 6a605669acacdbba9ce56166" value={vendorId} onChange={(e) => setVendorId(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input className="form-input" placeholder="e.g. Shirt" value={productName} onChange={(e) => setProductName(e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Price (₹)</label>
              <input className="form-input" type="number" placeholder="500" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input className="form-input" type="number" placeholder="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            </div>
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Order'}
          </button>
        </form>
        {error && <div className="alert-error">{error}</div>}
      </div>

      {order && (
        <div className="card">
          <h3 className="card-title">
            📦 Order {order.status === 'paid' ? <span className="badge badge-paid">paid</span> : <span className="badge badge-pending">pending</span>}
          </h3>
          <div className="split-metrics" style={{ marginBottom: order.status === 'pending' ? '16px' : '0' }}>
            <div>
              <div className="split-metric-label">Order ID</div>
              <div className="split-metric-value" style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-secondary)' }}>{order._id}</div>
            </div>
            <div>
              <div className="split-metric-label">Total Amount</div>
              <div className="split-metric-value">₹{order.totalAmount}</div>
            </div>
          </div>
          {order.status === 'pending' && (
            <button className="btn btn-primary" onClick={handlePay} disabled={loading}>
              {loading ? 'Processing...' : '⚡ Pay Now'}
            </button>
          )}
        </div>
      )}

      {transaction && (
        <div className="card">
          <h3 className="card-title">🔀 Split Breakdown</h3>
          {transaction.breakdown.map((line, i) => {
            const chartData = [
              { name: 'Net Payout', value: line.netPayout, color: '#22C55E' },
              { name: 'Platform Fee', value: line.platformFee, color: '#F59E0B' },
              { name: 'Tax', value: line.taxAmount, color: '#EF4444' },
            ];
            return (
              <div key={i} className="split-row">
                <div className="split-row-header">
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Vendor: {line.vendorId}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '20px', alignItems: 'center' }}>
                  <div style={{ width: '160px', height: '160px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="#171B24" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: '#1D212C', border: '1px solid #262B37', borderRadius: '8px', fontSize: '12px' }}
                          formatter={(value) => `₹${value}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <div className="split-metrics" style={{ gridTemplateColumns: '1fr' }}>
                      {chartData.map((entry, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: entry.color, flexShrink: 0 }}></span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1 }}>{entry.name}</span>
                          <span style={{ fontSize: '13px', fontWeight: 600 }}>₹{entry.value}</span>
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid var(--border)', marginTop: '4px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Gross Amount</span>
                        <span style={{ fontSize: '13px', fontWeight: 700 }}>₹{line.grossAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CheckoutForm;