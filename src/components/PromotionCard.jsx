import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './PromotionCard.css'

function PromotionCard({ promotion, formatDate, formatCurrency, getStatusBadge }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const navigate = useNavigate()

  const handleEdit = () => {
    navigate(`/edit-promotion/${promotion.id}`)
  }

  const getSettingsInfo = (settings, promotionType) => {
    if (!settings) return "ไม่มีข้อมูลการตั้งค่า"
    
    switch (promotionType) {
      case 'welcome_bonus':
        return `โบนัสต้อนรับ: ${settings.bonus_percentage}%`
      case 'cashback':
        return `คืนเงิน: ${settings.cashback_percentage}%`
      case 'weekend_bonus':
        return `โบนัสสุดสัปดาห์: ${settings.bonus_multiplier}x ตัวคูณ`
      case 'lose_all_refund':
        if (settings.tiers && settings.tiers.length > 0) {
          const tierTexts = settings.tiers.map(tier => 
            `${tier.pairs} คู่ = ${tier.multiplier}x`
          ).join(', ')
          return `แพ้ทุกคู่คืนเงิน: ${tierTexts}`
        }
        return `แพ้ทุกคู่คืนเงิน: เสีย ${settings.required_loss_pairs || 0} คู่ ได้คืน ${settings.refund_amount || 0} บาท`
      default:
        return `ประเภท: ${promotionType}`
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
            className="edit-btn"
            onClick={handleEdit}
            title="แก้ไขโปรโมชั่น"
          >
            ✏️
          </button>
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
            <span className="label">ความสำคัญ:</span>
            <span 
              className="priority-badge"
              style={{ backgroundColor: getPriorityColor(promotion.priority) }}
            >
              {promotion.priority}
            </span>
          </div>
          <div className="info-row">
            <span className="label">รวมกันได้:</span>
            <span className={`stackable-badge ${promotion.is_stackable ? 'yes' : 'no'}`}>
              {promotion.is_stackable ? 'ใช่' : 'ไม่'}
            </span>
          </div>
          <div className="info-row">
            <span className="label">ระยะเวลา:</span>
            <span className="period">
              {formatDate(promotion.starts_at)} - {formatDate(promotion.ends_at)}
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="expanded-info">
            <div className="info-section">
              <h4>ขีดจำกัดผู้ใช้</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">รวมต่อผู้ใช้:</span>
                  <span>{promotion.user_limit_total || 'ไม่จำกัด'}</span>
                </div>
                <div className="info-item">
                  <span className="label">ต่อวันต่อผู้ใช้:</span>
                  <span>{promotion.user_limit_per_day || 'ไม่จำกัด'}</span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h4>ขีดจำกัดรวม</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">โควต้าทั้งหมด:</span>
                  <span>{promotion.global_quota?.toLocaleString() || 'ไม่จำกัด'}</span>
                </div>
                <div className="info-item">
                  <span className="label">งบประมาณรวม:</span>
                  <span>{promotion.global_budget ? formatCurrency(promotion.global_budget) : 'ไม่จำกัด'}</span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h4>ขีดจำกัดการจ่าย</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">สูงสุดต่อบิล:</span>
                  <span>{promotion.max_payout_per_bill ? formatCurrency(promotion.max_payout_per_bill) : 'ไม่จำกัด'}</span>
                </div>
                <div className="info-item">
                  <span className="label">สูงสุดต่อวัน:</span>
                  <span>{promotion.max_payout_per_day ? formatCurrency(promotion.max_payout_per_day) : 'ไม่จำกัด'}</span>
                </div>
                <div className="info-item">
                  <span className="label">สูงสุดต่อผู้ใช้:</span>
                  <span>{promotion.max_payout_per_user ? formatCurrency(promotion.max_payout_per_user) : 'ไม่จำกัด'}</span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h4>การตั้งค่า</h4>
              <div className="settings-info">
                {getSettingsInfo(promotion.settings, promotion.type)}
              </div>
            </div>

            {promotion.settings?.betting_types && promotion.settings.betting_types.length > 0 && (
              <div className="info-section">
                <h4>ประเภทการเดิมพัน</h4>
                <div className="betting-types-display">
                  {promotion.settings.betting_types.map(type => {
                    const typeInfo = {
                      'football': '⚽ ฟุตบอล',
                      'boxing': '🥊 มวย',
                      'all': '🎯 ทั้งหมด'
                    }
                    return (
                      <span key={type} className="betting-type-tag">
                        {typeInfo[type] || type}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="info-section">
              <h4>เวลาสร้างและแก้ไข</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">สร้างเมื่อ:</span>
                  <span>{formatDate(promotion.created_at)}</span>
                </div>
                <div className="info-item">
                  <span className="label">แก้ไขเมื่อ:</span>
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
