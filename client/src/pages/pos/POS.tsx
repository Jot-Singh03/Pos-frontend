import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import theme from "../../styles/theme";
import api, { ApiResponse } from "../../services/api";
import { getCategories } from "../../services/api";
import LoyaltyBar from "../../components/Loyaltybar";
import "../../styles/pos.css";
import arrow from "../../assests/arrow.svg";
import { useOrder } from "./OrderContext";

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
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const navigate = useNavigate();

  const { setOrderData } = useOrder();

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
  // const postpoints = async () => {
  //   // Calculate points as 10% of total amount
  //   const totalAmount = getTotal();

  //   // Validate total amount
  //   if (isNaN(totalAmount) || totalAmount <= 0) {
  //     console.error("Total amount is invalid or too small.");
  //     setError("Invalid total amount.");
  //     return;
  //   }

  //   // Calculate points (10% of total amount) and ensure 2 decimal places
  //   // let points = totalAmount * 0.1;
  //   // points = parseFloat(points.toFixed(2));

  //   // Validate phone number - Check if it's blank
  //   if (!phoneNumber || phoneNumber.trim() === "") {
  //     // setError("Please provide a valid phone number.");
  //     return; // Prevent POST request if phone number is blank
  //   }

  //   // console.log("Posting points:", { phoneNumber, points });

  //   try {
  //     // Make the POST request
  //     const { data } = await api.post<ApiResponse<LoyaltyCustomer>>(
  //       "/loyalty/add",
  //       {
  //         phoneNumber,
  //         points,
  //       }
  //     );

  //     // Handle success
  //     // console.log("Loyalty points added successfully:", data);
  //     setError(""); // Clear any previous error message
  //   } catch (error: any) {
  //     // Handle API error
  //     if (error.response) {
  //       console.error("Error response:", error.response);
  //       console.error("Error message:", error.response.data);
  //     } else {
  //       console.error("Error:", error.message);
  //     }
  //     setError(error?.message || "An unexpected error occurred");
  //   }
  // };

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
      // await postpoints();

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

      setOrderData((prev) => ({
        ...prev,
        items: cart.map(({ item, quantity }) => ({
          itemId: item._id,
          name: item.name,
          price: item.price,
          quantity,
        })),
        totalAmount: (getTotal() * (1 - (discount ?? 0) / 100)).toFixed(2),
        ...(phoneNumber ? { phoneNumber } : {}),
        ...(tableToken ? { tableToken } : {}),
      }));

      // const { data } = await api.post<ApiResponse<any>>("/orders", orderData);
      // if (data.success) {
      //   // toast.success("Order placed successfully!");
      //   // setCart([]);
      //   // navigate(`/pos/confirmation/${data.data._id}`);
      navigate(`/pay`);
      // } else {
      //   toast.error(data.error || "Failed to place order");
      // }
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
        <div className="Bbutton" onClick={() => navigate(-1)}>
          <img src={arrow} alt="arrow" className="arr" />
        </div>

        <h2 className="pos-h2">Hey</h2>
        <span className="pos-span" style={{ marginBottom: theme.spacing.lg }}>
          What's up?
        </span>
        <button
          className="voucher-button"
          onClick={() => setShowVoucherModal(true)}
        >
          <svg
            className="icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            strokeWidth="2"
            stroke="#000"
            width="20"
            height="20"
            viewBox="0 0 64 64"
          >
            <g data-name="33 discount ticket" id="_33_discount_ticket">
              <path d="M57.46,27.91H59.5a1,1,0,0,0,1-1V18.76a2.027,2.027,0,0,0-2.02-2.02H5.52A2.027,2.027,0,0,0,3.5,18.76v8.15a1,1,0,0,0,1,1H6.54a4.09,4.09,0,1,1,0,8.18H4.5a1,1,0,0,0-1,1v8.15a2.027,2.027,0,0,0,2.02,2.02H58.48a2.027,2.027,0,0,0,2.02-2.02V37.09a1,1,0,0,0-1-1H57.46a4.09,4.09,0,1,1,0-8.18Zm0,10.18H58.5l-.02,7.17L5.5,45.24V38.09H6.54a6.09,6.09,0,0,0,0-12.18H5.5l.02-7.17,52.98.02v7.15H57.46a6.09,6.09,0,0,0,0,12.18Z" />

              <path d="M32,20.814a1,1,0,0,0-1,1v2.038a1,1,0,1,0,2,0V21.814A1,1,0,0,0,32,20.814Z" />

              <path d="M32,39.148a1,1,0,0,0-1,1v2.038a1,1,0,1,0,2,0V40.148A1,1,0,0,0,32,39.148Z" />

              <path d="M32,33.037a1,1,0,0,0-1,1v2.037a1,1,0,0,0,2,0V34.037A1,1,0,0,0,32,33.037Z" />

              <path d="M32,26.926a1,1,0,0,0-1,1v2.037a1,1,0,0,0,2,0V27.926A1,1,0,0,0,32,26.926Z" />

              <path d="M16.722,26.889H20.8a1,1,0,0,0,0-2H16.722a1,1,0,0,0,0,2Z" />

              <path d="M16.722,33h6.111a1,1,0,0,0,0-2H16.722a1,1,0,0,0,0,2Z" />

              <path d="M24.871,37.111H16.722a1,1,0,0,0,0,2h8.149a1,1,0,1,0,0-2Z" />

              <path d="M39.13,24.89a3.035,3.035,0,1,0,3.04,3.04A3.045,3.045,0,0,0,39.13,24.89Zm0,4.07a1.035,1.035,0,1,1,1.04-1.03A1.037,1.037,0,0,1,39.13,28.96Z" />

              <path d="M47.28,33.04a3.035,3.035,0,1,0,3.03,3.03A3.037,3.037,0,0,0,47.28,33.04Zm0,4.07a1.035,1.035,0,1,1,0-2.07,1.035,1.035,0,0,1,0,2.07Z" />

              <path d="M49,26.2a1,1,0,0,0-1.414,0L37.4,36.386A1,1,0,1,0,38.818,37.8L49,27.614A1,1,0,0,0,49,26.2Z" />
            </g>
          </svg>
          Vouchers
        </button>
        <Modal
          show={showVoucherModal}
          onHide={() => setShowVoucherModal(false)}
          dialogClassName="modal-dialog-centered"
          contentClassName="item-modal"
        >
          <Modal.Header className="custom-modal-header" closeButton />

          <Modal.Body>
            <div className="form-group">
              <label htmlFor="voucherPhoneNumber">Phone Number</label>
              <input
                id="voucherPhoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="Enter phone number"
                style={{ width: "100%", padding: "8px", fontSize: "16px" }}
              />
              <LoyaltyBar
                points={points}
                onDiscountChange={handleDiscountChange}
              />
            </div>
          </Modal.Body>

          <Modal.Footer style={{ padding: "10px 20px" }}>
            <button
              className="submit-btn"
              onClick={() => {
                // Your submit logic here
                // console.log("Voucher phone number submitted:", phoneNumber);
                setShowVoucherModal(false); // Close modal after submit
              }}
              style={{
                backgroundColor: "#ffcb3e",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: "pointer",
                width: "100%",
              }}
              disabled={!phoneNumber || phoneNumber.length < 10} // optional disable if invalid
            >
              Submit
            </button>
          </Modal.Footer>
        </Modal>

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

                transition: "transform 0.1s ease, background 0.1s ease",
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
                    <span className="menu-price">${item.price}</span>
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
      {/* Modal Section */}

      {selectedItem && (
        <Modal
          show={showModal}
          onHide={handleCloseModal}
          dialogClassName="modal-dialog-centered"
          contentClassName="item-modal" // Matches .modal-content.item-modal in CSS
        >
          {/* We keep header only for the close button */}
          <Modal.Header className="custom-modal-header" closeButton />

          <Modal.Body>
            {/* Image */}
            <img
              src={selectedItem.imageUrl}
              alt={selectedItem.name}
              className="modal-image"
            />

            {/* Name */}
            <h3
              className="modal-title"
              style={{ textAlign: "start", marginTop: "20px" }}
            >
              {selectedItem.name}
            </h3>

            {/* Description */}
            <p
              className="menu-description"
              style={{ textAlign: "start", marginTop: "8px" }}
            >
              {selectedItem.description}
            </p>

            {/* Tags */}
            {selectedItem.tags && selectedItem.tags.length > 0 && (
              <div className="modal-tags">
                {selectedItem.tags.map((tag, index) => (
                  <div key={index} className="modal-tag">
                    {tag}
                  </div>
                ))}
              </div>
            )}

            {/* Price & Add Button */}
            <div
              className="menu-bottom"
              style={{
                marginTop: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                className="menu-price"
                style={{ fontWeight: "bold", color: "#000" }}
              >
                ${selectedItem.price.toFixed(2)}
              </span>
              <button
                className="menu-add-btn"
                style={{
                  backgroundColor: "#ffcb3e",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
                onClick={() => {
                  addToCart(selectedItem);
                  handleCloseModal();
                }}
              >
                Add +
              </button>
            </div>
          </Modal.Body>
        </Modal>
      )}
      {/* Cart Section */}
      <div className="cart-section">
        <div className="cart-content">
          <div className="cart-title">
            <span>Your Cart</span>
            <button className="clear-all" onClick={() => setCart([])}>
              Clear All
            </button>
          </div>
          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="cart-empty">Your cart is empty</div>
            ) : (
              <div className="cart-list">
                {cart.map((cartItem) => (
                  <div className="cart-row" key={cartItem.item._id}>
                    <div className="cart-item-info">
                      <img
                        src={cartItem.item.imageUrl}
                        alt={cartItem.item.name}
                        className="cart-item-img"
                      />
                      <div className="cart-item-details">
                        <h4 className="cart-item-title">
                          {cartItem.item.name}
                        </h4>
                        <div className="cart-item-price">
                          ${cartItem.item.price}
                        </div>
                      </div>
                    </div>

                    <div className="cart-qty-controls">
                      <button
                        onClick={() =>
                          updateQuantity(
                            cartItem.item._id,
                            cartItem.quantity + 1
                          )
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
                          updateQuantity(
                            cartItem.item._id,
                            cartItem.quantity - 1
                          )
                        }
                        className="qty-btn minus"
                      >
                        -
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="cart-summary">
          <div className="summary-line">
            <span>Cart:</span>
            <span>${getTotal().toFixed(2)}</span>
          </div>
          <div className="summary-line">
            <span>Discount Amount:</span>
            <span>${((getTotal() * (discount ?? 0)) / 100).toFixed(2)}</span>
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

            <div className="form-group">
              <label htmlFor="tableToken">Table Token</label>
              <select
                id="tableToken"
                value={tableToken}
                onChange={(e) =>
                  setTableToken(e.target.value ? Number(e.target.value) : "")
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
      </div>
    </div>
  );
};

export default POS;
