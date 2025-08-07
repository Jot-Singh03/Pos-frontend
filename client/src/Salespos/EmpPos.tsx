import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import theme from "../styles/theme";
import api, { ApiResponse } from "../services/api";
import { getCategories } from "../services/api";
import { useNavigate } from "react-router-dom";
import { clearAuthData, logout } from "../utils/auth";
import LoyaltyBar from "../components/Loyaltybar";

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  tags?: string[];
}

interface LoyaltyCustomer {
  _id: string;
  customerId: string;
  phoneNumber: number;
  points: number;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
}
interface Category {
  name: string;
  imageUrl: string;
}

const EmpPos: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [tableToken, setTableToken] = useState<number | "">("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [employeeName, setEmployeeName] = useState<string | null>(null);

  const [discount, setDiscount] = useState<number | null>(null);

  const handleDiscountChange = (newDiscount: number) => {
    setDiscount(newDiscount);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleClearAuth = () => {
    clearAuthData();
    navigate("/login");
  };

  useEffect(() => {
    const name = localStorage.getItem("employeeUsername");
    setEmployeeName(name); // Set employee name
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
    // toast.success(`${item.name} added to cart`);
  };
  const removeFromCart = (itemId: string) => {
    setCart((prevCart) =>
      prevCart.filter((cartItem) => cartItem.item._id !== itemId)
    );
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategories(); // Assuming this fetches data from the API
      if (res.data.success) {
        const categoriesWithImages = res.data.data.map(
          (cat: { name: string; imageUrl: string }) => ({
            name: cat.name,
            imageUrl: cat.imageUrl, // Make sure this is included
          })
        );
        setCategories(categoriesWithImages);
        if (!selectedCategory && categoriesWithImages.length > 0) {
          setSelectedCategory(categoriesWithImages[0].name);
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
        // toast.error(`${item.item.name} removed from cart`);
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


   const getTotal = () => {
     return cart.reduce(
       (total, cartItem) => total + cartItem.item.price * cartItem.quantity,
       0
     );
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

    const orderBy = employeeName ? "employee" : "customer";

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
        orderBy,
        employeeName: employeeName,
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
      toast.error(error?.response?.data?.error || "Failed to place order");
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
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top: Employee & Categories */}
        <div>
          <h3 style={{ marginBottom: theme.spacing.md }}>
            {employeeName ? employeeName : "Employee"}
            <span
              style={{
                fontSize: "0.9rem",
                marginLeft: "0.5rem",
                verticalAlign: "middle",
                transform: "scale(0.5)",
              }}
            >
              🟢
            </span>
          </h3>

          <h2 style={{ marginBottom: theme.spacing.xl }}>Categories</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {categories.map((category) => (
              <li
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                style={{
                  cursor: "pointer",
                  color:
                    selectedCategory === category.name
                      ? theme.colors.primary
                      : theme.colors.gray[700],
                  marginBottom: theme.spacing.xs,
                  padding: "6px 10px",
                  borderRadius: "8px",
                  fontWeight: 500,
                  transition: "all 0.3s ease",
                  backgroundColor:
                    selectedCategory === category.name
                      ? theme.colors.gray[300]
                      : "transparent",
                  boxShadow:
                    selectedCategory === category.name
                      ? "0 2px 10px rgba(0,0,0,0.08)"
                      : "none",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = theme.colors.gray[200];
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background =
                    selectedCategory === category.name
                      ? theme.colors.gray[300]
                      : "transparent";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  {category.imageUrl && (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      style={{
                        width: "35px",
                        height: "35px",
                        borderRadius: "50%",
                        marginRight: "10px",
                      }}
                    />
                  )}
                  {category.name}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: Buttons */}
        <div>
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

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              marginTop: "8px",
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
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  padding: theme.spacing.md,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: theme.spacing.md,
                  justifyContent: "space-between",
                  height: "100%",
                  border: `1px solid ${theme.colors.gray[300]}`,
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-5px) scale(1.03)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(0,0,0,0.12)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0,0,0,0.05)";
                }}
                onClick={() => handleItemClick(item)}
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
                      padding: "0.5rem 1.2rem",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      transition: "all 0.25s ease",
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
                    flexDirection: "row", // Align elements horizontally
                    gap: theme.spacing.md, // Optional gap between the two elements
                    alignItems: "center", // Vertically center the elements
                  }}
                >
                  <h2
                    style={{
                      fontSize: "1rem", // Same size as phone number input
                      fontWeight: 600, // Bold for "Order By"
                      margin: 0, // Remove margin for better alignment
                    }}
                  >
                    Order By:
                  </h2>
                  {/* Display Employee's Name */}
                  <h2
                    style={{
                      fontSize: "1rem",
                      fontWeight: 300, // Lighter weight for the employee name
                      margin: 0, // Remove margin for better alignment
                    }}
                  >
                    {employeeName ? employeeName : "Employee"}
                  </h2>
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

export default EmpPos;
