import React, { useEffect, useState } from 'react';
import theme from '../../styles/theme';
import api, { ApiResponse } from '../../services/api';

interface Order {
  _id: string;
  totalAmount: number;
  orderBy: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<Order[]>>('/orders');
      setOrders(res.data.data);
    } catch (err) {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
   const recentOrders = orders
     .sort(
       (a, b) =>
         new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
     ) 
     .slice(0, 5); 
  return (
    <div>
      <h1 style={{ marginBottom: theme.spacing.xl }}>Dashboard</h1>
      {error && (
        <div
          style={{ color: theme.colors.danger, marginBottom: theme.spacing.md }}
        >
          {error}
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: theme.spacing.lg,
          marginBottom: theme.spacing.xl,
        }}
      >
        <div
          style={{
            background: theme.colors.white,
            borderRadius: theme.borderRadius.lg,
            boxShadow: theme.shadows.sm,
            padding: theme.spacing.lg,
            textAlign: "center",
          }}
        >
          <h3
            style={{
              color: theme.colors.primary,
              marginBottom: theme.spacing.sm,
            }}
          >
            Total Orders
          </h3>
          <div style={{ fontSize: theme.fontSizes["2xl"], fontWeight: 700 }}>
            {totalOrders}
          </div>
        </div>
        <div
          style={{
            background: theme.colors.white,
            borderRadius: theme.borderRadius.lg,
            boxShadow: theme.shadows.sm,
            padding: theme.spacing.lg,
            textAlign: "center",
          }}
        >
          <h3
            style={{
              color: theme.colors.secondary,
              marginBottom: theme.spacing.sm,
            }}
          >
            Total Revenue
          </h3>
          <div style={{ fontSize: theme.fontSizes["2xl"], fontWeight: 700 }}>
            ${totalRevenue.toFixed(2)}
          </div>
        </div>
      </div>
      <div
        style={{
          background: theme.colors.white,
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.shadows.sm,
          padding: theme.spacing.lg,
        }}
      >
        <h2
          style={{
            marginBottom: theme.spacing.md,
            color: theme.colors.primary,
          }}
        >
          Recent Orders
        </h2>
        {loading ? (
          <div>Loading...</div>
        ) : recentOrders.length === 0 ? (
          <div style={{ color: theme.colors.gray[500] }}>No recent orders.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: theme.colors.gray[100] }}>
                <th style={{ textAlign: "left", padding: theme.spacing.sm }}>
                  Order ID
                </th>
                <th style={{ textAlign: "right", padding: theme.spacing.sm }}>
                  OrderBy
                </th>
                <th style={{ textAlign: "right", padding: theme.spacing.sm }}>
                  Amount
                </th>
                <th style={{ textAlign: "right", padding: theme.spacing.sm }}>
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order._id}
                  style={{
                    borderBottom: `1px solid ${theme.colors.gray[200]}`,
                  }}
                >
                  <td style={{ padding: theme.spacing.sm }}>
                    {order._id.slice(-6).toUpperCase()}
                  </td>
                  <td style={{ padding: theme.spacing.sm, textAlign: "right" }}>
                    {order.orderBy}
                  </td>
                  <td style={{ padding: theme.spacing.sm, textAlign: "right" }}>
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td style={{ padding: theme.spacing.sm, textAlign: "right" }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 