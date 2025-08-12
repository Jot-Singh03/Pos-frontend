import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import "../../styles/confirmation.css"; // Import new CSS

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
}

const Confirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    navigate(-1);
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
    } catch {
      setError("Failed to fetch order details");
      toast.error("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return <div className="confirmation-loading">Loading order details...</div>;
  }

  if (error || !order) {
    return (
      <div className="confirmation-error">
        <p>{error || "Order not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="confirmation-return-btn"
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


          <h3 className="confirmation-info-title">Thanks For Ordering!</h3>
          <h3 className="confirmation-info-title">Customer Information</h3>

          {order.phoneNumber && (
            <div className="confirmation-info-box">
              <strong>Phone Number:</strong> {order.phoneNumber}
            </div>
          )}

          {order.tableToken && (
            <div className="confirmation-info-box">
              <strong>Table Token:</strong> {order.tableToken}
              <p>
                <strong>Order By:</strong>{" "}
                {order.orderBy === "employee"
                  ? order.employeeName || "Unknown Employee"
                  : "Customer"}
              </p>
            </div>
          )}

          {!order.phoneNumber && !order.tableToken && (
            <div className="confirmation-warning">
              <strong>Note:</strong> No contact information provided
            </div>
          )}

          <h2>Order Items</h2>
          <div className="confirmation-items">
            {order.items.map((item, index) => (
              <div key={index} className="confirmation-item">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="confirmation-total">
            <span>Total:</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Fixed button at bottom */}
        <div className="confirmation-footer">
          <button onClick={handleClick} className="confirmation-btn">
            Place Another Order
          </button>
        </div>
      </div>
    </div>
  );
};
export default Confirmation;
