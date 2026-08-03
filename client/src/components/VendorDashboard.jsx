import { useState } from 'react';
import axios from 'axios';

function VendorDashboard() {
  const [vendorId, setVendorId] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const fetchPayouts = async (e) => {
    e.preventDefault();
    setError('');
    setData(null);
    try {
      const res = await axios.get(`http://localhost:5000/api/vendors/${vendorId}/payouts`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div style={{ marginTop: '40px', borderTop: '2px solid #333', paddingTop: '20px' }}>
      <h2>Vendor Dashboard</h2>
      <form onSubmit={fetchPayouts} style={{ display: 'flex', gap: '10px', maxWidth: '400px' }}>
        <input
          placeholder="Vendor ID"
          value={vendorId}
          onChange={(e) => setVendorId(e.target.value)}
          style={{ flex: 1 }}
          required
        />
        <button type="submit">View Payouts</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {data && (
        <div style={{ marginTop: '20px' }}>
          <h3>{data.vendor.name} ({data.vendor.email})</h3>
          <p>Total Earned (succeeded): ₹{data.summary.totalEarned}</p>
          <p>Total Pending: ₹{data.summary.totalPending}</p>
          <p>Total Payout Records: {data.summary.totalPayouts}</p>

          <table border="1" cellPadding="8" style={{ marginTop: '10px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Amount</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {data.payouts.map((p) => (
                <tr key={p._id}>
                  <td>₹{p.amount}</td>
                  <td>{p.status}</td>
                  <td>{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default VendorDashboard;