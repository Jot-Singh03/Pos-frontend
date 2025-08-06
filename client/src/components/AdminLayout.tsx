import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import theme from "../styles/theme";
import { clearAuthData, debugAuth, logout } from "../utils/auth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const handleDebugAuth = () => {
    debugAuth();
  };

  const handleClearAuth = () => {
    clearAuthData();
    navigate("/admin/login");
  };

  const navItems = [
    { path: "/admin", label: "Dashboard" },
    { path: "/admin/menu", label: "Menu Management" },
    { path: "/admin/orders", label: "Orders" },
    { path: "/admin/loyalty", label: "Loyalty Points" },
    { path: "/admin/manage", label: "Manage Employees" },
    { path: "/admin/register", label: "Employee Registration" },
    { path: "/admin/discount", label: "Discount Management" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          backgroundColor: theme.colors.white,
          padding: theme.spacing.lg,
          boxShadow: theme.shadows.md,
          display: "flex",
          flexDirection: "column",
          zIndex: 1000,
        }}
      >
        <h2 style={{ marginBottom: theme.spacing.xl }}>Admin Panel</h2>

        {/* Debug info - remove this after testing */}
        <div
          style={{
            fontSize: "12px",
            color: theme.colors.gray[600],
            marginBottom: theme.spacing.md,
            padding: theme.spacing.sm,
            backgroundColor: theme.colors.gray[100],
            borderRadius: theme.borderRadius.sm,
          }}
        >
          Token: {localStorage.getItem("token") ? "✅ Present" : "❌ Missing"}
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "block",
                padding: theme.spacing.sm,
                marginBottom: theme.spacing.sm,
                color:
                  location.pathname === item.path
                    ? theme.colors.primary
                    : theme.colors.gray[600],
                textDecoration: "none",
                borderRadius: theme.borderRadius.md,
                backgroundColor:
                  location.pathname === item.path
                    ? theme.colors.gray[100]
                    : "transparent",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Debug buttons - remove these after testing */}
        <div style={{ marginBottom: theme.spacing.md }}>
          <button
            onClick={handleDebugAuth}
            style={{
              width: "100%",
              padding: theme.spacing.sm,
              backgroundColor: theme.colors.secondary,
              color: theme.colors.white,
              border: "none",
              borderRadius: theme.borderRadius.md,
              cursor: "pointer",
              marginBottom: theme.spacing.xs,
              fontSize: "12px",
            }}
          >
            Debug Auth
          </button>
          <button
            onClick={handleClearAuth}
            style={{
              width: "100%",
              padding: theme.spacing.sm,
              backgroundColor: theme.colors.warning,
              color: theme.colors.white,
              border: "none",
              borderRadius: theme.borderRadius.md,
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Clear Token
          </button>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: theme.spacing.sm,
            backgroundColor: theme.colors.danger,
            color: theme.colors.white,
            border: "none",
            borderRadius: theme.borderRadius.md,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          marginLeft: "250px", // Adjust for sidebar width
          overflowY: "auto",
          height: "100vh", // Ensure content fills the viewport height
          padding: theme.spacing.xl,
          backgroundColor: theme.colors.background,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
