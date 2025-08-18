import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/choice.css";
import logo from "../../assests/logo.png";
import payhere from "../../assests/payhere.svg";
import counter from "../../assests/counter.svg";
import arrow from "../../assests/arrow.svg";
import { useOrder } from "./OrderContext";
import api, { ApiResponse } from "../../services/api";
import { toast } from "react-toastify";

const PayChoice: React.FC = () => {
  const navigate = useNavigate();
  const { orderData, setOrderData } = useOrder();

 const handlePayChoice = async (payChoice: string) => {
   if (!orderData) return;

   const finalData = { ...orderData, payChoice };
   setOrderData(finalData);

   try {
     // Step 1: Post points if phone number exists
     if (finalData.phoneNumber) {
       const points = parseFloat(
         (Number(finalData.totalAmount) * 0.1).toFixed(2)
       );
       await api.post("/loyalty/add", {
         phoneNumber: finalData.phoneNumber,
         points,
       });
     }

     // Step 2: Place the order
     const { data } = await api.post<ApiResponse<any>>("/orders", finalData);
     if (data.success) {
       toast.success("Order placed successfully!");
       navigate(`/pos/confirmation/${data.data._id}`);
     } else {
       toast.error(data.error || "Failed to place order");
     }
   } catch (err: any) {
     toast.error(err.response?.data?.error || "Failed to place order");
   }
 };

  return (
    <div className="choice-container">
      <img src={logo} alt="Logo" className="logo" />
      <span className="choice-title">Where would you like to pay?</span>

      <div className="choice-options">
        <div
          onClick={() => handlePayChoice("Pay Here")}
          className="choice-card"
        >
          <img src={payhere} alt="Pay Here" className="choice-image2" />
          <h3 className="choice-subtitle">PAY HERE</h3>
        </div>
        <div
          onClick={() => handlePayChoice("Pay at Counter")}
          className="choice-card"
        >
          <img src={counter} alt="Counter" className="choice-image2" />
          <h3 className="choice-subtitle">PAY AT COUNTER</h3>
        </div>
      </div>

      <div className="choice-footer" onClick={() => navigate(-1)}>
        <img src={arrow} alt="arrow" className="choice-image3" />
      </div>
    </div>
  );
};

export default PayChoice;
