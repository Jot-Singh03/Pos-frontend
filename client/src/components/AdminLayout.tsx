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
    { path: "/admin/discount", label: "Level Management" },
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
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.gray[100];
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
                style={{
                  display: "block",
                  padding: theme.spacing.sm,
                  marginBottom: theme.spacing.sm,
                  color: isActive
                    ? theme.colors.primary
                    : theme.colors.gray[600],
                  textDecoration: "none",
                  borderRadius: theme.borderRadius.md,
                  backgroundColor: isActive
                    ? theme.colors.gray[100]
                    : "transparent",
                  transition: "all 0.2s ease-in-out", // smooth effect
                  cursor: "pointer",
                }}
              >
                {item.label}
              </Link>
            );
          })}
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
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "	#334155";
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.secondary;
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
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
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#d97706"; // Darker warning color
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.warning;
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
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
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#b91c1c"; // Darker red
            e.currentTarget.style.transform = "scale(1.03)";
            e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.danger;
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
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
