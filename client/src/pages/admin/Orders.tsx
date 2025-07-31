import React, { useState, useEffect } from 'react';
import theme from '../../styles/theme';
import api, { ApiResponse } from '../../services/api';

interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: number;
  items: OrderItem[];
  totalAmount: number;
  customerId: string;
  createdAt: string;
  phoneNumber?: string;
  tableToken?: number;
  orderBy: string;
  employeeName?: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get<ApiResponse<Order[]>>('/orders');
      
      if (response.data.success && Array.isArray(response.data.data)) {
        setOrders(response.data.data);
      } else {
        setOrders([]);
        setError('Invalid data format received from server');
      }
    } catch (error: any) {
      setError('Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: theme.spacing.xl, textAlign: 'center' }}>
        Loading orders...
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: theme.spacing.xl,
        }}
      >
        <h1>Orders</h1>
        <button
          onClick={() => {
            fetchOrders();
          }}
          style={{
            padding: theme.spacing.sm,
            backgroundColor: theme.colors.primary,
            color: theme.colors.white,
            border: "none",
            borderRadius: theme.borderRadius.md,
            cursor: "pointer",
          }}
        >
          Refresh Orders
        </button>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: theme.colors.danger,
            color: theme.colors.white,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            marginBottom: theme.spacing.lg,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          backgroundColor: theme.colors.white,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.lg,
        }}
      >
        {orders.length === 0 ? (
          <p style={{ color: theme.colors.gray[600] }}>No orders found.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              style={{
                padding: theme.spacing.lg,
                border: `1px solid ${theme.colors.gray[200]}`,
                borderRadius: theme.borderRadius.md,
                marginBottom: theme.spacing.md,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: theme.spacing.md,
                }}
              >
                <div>
                  <h3
                    style={{
                      marginBottom: theme.spacing.xs,
                      color: theme.colors.primary,
                    }}
                  >
                    Order #{order.orderNumber}
                  </h3>
                  <p
                    style={{
                      color: theme.colors.gray[600],
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    Date: {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p
                    style={{
                      color: theme.colors.gray[600],
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    Order By:{" "}
                    {order.orderBy === "employee"
                      ? order.employeeName || "Unknown Employee"
                      : "Customer"}
                  </p>
                  {order.phoneNumber && (
                    <p
                      style={{
                        color: theme.colors.gray[600],
                        marginBottom: theme.spacing.xs,
                      }}
                    >
                      Phone: {order.phoneNumber}
                    </p>
                  )}
                  {order.tableToken && (
                    <p
                      style={{
                        color: theme.colors.gray[600],
                        marginBottom: theme.spacing.xs,
                      }}
                    >
                      Table: {order.tableToken}
                    </p>
                  )}
                  {!order.phoneNumber && !order.tableToken && (
                    <p
                      style={{
                        color: theme.colors.warning,
                        marginBottom: theme.spacing.xs,
                      }}
                    >
                      ⚠️ No contact information
                    </p>
                  )}
                </div>
                <div
                  style={{
                    fontSize: theme.fontSizes.lg,
                    fontWeight: "bold",
                    color: theme.colors.primary,
                  }}
                >
                  ${order.totalAmount.toFixed(2)}
                </div>
              </div>

              <div style={{ marginTop: theme.spacing.md }}>
                <h4 style={{ marginBottom: theme.spacing.sm }}>Items:</h4>
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: theme.spacing.sm,
                      backgroundColor: theme.colors.gray[100],
                      borderRadius: theme.borderRadius.sm,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: "bold" }}>{item.name}</span>
                      <span
                        style={{
                          color: theme.colors.gray[600],
                          marginLeft: theme.spacing.sm,
                        }}
                      >
                        x{item.quantity}
                      </span>
                    </div>
                    <div>${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders; 