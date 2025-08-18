import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminLayout from "./components/AdminLayout";
import { ProtectedRoute, EmpProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/admin/Login";
import MenuManagement from "./pages/admin/MenuManagement";
import Orders from "./pages/admin/Orders";
import LoyaltyPoints from "./pages/admin/LoyaltyPoints";
import POS from "./pages/pos/POS";
import Confirmation from "./pages/pos/Confirmation";
import DropdownsManagement from "./pages/admin/DropdownsManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Emplogin from "./Salespos/Emplogin";
import EmpRegister from "./pages/admin/EmpRegister";
import EmpPos from "./Salespos/EmpPos";
import EmpManage from "./pages/admin/EmpManage";
import Discount from "./pages/admin/Discount";
import Choice from "./pages/pos/Choice";
import PayChoice from "./pages/pos/PayChoice";
import { OrderProvider } from "./pages/pos/OrderContext";

const App: React.FC = () => {
  return (
    <OrderProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Outlet />
                </AdminLayout>
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="orders" element={<Orders />} />
            <Route path="loyalty" element={<LoyaltyPoints />} />
            <Route path="dropdowns" element={<DropdownsManagement />} />
            <Route path="register" element={<EmpRegister />} />
            <Route path="manage" element={<EmpManage />} />
            <Route path="discount" element={<Discount />} />
          </Route>

          {/* POS Routes */}
          <Route path="/pos" element={<POS />} />
          <Route path="/pos/confirmation/:orderId" element={<Confirmation />} />
          {/* Salespos Routes */}
          <Route path="/login" element={<Emplogin />} />
          {/* Protecting /Sales route with EmpProtectedRoute */}
          <Route
            path="/Sales"
            element={
              <EmpProtectedRoute>
                <EmpPos />
              </EmpProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/pos" element={<POS />} />
          <Route path="/" element={<Choice />} />
          <Route path="/pay" element={<PayChoice />} />
        </Routes>
      </Router>
    </OrderProvider>
  );
};

export default App;
