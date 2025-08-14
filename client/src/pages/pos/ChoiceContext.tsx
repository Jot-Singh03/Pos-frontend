import React, { createContext, useState, useContext, ReactNode } from "react";

export type ChoiceType = "dine-in" | "takeaway" | "";

interface ChoiceContextProps {
  choice: ChoiceType;
  setChoice: React.Dispatch<React.SetStateAction<ChoiceType>>;
}

const ChoiceContext = createContext<ChoiceContextProps>({
  choice: "",
  setChoice: () => {},
});

interface ChoiceProviderProps {
  children: ReactNode;
}

export const ChoiceProvider: React.FC<ChoiceProviderProps> = ({ children }) => {
  const [choice, setChoice] = useState<ChoiceType>("");

  return (
    <ChoiceContext.Provider value={{ choice, setChoice }}>
      {children}
    </ChoiceContext.Provider>
  );
};

export const useChoice = () => useContext(ChoiceContext);
