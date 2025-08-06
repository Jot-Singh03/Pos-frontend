import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import theme from "../../styles/theme";
import api, { ApiResponse } from "../../services/api";
import { getCategories } from "../../services/api";
import LoyaltyBar from "../../components/Loyaltybar";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  tags?: string[];
}

interface CartItem {
  item: MenuItem;
  quantity: number;
}

interface LoyaltyCustomer {
  _id: string;
  customerId: string;
  phoneNumber: number;
  points: number;
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
  const [points, setPoints] = useState<number>(0);

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const [discount, setDiscount] = useState<number | null>(null);

  const handleDiscountChange = (newDiscount: number) => {
    setDiscount(newDiscount);
  };

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

  const fetchPoints = async (phoneNumber: string) => {
    if (!phoneNumber) return; // Don't make a request if phone number is empty

    try {
      const { data } = await api.get<ApiResponse<LoyaltyCustomer>>(
        `/loyalty/${phoneNumber}`
      );
      if (data.success && data.data) {
        setPoints(data.data.points);
      } else {
        setPoints(0); // In case no points are found
      }
    } catch (error) {
      setPoints(0); // In case of error, reset points to 0
    }
  };
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value;
    setPhoneNumber(phone);
    if (phone.length >= 10) {
      // Fetch points when the phone number is at least 10 digits
      fetchPoints(phone);
    } else {
      // Reset points when phone number length is less than 10
      setPoints(0);
      setDiscount(0);
    }
  };

  const postpoints = async () => {
    // Calculate points as 10% of total amount
    const totalAmount = getTotal();
    if (!totalAmount) {
      console.error("Total amount is invalid or missing.");
      return;
    }

    let points = totalAmount * 0.1;
    points = parseFloat(points.toFixed(2)); // Ensure points have 2 decimal places

    console.log("Posting points:", { phoneNumber, points });

    try {
      // Make the POST request
      const { data } = await api.post<ApiResponse<LoyaltyCustomer>>(
        "/loyalty/add",
        {
          phoneNumber: phoneNumber,
          points: points,
        }
      );
      // Handle success
      console.log("Loyalty points added successfully:", data);
    } catch (error: any) {
      // Log the full error response for detailed info
      if (error.response) {
        console.error("Error response:", error.response);
        console.error("Error message:", error.response.data);
      } else {
        console.error("Error:", error.message);
      }
      setError(error?.message || "An unexpected error occurred");
    }
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
    if (phoneNumber && phoneNumber.length < 10) {
      toast.error("Phone number must be at least 10 digits.");
      return;
    }

    if (tableToken && (tableToken < 1 || tableToken > 20)) {
      toast.error("Table token must be between 1 and 20.");
      return;
    }
    setLoading(true);
    try {
      await postpoints();

      const orderData = {
        items: cart.map(({ item, quantity }) => ({
          itemId: item._id,
          name: item.name,
          price: item.price,
          quantity,
        })),
        totalAmount: (getTotal() * (1 - (discount ?? 0) / 100)).toFixed(2),
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

  // Show modal when an item is clicked
  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null); // Reset selected item
  };

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
        <h2 style={{ marginBottom: theme.spacing.xl }}>Categories</h2>
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
                  justifyContent: "space-between", // Ensures the content stretches vertically
                  height: "100%",
                  border: `1px solid ${theme.colors.gray[300]}`,
                }}
                onClick={() => handleItemClick(item)} // Show modal on click
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
                  {item.description
                    ? item.description.split(" ").slice(0, 10).join(" ") +
                      (item.description.split(" ").length > 10 ? "..." : "")
                    : ""}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    marginTop: "auto", // pushes them to bottom if the card grows
                  }}
                >
                  <div
                    style={{
                      color: theme.colors.primary,
                      fontWeight: 700,
                      fontSize: "1rem",
                    }}
                  >
                    ${item.price.toFixed(2)}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                    style={{
                      background: theme.colors.primary,
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "0.4rem 1rem",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      cursor: "pointer",
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Modal for Item Details */}
      {selectedItem && (
        <Modal
          show={showModal}
          onHide={handleCloseModal}
          dialogClassName="modal-dialog-centered"
        >
          <Modal.Header closeButton>
            <Modal.Title>{selectedItem.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <img
              src={selectedItem.imageUrl}
              alt={selectedItem.name}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "200px",
                objectFit: "contain",
                borderRadius: 10,
                marginBottom: theme.spacing.md,
              }}
            />
            <p>{selectedItem.description}</p>
            {/* Price + Add to Cart same line */}
            {/* Tags Mapping */}
            {selectedItem.tags && selectedItem.tags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap", // Allow tags to wrap in case there are many
                  gap: "10px", // Add spacing between tags
                  marginBottom: theme.spacing.md, // Bottom margin for spacing
                }}
              >
                {selectedItem.tags.map((tag, index) => (
                  <div
                    key={index}
                    style={{
                      height: 25,
                      padding: "0 10px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 50,
                      border: `2px solid ${theme.colors.primary}`,
                      color: theme.colors.primary,
                      fontWeight: 700,
                      fontSize: "0.85rem", // Adjust font size for tags
                    }}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: theme.spacing.lg,
              }}
            >
              <div
                style={{
                  color: theme.colors.primary,
                  fontWeight: 700,
                  fontSize: "1.1rem",
                }}
              >
                ${selectedItem.price.toFixed(2)}
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  addToCart(selectedItem);
                  handleCloseModal();
                }}
              >
                Add to Cart
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      )}

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
                  fontSize: theme.fontSizes.lg,
                  fontWeight: "bold",
                }}
              >
                <span>Cart:</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: theme.fontSizes.lg,
                  fontWeight: "bold",
                }}
              >
                <span>Discount Amount:</span>
                <span>
                  ${((getTotal() * (discount ?? 0)) / 100).toFixed(2)}
                </span>
              </div>{" "}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: theme.fontSizes.lg,
                  fontWeight: "bold",
                }}
              >
                <span>Total:</span>
                <span>
                  ${(getTotal() * (1 - (discount ?? 0) / 100)).toFixed(2)}
                </span>
              </div>
              <div
                style={{
                  margin: "2rem 0",
                  marginTop: "-0.4rem",
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
                    }}
                    htmlFor="phoneNumber"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
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
                {/* Add Loyalty Progress Bar Below */}
                <LoyaltyBar
                  points={points}
                  onDiscountChange={handleDiscountChange}
                />
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
