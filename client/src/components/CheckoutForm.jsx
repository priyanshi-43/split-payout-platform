import { useState } from 'react';
import axios from 'axios';

function CheckoutForm() {
  const [vendorId, setVendorId] = useState('');
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/orders/checkout', {
        customerEmail: 'test@test.com',
        items: [
          { vendorId, productName, price: Number(price), quantity: Number(quantity) }
        ]
      });
      setOrder(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div>
      <h2>Checkout</h2>
      <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        <input placeholder="Vendor ID" value={vendorId} onChange={(e) => setVendorId(e.target.value)} required />
        <input placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} required />
        <input placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <input placeholder="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        <button type="submit">Create Order</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {order && (
        <div style={{ marginTop: '20px' }}>
          <h3>Order Created</h3>
          <p>Order ID: {order._id}</p>
          <p>Total Amount: ₹{order.totalAmount}</p>
        </div>
      )}
    </div>
  );
}

export default CheckoutForm;