import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import theme from "../styles/theme";
import api, { ApiResponse } from "../services/api";

interface LoginResponse {
  success: boolean;
  token: string;
  data: {
    id: string;
    email: string;
  };
}

const Emplogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await api.post<LoginResponse>("/new/emplogin", {
        email,
        password,
      });

      if (data.success) {
        localStorage.setItem("token", data.token);

        const username = email.split("@")[0];
        localStorage.setItem("employeeUsername", username);

        toast.success("Login successful!");
        navigate("/Sales");
      } else {
        toast.error("Login failed");
      }
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          toast.error("Invalid email or password");
        } else if (error.response.status === 400) {
          toast.error(error.response.data?.error || "Invalid request");
        } else {
          toast.error("Login failed. Please try again.");
        }
      } else if (error.request) {
        // Network error
        toast.error("Network error. Please check your connection.");
      } else {
        // Other error
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
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
          Employee Login
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
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Emplogin;
