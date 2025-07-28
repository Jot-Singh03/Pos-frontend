import React, { useState, useEffect } from 'react';
import theme from '../../styles/theme';
import api, { ApiResponse } from '../../services/api';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalMenuItems: number;
  totalLoyaltyCustomers: number;
}

const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalMenuItems: 0,
    totalLoyaltyCustomers: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch orders
      const ordersResponse = await api.get<ApiResponse<any[]>>('/orders');
      const orders = ordersResponse.data.success ? ordersResponse.data.data : [];
      
      // Fetch menu items
      const menuResponse = await api.get<ApiResponse<any[]>>('/menu');
      const menuItems = menuResponse.data.success ? menuResponse.data.data : [];
      
      // Fetch loyalty customers
      const loyaltyResponse = await api.get<ApiResponse<any[]>>('/loyalty');
      const loyaltyCustomers = loyaltyResponse.data.success ? loyaltyResponse.data.data : [];

      // Calculate total revenue
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalMenuItems: menuItems.length,
        totalLoyaltyCustomers: loyaltyCustomers.length
      });
    } catch (error) {
      // Handle error silently for dashboard stats
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: theme.spacing.xl }}>Dashboard</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: theme.spacing.lg
      }}>
        {/* Orders Card */}
        <div style={{
          backgroundColor: theme.colors.white,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.shadows.sm
        }}>
          <h3 style={{ marginBottom: theme.spacing.sm }}>Total Orders</h3>
          <p style={{
            fontSize: theme.fontSizes['2xl'],
            fontWeight: 'bold',
            color: theme.colors.primary
          }}>
            {stats.totalOrders}
          </p>
        </div>

        {/* Revenue Card */}
        <div style={{
          backgroundColor: theme.colors.white,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.shadows.sm
        }}>
          <h3 style={{ marginBottom: theme.spacing.sm }}>Total Revenue</h3>
          <p style={{
            fontSize: theme.fontSizes['2xl'],
            fontWeight: 'bold',
            color: theme.colors.success
          }}>
            ${stats.totalRevenue.toFixed(2)}
          </p>
        </div>

        {/* Menu Items Card */}
        <div style={{
          backgroundColor: theme.colors.white,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.shadows.sm
        }}>
          <h3 style={{ marginBottom: theme.spacing.sm }}>Menu Items</h3>
          <p style={{
            fontSize: theme.fontSizes['2xl'],
            fontWeight: 'bold',
            color: theme.colors.secondary
          }}>
            {stats.totalMenuItems}
          </p>
        </div>

        {/* Loyalty Customers Card */}
        <div style={{
          backgroundColor: theme.colors.white,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.shadows.sm
        }}>
          <h3 style={{ marginBottom: theme.spacing.sm }}>Loyalty Customers</h3>
          <p style={{
            fontSize: theme.fontSizes['2xl'],
            fontWeight: 'bold',
            color: theme.colors.warning
          }}>
            {stats.totalLoyaltyCustomers}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 