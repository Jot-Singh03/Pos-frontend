import React, { useEffect, useState } from "react";
import theme from "../../styles/theme";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/api";

interface Category {
  _id: string;
  name: string;
  imageUrl?: string; // Make imageUrl optional
}

const DropdownsManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCategories();
      setCategories(res.data.data);
    } catch (err) {
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setFormLoading(true);
     setError(null);

     try {
       const categoryData = {
         name: formName,
         imageUrl: formImageUrl || "",
       };

       if (editingCategory) {
         await updateCategory(editingCategory._id, categoryData);
       } else {
         await createCategory(categoryData);
       }

       // Reset form state
       setFormName("");
       setFormImageUrl("");
       setEditingCategory(null);

       // Refetch the categories and products
       fetchCategories();
       // Optionally, fetch or update product data here if needed
     } catch (err) {
       setError("Failed to save category.");
     } finally {
       setFormLoading(false);
     }
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormImageUrl(cat.imageUrl || ""); // Pre-fill the imageUrl field
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this category?")) return;
    setError(null);
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (err) {
      setError("Failed to delete category.");
    }
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setFormName("");
    setFormImageUrl("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.colors.background,
        padding: `0 0 ${theme.spacing.xl} 0`,
      }}
    >
      <div
        style={{
          maxWidth: 500,
          margin: "0 auto",
          paddingTop: theme.spacing.xl,
        }}
      >
        <h1
          style={{
            marginBottom: theme.spacing.md,
            textAlign: "center",
            color: theme.colors.primary,
          }}
        >
          Dropdowns Management
        </h1>
        <div
          style={{
            background: theme.colors.white,
            borderRadius: theme.borderRadius.lg,
            boxShadow: theme.shadows.md,
            padding: theme.spacing.xl,
            marginBottom: theme.spacing.xl,
          }}
        >
          <h2
            style={{
              marginBottom: theme.spacing.md,
              fontSize: theme.fontSizes.xl,
              color: theme.colors.secondary,
            }}
          >
            Categories
          </h2>
          {error && (
            <div
              style={{
                color: theme.colors.danger,
                marginBottom: theme.spacing.md,
              }}
            >
              {error}
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            style={{
              marginBottom: theme.spacing.lg,
              display: "flex",
              gap: theme.spacing.md,
              flexDirection: "column", // Stack form fields vertically
              alignItems: "center",
              background: theme.colors.gray[100],
              padding: theme.spacing.md,
              borderRadius: theme.borderRadius.md,
            }}
          >
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Category name"
              required
              style={{
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.gray[300]}`,
                width: "100%",
                flex: 1,
                fontSize: theme.fontSizes.base,
              }}
            />
            {/* Optional imageUrl input field */}
            {editingCategory && (
              <input
                type="text"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
                placeholder="Image URL (optional)"
                style={{
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.gray[300]}`,
                  width: "100%",
                  fontSize: theme.fontSizes.base,
                }}
              />
            )}
            <button
              type="submit"
              disabled={formLoading}
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
                e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {editingCategory ? "Update" : "Add"}
            </button>
            {editingCategory && (
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                  backgroundColor: theme.colors.gray[300],
                  color: theme.colors.gray[700],
                  border: "none",
                  borderRadius: theme.borderRadius.md,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: theme.fontSizes.base,
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
            )}
          </form>
          {loading ? (
            <div style={{ textAlign: "center", color: theme.colors.gray[500] }}>
              Loading...
            </div>
          ) : (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
              }}
            >
              {categories.map((cat) => (
                <li
                  key={cat._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: `${theme.spacing.sm} 0`,
                    borderBottom: `1px solid ${theme.colors.gray[200]}`,
                    transition: "background 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = theme.colors.gray[100])
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <span style={{ fontSize: theme.fontSizes.base }}>
                    {cat.name}
                  </span>
                  <span style={{ display: "flex", gap: theme.spacing.sm }}>
                    <button
                      onClick={() => handleEdit(cat)}
                      title="Edit"
                      style={{
                        padding: theme.spacing.xs,
                        backgroundColor: theme.colors.secondary,
                        color: theme.colors.white,
                        border: "none",
                        borderRadius: theme.borderRadius.sm,
                        cursor: "pointer",
                        fontSize: theme.fontSizes.lg,
                        transition: "background 0.2s",
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      title="Delete"
                      style={{
                        padding: theme.spacing.xs,
                        backgroundColor: theme.colors.danger,
                        color: theme.colors.white,
                        border: "none",
                        borderRadius: theme.borderRadius.sm,
                        cursor: "pointer",
                        fontSize: theme.fontSizes.lg,
                        transition: "background 0.2s",
                      }}
                    >
                      🗑️
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DropdownsManagement;
