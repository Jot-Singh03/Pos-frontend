import React, { useEffect, useState } from "react";
import ProgressBar from "@ramonak/react-progress-bar";
import api, { ApiResponse } from "../services/api";

interface Level {
  name: string;
  minPoints: number;
  maxPoints: number;
  discount: number;
  color: string;
}

interface LoyaltyBarProps {
  points?: number | null; // Make points optional
  onDiscountChange?: (discount: number) => void; // Callback to send discount percentage
}

const LoyaltyBar: React.FC<LoyaltyBarProps> = ({
  points,
  onDiscountChange,
}) => {
  const [levels, setLevels] = useState<Level[]>([]); // State to store the fetched levels
  const [loading, setLoading] = useState<boolean>(true); // State to track loading status
  const [error, setError] = useState<string | null>(null); // State for handling errors

  // Fetch levels from the backend
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await api.get<ApiResponse<Level[]>>("/discounts");
        if (response.data && Array.isArray(response.data)) {
          setLevels(response.data); // Directly set the levels array
        } else {
          setError("No discounts available.");
        }
      } catch (err) {
        setError("Failed to load discounts. Please try again.");
      } finally {
        setLoading(false); // Mark loading as false when the request is complete
      }
    };

    fetchLevels();
  }, []); // Empty dependency array means this runs once when the component mounts

  // If levels are still loading or there's an error, show loading or error message
  if (loading) {
    return (
      <div style={{ textAlign: "center" }}>
        <p>Loading levels...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", color: "red" }}>
        <p>{error}</p>
      </div>
    );
  }

  // If points are 0, null, or undefined, show a message instead of the progress bar
  if (points == null || points === 0) {
    return (
      <div style={{ textAlign: "center" }}>
        <p></p>
      </div>
    );
  }

  // If no levels were fetched, show a message
  if (levels.length === 0) {
    return (
      <div style={{ textAlign: "center" }}>
        <p>No discounts available.</p>
      </div>
    );
  }

  // Variables to store the values we need for the progress bar
  let currentLevel = "";
  let discount = 0;
  let maxPoints = 0;
  let bgColor = "";
  let customLabel = `${points}`;

  // Loop through levels and find the correct level based on points
  for (let level of levels) {
    if (points >= level.minPoints && points <= level.maxPoints) {
      currentLevel = level.name;
      discount = level.discount;
      maxPoints = level.maxPoints;
      bgColor = level.color;
      customLabel = `${points}`;
      break;
    }
  }

  // Ensure progress does not exceed 100% if points exceed maxPoints
  const progress = Math.min((points / maxPoints) * 100, 100);

   if (onDiscountChange) {
     onDiscountChange(discount);
   }

  return (
    <div style={{ textAlign: "center" }}>
      <p>Level: {`${currentLevel} - ${discount}% Discount`}</p>

      <ProgressBar
        completed={progress} // Use calculated progress here
        maxCompleted={100} // Ensure progress is capped at 100%
        customLabel={customLabel} // Show points value or "LOYAL" in the label
        customLabelStyles={{
          color: "black",
          fontSize: "14px",
        }}
        bgColor={bgColor} // Set background color based on the Level
        height="20px"
        baseBgColor="#e0e0e0"
        width="100%"
      />
    </div>
  );
};

export default LoyaltyBar;
