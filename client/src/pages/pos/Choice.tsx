import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/choice.css";
import logo from "../../assests/logo.png";
import dine from "../../assests/Group.svg";
import takeaway from "../../assests/Group-1.svg";
import { useOrder } from "./OrderContext";



const Choice: React.FC = () => {
  const navigate = useNavigate();
  const { orderData, setOrderData } = useOrder();

  const handleChoice = (choice: string) => {
   setOrderData({
     items: orderData?.items || [],
     totalAmount: orderData?.totalAmount || "0",
     ...orderData,
     choice,
   });

    navigate("/pos");
  };

  return (
    <div className="choice-container">
      <img src={logo} alt="Logo" className="logo" />
      <span className="choice-title">Where would you like to eat?</span>

      <div className="choice-options">
        <div onClick={() => handleChoice("Dining In")} className="choice-card">
          <img src={dine} alt="Dining In" className="choice-image" />
          <h3 className="choice-subtitle">DINING IN?</h3>
        </div>
        <div onClick={() => handleChoice("Takeaway")} className="choice-card">
          <img src={takeaway} alt="Takeaway" className="choice-image2" />
          <h3 className="choice-subtitle">Takeaway</h3>
        </div>
      </div>
    </div>
  );
};

export default Choice;
