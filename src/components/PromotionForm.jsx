import { useState } from 'react'
import apiService from '../services/api'
import './PromotionForm.css'

function PromotionForm({ type, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    is_active: 1,
    starts_at: '',
    ends_at: '',
    priority: 100,
    is_stackable: 0,
    user_limit_total: '',
    user_limit_per_day: '',
    global_quota: '',
    global_budget: '',
    max_payout_per_bill: '',
    max_payout_per_day: '',
    max_payout_per_user: '',
    settings: {}
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSettingsChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Promotion name is required'
    }
    
    if (!formData.starts_at) {
      newErrors.starts_at = 'Start date is required'
    }
    
    if (!formData.ends_at) {
      newErrors.ends_at = 'End date is required'
    }
    
    if (formData.starts_at && formData.ends_at && new Date(formData.starts_at) >= new Date(formData.ends_at)) {
      newErrors.ends_at = 'End date must be after start date'
    }
    
    if (formData.priority < 1 || formData.priority > 100) {
      newErrors.priority = 'Priority must be between 1 and 100'
    }

    // Type-specific validation
    if (type === 'welcome_bonus' && (!formData.settings.bonus_percentage || formData.settings.bonus_percentage < 1)) {
      newErrors.bonus_percentage = 'Bonus percentage is required and must be at least 1%'
    }
    
    if (type === 'cashback' && (!formData.settings.cashback_percentage || formData.settings.cashback_percentage < 1)) {
      newErrors.cashback_percentage = 'Cashback percentage is required and must be at least 1%'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const submitData = {
        ...formData,
        settings: {
          ...formData.settings,
          type: type
        }
      }

      // Convert empty strings to null for optional fields
      const cleanedData = Object.fromEntries(
        Object.entries(submitData).map(([key, value]) => [
          key,
          value === '' ? null : value
        ])
      )

      const response = await apiService.createPromotion(cleanedData)
      console.log('Promotion created successfully:', response)
      
      // Call the parent onSubmit callback
      onSubmit(response)
    } catch (error) {
      console.error('Failed to create promotion:', error)
      setErrors({ 
        submit: 'Failed to create promotion. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTypeSpecificFields = () => {
    switch (type) {
      case 'welcome_bonus':
        return (
          <div className="form-section">
            <h3>Welcome Bonus Settings</h3>
            <div className="form-group">
              <label htmlFor="bonus_percentage">Bonus Percentage (%)</label>
              <input
                type="number"
                id="bonus_percentage"
                min="1"
                max="1000"
                value={formData.settings.bonus_percentage || ''}
                onChange={(e) => handleSettingsChange('bonus_percentage', parseInt(e.target.value))}
                className={errors.bonus_percentage ? 'error' : ''}
              />
              {errors.bonus_percentage && <span className="error-text">{errors.bonus_percentage}</span>}
            </div>
          </div>
        )
      
      case 'cashback':
        return (
          <div className="form-section">
            <h3>Cashback Settings</h3>
            <div className="form-group">
              <label htmlFor="cashback_percentage">Cashback Percentage (%)</label>
              <input
                type="number"
                id="cashback_percentage"
                min="1"
                max="100"
                value={formData.settings.cashback_percentage || ''}
                onChange={(e) => handleSettingsChange('cashback_percentage', parseInt(e.target.value))}
                className={errors.cashback_percentage ? 'error' : ''}
              />
              {errors.cashback_percentage && <span className="error-text">{errors.cashback_percentage}</span>}
            </div>
          </div>
        )
      
      case 'weekend_bonus':
        return (
          <div className="form-section">
            <h3>Weekend Bonus Settings</h3>
            <div className="form-group">
              <label htmlFor="bonus_multiplier">Bonus Multiplier</label>
              <input
                type="number"
                id="bonus_multiplier"
                min="1"
                max="10"
                step="0.1"
                value={formData.settings.bonus_multiplier || ''}
                onChange={(e) => handleSettingsChange('bonus_multiplier', parseFloat(e.target.value))}
              />
            </div>
          </div>
        )
      
      case 'deposit_bonus':
        return (
          <div className="form-section">
            <h3>Deposit Bonus Settings</h3>
            <div className="form-group">
              <label htmlFor="deposit_bonus_percentage">Deposit Bonus Percentage (%)</label>
              <input
                type="number"
                id="deposit_bonus_percentage"
                min="1"
                max="500"
                value={formData.settings.deposit_bonus_percentage || ''}
                onChange={(e) => handleSettingsChange('deposit_bonus_percentage', parseInt(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="min_deposit">Minimum Deposit Amount</label>
              <input
                type="number"
                id="min_deposit"
                min="0"
                value={formData.settings.min_deposit || ''}
                onChange={(e) => handleSettingsChange('min_deposit', parseFloat(e.target.value))}
              />
            </div>
          </div>
        )
      
      case 'referral_bonus':
        return (
          <div className="form-section">
            <h3>Referral Bonus Settings</h3>
            <div className="form-group">
              <label htmlFor="referral_bonus_amount">Referral Bonus Amount</label>
              <input
                type="number"
                id="referral_bonus_amount"
                min="0"
                value={formData.settings.referral_bonus_amount || ''}
                onChange={(e) => handleSettingsChange('referral_bonus_amount', parseFloat(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="referee_bonus_amount">Referee Bonus Amount</label>
              <input
                type="number"
                id="referee_bonus_amount"
                min="0"
                value={formData.settings.referee_bonus_amount || ''}
                onChange={(e) => handleSettingsChange('referee_bonus_amount', parseFloat(e.target.value))}
              />
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="promotion-form">
      <div className="form-section">
        <h3>Basic Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Promotion Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? 'error' : ''}
              placeholder="Enter promotion name"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="priority">Priority (1-100)</label>
            <input
              type="number"
              id="priority"
              name="priority"
              min="1"
              max="100"
              value={formData.priority}
              onChange={handleInputChange}
              className={errors.priority ? 'error' : ''}
            />
            {errors.priority && <span className="error-text">{errors.priority}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="starts_at">Start Date *</label>
            <input
              type="datetime-local"
              id="starts_at"
              name="starts_at"
              value={formData.starts_at}
              onChange={handleInputChange}
              className={errors.starts_at ? 'error' : ''}
            />
            {errors.starts_at && <span className="error-text">{errors.starts_at}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="ends_at">End Date *</label>
            <input
              type="datetime-local"
              id="ends_at"
              name="ends_at"
              value={formData.ends_at}
              onChange={handleInputChange}
              className={errors.ends_at ? 'error' : ''}
            />
            {errors.ends_at && <span className="error-text">{errors.ends_at}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
              />
              <span className="checkbox-text">Active</span>
            </label>
          </div>
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_stackable"
                checked={formData.is_stackable}
                onChange={handleInputChange}
              />
              <span className="checkbox-text">Stackable with other promotions</span>
            </label>
          </div>
        </div>
      </div>

      {getTypeSpecificFields()}

      <div className="form-section">
        <h3>User Limits</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="user_limit_total">Total Uses per User</label>
            <input
              type="number"
              id="user_limit_total"
              name="user_limit_total"
              min="0"
              value={formData.user_limit_total}
              onChange={handleInputChange}
              placeholder="Leave empty for unlimited"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="user_limit_per_day">Uses per Day per User</label>
            <input
              type="number"
              id="user_limit_per_day"
              name="user_limit_per_day"
              min="0"
              value={formData.user_limit_per_day}
              onChange={handleInputChange}
              placeholder="Leave empty for unlimited"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Global Limits</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="global_quota">Global Quota</label>
            <input
              type="number"
              id="global_quota"
              name="global_quota"
              min="0"
              value={formData.global_quota}
              onChange={handleInputChange}
              placeholder="Leave empty for unlimited"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="global_budget">Global Budget (THB)</label>
            <input
              type="number"
              id="global_budget"
              name="global_budget"
              min="0"
              step="0.01"
              value={formData.global_budget}
              onChange={handleInputChange}
              placeholder="Leave empty for unlimited"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Payout Limits</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="max_payout_per_bill">Max Payout per Bill (THB)</label>
            <input
              type="number"
              id="max_payout_per_bill"
              name="max_payout_per_bill"
              min="0"
              step="0.01"
              value={formData.max_payout_per_bill}
              onChange={handleInputChange}
              placeholder="Leave empty for unlimited"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="max_payout_per_day">Max Payout per Day (THB)</label>
            <input
              type="number"
              id="max_payout_per_day"
              name="max_payout_per_day"
              min="0"
              step="0.01"
              value={formData.max_payout_per_day}
              onChange={handleInputChange}
              placeholder="Leave empty for unlimited"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="max_payout_per_user">Max Payout per User (THB)</label>
            <input
              type="number"
              id="max_payout_per_user"
              name="max_payout_per_user"
              min="0"
              step="0.01"
              value={formData.max_payout_per_user}
              onChange={handleInputChange}
              placeholder="Leave empty for unlimited"
            />
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="error-message">
          <span className="error-text">{errors.submit}</span>
        </div>
      )}

      <div className="form-actions">
        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Promotion'}
        </button>
        <button 
          type="button" 
          className="cancel-btn" 
          onClick={() => window.history.back()}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default PromotionForm
