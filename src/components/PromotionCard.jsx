import { useState } from 'react'
import './PromotionCard.css'

function PromotionCard({ promotion, formatDate, formatCurrency, getStatusBadge }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getSettingsInfo = (settings) => {
    if (!settings) return "No settings"
    
    const type = settings.type || 'unknown'
    switch (type) {
      case 'welcome_bonus':
        return `Welcome Bonus: ${settings.bonus_percentage}%`
      case 'cashback':
        return `Cashback: ${settings.cashback_percentage}%`
      case 'weekend_bonus':
        return `Weekend Bonus: ${settings.bonus_multiplier}x multiplier`
      default:
        return `Type: ${type}`
    }
  }

  const getPriorityColor = (priority) => {
    if (priority >= 90) return '#ff6b6b'
    if (priority >= 70) return '#ffa726'
    return '#4ade80'
  }

  return (
    <div className="promotion-card">
      <div className="card-header">
        <div className="card-title">
          <h3>{promotion.name}</h3>
          {getStatusBadge(promotion.is_active)}
        </div>
        <div className="card-actions">
          <button 
            className="expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
      </div>

      <div className="card-content">
        <div className="basic-info">
          <div className="info-row">
            <span className="label">Priority:</span>
            <span 
              className="priority-badge"
              style={{ backgroundColor: getPriorityColor(promotion.priority) }}
            >
              {promotion.priority}
            </span>
          </div>
          <div className="info-row">
            <span className="label">Stackable:</span>
            <span className={`stackable-badge ${promotion.is_stackable ? 'yes' : 'no'}`}>
              {promotion.is_stackable ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="info-row">
            <span className="label">Period:</span>
            <span className="period">
              {formatDate(promotion.starts_at)} - {formatDate(promotion.ends_at)}
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="expanded-info">
            <div className="info-section">
              <h4>User Limits</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Total per user:</span>
                  <span>{promotion.user_limit_total || 'Unlimited'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Per day per user:</span>
                  <span>{promotion.user_limit_per_day || 'Unlimited'}</span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h4>Global Limits</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Global quota:</span>
                  <span>{promotion.global_quota?.toLocaleString() || 'Unlimited'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Global budget:</span>
                  <span>{promotion.global_budget ? formatCurrency(promotion.global_budget) : 'Unlimited'}</span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h4>Payout Limits</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Max per bill:</span>
                  <span>{promotion.max_payout_per_bill ? formatCurrency(promotion.max_payout_per_bill) : 'Unlimited'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Max per day:</span>
                  <span>{promotion.max_payout_per_day ? formatCurrency(promotion.max_payout_per_day) : 'Unlimited'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Max per user:</span>
                  <span>{promotion.max_payout_per_user ? formatCurrency(promotion.max_payout_per_user) : 'Unlimited'}</span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h4>Settings</h4>
              <div className="settings-info">
                {getSettingsInfo(promotion.settings)}
              </div>
            </div>

            <div className="info-section">
              <h4>Timestamps</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Created:</span>
                  <span>{formatDate(promotion.created_at)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Updated:</span>
                  <span>{formatDate(promotion.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PromotionCard
