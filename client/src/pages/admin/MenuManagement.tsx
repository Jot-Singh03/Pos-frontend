import React, { useState, useEffect } from "react";
import theme from "../../styles/theme";
import api, { ApiResponse } from "../../services/api";
import { getCategories } from "../../services/api";
import { useNavigate } from "react-router-dom";

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  tags?: string[];
}

interface Category {
  _id: string;
  name: string;
}

const MenuManagement: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    imageUrl: "",
    tags: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<ApiResponse<MenuItem[]>>("/menu");

      if (response.data.success && Array.isArray(response.data.data)) {
        setMenuItems(response.data.data);
      } else {
        setMenuItems([]);
        setError("Invalid data format received from server");
      }
    } catch (error) {
      setError("Failed to load menu items. Please try again.");
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data.data);
    } catch (err) {
      setCategories([]);
    } finally {
      setCatLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    const itemData = {
      ...formData,
      price: parseFloat(formData.price),
      tags: tagsArray.length > 0 ? tagsArray : undefined,
    };

    try {
      setError(null);
      if (editingItem) {
        await api.put<ApiResponse<MenuItem>>(
          `/menu/${editingItem._id}`,
          itemData
        );
      } else {
        await api.post<ApiResponse<MenuItem>>("/menu", itemData);
      }

      await fetchMenuItems();
      resetForm();
    } catch (error) {
      setError("Failed to save menu item. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        setError(null);
        await api.delete<ApiResponse<{}>>(`/menu/${id}`);
        await fetchMenuItems();
      } catch (error) {
        setError("Failed to delete menu item. Please try again.");
      }
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      description: item.description || "",
      imageUrl: item.imageUrl,
      tags: item.tags ? item.tags.join(", ") : "",
    });
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      price: "",
      category: "",
      description: "",
      imageUrl: "",
      tags: "",
    });
  };

  if (loading || catLoading) {
    return (
      <div style={{ padding: theme.spacing.xl, textAlign: "center" }}>
        Loading menu items...
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
        <h1> Menu Management</h1>
        <button
          onClick={() => navigate("/admin/dropdowns")}
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
            e.currentTarget.style.boxShadow = "0 0 12px rgba(0,123,255,0.3)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = theme.colors.primary;
            e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Manage Dropdowns
        </button>
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

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: theme.colors.white,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.lg,
          marginBottom: theme.spacing.xl,
        }}
      >
        <h2 style={{ marginBottom: theme.spacing.lg }}>
          {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
        </h2>

        <div style={{ marginBottom: theme.spacing.md }}>
          <label style={{ display: "block", marginBottom: theme.spacing.xs }}>
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          <label style={{ display: "block", marginBottom: theme.spacing.xs }}>
            Price
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
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
          <label style={{ display: "block", marginBottom: theme.spacing.xs }}>
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            style={{
              width: "100%",
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.gray[300]}`,
            }}
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: theme.spacing.md }}>
          <label style={{ display: "block", marginBottom: theme.spacing.xs }}>
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            style={{
              width: "100%",
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.gray[300]}`,
            }}
          />
        </div>

        <div style={{ marginBottom: theme.spacing.md }}>
          <label style={{ display: "block", marginBottom: theme.spacing.xs }}>
            Tags (separate by commas)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            style={{
              width: "100%",
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.gray[300]}`,
            }}
          />
        </div>

        <div style={{ marginBottom: theme.spacing.lg }}>
          <label style={{ display: "block", marginBottom: theme.spacing.xs }}>
            Image URL
          </label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) =>
              setFormData({ ...formData, imageUrl: e.target.value })
            }
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
              e.currentTarget.style.boxShadow = "0 0 12px rgba(0,123,255,0.3)";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = theme.colors.primary;
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {editingItem ? "Update" : "Add"} Item
          </button>

          {editingItem && (
            <button
              type="button"
              onClick={resetForm}
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
                e.currentTarget.style.backgroundColor = theme.colors.gray[300];
                e.currentTarget.style.boxShadow =
                  "0 2px 6px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.color = theme.colors.gray[700];
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Menu Items List */}
      <div
        style={{
          backgroundColor: theme.colors.white,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.lg,
        }}
      >
        <h2 style={{ marginBottom: theme.spacing.lg }}>Menu Items</h2>
        {menuItems.length === 0 ? (
          <p style={{ color: theme.colors.gray[600] }}>No menu items found.</p>
        ) : (
          <div style={{ display: "grid", gap: theme.spacing.md }}>
            {menuItems
              .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically by item name
              .map((item) => (
                <div
                  key={item._id}
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
                      {item.name}
                    </h5>
                    <p style={{ color: theme.colors.gray[600] }}>
                      ${item.price.toFixed(2)} - {item.category}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: theme.spacing.sm }}>
                    <button
                      onClick={() => handleEdit(item)}
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
                      onClick={() => handleDelete(item._id)}
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

export default MenuManagement;
