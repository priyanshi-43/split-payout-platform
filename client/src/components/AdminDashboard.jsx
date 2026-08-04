import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/orders/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load'));
  }, []);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!stats) return <p>Loading...</p>;

  return (
    <div style={{ marginTop: '40px', borderTop: '2px solid #333', paddingTop: '20px' }}>
      <h2>Admin Dashboard</h2>
      <p>Total Platform Fees: ₹{stats.totalPlatformFees}</p>
      <p>Total Tax Collected: ₹{stats.totalTaxCollected}</p>
      <p>Total Orders: {stats.totalOrders} | Paid: {stats.paidOrders} | Delivered: {stats.deliveredOrders}</p>
      <p>Payouts — Succeeded: {stats.payoutSummary.succeeded} | Pending: {stats.payoutSummary.pending} | Failed: {stats.payoutSummary.failed}</p>

      {stats.failedPayouts.length > 0 && (
        <div>
          <h3>Failed Payouts</h3>
          <ul>
            {stats.failedPayouts.map(p => (
              <li key={p._id}>₹{p.amount} — {p.failureReason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;