import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../theme/colors';

const API_URL = 'http://localhost:5000';

function DonutChart({ data, size = 140 }: { data: { value: number; color: string }[]; size?: number }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = size / 2 - 12;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <Svg width={size} height={size}>
      {data.map((d, i) => {
        const fraction = d.value / total;
        const dash = fraction * circumference;
        const circle = (
          <Circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={d.color}
            strokeWidth={16}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
            fill="none"
            strokeLinecap="butt"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
        offset += dash;
        return circle;
      })}
    </Svg>
  );
}

export default function Index() {
  const [vendorId, setVendorId] = useState('');
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [order, setOrder] = useState<any>(null);
  const [transaction, setTransaction] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setError('');
    setTransaction(null);
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/orders/checkout`, {
        customerEmail: 'test@test.com',
        items: [{ vendorId, productName, price: Number(price), quantity: Number(quantity) }],
      });
      setOrder(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/orders/${order._id}/pay`);
      const confirmRes = await axios.post(`${API_URL}/api/orders/${order._id}/confirm-payment`);
      setTransaction(confirmRes.data.transaction);
      setOrder(confirmRes.data.order);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Split Payout Platform</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧾 New Order</Text>

        <Text style={styles.label}>Vendor ID</Text>
        <TextInput style={styles.input} placeholder="e.g. 6a605669acacdbba9ce56166" placeholderTextColor={colors.textMuted} value={vendorId} onChangeText={setVendorId} />

        <Text style={styles.label}>Product Name</Text>
        <TextInput style={styles.input} placeholder="e.g. Shirt" placeholderTextColor={colors.textMuted} value={productName} onChangeText={setProductName} />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Price (₹)</Text>
            <TextInput style={styles.input} placeholder="500" placeholderTextColor={colors.textMuted} value={price} onChangeText={setPrice} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput style={styles.input} placeholder="1" placeholderTextColor={colors.textMuted} value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
          </View>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleCheckout} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Order</Text>}
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      {order && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📦 Order</Text>
          <Text style={styles.rowText}>ID: {order._id}</Text>
          <Text style={styles.rowText}>Total: ₹{order.totalAmount}</Text>
          <Text style={[styles.rowText, { color: order.status === 'paid' ? colors.success : colors.warning, fontWeight: '700' }]}>
            Status: {order.status}
          </Text>
          {order.status === 'pending' && (
            <TouchableOpacity style={styles.btn} onPress={handlePay} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>⚡ Pay Now</Text>}
            </TouchableOpacity>
          )}
        </View>
      )}

      {transaction && transaction.breakdown.map((line: any, i: number) => {
        const chartData = [
          { label: 'Net Payout', value: line.netPayout, color: colors.success },
          { label: 'Platform Fee', value: line.platformFee, color: colors.warning },
          { label: 'Tax', value: line.taxAmount, color: colors.danger },
        ];
        return (
          <View key={i} style={styles.card}>
            <Text style={styles.cardTitle}>🔀 Split Breakdown</Text>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <DonutChart data={chartData} />
            </View>
            {chartData.map((d, idx) => (
              <View key={idx} style={styles.legendRow}>
                <View style={[styles.dot, { backgroundColor: d.color }]} />
                <Text style={styles.legendLabel}>{d.label}</Text>
                <Text style={styles.legendValue}>₹{d.value}</Text>
              </View>
            ))}
            <View style={[styles.legendRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 10 }]}>
              <Text style={[styles.legendLabel, { color: colors.textMuted }]}>Gross Amount</Text>
              <Text style={[styles.legendValue, { fontWeight: '800' }]}>₹{line.grossAmount}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgMain },
  container: { padding: 16, paddingTop: 20, paddingBottom: 60 },
  title: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 16 },
  card: { backgroundColor: colors.bgCard, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  label: { fontSize: 12, color: colors.textSecondary, marginBottom: 6, marginTop: 4 },
  input: { backgroundColor: colors.bgPanel, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, color: colors.textPrimary, marginBottom: 8, fontSize: 14 },
  btn: { backgroundColor: colors.accent, borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  error: { color: colors.danger, marginTop: 8, fontSize: 13 },
  rowText: { color: colors.textSecondary, fontSize: 13, marginBottom: 4 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 3, marginRight: 8 },
  legendLabel: { color: colors.textSecondary, fontSize: 12, flex: 1 },
  legendValue: { color: colors.textPrimary, fontSize: 13, fontWeight: '700' },
});