import { useState } from 'react';
import axios from 'axios';

function VendorDashboard() {
  const [vendorId, setVendorId] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPayouts = async (e) => {
    e.preventDefault();
    setError('');
    setData(null);
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/vendors/${vendorId}/payouts`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h3 className="card-title">🔍 Look Up Vendor</h3>
        <form onSubmit={fetchPayouts} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Vendor ID</label>
            <input
              className="form-input"
              placeholder="e.g. 6a605669acacdbba9ce56166"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'View Payouts'}
          </button>
        </form>
        {error && <div className="alert-error">{error}</div>}
      </div>

      {data && (
        <>
          <div className="card">
            <h3 className="card-title">👤 {data.vendor.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '-10px 0 18px 0' }}>{data.vendor.email}</p>

            <div className="stat-grid" style={{ marginBottom: 0 }}>
              <div className="stat-card">
                <div className="stat-label">Total Earned</div>
                <div className="stat-value success">₹{data.summary.totalEarned}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Pending</div>
                <div className="stat-value accent">₹{data.summary.totalPending}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Payouts</div>
                <div className="stat-value">{data.summary.totalPayouts}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">📋 Payout History</h3>
            {data.payouts.length === 0 ? (
              <div className="empty-state">No payouts yet for this vendor.</div>
            ) : (
              <table className="data-table">
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
                      <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹{p.amount}</td>
                      <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                      <td>{new Date(p.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default VendorDashboard;