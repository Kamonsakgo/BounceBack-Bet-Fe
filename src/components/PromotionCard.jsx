import { useNavigate } from 'react-router-dom'
import './PromotionCard.css'

function PromotionCard({ promotion, formatDate, formatCurrency, getStatusBadge }) {
  const navigate = useNavigate()

  const handleEdit = () => {
    navigate(`/edit-promotion/${promotion.id}`)
  }

  const handleView = () => {
    navigate(`/promotion/${promotion.id}`)
  }

  // Ensure settings is an object (backend may send JSON string)
  const parseSettings = (rawSettings) => {
    if (!rawSettings) return {}
    if (typeof rawSettings === 'string') {
      try {
        return JSON.parse(rawSettings)
      } catch (e) {
        return {}
      }
    }
    return rawSettings
  }

  const getSettingsInfo = (rawSettings, promotionType) => {
    const settings = parseSettings(rawSettings)
    if (!settings) return "ไม่มีข้อมูลการตั้งค่า"

    switch (promotionType) {
      case 'welcome_bonus':
        return `โบนัสต้อนรับ: ${settings.bonus_percentage}%`
      case 'cashback':
        return `คืนเงิน: ${settings.cashback_percentage}%`
      case 'weekend_bonus':
        return `โบนัสสุดสัปดาห์: ${settings.bonus_multiplier}x ตัวคูณ`
      case 'lose_all_refund': {
        const tiers = Array.isArray(settings.tiers) ? [...settings.tiers] : []
        const hasTiers = tiers.length > 0
        const sortedTiers = hasTiers ? tiers.sort((a, b) => (a.pairs || 0) - (b.pairs || 0)) : []
        const minOdds = settings.min_odds
        const minStake = settings.min_stake
        const maxRefund = settings.max_refund_amount

        return (
          <div>
            <div style={{ marginBottom: hasTiers ? 6 : 0 }}>แพ้ทุกคู่คืนเงิน</div>
            {hasTiers ? (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {sortedTiers.map((t, i) => (
                  <li key={i}>
                    {t.pairs} คู่ = {t.multiplier}x
                  </li>
                ))}
              </ul>
            ) : (
              <div>เสีย {settings.required_loss_pairs || 0} คู่ ได้คืน {settings.refund_amount || 0} บาท</div>
            )}
            <div style={{ marginTop: 6, opacity: 0.9, fontSize: '0.9em' }}>
              {minOdds ? <span style={{ marginRight: 12 }}>อัตราต่อรองขั้นต่ำ: {minOdds}</span> : null}
              {minStake ? <span style={{ marginRight: 12 }}>ยอดเดิมพันขั้นต่ำ: {minStake}</span> : null}
            </div>
          </div>
        )
      }
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
        <div className="card-title-section">
          <h3>{promotion.name}</h3>
        </div>
        <div className="card-status-section">
          {getStatusBadge(promotion.is_active)}
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
              onClick={handleView}
              title="ดูรายละเอียด"
            >
              👁️
            </button>
          </div>
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

      </div>
    </div>
  )
}

export default PromotionCard
