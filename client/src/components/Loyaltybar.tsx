import React from "react";
import ProgressBar from "@ramonak/react-progress-bar";

interface Tier {
  name: string;
  minPoints: number;
  maxPoints: number;
  discount: number;
  color: string;
}

interface LoyaltyProgressBarProps {
  points?: number | null; // Make points optional
}

const LoyaltyProgressBar: React.FC<LoyaltyProgressBarProps> = ({ points }) => {
  // Define tiers and corresponding discounts
  const tiers: Tier[] = [
    {
      name: "Bronze",
      minPoints: 150,
      maxPoints: 500,
      discount: 5,
      color: "#854200",
    },
    {
      name: "Silver",
      minPoints: 500,
      maxPoints: 1500,
      discount: 9,
      color: "#c0c0c0",
    },
    {
      name: "Gold",
      minPoints: 1500,
      maxPoints: 10000, // Max for Gold
      discount: 12,
      color: "#ffd700",
    },
  ];

  // If points are 0, null, or undefined, show a message instead of the progress bar
  if (points == null || points === 0) {
    return (
      <div style={{ textAlign: "center" }}>
        <p>No points yet!</p>
      </div>
    );
  }

  // Default variables
  let currentTier = "Bronze";
  let discount = 5;
  let maxPoints = 500;
  let bgColor = "#854200"; // Default Bronze color
  let customLabel = `${points}`; // Default label as the points value


  // If points exceed or are equal to 10000, display "LOYAL" and set the color to Gold
  if (points >= 10000) {
    customLabel = "LOYAL CUSTOMER"; // Show "LOYAL" for points >= 10000
    bgColor = "#ffd700"; // Set progress bar color to Gold for 10000 points or more
    currentTier = "LOYAL"; // Update the tier to "LOYAL" instead of Gold
    discount = 12; // You can set discount to 0 for loyalty if no discount applies after this threshold
    maxPoints = points; // Set maxPoints to the current points (we don't need an upper limit anymore)
  } else {
    // Default logic to find the correct tier based on points
    for (let tier of tiers) {
      if (points >= tier.minPoints && points < tier.maxPoints) {
        currentTier = tier.name;
        discount = tier.discount;
        maxPoints = tier.maxPoints;
        bgColor = tier.color;
        customLabel = `${points}`;
        break;
      }
    }
  }

  // Ensure progress does not exceed 100% if points exceed maxPoints
  const progress = Math.min((points / maxPoints) * 100, 100);

  return (
    <div style={{ textAlign: "center" }}>
      <h6>Loyalty Points</h6>
      <p>Tier: {`${currentTier} - ${discount}% Discount`}</p>

      <ProgressBar
        completed={progress} // Use calculated progress here
        maxCompleted={100} // Ensure progress is capped at 100%
        customLabel={customLabel} // Show points value or "LOYAL" in the label
        customLabelStyles={{
          color: "black",
          fontSize: "14px",
        }}
        bgColor={bgColor} // Set background color based on the tier or "LOYAL"
        height="25px"
        baseBgColor="#e0e0e0"
        width="100%"
      />
    </div>
  );
};

export default LoyaltyProgressBar;
