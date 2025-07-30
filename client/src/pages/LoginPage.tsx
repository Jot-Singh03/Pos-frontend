import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import theme from '../styles/theme';
import api, { ApiResponse } from '../services/api';

interface LoginResponse {
  token: string;
  data: {
    id: string;
    email: string;
  };
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await api.post<ApiResponse<LoginResponse>>('/admin/login', {
        email,
        password
      });

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        toast.success('Login successful!');
        navigate('/admin');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: theme.colors.background
    }}>
      <form onSubmit={handleSubmit} style={{
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.lg,
        boxShadow: theme.shadows.md,
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ marginBottom: theme.spacing.lg }}>Admin Login</h1>
        <div style={{ marginBottom: theme.spacing.md }}>
          <label style={{ display: 'block', marginBottom: theme.spacing.xs }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.gray[300]}`,
              fontSize: theme.fontSizes.base
            }}
            required
            disabled={loading}
          />
        </div>
        <div style={{ marginBottom: theme.spacing.lg }}>
          <label style={{ display: 'block', marginBottom: theme.spacing.xs }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.gray[300]}`,
              fontSize: theme.fontSizes.base
            }}
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: theme.spacing.sm,
            backgroundColor: loading ? theme.colors.gray[400] : theme.colors.primary,
            color: theme.colors.white,
            border: 'none',
            borderRadius: theme.borderRadius.md,
            fontSize: theme.fontSizes.base,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage; 