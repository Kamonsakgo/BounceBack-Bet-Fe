import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './PromotionCard.css'

function PromotionCard({ promotion, formatDate, formatCurrency, getStatusBadge }) {
  const [isExpanded, setIsExpanded] = useState(false)
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
              {maxRefund ? <span>เงินคืนสูงสุด: {maxRefund}</span> : null}
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
            onClick={handleView}
            title="ดูรายละเอียด"
          >
            👁️
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

            {(() => {
              const settings = parseSettings(promotion.settings)
              return settings?.betting_types && settings.betting_types.length > 0
            })() && (
              <div className="info-section">
                <h4>ประเภทกีฬา</h4>
                <div className="betting-types-display">
                  {(() => {
                    const settings = parseSettings(promotion.settings)
                    const order = { 'all': 0, 'football': 1, 'boxing': 2 }
                    const types = (settings.betting_types || []).slice().sort((a, b) => (order[a] ?? 99) - (order[b] ?? 99))
                    return types.map(type => {
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
                    })
                  })()}
                </div>
              </div>
            )}

            {(() => {
              const settings = parseSettings(promotion.settings)
              return settings?.market_types && settings.market_types.length > 0
            })() && (
              <div className="info-section">
                <h4>ประเภทการเดิมพัน</h4>
                <div className="betting-types-display">
                  {(() => {
                    const settings = parseSettings(promotion.settings)
                    const order = { 'all': 0, 'handicap': 1, 'over_under': 2, '1x2': 3 }
                    const labels = { 'all': 'ทั้งหมด', 'handicap': 'แฮนดิแคป', 'over_under': 'สูง/ต่ำ', '1x2': '1X2' }
                    const types = (settings.market_types || []).slice().sort((a, b) => (order[a] ?? 99) - (order[b] ?? 99))
                    return types.map(mt => (
                      <span key={mt} className="betting-type-tag">
                        {labels[mt] || mt}
                      </span>
                    ))
                  })()}
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
