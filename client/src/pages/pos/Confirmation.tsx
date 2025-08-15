import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import theme from "../../styles/theme";
import api from "../../services/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

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
  status: string;
  createdAt: string;
  phoneNumber?: string;
  tableToken?: number;
  orderBy: string;
  employeeName?: string;
  payChoice?: string;
}

const Confirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
     if (order?.orderBy === "customer") {
       navigate("/");
     } else {
       navigate("/sales");
     }
  };

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      const response = await api.get<ApiResponse<Order>>(`/orders/${orderId}`);

      if (response.data.success && response.data.data) {
        setOrder(response.data.data);
      } else {
        setError("Failed to fetch order details");
        toast.error("Failed to fetch order details");
      }
    } catch (err) {
      setError("Failed to fetch order details");
      toast.error("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);
  useEffect(() => {
    document.body.style.backgroundColor = "#fbfbf8";
    document.body.style.fontFamily = "Montserrat, sans-serif";

    return () => {
      document.body.style.backgroundColor = "#fbfbf8";
      document.body.style.fontFamily = "Montserrat, sans-serif";
    };
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: theme.spacing.xl }}>
        Loading order details...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ textAlign: "center", padding: theme.spacing.xl }}>
        <p style={{ color: theme.colors.danger }}>
          {error || "Order not found"}
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: theme.spacing.sm,
            backgroundColor: theme.colors.primary,
            color: theme.colors.white,
            border: "none",
            borderRadius: theme.borderRadius.md,
            cursor: "pointer",
            marginTop: theme.spacing.md,
          }}
        >
          Return
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: theme.spacing.xl,
        textAlign: "center",
      }}
    >
      <h1 style={{ marginBottom: theme.spacing.xl }}>Order Confirmation</h1>

      <div
        style={{
          backgroundColor: theme.colors.white,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.shadows.md,
        }}
      >
        <div
          style={{
            backgroundColor:
              order.orderBy === "employee" ? theme.colors.primary : "#ffcb3e",
            color: order.orderBy === "employee" ? theme.colors.white : "black",

            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.md,
            marginBottom: theme.spacing.lg,
            textAlign: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "2rem" }}>
            Order #{order.orderNumber}
          </h2>
          <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9 }}>
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div style={{ marginBottom: theme.spacing.lg }}>
          <h3
            style={{
              color: order.orderBy === "employee" ? "black" : "#ffcb3e",
              textAlign: "center",
            }}
          >
            Thanks For Ordering!
          </h3>
          <h3
            style={{
              color: order.orderBy === "employee" ? "black" : "#ffcb3e",
            }}
          >
            Information
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing.sm,
            }}
          >
            {order.phoneNumber && (
              <div
                style={{
                  padding: theme.spacing.sm,
                  backgroundColor: theme.colors.gray[100],
                  borderRadius: theme.borderRadius.sm,
                }}
              >
                <strong>Phone Number:</strong> {order.phoneNumber}
              </div>
            )}

            {order.tableToken && (
              <div
                style={{
                  padding: theme.spacing.sm,
                  backgroundColor: theme.colors.gray[100],
                  borderRadius: theme.borderRadius.sm,
                  textAlign: "left",
                }}
              >
                <strong>Table Token:</strong> {order.tableToken}
                <p
                  style={{
                    textAlign: "left",
                  }}
                >
                  <strong>Order By: </strong>
                  {order.orderBy === "employee"
                    ? order.employeeName || "Unknown Employee"
                    : "Customer"}
                 
                  {order.payChoice && (
                    <>
                      <br />
                      <strong>Payment mode: </strong> {order.payChoice}
                    </>
                  )}
                </p>
              </div>
            )}

            {!order.phoneNumber && !order.tableToken && (
              <div
                style={{
                  padding: theme.spacing.sm,
                  backgroundColor: theme.colors.warning,
                  color: theme.colors.white,
                  borderRadius: theme.borderRadius.sm,
                }}
              >
                <strong>Note:</strong> No contact information provided
              </div>
            )}
          </div>
        </div>

        <h2
          style={{
            marginTop: theme.spacing.xl,
            marginBottom: theme.spacing.md,
            textAlign: "left",
          }}
        >
          Order Items
        </h2>
        <div style={{ marginBottom: theme.spacing.xl }}>
          {order.items.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: theme.spacing.sm,
                borderBottom: `1px solid ${theme.colors.gray[200]}`,
              }}
            >
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: theme.spacing.md,
            borderTop: `2px solid ${theme.colors.gray[200]}`,
            marginTop: theme.spacing.md,
            fontSize: "1.2rem",
            fontWeight: "bold",
          }}
        >
          <span>Total:</span>
          <span>${order.totalAmount.toFixed(2)}</span>
        </div>

        <button
          onClick={handleClick}
          style={{
            width: "100%",
            padding: theme.spacing.md,
            backgroundColor:
              order.orderBy === "employee" ? theme.colors.primary : "#ffcb3e",
            color: order.orderBy === "employee" ? theme.colors.white : "black",
            border: "none",
            borderRadius: theme.borderRadius.md,
            cursor: "pointer",
            marginTop: theme.spacing.xl,
          }}
        >
          Place Another Order
        </button>
      </div>
    </div>
  );
};

export default Confirmation;
