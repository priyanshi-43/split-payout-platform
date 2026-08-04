import CheckoutForm from './components/CheckoutForm';
import VendorDashboard from './components/VendorDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Split Payout Platform</h1>
      <CheckoutForm />
      <VendorDashboard />
      <AdminDashboard />
    </div>
  );
}

export default App;