import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PromotionForm from '../components/PromotionForm'
import './AddPromotionPage.css'

function AddPromotionPage() {
  const navigate = useNavigate()
  const [promotionType, setPromotionType] = useState('welcome_bonus')

  const promotionTypes = [
    {
      id: 'welcome_bonus',
      name: 'Welcome Bonus',
      description: 'Bonus for new users',
      icon: '🎁',
      color: '#4ade80'
    },
    {
      id: 'cashback',
      name: 'Cashback',
      description: 'Return percentage of losses',
      icon: '💰',
      color: '#3b82f6'
    },
    {
      id: 'weekend_bonus',
      name: 'Weekend Bonus',
      description: 'Special weekend promotions',
      icon: '🎉',
      color: '#f59e0b'
    },
    {
      id: 'deposit_bonus',
      name: 'Deposit Bonus',
      description: 'Bonus on deposits',
      icon: '💳',
      color: '#8b5cf6'
    },
    {
      id: 'referral_bonus',
      name: 'Referral Bonus',
      description: 'Reward for referring friends',
      icon: '👥',
      color: '#ef4444'
    }
  ]

  const handleSubmit = (response) => {
    console.log('Promotion created successfully:', response)
    alert('Promotion created successfully!')
    navigate('/')
  }

  return (
    <div className="add-promotion-page">
      <div className="page-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/')}
        >
          ← Back to Promotions
        </button>
        <h2>Add New Promotion</h2>
        <p>Choose a promotion type and configure the settings</p>
      </div>

      <div className="promotion-type-selector">
        <h3>Select Promotion Type</h3>
        <div className="type-grid">
          {promotionTypes.map(type => (
            <div
              key={type.id}
              className={`type-card ${promotionType === type.id ? 'selected' : ''}`}
              onClick={() => setPromotionType(type.id)}
              style={{ '--card-color': type.color }}
            >
              <div className="type-icon">{type.icon}</div>
              <div className="type-info">
                <h4>{type.name}</h4>
                <p>{type.description}</p>
              </div>
              <div className="type-indicator">
                {promotionType === type.id && <span>✓</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-container">
        <PromotionForm
          type={promotionType}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}

export default AddPromotionPage
