import React, { createContext, useContext, useState } from "react";

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface OrderData {
  items?: OrderItem[];
  totalAmount?: string;
  phoneNumber?: string;
  tableToken?: number | string;
  choice?: string; // Dining In / Takeaway
  payChoice?: string; // Pay Here / Counter
}

interface OrderContextType {
  orderData: OrderData | null;
  setOrderData: React.Dispatch<React.SetStateAction<OrderData | null>>;
  clearOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  // ✅ Add clearOrder implementation
  const clearOrder = () => setOrderData(null);

  return (
    <OrderContext.Provider value={{ orderData, setOrderData, clearOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used inside OrderProvider");
  }
  return context;
};
