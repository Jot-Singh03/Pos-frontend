import React, { useState, useEffect } from "react";
import theme from "../../styles/theme";
import api, { ApiResponse } from "../../services/api";

interface LoyaltyCustomer {
  _id: string;
  phoneNumber: string; // Updated to string for phone number
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

  const handleAddPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    const pointsValue = parseFloat(points);
    if (isNaN(pointsValue) || pointsValue <= 0) {
      setError("Please enter a valid positive decimal number of points.");
      return;
    }

    try {
      setError(null);
      await api.post<ApiResponse<LoyaltyCustomer>>(`/loyalty/add`, {
        phoneNumber: editingCustomer.phoneNumber,
        points: pointsValue,
      });

      fetchCustomers();
      setEditingCustomer(null);
      setPoints(""); // Clear points input after successful update
    } catch (error) {
      setError("Failed to update points. Please try again.");
    }
  };

  const handleRemovePoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    const pointsValue = parseFloat(points);
    if (isNaN(pointsValue) || pointsValue <= 0) {
      setError("Please enter a valid positive decimal number of points.");
      return;
    }

    try {
      setError(null);
      await api.post<ApiResponse<LoyaltyCustomer>>(`/loyalty/remove`, {
        phoneNumber: editingCustomer.phoneNumber,
        points: pointsValue,
      });

      fetchCustomers();
      setEditingCustomer(null);
      setPoints(""); // Clear points input after successful update
    } catch (error) {
      setError("Failed to update points. Please try again.");
    }
  };

  const handleDeleteCustomer = async (phoneNumber: string) => {
    try {
      setError(null);
      await api.delete(`/loyalty/${phoneNumber}`);
      fetchCustomers(); // Refresh the list after deletion
    } catch (error) {
      setError("Failed to delete customer. Please try again.");
    }
  };

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
        <h1>Loyalty Points</h1>
        <button
          onClick={() => {
            fetchCustomers();
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
          Refresh points
        </button>
      </div>

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
          <h4 style={{ marginBottom: theme.spacing.lg }}>
            Update Points for {editingCustomer.phoneNumber}
          </h4>

          <form>
            <div style={{ marginBottom: theme.spacing.md }}>
              <label
                style={{ display: "block", marginBottom: theme.spacing.xs }}
              >
                Points to be updated
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
                step="0.01" // Allow decimals
              />
            </div>

            <div style={{ display: "flex", gap: theme.spacing.md }}>
              <button
                type="button"
                onClick={handleAddPoints}
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
                onClick={handleRemovePoints}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                  backgroundColor: theme.colors.danger,
                  color: theme.colors.white,
                  border: "none",
                  borderRadius: theme.borderRadius.md,
                  cursor: "pointer",
                }}
              >
                Remove Points
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
          padding: "-1rem",
          borderRadius: theme.borderRadius.lg,
        }}
      >
        <h4>Loyalty Customers</h4>
        <div style={{ display: "grid", gap: theme.spacing.md }}>
          {customers.map((customer) => (
            <div
              key={customer._id}
              style={{
                border: `1px solid ${theme.colors.gray[200]}`,
                borderRadius: theme.borderRadius.md,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: theme.spacing.lg,
              }}
            >
              <div>
                <h5 style={{ marginBottom: theme.spacing.xs }}>
                  {customer.phoneNumber}
                </h5>
                <p style={{ color: theme.colors.gray[600] }}>
                  Points: {customer.points}
                </p>
              </div>

              <div style={{ display: "flex", gap: theme.spacing.sm }}>
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

                <button
                  onClick={() => handleDeleteCustomer(customer.phoneNumber)}
                  style={{
                    padding: theme.spacing.sm,
                    backgroundColor: theme.colors.danger,
                    color: theme.colors.white,
                    border: "none",
                    borderRadius: theme.borderRadius.md,
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoyaltyPoints;
