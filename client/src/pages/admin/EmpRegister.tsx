import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import theme from "../../styles/theme";
import api, { ApiResponse } from "../../services/api";

interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
  };
}

const EmpRegister: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await api.post<RegisterResponse>(
        "/new/register",
        { email, password },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send JWT token as Bearer token
          },
        }
      );
      if (data.success) {
        toast.success("Registration successful!");
        // Optionally, navigate to the login page or dashboard
        // navigate("/login");
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 400) {
          toast.error(error.response.data?.error || "Invalid request");
        } else {
          toast.error("Registration failed. Please try again.");
        }
      } else if (error.request) {
        // Network error
        toast.error("Network error. Please check your connection.");
      } else {
        // Other error
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.gray[100],
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: theme.spacing.xl,
          backgroundColor: theme.colors.white,
          borderRadius: theme.borderRadius.lg,
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: theme.spacing.xl,
            color: theme.colors.primary,
          }}
        >
          Employee Registration
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: theme.spacing.lg }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: theme.spacing.xs,
                color: theme.colors.gray[700],
              }}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: theme.spacing.md,
                border: `1px solid ${theme.colors.gray[300]}`,
                borderRadius: theme.borderRadius.md,
                fontSize: theme.fontSizes.base,
              }}
            />
          </div>

          <div style={{ marginBottom: theme.spacing.xl }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: theme.spacing.xs,
                color: theme.colors.gray[700],
              }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: theme.spacing.md,
                border: `1px solid ${theme.colors.gray[300]}`,
                borderRadius: theme.borderRadius.md,
                fontSize: theme.fontSizes.base,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: theme.spacing.md,
              backgroundColor: theme.colors.primary,
              color: theme.colors.white,
              border: "none",
              borderRadius: theme.borderRadius.md,
              fontSize: theme.fontSizes.lg,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "all 0.1s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background =
                theme.colors.primaryDark || "#0055aa";
              e.currentTarget.style.boxShadow = "0 0 12px rgba(0,123,255,0.3)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = theme.colors.primary;
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmpRegister;
