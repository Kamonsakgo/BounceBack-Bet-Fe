import { API_CONFIG, getApiUrl } from '../config/api'

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Get all promotions
  async getPromotions() {
    try {
      const response = await this.request(API_CONFIG.ENDPOINTS.PROMOTIONS)
      return response
    } catch (error) {
      console.error('Failed to fetch promotions:', error)
      throw error
    }
  }

  // Get single promotion by ID
  async getPromotion(id) {
    try {
      const response = await this.request(`/api/promotions/${id}`)
      return response
    } catch (error) {
      console.error(`Failed to fetch promotion ${id}:`, error)
      throw error
    }
  }

  // Create new promotion
  async createPromotion(promotionData) {
    try {
      const response = await this.request(API_CONFIG.ENDPOINTS.PROMOTIONS, {
        method: 'POST',
        body: JSON.stringify(promotionData),
      })
      return response
    } catch (error) {
      console.error('Failed to create promotion:', error)
      throw error
    }
  }

  // Update promotion
  async updatePromotion(id, promotionData) {
    try {
      const response = await this.request(`/api/promotions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(promotionData),
      })
      return response
    } catch (error) {
      console.error(`Failed to update promotion ${id}:`, error)
      throw error
    }
  }

  // Delete promotion
  async deletePromotion(id) {
    try {
      const response = await this.request(`/api/promotions/${id}`, {
        method: 'DELETE',
      })
      return response
    } catch (error) {
      console.error(`Failed to delete promotion ${id}:`, error)
      throw error
    }
  }

  // Test promotion evaluation
  async testPromotion(testData) {
    try {
      const response = await this.request('/api/promotion/evaluate', {
        method: 'POST',
        body: JSON.stringify(testData),
      })
      return response
    } catch (error) {
      console.error('Failed to test promotion:', error)
      throw error
    }
  }

  // Get all promotion payouts
  async getPromotionPayouts(userId = null) {
    try {
      let endpoint = API_CONFIG.ENDPOINTS.PROMOTION_PAYOUTS
      if (userId) {
        endpoint += `?user_id=${userId}`
      }
      const response = await this.request(endpoint)
      return response
    } catch (error) {
      console.error('Failed to fetch promotion payouts:', error)
      throw error
    }
  }

  // Get promotion payouts by promotion ID
  async getPromotionPayoutsByPromotion(promotionId, userId = null) {
    try {
      let endpoint = `${API_CONFIG.ENDPOINTS.PROMOTION_PAYOUTS}/promotion/${promotionId}`
      if (userId) {
        endpoint += `?user_id=${userId}`
      }
      const response = await this.request(endpoint)
      return response
    } catch (error) {
      console.error(`Failed to fetch payouts for promotion ${promotionId}:`, error)
      throw error
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService()
export default apiService
