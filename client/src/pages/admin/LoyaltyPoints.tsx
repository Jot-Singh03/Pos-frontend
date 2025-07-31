import React, { useState, useEffect } from "react";
import theme from "../../styles/theme";
import api, { ApiResponse } from "../../services/api";

interface LoyaltyCustomer {
  _id: string;
  customerId: string;
  points: number;
}

const LoyaltyPoints: React.FC = () => {
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>([]);
  const [editingCustomer, setEditingCustomer] =
    useState<LoyaltyCustomer | null>(null);
  const [points, setPoints] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<LoyaltyCustomer[]>>(
        "/loyalty"
      );
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (error) {
      setError("Failed to load loyalty customers. Please try again.");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    try {
      setError(null);
      await api.post<ApiResponse<LoyaltyCustomer>>(`/loyalty/add`,
        {
        customerId: editingCustomer.customerId,
        points: parseInt(points),
        }
      );

      fetchCustomers();
      setEditingCustomer(null);
      setPoints("");
    } catch (error) {
      setError("Failed to update points. Please try again.");
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: theme.spacing.xl }}>Loyalty Points</h1>

      {/* Update Points Form */}
      {editingCustomer && (
        <div
          style={{
            backgroundColor: theme.colors.white,
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.lg,
            marginBottom: theme.spacing.xl,
          }}
        >
          <h2 style={{ marginBottom: theme.spacing.lg }}>
            Update Points for {editingCustomer.customerId}
          </h2>

          <form onSubmit={handleUpdatePoints}>
            <div style={{ marginBottom: theme.spacing.md }}>
              <label
                style={{ display: "block", marginBottom: theme.spacing.xs }}
              >
                Points to be added
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                style={{
                  width: "100%",
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.gray[300]}`,
                }}
                required
              />
            </div>

            <div style={{ display: "flex", gap: theme.spacing.md }}>
              <button
                type="submit"
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.white,
                  border: "none",
                  borderRadius: theme.borderRadius.md,
                  cursor: "pointer",
                }}
              >
                Add Points
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingCustomer(null);
                  setPoints("");
                }}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                  backgroundColor: theme.colors.gray[300],
                  color: theme.colors.gray[700],
                  border: "none",
                  borderRadius: theme.borderRadius.md,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customers List */}
      <div
        style={{
          backgroundColor: theme.colors.white,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.lg,
        }}
      >
        <h2 style={{ marginBottom: theme.spacing.lg }}>Loyalty Customers</h2>
        <div style={{ display: "grid", gap: theme.spacing.md }}>
          {customers.map((customer) => (
            <div
              key={customer._id}
              style={{
                padding: theme.spacing.lg,
                border: `1px solid ${theme.colors.gray[200]}`,
                borderRadius: theme.borderRadius.md,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ marginBottom: theme.spacing.xs }}>
                  {customer.customerId}
                </h3>
                <p style={{ color: theme.colors.gray[600] }}>
                  Points: {customer.points}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingCustomer(customer);
                  setPoints(" ");
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
                Update Points
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoyaltyPoints;
