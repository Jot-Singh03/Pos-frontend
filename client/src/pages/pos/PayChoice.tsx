import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/choice.css";
import logo from "../../assests/logo.png";
import payhere from "../../assests/payhere.svg";
import counter from "../../assests/counter.svg";
import arrow from "../../assests/arrow.svg";
const PayChoice: React.FC = () => {
  const navigate = useNavigate();
  //  navigate(`/pos/confirmation/${data.data._id}`);
  return (
    <div className="choice-container">
      <img src={logo} alt="Logo" className="logo" />
      <span className="choice-title">Where would you like to pay?</span>

      <div className="choice-options">
        <div className="choice-card">
          <img src={payhere} alt="Pay Here" className="choice-image2" />
          <h3 className="choice-subtitle">PAY HERE</h3>
        </div>
        <div className="choice-card">
          <img src={counter} alt="Counter" className="choice-image2" />
          <h3 className="choice-subtitle"> PAY AT COUNTER</h3>
        </div>
      </div>
      <div className="choice-footer">
        <img src={arrow} alt="arrow" className="choice-image3" />
      </div>
    </div>
  );
};

export default PayChoice;
