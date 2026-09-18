import { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/orders/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load'));
  }, []);

  if (error) return <div className="alert-error">{error}</div>;
  if (!stats) return <div className="empty-state">Loading stats...</div>;

  const payoutData = [
    { name: 'Succeeded', value: stats.payoutSummary.succeeded, color: '#22C55E' },
    { name: 'Pending', value: stats.payoutSummary.pending, color: '#F59E0B' },
    { name: 'Failed', value: stats.payoutSummary.failed, color: '#EF4444' },
  ].filter(d => d.value > 0);

  const moneyData = [
    { name: 'Platform Fees', value: stats.totalPlatformFees, color: '#6366F1' },
    { name: 'Tax Collected', value: stats.totalTaxCollected, color: '#F59E0B' },
  ].filter(d => d.value > 0);

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Platform Fees</div>
          <div className="stat-value accent">₹{stats.totalPlatformFees}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tax Collected</div>
          <div className="stat-value">₹{stats.totalTaxCollected}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{stats.totalOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Delivered</div>
          <div className="stat-value success">{stats.deliveredOrders}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="card">
          <h3 className="card-title">💰 Payout Status</h3>
          {payoutData.length === 0 ? (
            <div className="empty-state">No payouts yet.</div>
          ) : (
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={payoutData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {payoutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#171B24" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1D212C', border: '1px solid #262B37', borderRadius: '8px', fontSize: '12px' }} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span style={{ color: '#8B92A5', fontSize: '12px' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="card-title">🧾 Fees vs Tax</h3>
          {moneyData.length === 0 ? (
            <div className="empty-state">No revenue yet.</div>
          ) : (
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={moneyData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {moneyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#171B24" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1D212C', border: '1px solid #262B37', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value) => `₹${value}`}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span style={{ color: '#8B92A5', fontSize: '12px' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">⚠️ Failed Payouts</h3>
        {stats.failedPayouts.length === 0 ? (
          <div className="empty-state">No failed payouts — all clear.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Amount</th>
                <th>Reason</th>
                <th>Attempts</th>
              </tr>
            </thead>
            <tbody>
              {stats.failedPayouts.map((p) => (
                <tr key={p._id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹{p.amount}</td>
                  <td>{p.failureReason}</td>
                  <td><span className="badge badge-failed">{p.attempts} attempt{p.attempts !== 1 ? 's' : ''}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;