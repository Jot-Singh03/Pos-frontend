// Auth utility functions for debugging and token management

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('adminData');
};

export const getTokenInfo = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }
  
  try {
    // Decode JWT token (without verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    return null;
  }
};

export const isTokenValid = () => {
  const tokenInfo = getTokenInfo();
  if (!tokenInfo) return false;
  
  const now = Math.floor(Date.now() / 1000);
  const isValid = tokenInfo.exp > now;
  
  if (!isValid) {
    clearAuthData();
  }
  
  return isValid;
};

export const getAuthToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  if (!isTokenValid()) {
    return null;
  }
  
  return token;
};

export const debugAuth = () => {
  // Debug function kept for future use but without console logs
  const token = localStorage.getItem('token');
  const tokenInfo = getTokenInfo();
  const isValid = isTokenValid();
  return { token, tokenInfo, isValid };
};

export const logout = () => {
  clearAuthData();
}; 