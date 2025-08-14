import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/choice.css";
import logo from "../../assests/logo.png";
import dine from "../../assests/Group.svg";
import takeaway from "../../assests/Group-1.svg";
import { useChoice } from "./ChoiceContext"; // make sure path is correct
import type { ChoiceType } from "./ChoiceContext"; // import type

const Choice: React.FC = () => {
  const navigate = useNavigate();
  const { setChoice } = useChoice();

  const handleChoice = (selectedChoice: ChoiceType) => {
    setChoice(selectedChoice);
    navigate("/pos");
  };

  return (
    <div className="choice-container">
      <img src={logo} alt="Logo" className="logo" />
      <span className="choice-title">Where would you like to eat?</span>

      <div className="choice-options">
        <div onClick={() => handleChoice("dine-in")} className="choice-card">
          <img src={dine} alt="Dining In" className="choice-image" />
          <h3 className="choice-subtitle">DINING IN?</h3>
        </div>
        <div onClick={() => handleChoice("takeaway")} className="choice-card">
          <img src={takeaway} alt="Takeaway" className="choice-image2" />
          <h3 className="choice-subtitle">Takeaway</h3>
        </div>
      </div>
    </div>
  );
};

export default Choice;
