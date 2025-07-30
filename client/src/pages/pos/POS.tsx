import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import theme from "../../styles/theme";
import api, { ApiResponse } from "../../services/api";
import { getCategories } from "../../services/api";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
}

interface OrderResponse {
  _id: string;
  items: Array<{
    itemId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  customerId: string;
  createdAt: string;
}

const POS: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [tableToken, setTableToken] = useState<number | "">("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get<ApiResponse<MenuItem[]>>("/menu");
      if (data.success && Array.isArray(data.data)) {
        setMenuItems(data.data);
      } else {
        setMenuItems([]);
      }
    } catch (error) {
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.item._id === item._id
      );
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.item._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { item, quantity: 1 }];
    });
    toast.success(`${item.name} added to cart`);
  };
  const removeFromCart = (itemId: string) => {
    setCart((prevCart) =>
      prevCart.filter((cartItem) => cartItem.item._id !== itemId)
    );
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      if (res.data.success) {
        const categoryNames = res.data.data.map(
          (cat: { name: string }) => cat.name
        );
        setCategories(categoryNames);
        if (!selectedCategory && categoryNames.length > 0) {
          setSelectedCategory(categoryNames[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      const item = cart.find((cartItem) => cartItem.item._id === itemId);
      if (item) {
        toast.error(`${item.item.name} removed from cart`);
      }
      removeFromCart(itemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        cartItem.item._id === itemId ? { ...cartItem, quantity } : cartItem
      )
    );
  };

  const getTotal = () => {
    return cart.reduce(
      (total, cartItem) => total + cartItem.item.price * cartItem.quantity,
      0
    );
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (!phoneNumber && !tableToken) {
      toast.error("Please enter a phone number or select a table token.");
      return;
    }
    if (tableToken && (tableToken < 1 || tableToken > 20)) {
      toast.error("Table token must be between 1 and 20.");
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        items: cart.map(({ item, quantity }) => ({
          itemId: item._id,
          name: item.name,
          price: item.price,
          quantity,
        })),
        totalAmount: cart.reduce(
          (sum, cartItem) => sum + cartItem.item.price * cartItem.quantity,
          0
        ),
        ...(phoneNumber ? { phoneNumber } : {}),
        ...(tableToken ? { tableToken } : {}),
      };
      const { data } = await api.post<ApiResponse<any>>("/orders", orderData);
      if (data.success) {
        toast.success("Order placed successfully!");
        // Clear cart and redirect to confirmation
        setCart([]);
        window.location.href = `/pos/confirmation/${data.data._id}`;
      } else {
        toast.error(data.error || "Failed to place order");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const filteredMenu = selectedCategory
    ? menuItems.filter((item) => item.category === selectedCategory)
    : menuItems;

  if (loading) {
    return (
      <div style={{ padding: theme.spacing.xl, textAlign: "center" }}>
        Loading menu...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div
        style={{
          width: "200px",
          backgroundColor: theme.colors.gray[200],
          padding: theme.spacing.lg,
          borderRight: `1px solid ${theme.colors.gray[300]}`,
        }}
      >
        <h1 style={{ marginBottom: theme.spacing.xl }}>Categories</h1>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
          }}
        >
          {categories.map((category) => (
            <li
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                cursor: "pointer",
                color:
                  selectedCategory === category
                    ? theme.colors.primary
                    : theme.colors.gray[700],
                marginBottom: theme.spacing.md,
              }}
            >
              {category}
            </li>
          ))}
        </ul>
      </div>

      {/* Menu Section */}
      <div
        style={{
          flex: 2,
          padding: theme.spacing.lg,
          overflowY: "auto",
          backgroundColor: theme.colors.gray[100],
        }}
      >
        <h1 style={{ marginBottom: theme.spacing.xl }}>Menu</h1>

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
        {selectedCategory && (
          <h2
            style={{
              color: theme.colors.primary,
              marginBottom: theme.spacing.md,
              borderBottom: `2px solid ${theme.colors.primary}`,
              paddingBottom: theme.spacing.xs,
            }}
          >
            {selectedCategory}
          </h2>
        )}

        {filteredMenu.length === 0 ? (
          <p
            style={{
              color: theme.colors.gray[600],
              fontSize: "1rem",
              marginTop: theme.spacing.lg,
            }}
          >
            Currently no items in this category.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: theme.spacing.lg,
            }}
          >
            {filteredMenu.map((item) => (
              <div
                key={item._id}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  padding: theme.spacing.md,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: theme.spacing.md,
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 10,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    marginBottom: theme.spacing.sm,
                  }}
                />
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    marginBottom: 4,
                  }}
                >
                  {item.name}
                </div>
                <div
                  style={{
                    color: theme.colors.gray[700],
                    fontSize: "0.95rem",
                    marginBottom: 4,
                  }}
                >
                  {item.description}
                </div>
                <div
                  style={{
                    color: theme.colors.primary,
                    fontWeight: 700,
                    fontSize: "1rem",
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  ${item.price.toFixed(2)}
                </div>
                <button
                  onClick={() => addToCart(item)}
                  style={{
                    background: theme.colors.primary,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "0.5rem 1.2rem",
                    fontWeight: 600,
                    fontSize: "1rem",
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Section */}
      <div
        style={{
          flex: 0.5,
          padding: theme.spacing.lg,
          backgroundColor: theme.colors.white,
          borderLeft: `1px solid ${theme.colors.gray[200]}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2 style={{ marginBottom: theme.spacing.lg }}>Cart</h2>

        {cart.length === 0 ? (
          <p style={{ color: theme.colors.gray[600] }}>Your cart is empty</p>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {cart.map((cartItem) => (
                <div
                  key={cartItem.item._id}
                  style={{
                    padding: theme.spacing.md,
                    borderBottom: `1px solid ${theme.colors.gray[200]}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h4 style={{ marginBottom: theme.spacing.xs }}>
                      {cartItem.item.name}
                    </h4>
                    <div style={{ color: theme.colors.gray[600] }}>
                      ${cartItem.item.price.toFixed(2)}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing.sm,
                    }}
                  >
                    <button
                      onClick={() =>
                        updateQuantity(cartItem.item._id, cartItem.quantity - 1)
                      }
                      style={{
                        padding: theme.spacing.xs,
                        backgroundColor: theme.colors.gray[200],
                        border: "none",
                        borderRadius: theme.borderRadius.sm,
                        cursor: "pointer",
                      }}
                    >
                      -
                    </button>
                    <span>{cartItem.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(cartItem.item._id, cartItem.quantity + 1)
                      }
                      style={{
                        padding: theme.spacing.xs,
                        backgroundColor: theme.colors.gray[200],
                        border: "none",
                        borderRadius: theme.borderRadius.sm,
                        cursor: "pointer",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: theme.spacing.lg,
                borderTop: `1px solid ${theme.colors.gray[200]}`,
                marginTop: theme.spacing.lg,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: theme.spacing.md,
                  fontSize: theme.fontSizes.lg,
                  fontWeight: "bold",
                }}
              >
                <span>Total:</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
              <div
                style={{
                  margin: "2rem 0",
                  padding: "1.5rem",
                  background: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                  maxWidth: 400,
                  marginLeft: "auto",
                  marginRight: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <label
                    style={{
                      fontWeight: 600,
                      fontSize: "1rem",
                      marginBottom: 4,
                    }}
                    htmlFor="phoneNumber"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    style={{
                      padding: "0.75rem 1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      fontSize: "1rem",
                      outline: "none",
                      transition: "border 0.2s",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                    }}
                  />
                </div>
                <div
                  style={{
                    textAlign: "center",
                    color: "#888",
                    fontWeight: 500,
                  }}
                >
                  or
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <label
                    style={{
                      fontWeight: 600,
                      fontSize: "1rem",
                      marginBottom: 4,
                    }}
                    htmlFor="tableToken"
                  >
                    Table Token
                  </label>
                  <select
                    id="tableToken"
                    value={tableToken}
                    onChange={(e) =>
                      setTableToken(
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
                    style={{
                      padding: "0.75rem 1rem",
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      fontSize: "1rem",
                      outline: "none",
                      background: "#fafbfc",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                    }}
                  >
                    <option value="">Select table</option>
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                style={{
                  width: "100%",
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.white,
                  border: "none",
                  borderRadius: theme.borderRadius.md,
                  fontSize: theme.fontSizes.lg,
                  cursor: "pointer",
                }}
                disabled={loading}
              >
                {loading ? "Processing..." : "Checkout"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default POS;
