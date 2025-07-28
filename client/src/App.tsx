import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/admin/Login';
import MenuManagement from './pages/admin/MenuManagement';
import Orders from './pages/admin/Orders';
import LoyaltyPoints from './pages/admin/LoyaltyPoints';
import POS from './pages/pos/POS';
import Confirmation from './pages/pos/Confirmation';
import DropdownsManagement from './pages/admin/DropdownsManagement';
import AdminDashboard from './pages/admin/AdminDashboard';

const App: React.FC = () => {
  return (
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
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout>
              <Outlet />
            </AdminLayout>
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="orders" element={<Orders />} />
          <Route path="loyalty" element={<LoyaltyPoints />} />
          <Route path="dropdowns" element={<DropdownsManagement />} />
        </Route>

        {/* POS Routes */}
        <Route path="/pos" element={<POS />} />
        <Route path="/pos/confirmation/:orderId" element={<Confirmation />} />

        {/* Default Route */}
        <Route path="/" element={<POS />} />
      </Routes>
    </Router>
  );
};

export default App;
