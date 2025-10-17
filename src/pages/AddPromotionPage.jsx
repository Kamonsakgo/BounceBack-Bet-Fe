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
      name: 'โบนัสต้อนรับ',
      description: 'โบนัสสำหรับผู้ใช้ใหม่',
      icon: '🎁',
      color: '#4ade80'
    },
    {
      id: 'cashback',
      name: 'คืนเงิน',
      description: 'คืนเปอร์เซ็นต์ของเงินที่เสีย',
      icon: '💰',
      color: '#3b82f6'
    },
    {
      id: 'weekend_bonus',
      name: 'โบนัสสุดสัปดาห์',
      description: 'โปรโมชั่นพิเศษวันหยุด',
      icon: '🎉',
      color: '#f59e0b'
    },
    {
      id: 'deposit_bonus',
      name: 'โบนัสฝากเงิน',
      description: 'โบนัสจากการฝากเงิน',
      icon: '💳',
      color: '#8b5cf6'
    },
    {
      id: 'referral_bonus',
      name: 'โบนัสแนะนำเพื่อน',
      description: 'รางวัลจากการแนะนำเพื่อน',
      icon: '👥',
      color: '#ef4444'
    },
    {
      id: 'lose_all_refund',
      name: 'แพ้ทุกคู่คืนเงิน',
      description: 'คืนเงินเมื่อแพ้ทุกคู่เดิมพัน',
      icon: '🔄',
      color: '#10b981'
    }
  ]

  const handleSubmit = (response) => {
    console.log('Promotion created successfully:', response)
    alert('สร้างโปรโมชั่นสำเร็จ!')
    navigate('/')
  }

  return (
    <div className="add-promotion-page">
      <div className="page-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/')}
        >
          ← กลับไปยังโปรโมชั่น
        </button>
        <h2>เพิ่มโปรโมชั่นใหม่</h2>
        <p>เลือกประเภทโปรโมชั่นและกำหนดการตั้งค่า</p>
      </div>

      <div className="promotion-type-selector">
        <h3>เลือกประเภทโปรโมชั่น</h3>
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
