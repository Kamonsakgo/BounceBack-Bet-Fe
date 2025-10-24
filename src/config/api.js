// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  ENDPOINTS: {
    PROMOTIONS: '/api/promotions',
    PROMOTION_TEST: '/api/promotions/test',
    PROMOTION_PAYOUTS: '/api/promotion-payouts'
  }
}

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}
