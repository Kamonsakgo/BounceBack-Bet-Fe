import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiService from '../services/api'
import './PromotionDetailPage.css'

function PromotionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const parseSettings = (raw) => {
    if (!raw) return {}
    if (typeof raw === 'string') {
      try { return JSON.parse(raw) } catch { return {} }
    }
    return raw
  }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await apiService.getPromotion(id)
        setData(res)
      } catch (e) {
        setError('ไม่สามารถโหลดข้อมูลโปรโมชั่นได้')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="promotion-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>กำลังโหลดข้อมูลโปรโมชั่น...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="promotion-detail-page">
        <div className="error-container">
          <h2>เกิดข้อผิดพลาด</h2>
          <p>{error || 'ไม่พบข้อมูลโปรโมชั่น'}</p>
          <button onClick={() => navigate('/')} className="retry-btn">กลับหน้าแรก</button>
        </div>
      </div>
    )
  }

  const settings = parseSettings(data.settings)
  const tiers = Array.isArray(settings.tiers) ? [...settings.tiers].sort((a,b) => (a.pairs||0)-(b.pairs||0)) : []
  const betTypes = settings.betting_types || []
  const marketTypes = settings.market_types || []

  const fmtDate = (d) => d ? new Date(d).toLocaleString('th-TH') : '—'

  const currency = (v) => v == null ? 'ไม่จำกัด' : new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(v)

  return (
    <div className="promotion-detail-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>← กลับ</button>
        <div>
          <h2>รายละเอียดโปรโมชั่น: {data.name}</h2>
          <p>ดูข้อมูลทั้งหมดในหน้าเดียว</p>
        </div>
      </div>

      <div className="form-container">
        <div className="promotion-form">
          <div className="form-section">
            <h3>ข้อมูลพื้นฐาน</h3>
            <div className="info-grid">
              <div className="info-item"><strong>ID</strong><div>{data.id}</div></div>
              <div className="info-item"><strong>ประเภท</strong><div>{data.type}</div></div>
              <div className="info-item"><strong>สถานะ</strong><div>{data.is_active ? 'ใช้งาน' : 'ไม่ใช้งาน'}</div></div>
              <div className="info-item"><strong>ความสำคัญ</strong><div>{data.priority}</div></div>
              <div className="info-item"><strong>เริ่ม</strong><div>{fmtDate(data.starts_at)}</div></div>
              <div className="info-item"><strong>สิ้นสุด</strong><div>{fmtDate(data.ends_at)}</div></div>
            </div>
          </div>

          <div className="form-section">
            <h3>การตั้งค่า</h3>
            {tiers.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <strong>แพ้ทุกคู่คืนเงิน</strong>
                <ul style={{ margin: 6, paddingLeft: 20 }}>
                  {tiers.map((t, i) => (
                    <li key={i}>{t.pairs} คู่ = {t.multiplier}x</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="info-grid">
              {settings.min_odds != null && <div className="info-item"><strong>อัตราต่อรองขั้นต่ำ</strong><div>{settings.min_odds}</div></div>}
              {settings.min_stake != null && <div className="info-item"><strong>ยอดเดิมพันขั้นต่ำ</strong><div>{settings.min_stake}</div></div>}
              {settings.max_refund_amount != null && <div className="info-item"><strong>เงินคืนสูงสุด</strong><div>{currency(settings.max_refund_amount)}</div></div>}
              {settings.refund_delay_hours != null && <div className="info-item"><strong>เวลาคืนเงิน (ชม.)</strong><div>{settings.refund_delay_hours}</div></div>}
            </div>
            {betTypes.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <strong>ประเภทกีฬา</strong>
                <div className="betting-types-display" style={{ marginTop: 6 }}>
                  {betTypes.map((t) => {
                    const labels = { 'all': '🎯 ทั้งหมด', 'football': '⚽ ฟุตบอล', 'boxing': '🥊 มวย' }
                    return <span key={t} className="betting-type-tag">{labels[t] || t}</span>
                  })}
                </div>
              </div>
            )}
            {marketTypes.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <strong>ประเภทการเดิมพัน</strong>
                <div className="betting-types-display" style={{ marginTop: 6 }}>
                  {marketTypes.map((t) => {
                    const labels = { 'all': 'ทั้งหมด', 'handicap': 'แฮนดิแคป', 'over_under': 'สูง/ต่ำ', '1x2': '1X2' }
                    return <span key={t} className="betting-type-tag">{labels[t] || t}</span>
                  })}
                </div>
              </div>
            )}
            {settings.match_periods && settings.match_periods.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <strong>ช่วงเวลาการแข่งขัน</strong>
                <div className="betting-types-display" style={{ marginTop: 6 }}>
                  {settings.match_periods.map((period) => {
                    const labels = { 'first_half': 'ครึ่งแรก', 'second_half': 'ครึ่งหลัง', 'full_time': 'เต็มเวลา', 'all': 'ทุกช่วงเวลา' }
                    return <span key={period} className="betting-type-tag">{labels[period] || period}</span>
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>ขีดจำกัดผู้ใช้</h3>
            <div className="info-grid">
              <div className="info-item"><strong>รวมต่อผู้ใช้</strong><div>{data.user_limit_total || 'ไม่จำกัด'}</div></div>
              <div className="info-item"><strong>ต่อวันต่อผู้ใช้</strong><div>{data.user_limit_per_day || 'ไม่จำกัด'}</div></div>
            </div>
          </div>

          <div className="form-section">
            <h3>ขีดจำกัดรวม</h3>
            <div className="info-grid">
              <div className="info-item"><strong>โควต้ารวม</strong><div>{data.global_quota ?? 'ไม่จำกัด'}</div></div>
              <div className="info-item"><strong>งบประมาณรวม</strong><div>{currency(data.global_budget)}</div></div>
            </div>
          </div>

          <div className="form-section">
            <h3>ขีดจำกัดการจ่าย</h3>
            <div className="info-grid">
              <div className="info-item"><strong>สูงสุดต่อบิล</strong><div>{currency(data.max_payout_per_bill)}</div></div>
              <div className="info-item"><strong>สูงสุดต่อวัน</strong><div>{currency(data.max_payout_per_day)}</div></div>
              <div className="info-item"><strong>สูงสุดต่อผู้ใช้</strong><div>{currency(data.max_payout_per_user)}</div></div>
            </div>
          </div>

          <div className="form-section">
            <h3>ตารางเวลา</h3>
            <div className="info-grid">
              <div className="info-item"><strong>วันในสัปดาห์</strong><div>{data.schedule_days && data.schedule_days !== '[]' ? data.schedule_days : 'ทุกวัน'}</div></div>
              <div className="info-item"><strong>เวลาเริ่ม</strong><div>{data.schedule_start_time ?? '—'}</div></div>
              <div className="info-item"><strong>เวลาสิ้นสุด</strong><div>{data.schedule_end_time ?? '—'}</div></div>
            </div>
          </div>

          <div className="form-section">
            <h3>ข้อมูลเพิ่มเติม</h3>
            <div className="info-grid">
              <div className="info-item"><strong>รวมกันได้</strong><div>{data.is_stackable ? 'ใช่' : 'ไม่'}</div></div>
              <div className="info-item"><strong>สร้างเมื่อ</strong><div>{fmtDate(data.created_at)}</div></div>
              <div className="info-item"><strong>แก้ไขเมื่อ</strong><div>{fmtDate(data.updated_at)}</div></div>
              {data.deleted_at && <div className="info-item"><strong>ลบเมื่อ</strong><div>{fmtDate(data.deleted_at)}</div></div>}
            </div>
          </div>

          <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
            <button className="cancel-btn" onClick={() => navigate(`/edit-promotion/${data.id}`)}>แก้ไขโปรโมชั่นนี้</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromotionDetailPage


