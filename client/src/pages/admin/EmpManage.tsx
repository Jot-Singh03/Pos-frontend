import React, { useState, useEffect } from "react";
import theme from "../../styles/theme";
import api, { ApiResponse } from "../../services/api";

interface Employee {
  _id: string;
  email: string;
  role: string;
  createdAt: string;
}

const EmpManage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [editEmployeeId, setEditEmployeeId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<Employee[]>>("/new");
      if (response.data.success) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      setError("Failed to load employees. Please try again.");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (email: string) => {
    try {
      setError(null);
      await api.delete(`/new/${email}`);
      fetchEmployees();
    } catch (error) {
      setError("Failed to delete employee. Please try again.");
    }
  };

  const handleEditClick = (employee: Employee) => {
    setEditEmployeeId(employee._id);
    setEditEmail(employee.email);
    setEditPassword(""); // keep password empty initially
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: { email: string; password?: string } = {
        email: editEmail,
      };
      if (editPassword.trim() !== "") {
        payload.password = editPassword;
      }

      await api.put(`/new/${editEmployeeId}`, payload);

      setEditEmployeeId(null);
      setEditEmail("");
      setEditPassword("");
      fetchEmployees();
    } catch (error) {
      setError("Failed to update employee. Please try again.");
    }
  };

  return (
    <div>
      <h1>Employee Management</h1>

      {error && (
        <div style={{ color: "red", marginBottom: theme.spacing.lg }}>
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
        <h4 style={{ marginBottom: theme.spacing.lg }}>Employees</h4>
        <div style={{ display: "grid", gap: theme.spacing.md }}>
          {employees.map((employee) => (
            <div
              key={employee._id}
              style={{
                border: `1px solid ${theme.colors.gray[200]}`,
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.md,
              }}
            >
              {/* Always visible details */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h5>{employee.email}</h5>
                  <p>Role: {employee.role}</p>
                  <p>
                    Created At: {new Date(employee.createdAt).toLocaleString()}
                  </p>
                </div>

                <div style={{ display: "flex", gap: theme.spacing.md }}>
                  <button
                    onClick={() => handleEditClick(employee)}
                    style={{
                      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                      backgroundColor: theme.colors.primary,
                      color: theme.colors.white,
                      border: "none",
                      borderRadius: theme.borderRadius.md,
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: theme.fontSizes.base,
                      transition: "all 0.1s ease",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background =
                        theme.colors.primaryDark || "#0055aa";
                      e.currentTarget.style.boxShadow =
                        "0 0 12px rgba(0,123,255,0.3)";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = theme.colors.primary;
                      e.currentTarget.style.boxShadow =
                        "0 2px 6px rgba(0,0,0,0.1)";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(employee.email)}
                    style={{
                      padding: theme.spacing.sm,
                      backgroundColor: theme.colors.danger,
                      color: theme.colors.white,
                      border: "none",
                      borderRadius: theme.borderRadius.md,
                      cursor: "pointer",
                      transition: "all 0.1s ease",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#b91c1c"; // Darker red
                      e.currentTarget.style.transform = "scale(1.03)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 10px rgba(0,0,0,0.1)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor =
                        theme.colors.danger;
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Edit form appears below when selected */}
              {editEmployeeId === employee._id && (
                <form
                  onSubmit={handleUpdateEmployee}
                  style={{
                    marginTop: theme.spacing.md,
                    paddingTop: theme.spacing.md,
                    borderTop: `1px solid ${theme.colors.gray[200]}`,
                  }}
                >
                  <div style={{ marginBottom: theme.spacing.sm }}>
                    <label>Email:</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      required
                      style={{
                        padding: theme.spacing.sm,
                        borderRadius: theme.borderRadius.md,
                        border: `1px solid ${theme.colors.gray[300]}`,
                        width: "100%",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: theme.spacing.sm }}>
                    <label>Password:</label>
                    <input
                      type="password"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      style={{
                        padding: theme.spacing.sm,
                        borderRadius: theme.borderRadius.md,
                        border: `1px solid ${theme.colors.gray[300]}`,
                        width: "100%",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: theme.spacing.md }}>
                    <button
                      type="submit"
                      onClick={() => handleEditClick(employee)}
                      style={{
                        padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                        backgroundColor: theme.colors.primary,
                        color: theme.colors.white,
                        border: "none",
                        borderRadius: theme.borderRadius.md,
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: theme.fontSizes.base,
                        transition: "all 0.1s ease",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background =
                          theme.colors.primaryDark || "#0055aa";
                        e.currentTarget.style.boxShadow =
                          "0 0 12px rgba(0,123,255,0.3)";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = theme.colors.primary;
                        e.currentTarget.style.boxShadow =
                          "0 2px 6px rgba(0,0,0,0.1)";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditEmployeeId(null)}
                      style={{
                        padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                        backgroundColor: theme.colors.gray[300],
                        color: theme.colors.gray[700],
                        border: "none",
                        borderRadius: theme.borderRadius.md,
                        cursor: "pointer",
                        transition: "all 0.1s ease",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = "#334155";

                        e.currentTarget.style.boxShadow =
                          "0 0 12px rgba(51, 65, 85, 0.4)";

                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.color = "#ffffff";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor =
                          theme.colors.gray[300];
                        e.currentTarget.style.boxShadow =
                          "0 2px 6px rgba(0, 0, 0, 0.1)";
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.color = theme.colors.gray[700];
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmpManage;
