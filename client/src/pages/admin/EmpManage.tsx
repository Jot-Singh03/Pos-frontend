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

  // Fetch all employees
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

  // Handle delete employee by email
  const handleDeleteEmployee = async (email: string) => {
    try {
      setError(null);
      await api.delete(`/new/${email}`);
      fetchEmployees(); // Refresh the list after deletion
    } catch (error) {
      setError("Failed to delete employee. Please try again.");
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

      {/* Employee List */}
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: theme.spacing.md,
              }}
            >
              <div>
                <h5 style={{ marginBottom: theme.spacing.xs }}>
                  {employee.email}
                </h5>
                <p style={{ color: theme.colors.gray[600] }}>
                  Role: {employee.role}
                </p>
                <p style={{ color: theme.colors.gray[600] }}>
                  Created At: {new Date(employee.createdAt).toLocaleString()}
                </p>
              </div>

              <div style={{ display: "flex", gap: theme.spacing.md }}>
                <button
                  onClick={() => handleDeleteEmployee(employee.email)}
                  style={{
                    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                    backgroundColor: theme.colors.danger, // Red background
                    color: theme.colors.white,
                    border: "none",
                    borderRadius: theme.borderRadius.md,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#b91c1c"; // Darker red
                    e.currentTarget.style.transform = "scale(1.03)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 10px rgba(0,0,0,0.1)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.danger;
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
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

export default EmpManage;
