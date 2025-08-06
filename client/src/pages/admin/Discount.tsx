import React, { useState, useEffect } from "react";
import theme from "../../styles/theme";
import api, { ApiResponse } from "../../services/api";

interface Discount {
  _id: string;
  name: string;
  minPoints: number;
  maxPoints: number;
  discount: number;
  color: string;
}

const DiscountList: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [formValues, setFormValues] = useState({
    name: "",
    minPoints: "",
    maxPoints: "",
    discount: "",
    color: "",
  });
  const [isAddFormVisible, setIsAddFormVisible] = useState<boolean>(false);

  // Fetch all discounts
  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<Discount[]>>("/discounts");
      if (response.data && Array.isArray(response.data)) {
        setDiscounts(response.data); // Directly set the discounts array
      } else {
        setError("Failed to fetch discounts.");
      }
    } catch (err) {
      setError("Failed to load discounts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  //Editing Data
  const handleEditClick = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormValues({
      name: discount.name,
      minPoints: discount.minPoints.toString(),
      maxPoints: discount.maxPoints.toString(),
      discount: discount.discount.toString(),
      color: discount.color,
    });
  };
  const handleCancelEdit = () => {
    setEditingDiscount(null);
    setFormValues({
      name: "",
      minPoints: "",
      maxPoints: "",
      discount: "",
      color: "",
    });
  };

  // Handle deleting a discount
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this Level?"
    );
    if (confirmDelete) {
      try {
        await api.delete(`/discounts/${id}`);
        // Refresh the discount list after deletion
        fetchDiscounts();
      } catch (error) {
        setError("Failed to delete discount. Please try again.");
      }
    }
  };

  // Handle the input field change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle the update form submission
  const handleUpdateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formValues.name ||
      !formValues.minPoints ||
      !formValues.maxPoints ||
      !formValues.discount ||
      !formValues.color
    ) {
      setError("Please fill in all fields.");
      return;
    }

    const updatedDiscount = {
      ...formValues,
      minPoints: parseInt(formValues.minPoints, 10),
      maxPoints: parseInt(formValues.maxPoints, 10),
      discount: parseFloat(formValues.discount),
    };

    try {
      setError(null);
      await api.put<ApiResponse<Discount>>(
        `/discounts/${editingDiscount?._id}`,
        updatedDiscount
      );
      fetchDiscounts(); // Reload discounts
      setEditingDiscount(null); // Hide the form after saving
      setFormValues({
        name: "",
        minPoints: "",
        maxPoints: "",
        discount: "",
        color: "",
      }); // Reset form
    } catch (error) {
      setError("Failed to update discount. Please try again.");
    }
  };

  // Handle adding new discount form submission
  const handleAddDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formValues.name ||
      !formValues.minPoints ||
      !formValues.maxPoints ||
      !formValues.discount ||
      !formValues.color
    ) {
      setError("Please fill in all fields.");
      return;
    }

    const newDiscount = {
      ...formValues,
      minPoints: parseInt(formValues.minPoints, 10),
      maxPoints: parseInt(formValues.maxPoints, 10),
      discount: parseFloat(formValues.discount),
    };

    try {
      setError(null);
      await api.post<ApiResponse<Discount>>("/discounts", newDiscount);
      fetchDiscounts(); // Reload discounts after adding
      setIsAddFormVisible(false); // Hide the form after adding
      setFormValues({
        name: "",
        minPoints: "",
        maxPoints: "",
        discount: "",
        color: "#ffffff",
      }); // Reset form
    } catch (error) {
      setError("Failed to add new discount. Please try again.");
    }
  };

  // Toggle Add Form visibility
  const handleAddNewClick = () => {
    setIsAddFormVisible(true);
    setFormValues({
      name: "",
      minPoints: "",
      maxPoints: "",
      discount: "",
      color: "",
    });
  };

  // Handle canceling the Add form
  const handleCancelAdd = () => {
    setIsAddFormVisible(false);
    setFormValues({
      name: "",
      minPoints: "",
      maxPoints: "",
      discount: "",
      color: "",
    });
  };

  if (loading) {
    return (
      <div style={{ padding: theme.spacing.xl, textAlign: "center" }}>
        Loading discounts...
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: theme.spacing.xl,
          alignItems: "center",
        }}
      >
        <h1>Level Management </h1>
        <div style={{ display: "flex", gap: 15 }}>
          <button
            onClick={handleAddNewClick}
            style={{
              padding: theme.spacing.sm,
              backgroundColor: theme.colors.primary,
              color: theme.colors.white,
              border: "none",
              borderRadius: theme.borderRadius.md,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            aria-label="Add New Level"
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
            Add New Level
          </button>

          <button
            onClick={fetchDiscounts}
            style={{
              padding: theme.spacing.sm,
              backgroundColor: theme.colors.primary,
              color: theme.colors.white,
              border: "none",
              borderRadius: theme.borderRadius.md,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            aria-label="Refresh"
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
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: theme.colors.danger,
            color: theme.colors.white,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            marginBottom: theme.spacing.lg,
          }}
        >
          {error}
        </div>
      )}

      {/* Edit Discount Form */}
      {editingDiscount && (
        <div
          style={{
            backgroundColor: theme.colors.white,
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.lg,
            marginBottom: theme.spacing.xl,
          }}
        >
          <h4>Edit Level</h4>
          <form onSubmit={handleUpdateDiscount}>
            <div style={{ marginBottom: theme.spacing.md }}>
              <label
                style={{ display: "block", marginBottom: theme.spacing.xs }}
              >
                Level Name
              </label>
              <input
                type="text"
                name="name"
                value={formValues.name}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.gray[300]}`,
                }}
                required
              />
            </div>
            <div style={{ marginBottom: theme.spacing.md }}>
              <label
                style={{ display: "block", marginBottom: theme.spacing.xs }}
              >
                Min Points
              </label>
              <input
                type="number"
                name="minPoints"
                value={formValues.minPoints}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.gray[300]}`,
                }}
                required
              />
            </div>
            <div style={{ marginBottom: theme.spacing.md }}>
              <label
                style={{ display: "block", marginBottom: theme.spacing.xs }}
              >
                Max Points
              </label>
              <input
                type="number"
                name="maxPoints"
                value={formValues.maxPoints}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.gray[300]}`,
                }}
                required
              />
            </div>
            <div style={{ marginBottom: theme.spacing.md }}>
              <label
                style={{ display: "block", marginBottom: theme.spacing.xs }}
              >
                Discount Percentage
              </label>
              <input
                type="number"
                name="discount"
                value={formValues.discount}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.gray[300]}`,
                }}
                required
              />
            </div>
            <div style={{ marginBottom: theme.spacing.md }}>
              <label
                style={{ display: "block", marginBottom: theme.spacing.xs }}
              >
                Color
              </label>
              <input
                type="color"
                name="color"
                value={formValues.color}
                onChange={handleChange}
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
                  transition: "all 0.3s ease",
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
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                  backgroundColor: theme.colors.gray[300],
                  color: theme.colors.gray[700],
                  border: "none",
                  borderRadius: theme.borderRadius.md,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
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
        </div>
      )}

      {/* Add New Discount Form */}
      {isAddFormVisible && (
        <div
          style={{
            backgroundColor: theme.colors.white,
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.lg,
            marginBottom: theme.spacing.xl,
          }}
        >
          <h4>Add New Level</h4>
          <form onSubmit={handleAddDiscount}>
            <div style={{ marginBottom: theme.spacing.md }}>
              <label
                style={{ display: "block", marginBottom: theme.spacing.xs }}
              >
                Level Name
              </label>
              <input
                type="text"
                name="name"
                value={formValues.name}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.gray[300]}`,
                }}
                required
              />
            </div>
            <div style={{ marginBottom: theme.spacing.md }}>
              <label
                style={{ display: "block", marginBottom: theme.spacing.xs }}
              >
                Min Points
              </label>
              <input
                type="number"
                name="minPoints"
                value={formValues.minPoints}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.gray[300]}`,
                }}
                required
              />
            </div>
            <div style={{ marginBottom: theme.spacing.md }}>
              <label
                style={{ display: "block", marginBottom: theme.spacing.xs }}
              >
                Max Points
              </label>
              <input
                type="number"
                name="maxPoints"
                value={formValues.maxPoints}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.gray[300]}`,
                }}
                required
              />
            </div>
            <div style={{ marginBottom: theme.spacing.md }}>
              <label
                style={{ display: "block", marginBottom: theme.spacing.xs }}
              >
                Discount Percentage
              </label>
              <input
                type="number"
                name="discount"
                value={formValues.discount}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.gray[300]}`,
                }}
                required
              />
            </div>
            <div style={{ marginBottom: theme.spacing.md }}>
              <label
                style={{ display: "block", marginBottom: theme.spacing.xs }}
              >
                Color
              </label>
              <input
                type="color"
                name="color"
                value={formValues.color}
                onChange={handleChange}
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
                  transition: "all 0.3s ease",
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
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                Add Level
              </button>

              <button
                type="button"
                onClick={handleCancelAdd}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                  backgroundColor: theme.colors.gray[300],
                  color: theme.colors.gray[700],
                  border: "none",
                  borderRadius: theme.borderRadius.md,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
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
        </div>
      )}

      {/* List of Discounts */}
      <div
        style={{
          backgroundColor: theme.colors.white,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.lg,
        }}
      >
        <h2 style={{ marginBottom: theme.spacing.lg }}>All Levels</h2>
        {discounts.length === 0 ? (
          <p style={{ color: theme.colors.gray[600] }}>No discounts found.</p>
        ) : (
          <div style={{ display: "grid", gap: theme.spacing.md }}>
            {discounts.map((discount) => (
              <div
                key={discount._id}
                style={{
                  padding: theme.spacing.md,
                  border: `1px solid ${theme.colors.gray[200]}`,
                  borderRadius: theme.borderRadius.md,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h5 style={{ marginBottom: theme.spacing.xs }}>
                    {discount.name}
                  </h5>
                  <p style={{ color: theme.colors.gray[600] }}>
                    {discount.minPoints} - {discount.maxPoints} Points -{" "}
                    {discount.discount}% Discount
                  </p>
                  <p style={{ color: theme.colors.gray[600] }}>
                    Color:{" "}
                    <span style={{ color: discount.color }}>
                      {discount.color}
                    </span>
                  </p>
                </div>
                <div style={{ display: "flex", gap: theme.spacing.sm }}>
                  <button
                    onClick={() => handleEditClick(discount)}
                    style={{
                      padding: theme.spacing.sm,
                      backgroundColor: theme.colors.primary,
                      color: theme.colors.white,
                      border: "none",
                      borderRadius: theme.borderRadius.md,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
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
                    onClick={() => handleDelete(discount._id)}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountList;
