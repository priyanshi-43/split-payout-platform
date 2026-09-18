import { useState } from 'react';
import './App.css';
import CheckoutForm from './components/CheckoutForm';
import VendorDashboard from './components/VendorDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [activeTab, setActiveTab] = useState('checkout');

  const navItems = [
    { id: 'checkout', label: 'Checkout', icon: '🛒' },
    { id: 'vendor', label: 'Vendor Payouts', icon: '💳' },
    { id: 'admin', label: 'Admin Overview', icon: '📊' },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">SP</div>
          <div>
            <div className="sidebar-brand-text">SplitPay</div>
            <div className="sidebar-brand-sub">Payout Platform</div>
          </div>
        </div>

        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </aside>

      <main className="main-content">
        {activeTab === 'checkout' && (
          <>
            <div className="page-header">
              <h1 className="page-title">Checkout</h1>
              <p className="page-subtitle">Create an order and simulate the split-payout flow end to end.</p>
            </div>
            <CheckoutForm />
          </>
        )}

        {activeTab === 'vendor' && (
          <>
            <div className="page-header">
              <h1 className="page-title">Vendor Payouts</h1>
              <p className="page-subtitle">Look up a vendor's earnings and payout history.</p>
            </div>
            <VendorDashboard />
          </>
        )}

        {activeTab === 'admin' && (
          <>
            <div className="page-header">
              <h1 className="page-title">Admin Overview</h1>
              <p className="page-subtitle">Platform-wide fees, tax collected, and payout health.</p>
            </div>
            <AdminDashboard />
          </>
        )}
      </main>
    </div>
  );
}

export default App;