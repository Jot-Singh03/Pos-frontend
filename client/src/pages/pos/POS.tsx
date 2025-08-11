import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import theme from "../../styles/theme";
import api, { ApiResponse } from "../../services/api";
import { getCategories } from "../../services/api";
import LoyaltyBar from "../../components/Loyaltybar";
import "../../styles/pos.css";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  tags?: string[];
}
interface Category {
  name: string;
  imageUrl: string;
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
  const [categories, setCategories] = useState<Category[]>([]);
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

    // Validate total amount
    if (isNaN(totalAmount) || totalAmount <= 0) {
      console.error("Total amount is invalid or too small.");
      setError("Invalid total amount.");
      return;
    }

    // Calculate points (10% of total amount) and ensure 2 decimal places
    let points = totalAmount * 0.1;
    points = parseFloat(points.toFixed(2));

    // Validate phone number - Check if it's blank
    if (!phoneNumber || phoneNumber.trim() === "") {
      setError("Please provide a valid phone number.");
      return; // Prevent POST request if phone number is blank
    }

    console.log("Posting points:", { phoneNumber, points });

    try {
      // Make the POST request
      const { data } = await api.post<ApiResponse<LoyaltyCustomer>>(
        "/loyalty/add",
        {
          phoneNumber,
          points,
        }
      );

      // Handle success
      console.log("Loyalty points added successfully:", data);
      setError(""); // Clear any previous error message
    } catch (error: any) {
      // Handle API error
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
    <div className="pos-container">
      <div
        className="pos-sidebar"
        style={{
          borderRight: "1px solid  #F5F5F5",
        }}
      >
        <h2 className="pos-h2">Hey</h2>
        <span className="pos-span" style={{ marginBottom: theme.spacing.lg }}>
          {" "}
          What's up?
        </span>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "25px",
          }}
        >
          {categories.map((category) => (
            <li
              className="pos-category"
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              style={{
                backgroundColor:
                  selectedCategory === category.name ? "#DB0007" : "#F5F5F5", // red for selected, light gray otherwise
                textAlign: "center",
                color:
                  selectedCategory === category.name ? "#FFFFFF" : "#000000",

                transition: "transform 0.2s ease, background 0.2s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {category.imageUrl && (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  style={{
                    width: "120px",
                    height: "84px",
                    objectFit: "cover",
                    marginBottom: "10px",
                    borderRadius: "10px",
                  }}
                />
              )}
              <div style={{ fontSize: "14px", lineHeight: "1.2" }}>
                {category.name}
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* Menu Section */}
      <div className="menu-section">
        {error && <div className="menu-error">{error}</div>}

        {filteredMenu.length === 0 ? (
          <p className="menu-empty">Currently no items in this category.</p>
        ) : (
          <div className="menu-grid">
            {filteredMenu.map((item) => (
              <div
                key={item._id}
                className="menu-card"
                onClick={() => handleItemClick(item)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="menu-image"
                />
                <div className="menu-content">
                  <h3 className="menu-name">{item.name}</h3>
                  <p className="menu-description">
                    {item.description
                      ? item.description.split(" ").slice(0, 10).join(" ") +
                        (item.description.split(" ").length > 10 ? "..." : "")
                      : ""}
                  </p>
                  <div className="menu-bottom">
                    <span className="menu-price">₹{item.price}</span>
                    <button
                      className="menu-add-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                    >
                      Add +
                    </button>
                  </div>
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
      <div className="cart-section">
        <div className="cart-title">
          <span>Your Cart</span>
          <button className="clear-all">Clear All</button>
        </div>

        {cart.length === 0 ? (
          <p className="cart-empty">Your cart is empty</p>
        ) : (
          <>
            <div className="cart-list">
              {cart.map((cartItem) => (
                <div className="cart-row" key={cartItem.item._id}>
                  {/* Left: Image + details */}
                  <div className="cart-item-info">
                    <img
                      src={cartItem.item.imageUrl}
                      alt={cartItem.item.name}
                      className="cart-item-img"
                    />
                    <div className="cart-item-details">
                      <h4 className="cart-item-title">{cartItem.item.name}</h4>
                      <div className="cart-item-price">
                        ₹{cartItem.item.price}
                      </div>
                    </div>
                  </div>

                  {/* Right: Controls */}
                  <div className="cart-qty-controls">
                    <button
                      onClick={() =>
                        updateQuantity(cartItem.item._id, cartItem.quantity + 1)
                      }
                      className="qty-btn plus"
                    >
                      +
                    </button>
                    <span className="qty-count">
                      {String(cartItem.quantity).padStart(2, "0")}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(cartItem.item._id, cartItem.quantity - 1)
                      }
                      className="qty-btn minus"
                    >
                      -
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-line">
                <span>Cart:</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Discount Amount:</span>
                <span>
                  ${((getTotal() * (discount ?? 0)) / 100).toFixed(2)}
                </span>
              </div>
              <div className="summary-line">
                <span>Total:</span>
                <span>
                  ${(getTotal() * (1 - (discount ?? 0) / 100)).toFixed(2)}
                </span>
              </div>

              <div className="checkout-form">
                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <LoyaltyBar
                  points={points}
                  onDiscountChange={handleDiscountChange}
                />

                <div className="form-group">
                  <label htmlFor="tableToken">Table Token</label>
                  <select
                    id="tableToken"
                    value={tableToken}
                    onChange={(e) =>
                      setTableToken(
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
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
                className="checkout-btn"
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
